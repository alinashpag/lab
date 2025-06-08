import express from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import path from 'path';
import sql from '../database/connection.js';
import { handleValidationErrors, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = express.Router();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/projects/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|figma|sketch/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Недопустимый тип файла'));
    }
  }
});

// Валидация создания проекта
const createProjectValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Название проекта должно быть от 1 до 100 символов'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Описание не должно превышать 500 символов'),
  
  body('website_url')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        // Простая проверка URL без строгих требований
        const urlPattern = /^https?:\/\/[^\s]+$/;
        if (!urlPattern.test(value)) {
          throw new Error('Некорректный URL сайта');
        }
      }
      return true;
    }),
  
  body('figma_url')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        // Простая проверка URL без строгих требований
        const urlPattern = /^https?:\/\/[^\s]+$/;
        if (!urlPattern.test(value)) {
          throw new Error('Некорректный URL Figma');
        }
      }
      return true;
    }),
  
  body('project_type')
    .isIn(['website', 'figma', 'screenshot', 'mobile'])
    .withMessage('Недопустимый тип проекта')
];

// Валидация обновления проекта
const updateProjectValidation = [
  param('id').isInt().withMessage('Некорректный ID проекта'),
  ...createProjectValidation
];

// GET /api/projects - Получение списка проектов
router.get('/', 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Страница должна быть положительным числом'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Лимит должен быть от 1 до 1000'),
    query('status').optional().isIn(['active', 'archived', 'deleted']).withMessage('Недопустимый статус'),
    query('type').optional().isIn(['website', 'figma', 'screenshot', 'mobile']).withMessage('Недопустимый тип'),
    query('search').optional().isLength({ max: 100 }).withMessage('Поисковый запрос слишком длинный')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      status = 'active',
      type,
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereConditions = [`p.user_id = ${req.user.id}`, `p.status = '${status}'`];
    let params = [];

    if (type) {
      whereConditions.push(`p.project_type = '${type}'`);
    }

    if (search) {
      whereConditions.push(`(p.name ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');
    const orderClause = `ORDER BY p.${sort} ${order}`;

    // Получение проектов
    const projects = await sql`
      SELECT 
        p.*,
        COUNT(a.id) as analysis_count,
        MAX(a.created_at) as last_analysis
      FROM projects p
      LEFT JOIN analyses a ON p.id = a.project_id
      WHERE ${sql.unsafe(whereClause)}
      GROUP BY p.id
      ${sql.unsafe(orderClause)}
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Подсчет общего количества
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM projects p
      WHERE ${sql.unsafe(whereClause)}
    `;

    const total = parseInt(countResult[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  })
);

// POST /api/projects - Создание нового проекта
router.post('/',
  createProjectValidation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { name, description, website_url, figma_url, project_type, settings } = req.body;

    const project = await sql`
      INSERT INTO projects (
        user_id, name, description, website_url, figma_url, 
        project_type, settings
      ) VALUES (
        ${req.user.id}, ${name}, ${description || null}, 
        ${website_url || null}, ${figma_url || null}, 
        ${project_type}, ${JSON.stringify(settings || {})}
      )
      RETURNING *
    `;

    // Создание уведомления о новом проекте
    try {
      await createNotification(
        req.user.id,
        'project_created',
        'Новый проект создан',
        `Проект "${name}" успешно создан и готов к анализу`,
        { 
          project_id: project[0].id,
          project_name: name,
          project_type 
        }
      );
    } catch (notificationError) {
      console.error('Ошибка создания уведомления:', notificationError);
      // Не прерываем выполнение из-за ошибки уведомления
    }

    res.status(201).json({
      message: 'Проект успешно создан',
      project: project[0]
    });
  })
);

// GET /api/projects/:id - Получение проекта по ID
router.get('/:id',
  [param('id').isInt().withMessage('Некорректный ID проекта')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const projectId = req.params.id;

    const projects = await sql`
      SELECT 
        p.*,
        COUNT(a.id) as analysis_count,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_analyses,
        COUNT(CASE WHEN a.status = 'failed' THEN 1 END) as failed_analyses,
        MAX(a.created_at) as last_analysis
      FROM projects p
      LEFT JOIN analyses a ON p.id = a.project_id
      WHERE p.id = ${projectId} AND p.user_id = ${req.user.id} AND p.status != 'deleted'
      GROUP BY p.id
    `;

    if (!projects.length) {
      return res.status(404).json({
        error: 'Проект не найден'
      });
    }

    // Получение файлов проекта
    const assets = await sql`
      SELECT * FROM assets 
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
    `;

    // Получение последних анализов
    const recentAnalyses = await sql`
      SELECT * FROM analyses 
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
      LIMIT 5
    `;

    res.json({
      project: {
        ...projects[0],
        assets,
        recentAnalyses
      }
    });
  })
);

// PUT /api/projects/:id - Обновление проекта
router.put('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID проекта должен быть положительным числом'),
    body('name').notEmpty().withMessage('Название проекта обязательно'),
    body('project_type').isIn(['website', 'figma', 'screenshot']).withMessage('Некорректный тип проекта'),
    body('description').optional().isString(),
    body('website_url').optional().custom((value) => {
      if (value && value.trim() !== '') {
        // Простая проверка URL без строгих требований
        const urlPattern = /^https?:\/\/[^\s]+$/;
        if (!urlPattern.test(value)) {
          throw new Error('Некорректный URL сайта');
        }
      }
      return true;
    }),
    body('figma_url').optional().custom((value) => {
      if (value && value.trim() !== '') {
        // Простая проверка URL без строгих требований
        const urlPattern = /^https?:\/\/[^\s]+$/;
        if (!urlPattern.test(value)) {
          throw new Error('Некорректный URL Figma');
        }
      }
      return true;
    })
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const projectId = parseInt(req.params.id);
    const { name, description, website_url, figma_url, project_type, settings } = req.body;

    if (!projectId || projectId < 1) {
      return res.status(400).json({
        error: 'Некорректный ID проекта'
      });
    }

    // Проверка существования и прав доступа
    const existingProject = await sql`
      SELECT * FROM projects 
      WHERE id = ${projectId} AND user_id = ${req.user.id} AND status != 'deleted'
    `;

    if (!existingProject.length) {
      return res.status(404).json({
        error: 'Проект не найден или недоступен для редактирования'
      });
    }

    try {
      // Обработка URL полей - убираем пустые строки
      const processedWebsiteUrl = website_url && website_url.trim() !== '' ? website_url.trim() : null;
      const processedFigmaUrl = figma_url && figma_url.trim() !== '' ? figma_url.trim() : null;

      const updatedProject = await sql`
        UPDATE projects SET
          name = ${name.trim()},
          description = ${description ? description.trim() : null},
          website_url = ${processedWebsiteUrl},
          figma_url = ${processedFigmaUrl},
          project_type = ${project_type},
          settings = ${JSON.stringify(settings || {})},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${projectId}
        RETURNING *
      `;

      res.json({
        message: 'Проект успешно обновлен',
        project: updatedProject[0]
      });
    } catch (error) {
      console.error('Ошибка обновления проекта:', error);
      res.status(500).json({
        error: 'Ошибка при обновлении проекта',
        details: error.message
      });
    }
  })
);

// DELETE /api/projects/:id - Удаление проекта
router.delete('/:id',
  [param('id').isInt({ min: 1 }).withMessage('ID проекта должен быть положительным числом')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const projectId = parseInt(req.params.id);

    if (!projectId || projectId < 1) {
      return res.status(400).json({
        error: 'Некорректный ID проекта'
      });
    }

    // Проверка существования и прав доступа
    const existingProject = await sql`
      SELECT * FROM projects 
      WHERE id = ${projectId} AND user_id = ${req.user.id} AND status != 'deleted'
    `;

    if (!existingProject.length) {
      return res.status(404).json({
        error: 'Проект не найден или уже удален'
      });
    }

    // Проверим, есть ли связанные анализы
    const analyses = await sql`
      SELECT COUNT(*) as count FROM analyses 
      WHERE project_id = ${projectId}
    `;

    const analysesCount = analyses[0]?.count || 0;

    // Мягкое удаление
    await sql`
      UPDATE projects SET
        status = 'deleted',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${projectId}
    `;

    res.json({
      message: 'Проект успешно удален',
      project_id: projectId,
      analyses_affected: analysesCount
    });
  })
);

// POST /api/projects/:id/upload - Загрузка файлов для проекта
router.post('/:id/upload',
  [param('id').isInt().withMessage('Некорректный ID проекта')],
  handleValidationErrors,
  upload.array('files', 10),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id;

    // Проверка существования проекта
    const project = await sql`
      SELECT * FROM projects 
      WHERE id = ${projectId} AND user_id = ${req.user.id} AND status != 'deleted'
    `;

    if (!project.length) {
      return res.status(404).json({
        error: 'Проект не найден'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Файлы не были загружены'
      });
    }

    // Сохранение информации о файлах в базе данных
    const uploadedFiles = [];
    
    for (const file of req.files) {
      const asset = await sql`
        INSERT INTO assets (
          project_id, filename, original_name, file_path, 
          file_size, mime_type, asset_type, metadata
        ) VALUES (
          ${projectId}, ${file.filename}, ${file.originalname},
          ${file.path}, ${file.size}, ${file.mimetype},
          ${getAssetType(file.mimetype)}, ${JSON.stringify({
            encoding: file.encoding,
            fieldname: file.fieldname
          })}
        )
        RETURNING *
      `;
      
      uploadedFiles.push(asset[0]);
    }

    res.status(201).json({
      message: `Загружено файлов: ${req.files.length}`,
      files: uploadedFiles
    });
  })
);

// GET /api/projects/:id/files - Получение файлов проекта
router.get('/:id/files',
  [param('id').isInt().withMessage('Некорректный ID проекта')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const projectId = req.params.id;

    // Проверка доступа к проекту
    const project = await sql`
      SELECT * FROM projects 
      WHERE id = ${projectId} AND user_id = ${req.user.id} AND status != 'deleted'
    `;

    if (!project.length) {
      return res.status(404).json({
        error: 'Проект не найден'
      });
    }

    const files = await sql`
      SELECT * FROM assets 
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
    `;

    res.json({
      files
    });
  })
);

// DELETE /api/projects/:projectId/files/:fileId - Удаление файла
router.delete('/:projectId/files/:fileId',
  [
    param('projectId').isInt().withMessage('Некорректный ID проекта'),
    param('fileId').isInt().withMessage('Некорректный ID файла')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { projectId, fileId } = req.params;

    // Проверка прав доступа
    const file = await sql`
      SELECT a.*, p.user_id 
      FROM assets a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ${fileId} AND a.project_id = ${projectId} AND p.user_id = ${req.user.id}
    `;

    if (!file.length) {
      return res.status(404).json({
        error: 'Файл не найден'
      });
    }

    // Удаление файла из базы данных
    await sql`
      DELETE FROM assets WHERE id = ${fileId}
    `;

    // Попытка удаления физического файла
    try {
      const fs = await import('fs');
      await fs.promises.unlink(file[0].file_path);
    } catch (error) {
      console.warn('Не удалось удалить физический файл:', error.message);
    }

    res.json({
      message: 'Файл успешно удален'
    });
  })
);

// PATCH /api/projects/:id/archive - Архивирование проекта
router.patch('/:id/archive',
  [param('id').isInt().withMessage('Некорректный ID проекта')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const projectId = req.params.id;

    const project = await sql`
      UPDATE projects SET
        status = 'archived',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${projectId} AND user_id = ${req.user.id} AND status = 'active'
      RETURNING *
    `;

    if (!project.length) {
      return res.status(404).json({
        error: 'Проект не найден или уже архивирован'
      });
    }

    res.json({
      message: 'Проект успешно архивирован',
      project: project[0]
    });
  })
);

// PATCH /api/projects/:id/restore - Восстановление проекта
router.patch('/:id/restore',
  [param('id').isInt().withMessage('Некорректный ID проекта')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const projectId = req.params.id;

    const project = await sql`
      UPDATE projects SET
        status = 'active',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${projectId} AND user_id = ${req.user.id} AND status = 'archived'
      RETURNING *
    `;

    if (!project.length) {
      return res.status(404).json({
        error: 'Проект не найден или не архивирован'
      });
    }

    res.json({
      message: 'Проект успешно восстановлен',
      project: project[0]
    });
  })
);

// Вспомогательная функция для определения типа ресурса
function getAssetType(mimeType) {
  if (mimeType.startsWith('image/')) return 'screenshot';
  if (mimeType === 'application/pdf') return 'document';
  if (mimeType.includes('figma')) return 'design';
  return 'other';
}

export default router;