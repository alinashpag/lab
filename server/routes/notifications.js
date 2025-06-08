import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import sql from '../database/connection.js';
import { authenticateToken as auth } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting для уведомлений
const notificationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: process.env.NODE_ENV === 'development' ? 1000 : 500,
  skip: (req) => process.env.NODE_ENV === 'development',
});

// Валидация получения уведомлений
const getNotificationsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Страница должна быть положительным числом'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Лимит должен быть от 1 до 100'),
  query('is_read').optional().isBoolean().withMessage('is_read должен быть boolean'),
  query('type').optional().isString().trim().isLength({ max: 50 }).withMessage('Тип не должен превышать 50 символов'),
];

// Валидация создания уведомления
const createNotificationValidation = [
  body('user_id').isInt({ min: 1 }).withMessage('ID пользователя должен быть положительным числом'),
  body('type').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Тип должен быть от 1 до 50 символов'),
  body('title').isString().trim().isLength({ min: 1, max: 255 }).withMessage('Заголовок должен быть от 1 до 255 символов'),
  body('message').isString().trim().isLength({ min: 1, max: 1000 }).withMessage('Сообщение должно быть от 1 до 1000 символов'),
  body('data').optional().isObject().withMessage('Данные должны быть объектом'),
];

// Валидация обновления уведомления
const updateNotificationValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID уведомления должен быть положительным числом'),
  body('is_read').optional().isBoolean().withMessage('is_read должен быть boolean'),
];

// Получение уведомлений пользователя
router.get('/', notificationsLimiter, auth, getNotificationsValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const isRead = req.query.is_read;
    const type = req.query.type;

    let whereClause = 'WHERE user_id = $1';
    let params = [req.user.id];

    if (isRead !== undefined) {
      whereClause += ` AND is_read = $${params.length + 1}`;
      params.push(isRead === 'true');
    }

    if (type) {
      whereClause += ` AND type = $${params.length + 1}`;
      params.push(type);
    }

    // Получение уведомлений
    const notifications = await sql.unsafe(`
      SELECT 
        id, type, title, message, data, is_read, created_at, updated_at
      FROM notifications 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    // Подсчет общего количества
    const countResult = await sql.unsafe(`
      SELECT COUNT(*) as count 
      FROM notifications 
      ${whereClause}
    `, params);
    const count = countResult[0]?.count || 0;

    // Подсчет непрочитанных
    const [{ unread_count }] = await sql`
      SELECT COUNT(*) as unread_count 
      FROM notifications 
      WHERE user_id = ${req.user.id} AND is_read = FALSE
    `;

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total: parseInt(count),
        pages: Math.ceil(count / limit)
      },
      unread_count: parseInt(unread_count)
    });

  } catch (error) {
    console.error('Ошибка получения уведомлений:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение количества непрочитанных уведомлений
router.get('/unread-count', notificationsLimiter, auth, async (req, res) => {
  try {
    const [result] = await sql`
      SELECT COUNT(*) as unread_count
      FROM notifications 
      WHERE user_id = ${req.user.id} AND is_read = FALSE
    `;

    res.json({
      success: true,
      unread_count: parseInt(result.unread_count) || 0
    });
  } catch (error) {
    console.error('Ошибка получения количества непрочитанных уведомлений:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении количества уведомлений'
    });
  }
});

// Получение конкретного уведомления
router.get('/:id', notificationsLimiter, auth, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);

    const [notification] = await sql`
      SELECT 
        id, type, title, message, data, is_read, created_at, updated_at
      FROM notifications 
      WHERE id = ${notificationId} AND user_id = ${req.user.id}
    `;

    if (!notification) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }

    res.json({ notification });

  } catch (error) {
    console.error('Ошибка получения уведомления:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создание уведомления (для внутреннего использования)
router.post('/', notificationsLimiter, auth, createNotificationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации',
        details: errors.array()
      });
    }

    // Только админы могут создавать уведомления для других пользователей
    if (req.body.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Недостаточно прав для создания уведомления' });
    }

    const { user_id, type, title, message, data = {} } = req.body;

    const [notification] = await sql`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (${user_id}, ${type}, ${title}, ${message}, ${JSON.stringify(data)})
      RETURNING id, type, title, message, data, is_read, created_at, updated_at
    `;

    res.status(201).json({ notification });

  } catch (error) {
    console.error('Ошибка создания уведомления:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Отметка уведомления как прочитанного
router.patch('/:id/read', notificationsLimiter, auth, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);

    const [notification] = await sql`
      UPDATE notifications 
      SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${notificationId} AND user_id = ${req.user.id}
      RETURNING id, is_read, updated_at
    `;

    if (!notification) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }

    res.json({ notification });

  } catch (error) {
    console.error('Ошибка обновления уведомления:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Отметка всех уведомлений как прочитанных
router.patch('/mark-all-read', notificationsLimiter, auth, async (req, res) => {
  try {
    const result = await sql`
      UPDATE notifications 
      SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${req.user.id} AND is_read = FALSE
    `;

    res.json({ 
      message: 'Все уведомления отмечены как прочитанные',
      updated_count: result.count 
    });

  } catch (error) {
    console.error('Ошибка обновления уведомлений:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удаление уведомления
router.delete('/:id', notificationsLimiter, auth, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);

    const [notification] = await sql`
      DELETE FROM notifications 
      WHERE id = ${notificationId} AND user_id = ${req.user.id}
      RETURNING id
    `;

    if (!notification) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }

    res.json({ message: 'Уведомление удалено' });

  } catch (error) {
    console.error('Ошибка удаления уведомления:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удаление всех прочитанных уведомлений
router.delete('/clear-read', notificationsLimiter, auth, async (req, res) => {
  try {
    const result = await sql`
      DELETE FROM notifications 
      WHERE user_id = ${req.user.id} AND is_read = TRUE
    `;

    res.json({ 
      message: 'Прочитанные уведомления удалены',
      deleted_count: result.count 
    });

  } catch (error) {
    console.error('Ошибка удаления уведомлений:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Функция для создания уведомления (для использования в других модулях)
export const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const [notification] = await sql`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (${userId}, ${type}, ${title}, ${message}, ${JSON.stringify(data)})
      RETURNING id, type, title, message, data, is_read, created_at, updated_at
    `;
    return notification;
  } catch (error) {
    console.error('Ошибка создания уведомления:', error);
    throw error;
  }
};

export default router; 