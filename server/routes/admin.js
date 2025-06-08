import express from 'express';
import sql from '../database/connection.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Middleware для проверки админских прав
const requireAdmin = requireRole(['admin']);

// GET /api/admin/stats - Получение статистики для дашборда
router.get('/stats', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    // Получаем статистику пользователей (упрощенный запрос)
    const usersStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_this_month,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderators,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as users
      FROM users
    `;

    // Получаем статистику проектов
    const projectsStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_this_month
      FROM projects
    `;

    // Получаем статистику анализов
    const analysesStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'running' THEN 1 END) as running,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM analyses
    `;

    // Получаем статистику отчётов
    const reportsStats = await sql`
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(download_count), 0) as downloads,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready
      FROM reports
    `;

    // Получаем данные для графиков (последние 7 месяцев)
    const chartData = await sql`
      WITH months AS (
        SELECT 
          generate_series(
            date_trunc('month', CURRENT_DATE - INTERVAL '6 months'),
            date_trunc('month', CURRENT_DATE),
            INTERVAL '1 month'
          ) AS month
      ),
      user_data AS (
        SELECT 
          date_trunc('month', created_at) as month,
          COUNT(*) as users
        FROM users 
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at)
      ),
      project_data AS (
        SELECT 
          date_trunc('month', created_at) as month,
          COUNT(*) as projects
        FROM projects 
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at)
      ),
      analysis_data AS (
        SELECT 
          date_trunc('month', created_at) as month,
          COUNT(*) as analyses
        FROM analyses 
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY date_trunc('month', created_at)
      )
      SELECT 
        m.month,
        COALESCE(u.users, 0) as users,
        COALESCE(p.projects, 0) as projects,
        COALESCE(a.analyses, 0) as analyses
      FROM months m
      LEFT JOIN user_data u ON m.month = u.month
      LEFT JOIN project_data p ON m.month = p.month
      LEFT JOIN analysis_data a ON m.month = a.month
      ORDER BY m.month
    `;

    // Форматируем данные для графиков
    const formattedChartData = {
      users: chartData.map(row => ({
        name: new Date(row.month).toLocaleDateString('ru-RU', { month: 'short' }),
        value: parseInt(row.users)
      })),
      projects: chartData.map(row => ({
        name: new Date(row.month).toLocaleDateString('ru-RU', { month: 'short' }),
        value: parseInt(row.projects)
      })),
      analyses: chartData.map(row => ({
        name: new Date(row.month).toLocaleDateString('ru-RU', { month: 'short' }),
        value: parseInt(row.analyses)
      }))
    };

    res.json({
      users: {
        total: parseInt(usersStats[0].total),
        newThisMonth: parseInt(usersStats[0].new_this_month),
        admins: parseInt(usersStats[0].admins),
        moderators: parseInt(usersStats[0].moderators),
        users: parseInt(usersStats[0].users)
      },
      projects: {
        total: parseInt(projectsStats[0].total),
        active: parseInt(projectsStats[0].active),
        newThisMonth: parseInt(projectsStats[0].new_this_month)
      },
      analyses: {
        total: parseInt(analysesStats[0].total),
        completed: parseInt(analysesStats[0].completed),
        running: parseInt(analysesStats[0].running),
        pending: parseInt(analysesStats[0].pending),
        failed: parseInt(analysesStats[0].failed)
      },
      reports: {
        total: parseInt(reportsStats[0].total),
        downloads: parseInt(reportsStats[0].downloads),
        ready: parseInt(reportsStats[0].ready)
      },
      chartData: formattedChartData
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({
      error: 'Ошибка получения статистики',
      message: 'Не удалось загрузить данные статистики'
    });
  }
}));

// GET /api/admin/activity - Получение последней активности
router.get('/activity', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Получаем последнюю активность из разных источников
    const activities = await sql`
      (
        SELECT 
          'user_registered' as type,
          'Новый пользователь зарегистрировался' as text,
          email as user_identifier,
          created_at as timestamp,
          'user' as icon,
          '#4F46E5' as color
        FROM users 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 
          'project_created' as type,
          CONCAT('Создан новый проект "', name, '"') as text,
          (SELECT email FROM users WHERE id = projects.user_id) as user_identifier,
          created_at as timestamp,
          'folder' as icon,
          '#059669' as color
        FROM projects 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 
          'analysis_completed' as type,
          CONCAT('Завершен анализ для проекта "', 
            (SELECT name FROM projects WHERE id = analyses.project_id), '"') as text,
          (SELECT email FROM users u 
           JOIN projects p ON u.id = p.user_id 
           WHERE p.id = analyses.project_id) as user_identifier,
          completed_at as timestamp,
          'activity' as icon,
          '#DC2626' as color
        FROM analyses 
        WHERE status = 'completed' 
          AND completed_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY completed_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 
          'report_generated' as type,
          CONCAT('Сгенерирован отчёт по проекту "', 
            (SELECT name FROM projects WHERE id = reports.project_id), '"') as text,
          (SELECT email FROM users u 
           JOIN projects p ON u.id = p.user_id 
           WHERE p.id = reports.project_id) as user_identifier,
          created_at as timestamp,
          'file' as icon,
          '#7C3AED' as color
        FROM reports 
        WHERE status = 'ready' 
          AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 5
      )
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;

    const formattedActivities = activities.map((activity, index) => ({
      id: index + 1,
      type: activity.type,
      text: activity.text,
      user: activity.user_identifier,
      time: activity.timestamp,
      icon: activity.icon,
      color: activity.color
    }));

    res.json({
      activities: formattedActivities
    });
  } catch (error) {
    console.error('Ошибка получения активности:', error);
    res.status(500).json({
      error: 'Ошибка получения активности',
      message: 'Не удалось загрузить данные активности'
    });
  }
}));

// GET /api/admin/users - Получение списка пользователей с фильтрацией
router.get('/users', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push(`(username ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (role && role !== 'all') {
      whereConditions.push(`role = $${params.length + 1}`);
      params.push(role);
    }

    // Временно убираем фильтр по статусу для совместимости
    // if (status && status !== 'all') {
    //   const isActive = status === 'active';
    //   whereConditions.push(`is_active = $${params.length + 1}`);
    //   params.push(isActive);
    // }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Получаем пользователей (упрощенный запрос для совместимости)
    const users = await sql.unsafe(`
      SELECT 
        id, username, email, role, email_verified, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    // Получаем общее количество
    const totalResult = await sql.unsafe(`
      SELECT COUNT(*) as total FROM users ${whereClause}
    `, params);

    const total = parseInt(totalResult[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name || user.username,
        role: user.role,
        isActive: true, // Временно всегда true
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({
      error: 'Ошибка получения пользователей',
      message: 'Не удалось загрузить список пользователей'
    });
  }
}));

// Этот роут удален - используется более полный роут ниже

// DELETE /api/admin/users/:id - Удаление пользователя
router.delete('/users/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, что это не последний админ
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        error: 'Нельзя удалить собственный аккаунт',
        message: 'Вы не можете удалить свой собственный аккаунт'
      });
    }

    // Проверяем, что пользователь существует
    const existingUser = await sql`
      SELECT id, role FROM users WHERE id = ${id}
    `;

    if (existingUser.length === 0) {
      return res.status(404).json({
        error: 'Пользователь не найден',
        message: 'Пользователь с указанным ID не существует'
      });
    }

    // Если это админ, проверяем что есть другие админы
    if (existingUser[0].role === 'admin') {
      const adminCount = await sql`
        SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND id != ${id}
      `;
      
      if (parseInt(adminCount[0].count) === 0) {
        return res.status(400).json({
          error: 'Нельзя удалить последнего администратора',
          message: 'В системе должен остаться хотя бы один администратор'
        });
      }
    }

    // Удаляем пользователя (каскадное удаление настроено в БД)
    await sql`DELETE FROM users WHERE id = ${id}`;

    res.json({
      message: 'Пользователь успешно удалён'
    });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({
      error: 'Ошибка удаления пользователя',
      message: 'Не удалось удалить пользователя'
    });
  }
}));

// POST /api/admin/users - Создание нового пользователя
router.post('/users', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Заполните все обязательные поля',
        message: 'Имя пользователя, email и пароль обязательны'
      });
    }

    // Проверяем уникальность username и email
    const existingUser = await sql`
      SELECT username, email FROM users 
      WHERE username = ${username} OR email = ${email}
    `;

    if (existingUser.length > 0) {
      const existing = existingUser[0];
      const field = existing.username === username ? 'имя пользователя' : 'email';
      return res.status(400).json({
        error: `Такой ${field} уже существует`,
        message: `Пользователь с таким ${field} уже зарегистрирован`
      });
    }

    // Хешируем пароль
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем пользователя
    const newUser = await sql`
      INSERT INTO users (username, email, password, role, created_at)
      VALUES (${username}, ${email}, ${hashedPassword}, ${role}, NOW())
      RETURNING id, username, email, role, created_at
    `;

    res.status(201).json({
      message: 'Пользователь успешно создан',
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
        role: newUser[0].role,
        createdAt: newUser[0].created_at
      }
    });
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    res.status(500).json({
      error: 'Ошибка создания пользователя',
      message: 'Не удалось создать пользователя'
    });
  }
}));

// PUT /api/admin/users/:id - Редактирование пользователя
router.put('/users/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, password } = req.body;

    // Проверяем, что пользователь существует
    const existingUser = await sql`
      SELECT * FROM users WHERE id = ${id}
    `;

    if (existingUser.length === 0) {
      return res.status(404).json({
        error: 'Пользователь не найден'
      });
    }

    // Если изменяется роль собственного аккаунта с admin
    if (req.user.id === parseInt(id) && role && role !== 'admin') {
      // Проверяем, что есть другие админы
      const adminCount = await sql`
        SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND id != ${id}
      `;
      
      if (parseInt(adminCount[0].count) === 0) {
        return res.status(400).json({
          error: 'Нельзя изменить роль последнего администратора',
          message: 'В системе должен остаться хотя бы один администратор'
        });
      }
    }

    // Проверяем уникальность username и email (если они изменяются)
    if (username || email) {
      const conflictCheck = await sql`
        SELECT username, email FROM users 
        WHERE (username = ${username || existingUser[0].username} OR email = ${email || existingUser[0].email})
        AND id != ${id}
      `;

      if (conflictCheck.length > 0) {
        return res.status(400).json({
          error: 'Имя пользователя или email уже используется',
          message: 'Выберите другое имя пользователя или email'
        });
      }
    }

    // Подготавливаем данные для обновления
    let updateData = {
      username: username || existingUser[0].username,
      email: email || existingUser[0].email,
      role: role || existingUser[0].role,
      updated_at: new Date()
    };

    // Если нужно изменить пароль
    if (password) {
      const bcrypt = await import('bcrypt');
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Обновляем пользователя
    let updatedUser;
    if (password) {
      updatedUser = await sql`
        UPDATE users 
        SET username = ${updateData.username}, 
            email = ${updateData.email}, 
            role = ${updateData.role},
            password = ${updateData.password},
            updated_at = ${updateData.updated_at}
        WHERE id = ${id}
        RETURNING id, username, email, role, created_at, updated_at
      `;
    } else {
      updatedUser = await sql`
        UPDATE users 
        SET username = ${updateData.username}, 
            email = ${updateData.email}, 
            role = ${updateData.role},
            updated_at = ${updateData.updated_at}
        WHERE id = ${id}
        RETURNING id, username, email, role, created_at, updated_at
      `;
    }

    res.json({
      message: 'Пользователь успешно обновлен',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    res.status(500).json({
      error: 'Ошибка обновления пользователя',
      message: 'Не удалось обновить пользователя'
    });
  }
}));

// GET /api/admin/projects - Получение списка проектов
router.get('/projects', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const projects = await sql`
      SELECT 
        p.id, p.name, p.description, p.website_url, p.project_type, 
        p.status, p.created_at, p.updated_at,
        u.username, u.email,
        COUNT(DISTINCT a.id) as analysis_count,
        COUNT(DISTINCT r.id) as report_count
      FROM projects p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN analyses a ON p.id = a.project_id
      LEFT JOIN reports r ON p.id = r.project_id
      GROUP BY p.id, u.id, u.username, u.email
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await sql`SELECT COUNT(*) as total FROM projects`;
    const total = parseInt(totalResult[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        websiteUrl: project.website_url,
        projectType: project.project_type,
        status: project.status,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        user: {
          username: project.username,
          email: project.email,
          name: project.username
        },
        analysisCount: parseInt(project.analysis_count),
        reportCount: parseInt(project.report_count)
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalProjects: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Ошибка получения проектов:', error);
    res.status(500).json({
      error: 'Ошибка получения проектов',
      message: 'Не удалось загрузить список проектов'
    });
  }
}));

// POST /api/admin/projects - Создание нового проекта
router.post('/projects', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { name, description, website_url, project_type, user_id } = req.body;

    if (!name || !user_id) {
      return res.status(400).json({
        error: 'Заполните все обязательные поля',
        message: 'Название проекта и ID пользователя обязательны'
      });
    }

    // Проверяем, что пользователь существует
    const userExists = await sql`
      SELECT id FROM users WHERE id = ${user_id}
    `;

    if (userExists.length === 0) {
      return res.status(400).json({
        error: 'Пользователь не найден',
        message: 'Указанный пользователь не существует'
      });
    }

    // Создаем проект
    const newProject = await sql`
      INSERT INTO projects (name, description, website_url, project_type, user_id, status, created_at)
      VALUES (${name}, ${description || ''}, ${website_url || ''}, ${project_type || 'website'}, ${user_id}, 'active', NOW())
      RETURNING *
    `;

    res.status(201).json({
      message: 'Проект успешно создан',
      project: newProject[0]
    });
  } catch (error) {
    console.error('Ошибка создания проекта:', error);
    res.status(500).json({
      error: 'Ошибка создания проекта',
      message: 'Не удалось создать проект'
    });
  }
}));

// PUT /api/admin/projects/:id - Редактирование проекта
router.put('/projects/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, website_url, project_type, status, user_id } = req.body;

    // Проверяем, что проект существует
    const existingProject = await sql`
      SELECT * FROM projects WHERE id = ${id}
    `;

    if (existingProject.length === 0) {
      return res.status(404).json({
        error: 'Проект не найден'
      });
    }

    // Если меняется владелец, проверяем что новый пользователь существует
    if (user_id && user_id !== existingProject[0].user_id) {
      const userExists = await sql`
        SELECT id FROM users WHERE id = ${user_id}
      `;

      if (userExists.length === 0) {
        return res.status(400).json({
          error: 'Новый владелец не найден',
          message: 'Указанный пользователь не существует'
        });
      }
    }

    // Обновляем проект
    const updatedProject = await sql`
      UPDATE projects 
      SET name = ${name || existingProject[0].name}, 
          description = ${description !== undefined ? description : existingProject[0].description}, 
          website_url = ${website_url !== undefined ? website_url : existingProject[0].website_url},
          project_type = ${project_type || existingProject[0].project_type},
          status = ${status || existingProject[0].status},
          user_id = ${user_id || existingProject[0].user_id},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({
      message: 'Проект успешно обновлен',
      project: updatedProject[0]
    });
  } catch (error) {
    console.error('Ошибка обновления проекта:', error);
    res.status(500).json({
      error: 'Ошибка обновления проекта',
      message: 'Не удалось обновить проект'
    });
  }
}));

// DELETE /api/admin/projects/:id - Удаление проекта
router.delete('/projects/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, что проект существует
    const existingProject = await sql`
      SELECT id FROM projects WHERE id = ${id}
    `;

    if (existingProject.length === 0) {
      return res.status(404).json({
        error: 'Проект не найден'
      });
    }

    // Удаляем проект (каскадное удаление настроено в БД)
    await sql`DELETE FROM projects WHERE id = ${id}`;

    res.json({
      message: 'Проект успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления проекта:', error);
    res.status(500).json({
      error: 'Ошибка удаления проекта',
      message: 'Не удалось удалить проект'
    });
  }
}));

// GET /api/admin/analyses - Получение списка анализов
router.get('/analyses', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const analyses = await sql`
      SELECT 
        a.*,
        p.name as project_name,
        u.username
      FROM analyses a
      JOIN projects p ON a.project_id = p.id
      JOIN users u ON p.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await sql`SELECT COUNT(*) as total FROM analyses`;
    const total = parseInt(totalResult[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      analyses,
      pagination: {
        currentPage: page,
        totalPages,
        totalAnalyses: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Ошибка получения анализов:', error);
    res.status(500).json({
      error: 'Ошибка получения анализов',
      message: 'Не удалось загрузить список анализов'
    });
  }
}));

// DELETE /api/admin/analyses/:id - Удаление анализа
router.delete('/analyses/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, что анализ существует
    const existingAnalysis = await sql`
      SELECT id FROM analyses WHERE id = ${id}
    `;

    if (existingAnalysis.length === 0) {
      return res.status(404).json({
        error: 'Анализ не найден'
      });
    }

    // Удаляем анализ
    await sql`DELETE FROM analyses WHERE id = ${id}`;

    res.json({
      message: 'Анализ успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления анализа:', error);
    res.status(500).json({
      error: 'Ошибка удаления анализа',
      message: 'Не удалось удалить анализ'
    });
  }
}));

// GET /api/admin/reports - Получение списка отчетов
router.get('/reports', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const reports = await sql`
      SELECT 
        r.*,
        p.name as project_name,
        u.username
      FROM reports r
      JOIN projects p ON r.project_id = p.id
      JOIN users u ON p.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await sql`SELECT COUNT(*) as total FROM reports`;
    const total = parseInt(totalResult[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      reports,
      pagination: {
        currentPage: page,
        totalPages,
        totalReports: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Ошибка получения отчетов:', error);
    res.status(500).json({
      error: 'Ошибка получения отчетов',
      message: 'Не удалось загрузить список отчетов'
    });
  }
}));

// DELETE /api/admin/reports/:id - Удаление отчета
router.delete('/reports/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, что отчет существует
    const existingReport = await sql`
      SELECT * FROM reports WHERE id = ${id}
    `;

    if (existingReport.length === 0) {
      return res.status(404).json({
        error: 'Отчет не найден'
      });
    }

    // Удаляем файл отчета, если он существует
    if (existingReport[0].file_path) {
      try {
        const fs = await import('fs');
        await fs.promises.unlink(existingReport[0].file_path);
      } catch (error) {
        console.warn('Не удалось удалить файл отчета:', error.message);
      }
    }

    // Удаляем отчет из БД
    await sql`DELETE FROM reports WHERE id = ${id}`;

    res.json({
      message: 'Отчет успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления отчета:', error);
    res.status(500).json({
      error: 'Ошибка удаления отчета',
      message: 'Не удалось удалить отчет'
    });
  }
}));

// GET /api/admin/reports/:id/download - Админское скачивание отчета
router.get('/reports/:id/download', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const reportId = req.params.id;

    // Админ может скачать любой отчет
    const reports = await sql`
      SELECT r.*, p.name as project_name 
      FROM reports r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = ${reportId}
    `;

    if (!reports.length) {
      return res.status(404).json({
        error: 'Отчет не найден'
      });
    }

    const report = reports[0];

    // Если отчет не готов
    if (report.status !== 'ready') {
      const statusMessage = report.status === 'generating' ? 'генерируется' : 
                           report.status === 'error' ? 'произошла ошибка' : 'ожидает обработки';
      
      const simpleContent = `Отчет #${reportId} ${statusMessage}. Попробуйте скачать позже.`;
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}-status.txt"`);
      return res.send(simpleContent);
    }

    // Если есть файл отчета, возвращаем его
    if (report.file_path) {
      try {
        const fs = await import('fs');
        if (await fs.promises.access(report.file_path).then(() => true).catch(() => false)) {
          // Увеличиваем счетчик скачиваний
          await sql`
            UPDATE reports 
            SET download_count = download_count + 1 
            WHERE id = ${reportId}
          `;
          return res.download(report.file_path);
        }
      } catch (error) {
        console.warn('Не удалось найти файл отчета:', error.message);
      }
    }

    // Создаем JSON отчет как fallback
    const reportData = {
      id: report.id,
      name: report.name,
      type: report.report_type,
      project: report.project_name,
      created: report.created_at,
      status: report.status,
      summary: report.summary || { message: 'Отчет готов к скачиванию' }
    };

    // Увеличиваем счетчик скачиваний
    await sql`
      UPDATE reports 
      SET download_count = download_count + 1 
      WHERE id = ${reportId}
    `;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}-${report.project_name}.json"`);
    res.json(reportData);

  } catch (error) {
    console.error('Ошибка скачивания отчета:', error);
    res.status(500).json({
      error: 'Ошибка скачивания отчета',
      message: 'Не удалось скачать отчет'
    });
  }
}));

export default router; 