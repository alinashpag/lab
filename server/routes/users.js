import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Получение данных текущего пользователя
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновление профиля пользователя
router.patch('/me', [
  authenticateToken,
  body('name').optional().isLength({ min: 2 }).withMessage('Имя должно содержать минимум 2 символа'),
  body('email').optional().isEmail().withMessage('Некорректный email адрес'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Ошибка валидации',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { name, email } = req.body;
    
    const updateFields = [];
    const updateValues = [];
    let paramCounter = 1;

    if (name) {
      updateFields.push(`name = $${paramCounter}`);
      updateValues.push(name);
      paramCounter++;
    }

    if (email) {
      // Проверяем, не занят ли email
      const emailCheck = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email уже используется' });
      }

      updateFields.push(`email = $${paramCounter}`);
      updateValues.push(email);
      paramCounter++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(userId);

    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING id, email, name, role, created_at, updated_at`,
      updateValues
    );

    res.json({ 
      message: 'Профиль успешно обновлен',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Смена пароля
router.post('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Текущий пароль обязателен'),
  body('newPassword').isLength({ min: 6 }).withMessage('Новый пароль должен содержать минимум 6 символов'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Ошибка валидации',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Получаем текущий хеш пароля
    const userResult = await query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Неверный текущий пароль' });
    }

    // Хешируем новый пароль
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Обновляем пароль
    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({ message: 'Пароль успешно изменен' });

  } catch (error) {
    console.error('Ошибка смены пароля:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение статистики пользователя
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const projectsCount = await query(
      'SELECT COUNT(*) FROM projects WHERE user_id = $1',
      [userId]
    );

    const analysesCount = await query(
      'SELECT COUNT(*) FROM analyses WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)',
      [userId]
    );

    const reportsCount = await query(
      'SELECT COUNT(*) FROM reports WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)',
      [userId]
    );

    const recentActivity = await query(`
      SELECT 
        'project' as type,
        name as title,
        created_at,
        'Создан проект' as description
      FROM projects 
      WHERE user_id = $1
      UNION ALL
      SELECT 
        'analysis' as type,
        analysis_type as title,
        created_at,
        'Запущен анализ' as description
      FROM analyses 
      WHERE project_id IN (SELECT id FROM projects WHERE user_id = $1)
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId]);

    res.json({
      stats: {
        projects: parseInt(projectsCount.rows[0].count),
        analyses: parseInt(analysesCount.rows[0].count),
        reports: parseInt(reportsCount.rows[0].count)
      },
      recentActivity: recentActivity.rows
    });

  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение настроек пользователя
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      'SELECT settings FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const settings = result.rows[0].settings || {
      theme: 'light',
      notifications: true,
      language: 'ru',
      timezone: 'Europe/Moscow'
    };

    res.json({ settings });

  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновление настроек пользователя
router.patch('/settings', [
  authenticateToken,
  body('theme').optional().isIn(['light', 'dark']).withMessage('Некорректная тема'),
  body('notifications').optional().isBoolean().withMessage('Некорректное значение уведомлений'),
  body('language').optional().isIn(['ru', 'en']).withMessage('Некорректный язык'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Ошибка валидации',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const newSettings = req.body;

    // Получаем текущие настройки
    const currentResult = await query(
      'SELECT settings FROM users WHERE id = $1',
      [userId]
    );

    const currentSettings = currentResult.rows[0]?.settings || {};
    const updatedSettings = { ...currentSettings, ...newSettings };

    // Обновляем настройки
    await query(
      'UPDATE users SET settings = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(updatedSettings), userId]
    );

    res.json({ 
      message: 'Настройки успешно обновлены',
      settings: updatedSettings
    });

  } catch (error) {
    console.error('Ошибка обновления настроек:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router; 