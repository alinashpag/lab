import express from 'express';
import { body, param, query } from 'express-validator';
import sql from '../database/connection.js';
import { handleValidationErrors, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = express.Router();

// Валидация создания анализа
const createAnalysisValidation = [
  body('project_id')
    .isInt()
    .withMessage('Некорректный ID проекта'),
  
  body('analysis_type')
    .isIn(['accessibility', 'usability', 'performance', 'contrast', 'typography', 'responsive', 'lighthouse', 'ocr', 'complete'])
    .withMessage('Недопустимый тип анализа'),
  
  body('configuration')
    .optional()
    .isObject()
    .withMessage('Конфигурация должна быть объектом')
];

// GET /api/analysis - Получение списка анализов
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Страница должна быть положительным числом'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Лимит должен быть от 1 до 1000'),
    query('project_id').optional().isInt().withMessage('Некорректный ID проекта'),
    query('status').optional().isIn(['pending', 'running', 'completed', 'failed']).withMessage('Недопустимый статус'),
    query('type').optional().isIn(['accessibility', 'usability', 'performance', 'contrast', 'typography', 'responsive', 'lighthouse', 'ocr', 'complete']).withMessage('Недопустимый тип')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      project_id,
      status,
      type,
      sort = 'started_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Построение условий WHERE 
    const whereConditions = [
      `p.user_id = ${req.user.id}` // Используем p.user_id вместо a.user_id
    ];

    if (project_id) {
      // Проверяем доступ к проекту
      const project = await sql`
        SELECT id FROM projects 
        WHERE id = ${project_id} AND user_id = ${req.user.id}
      `;
      
      if (!project.length) {
        return res.status(403).json({
          error: 'Нет доступа к указанному проекту'
        });
      }
      
      whereConditions.push(`a.project_id = ${project_id}`);
    }

    if (status) {
      whereConditions.push(`a.status = '${status}'`);
    }

    if (type) {
      whereConditions.push(`a.analysis_type = '${type}'`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Получение анализов с информацией о проектах
    const analyses = await sql`
      SELECT 
        a.*,
        p.name as project_name,
        p.project_type
      FROM analyses a
      JOIN projects p ON a.project_id = p.id
      WHERE ${sql.unsafe(whereClause)}
      ORDER BY ${sql.unsafe(sort)} ${sql.unsafe(order)}
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Подсчет общего количества
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM analyses a
      JOIN projects p ON a.project_id = p.id
      WHERE ${sql.unsafe(whereClause)}
    `;

    const total = parseInt(countResult[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      analyses,
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

// POST /api/analysis - Создание нового анализа
router.post('/',
  createAnalysisValidation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { project_id, analysis_type, configuration } = req.body;

    // Проверка доступа к проекту
    const project = await sql`
      SELECT * FROM projects 
      WHERE id = ${project_id} AND user_id = ${req.user.id} AND status = 'active'
    `;

    if (!project.length) {
      return res.status(404).json({
        error: 'Проект не найден или недоступен'
      });
    }

    // Проверка на существующий запущенный анализ
    const runningAnalysis = await sql`
      SELECT a.id FROM analyses a
      JOIN projects p ON a.project_id = p.id
      WHERE a.project_id = ${project_id} 
        AND a.analysis_type = ${analysis_type} 
        AND a.status IN ('pending', 'running')
        AND p.user_id = ${req.user.id}
    `;

    if (runningAnalysis.length > 0) {
      return res.status(409).json({
        error: 'Анализ данного типа уже запущен для этого проекта'
      });
    }

    const analysis = await sql`
      INSERT INTO analyses (
        project_id, analysis_type, status
      ) VALUES (
        ${project_id}, ${analysis_type}, 'pending'
      )
      RETURNING *
    `;

    // Здесь должна быть логика запуска анализа в фоновом режиме
    // Пока что просто помечаем как запущенный
    setTimeout(async () => {
      try {
        await startAnalysisProcess(analysis[0]);
      } catch (error) {
        console.error('Ошибка запуска анализа:', error);
      }
    }, 1000);

    res.status(201).json({
      message: 'Анализ успешно создан и добавлен в очередь',
      analysis: analysis[0]
    });
  })
);

// GET /api/analysis/:id - Получение анализа по ID
router.get('/:id',
  [param('id').isInt().withMessage('Некорректный ID анализа')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const analysisId = req.params.id;

    const analyses = await sql`
      SELECT 
        a.*,
        p.name as project_name,
        p.website_url,
        p.figma_url,
        p.project_type
      FROM analyses a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ${analysisId} AND p.user_id = ${req.user.id}
    `;

    if (!analyses.length) {
      return res.status(404).json({
        error: 'Анализ не найден'
      });
    }

    res.json({
      analysis: analyses[0]
    });
  })
);

// POST /api/analysis/:id/start - Запуск анализа
router.post('/:id/start',
  [param('id').isInt().withMessage('Некорректный ID анализа')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const analysisId = req.params.id;

    // Проверка существования и статуса анализа
    const analysis = await sql`
      SELECT a.*, p.name as project_name
      FROM analyses a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ${analysisId} AND p.user_id = ${req.user.id}
    `;

    if (!analysis.length) {
      return res.status(404).json({
        error: 'Анализ не найден'
      });
    }

    if (analysis[0].status === 'running') {
      return res.status(409).json({
        error: 'Анализ уже запущен'
      });
    }

    if (analysis[0].status === 'completed') {
      return res.status(409).json({
        error: 'Анализ уже завершен'
      });
    }

    // Обновление статуса на "запущен"
    await sql`
      UPDATE analyses SET
        status = 'running',
        started_at = CURRENT_TIMESTAMP
      WHERE id = ${analysisId}
    `;

    // Запуск процесса анализа
    try {
      await startAnalysisProcess(analysis[0]);
    } catch (error) {
      console.error('Ошибка запуска анализа:', error);
      await sql`
        UPDATE analyses SET
          status = 'failed',
          error_message = ${error.message},
          completed_at = CURRENT_TIMESTAMP
        WHERE id = ${analysisId}
      `;
    }

    res.json({
      message: 'Анализ запущен'
    });
  })
);

// POST /api/analysis/:id/stop - Остановка анализа
router.post('/:id/stop',
  [param('id').isInt().withMessage('Некорректный ID анализа')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const analysisId = req.params.id;

    const analysis = await sql`
      SELECT a.* FROM analyses a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ${analysisId} AND p.user_id = ${req.user.id} AND a.status = 'running'
    `;

    if (!analysis.length) {
      return res.status(404).json({
        error: 'Запущенный анализ не найден'
      });
    }

    await sql`
      UPDATE analyses SET
        status = 'failed',
        error_message = 'Анализ остановлен пользователем',
        completed_at = CURRENT_TIMESTAMP
      WHERE id = ${analysisId}
    `;

    res.json({
      message: 'Анализ остановлен'
    });
  })
);

// GET /api/analysis/:id/results - Получение результатов анализа
router.get('/:id/results',
  [param('id').isInt().withMessage('Некорректный ID анализа')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const analysisId = req.params.id;

    const analyses = await sql`
      SELECT a.*, p.user_id, p.name as project_name, p.website_url, p.figma_url
      FROM analyses a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ${analysisId} AND p.user_id = ${req.user.id}
    `;

    if (!analyses.length) {
      return res.status(404).json({
        error: 'Анализ не найден'
      });
    }

    const analysis = analyses[0];

    if (analysis.status !== 'completed') {
      return res.status(409).json({
        error: 'Анализ еще не завершен',
        status: analysis.status
      });
    }

    // Генерируем детальные результаты анализа
    const detailedResults = {
      id: analysis.id,
      name: analysis.name || `Анализ #${analysis.id}`,
      type: analysis.analysis_type,
      status: analysis.status,
      score: analysis.score,
      project: {
        name: analysis.project_name,
        website_url: analysis.website_url,
        figma_url: analysis.figma_url
      },
      started_at: analysis.started_at,
      completed_at: analysis.completed_at,
      duration: analysis.duration,
      
      // Детальные результаты анализа
      results: {
        overall_score: analysis.score || 85,
        categories: [
          {
            name: 'Доступность',
            score: Math.floor(Math.random() * 20) + 80,
            issues: [
              {
                severity: 'high',
                title: 'Отсутствуют alt-атрибуты у изображений',
                description: 'Некоторые изображения не имеют альтернативного текста, что затрудняет навигацию для пользователей с ограниченными возможностями.',
                element: 'img',
                location: 'header, main content',
                recommendation: 'Добавить описательные alt-атрибуты ко всем изображениям'
              },
              {
                severity: 'medium',
                title: 'Недостаточный цветовой контраст',
                description: 'Некоторые элементы имеют недостаточный контраст между текстом и фоном.',
                element: 'p, span',
                location: 'sidebar, footer',
                recommendation: 'Увеличить контрастность до минимум 4.5:1 для обычного текста'
              }
            ]
          },
          {
            name: 'Производительность',
            score: Math.floor(Math.random() * 15) + 75,
            issues: [
              {
                severity: 'high',
                title: 'Большие неоптимизированные изображения',
                description: 'Изображения загружаются в исходном размере, что замедляет загрузку страницы.',
                element: 'img',
                location: 'hero section, gallery',
                recommendation: 'Оптимизировать изображения и использовать responsive images'
              },
              {
                severity: 'medium',
                title: 'Неэффективное использование кэширования',
                description: 'Статические ресурсы не имеют правильных заголовков кэширования.',
                element: 'link, script',
                location: 'head section',
                recommendation: 'Настроить кэширование статических ресурсов на 1 год'
              }
            ]
          },
          {
            name: 'Юзабилити',
            score: Math.floor(Math.random() * 25) + 70,
            issues: [
              {
                severity: 'medium',
                title: 'Мелкие кликабельные области',
                description: 'Некоторые кнопки и ссылки имеют маленькую область клика, особенно на мобильных устройствах.',
                element: 'button, a',
                location: 'navigation, call-to-action buttons',
                recommendation: 'Увеличить размер кликабельных областей до минимум 44x44px'
              },
              {
                severity: 'low',
                title: 'Отсутствие индикаторов загрузки',
                description: 'При выполнении асинхронных операций пользователь не получает обратной связи.',
                element: 'form, async actions',
                location: 'contact form, search',
                recommendation: 'Добавить спиннеры и индикаторы прогресса'
              }
            ]
          },
          {
            name: 'Дизайн',
            score: Math.floor(Math.random() * 20) + 80,
            issues: [
              {
                severity: 'low',
                title: 'Несогласованность в типографике',
                description: 'Используются разные размеры шрифтов без четкой иерархии.',
                element: 'h1, h2, h3, p',
                location: 'content sections',
                recommendation: 'Создать единую типографическую систему'
              },
              {
                severity: 'medium',
                title: 'Неоптимальное использование пространства',
                description: 'Некоторые секции имеют избыточные отступы, другие - недостаточные.',
                element: 'section, div',
                location: 'main content, sidebar',
                recommendation: 'Создать единую систему отступов и выравнивания'
              }
            ]
          }
        ],
        
        summary: {
          total_issues: 8,
          critical: 0,
          high: 2,
          medium: 4,
          low: 2,
          pages_analyzed: 1,
          analysis_time: analysis.duration || 12000,
          recommendations: [
            'Приоритизируйте исправление проблем с доступностью',
            'Оптимизируйте изображения для улучшения производительности',
            'Увеличьте размеры кликабельных элементов',
            'Создайте единую дизайн-систему'
          ]
        },

        technical_details: {
          page_load_time: '2.3s',
          total_page_size: '1.2MB',
          number_of_requests: 45,
          largest_contentful_paint: '1.8s',
          cumulative_layout_shift: '0.05',
          first_input_delay: '45ms'
        }
      }
    };

    res.json({
      results: detailedResults
    });
  })
);

// GET /api/analysis/stats - Получение статистики анализов
router.get('/stats',
  asyncHandler(async (req, res) => {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_analyses,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN a.status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN a.status = 'running' THEN 1 END) as running,
        COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending,
        AVG(CASE WHEN a.score IS NOT NULL THEN a.score END) as avg_score,
        COUNT(CASE WHEN a.analysis_type = 'accessibility' THEN 1 END) as accessibility_count,
        COUNT(CASE WHEN a.analysis_type = 'performance' THEN 1 END) as performance_count,
        COUNT(CASE WHEN a.analysis_type = 'usability' THEN 1 END) as usability_count
      FROM analyses a
      JOIN projects p ON a.project_id = p.id
      WHERE p.user_id = ${req.user.id}
    `;

    const recentAnalyses = await sql`
      SELECT 
        a.id, a.analysis_type, a.status, a.score, a.started_at,
        p.name as project_name
      FROM analyses a
      JOIN projects p ON a.project_id = p.id
      WHERE p.user_id = ${req.user.id}
      ORDER BY a.started_at DESC
      LIMIT 5
    `;

    res.json({
      stats: stats[0],
      recentAnalyses
    });
  })
);

// Функция запуска процесса анализа
async function startAnalysisProcess(analysis) {
  try {
    console.log(`Запуск анализа ${analysis.id} типа ${analysis.analysis_type}`);
    
    // Имитация процесса анализа
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Генерация тестовых результатов
    const results = generateMockResults(analysis.analysis_type);
    const score = calculateScore(results);
    
    // Обновление анализа
    await sql`
      UPDATE analyses SET
        status = 'completed',
        results = ${JSON.stringify(results)},
        score = ${score},
        completed_at = CURRENT_TIMESTAMP
      WHERE id = ${analysis.id}
    `;
    
    console.log(`Анализ ${analysis.id} завершен с оценкой ${score}`);
    
    // Создание уведомления о завершении анализа
    try {
      // Получаем информацию о пользователе и проекте
      const [projectInfo] = await sql`
        SELECT p.name, p.user_id 
        FROM projects p 
        WHERE p.id = ${analysis.project_id}
      `;

      if (projectInfo) {
        await createNotification(
          projectInfo.user_id,
          'analysis_completed',
          'Анализ завершен',
          `Анализ проекта "${projectInfo.name}" завершен с оценкой ${score}/100`,
          {
            analysis_id: analysis.id,
            project_id: analysis.project_id,
            project_name: projectInfo.name,
            score: score,
            analysis_type: analysis.analysis_type
          }
        );
      }
    } catch (notificationError) {
      console.error('Ошибка создания уведомления:', notificationError);
    }
    
  } catch (error) {
    console.error(`Ошибка анализа ${analysis.id}:`, error);
    
    await sql`
      UPDATE analyses SET
        status = 'failed',
        error_message = ${error.message},
        completed_at = CURRENT_TIMESTAMP
      WHERE id = ${analysis.id}
    `;
  }
}

// Генерация тестовых результатов
function generateMockResults(analysisType) {
  const baseResults = {
    scannedPages: Math.floor(Math.random() * 50) + 1,
    totalIssues: Math.floor(Math.random() * 20) + 1,
    processingTime: Math.floor(Math.random() * 300) + 30
  };

  switch (analysisType) {
    case 'accessibility':
      return {
        ...baseResults,
        wcagLevel: 'AA',
        passedCriteria: Math.floor(Math.random() * 40) + 30,
        failedCriteria: Math.floor(Math.random() * 10) + 1
      };
    case 'performance':
      return {
        ...baseResults,
        loadTime: Math.floor(Math.random() * 3000) + 500,
        firstContentfulPaint: Math.floor(Math.random() * 1500) + 300,
        largestContentfulPaint: Math.floor(Math.random() * 2500) + 800
      };
    case 'usability':
      return {
        ...baseResults,
        navigationScore: Math.floor(Math.random() * 40) + 60,
        contentScore: Math.floor(Math.random() * 40) + 60,
        layoutScore: Math.floor(Math.random() * 40) + 60
      };
    default:
      return baseResults;
  }
}

// Расчет общей оценки
function calculateScore(results) {
  return Math.floor(Math.random() * 40) + 60; // От 60 до 100
}

// DELETE /api/analysis/:id - Удаление анализа
router.delete('/:id',
  [param('id').isInt().withMessage('Некорректный ID анализа')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const analysisId = req.params.id;

    const analysis = await sql`
      SELECT a.* FROM analyses a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ${analysisId} AND p.user_id = ${req.user.id}
    `;

    if (!analysis.length) {
      return res.status(404).json({
        error: 'Анализ не найден'
      });
    }

    if (analysis[0].status === 'running') {
      return res.status(409).json({
        error: 'Нельзя удалить запущенный анализ'
      });
    }

    await sql`
      DELETE FROM analyses WHERE id = ${analysisId}
    `;

    res.json({
      message: 'Анализ успешно удален'
    });
  })
);

export default router; 