import express from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import sql from '../database/connection.js';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyToken,
  authenticateToken 
} from '../middleware/auth.js';
import { handleValidationErrors, asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Валидация регистрации
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Имя пользователя должно быть от 3 до 50 символов')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Имя пользователя может содержать только буквы, цифры и подчеркивания'),
  
  body('email')
    .isEmail()
    .withMessage('Некорректный email адрес')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Пароль должен содержать строчные и заглавные буквы, а также цифры'),
  
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Имя не должно превышать 50 символов'),
  
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Фамилия не должна превышать 50 символов')
];

// Валидация входа
const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Имя пользователя или email обязательны'),
  
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен')
];

// POST /api/auth/register - Регистрация нового пользователя
router.post('/register', registerValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  // Проверка существования пользователя
  const existingUser = await sql`
    SELECT id FROM users 
    WHERE username = ${username} OR email = ${email}
  `;

  if (existingUser.length > 0) {
    return res.status(409).json({
      error: 'Пользователь уже существует',
      message: 'Пользователь с таким именем или email уже зарегистрирован'
    });
  }

  // Хеширование пароля
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Создание пользователя
  const newUser = await sql`
    INSERT INTO users (username, email, password_hash, first_name, last_name)
    VALUES (${username}, ${email}, ${passwordHash}, ${firstName}, ${lastName})
    RETURNING id, username, email, first_name, last_name, role, created_at
  `;

  const user = newUser[0];

  // Генерация токенов
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Сохранение сессии
  await sql`
    INSERT INTO user_sessions (user_id, token_hash, expires_at, ip_address, user_agent)
    VALUES (
      ${user.id}, 
      ${refreshToken}, 
      ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}, 
      ${req.ip},
      ${req.get('User-Agent')}
    )
  `;

  res.status(201).json({
    message: 'Пользователь успешно зарегистрирован',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.first_name || user.last_name || null,
      role: user.role,
      createdAt: user.created_at
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: '24h'
    }
  });
}));

// POST /api/auth/login - Вход в систему
router.post('/login', loginValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const { username, password, rememberMe } = req.body;

  // Поиск пользователя по username или email (поддержка старой и новой схемы)
  let users;
  try {
    users = await sql`
      SELECT id, username, email, password_hash, first_name, last_name, role, is_active, email_verified
      FROM users 
      WHERE (username = ${username} OR email = ${username}) AND is_active = true
    `;
  } catch (error) {
    // Пробуем со старой схемой
    users = await sql`
      SELECT id, username, email, password, name, role, email_verified
      FROM users 
      WHERE (username = ${username} OR email = ${username})
    `;
  }

  if (!users.length) {
    return res.status(401).json({
      success: false,
      error: 'Неверные учетные данные',
      message: 'Пользователь не найден или неактивен'
    });
  }

  const user = users[0];

  // Проверка пароля (поддержка старой и новой схемы)
  const passwordField = user.password_hash || user.password;
  const isPasswordValid = await bcrypt.compare(password, passwordField);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Неверные учетные данные',
      message: 'Неправильный пароль'
    });
  }

  // Генерация токенов
  const expiresIn = rememberMe ? '7d' : '24h';
  const accessToken = generateToken(user.id, { expiresIn });
  const refreshToken = generateRefreshToken(user.id);

  // Сохранение сессии
  await sql`
    INSERT INTO user_sessions (user_id, token_hash, expires_at, ip_address, user_agent)
    VALUES (
      ${user.id}, 
      ${refreshToken}, 
      ${new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000)}, 
      ${req.ip},
      ${req.get('User-Agent')}
    )
  `;

  // Обновление времени последнего входа
  await sql`
    UPDATE users 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = ${user.id}
  `;

  res.json({
    success: true,
    message: 'Успешный вход в систему',
    token: accessToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.first_name || user.last_name || user.name || null,
      role: user.role,
      emailVerified: user.email_verified
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn
    }
  });
}));

// POST /api/auth/refresh - Обновление токена
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      error: 'Refresh token отсутствует',
      message: 'Необходимо войти в систему заново'
    });
  }

  // Проверка токена
  const decoded = verifyToken(refreshToken);
  if (!decoded) {
    return res.status(401).json({
      error: 'Недействительный refresh token',
      message: 'Необходимо войти в систему заново'
    });
  }

  // Проверка сессии в базе
  const sessions = await sql`
    SELECT s.*, u.username, u.email, u.role, u.is_active
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token_hash = ${refreshToken} 
      AND s.expires_at > CURRENT_TIMESTAMP 
      AND u.is_active = true
  `;

  if (!sessions.length) {
    return res.status(401).json({
      error: 'Сессия недействительна или истекла',
      message: 'Необходимо войти в систему заново'
    });
  }

  const session = sessions[0];

  // Генерация нового access token
  const newAccessToken = generateToken(session.user_id);

  res.json({
    message: 'Токен успешно обновлен',
    tokens: {
      accessToken: newAccessToken,
      refreshToken, // Возвращаем тот же refresh token
      expiresIn: '24h'
    }
  });
}));

// POST /api/auth/logout - Выход из системы
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  // Удаление сессии
  if (refreshToken) {
    await sql`
      DELETE FROM user_sessions 
      WHERE token_hash = ${refreshToken} AND user_id = ${req.user.id}
    `;
  }

  res.json({
    message: 'Успешный выход из системы'
  });
}));

// GET /api/auth/me - Получение информации о текущем пользователе
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const users = await sql`
    SELECT id, username, email, name, role, 
           is_active, email_verified, created_at, updated_at
    FROM users 
    WHERE id = ${req.user.id}
  `;

  if (!users.length) {
    return res.status(404).json({
      error: 'Пользователь не найден'
    });
  }

  const user = users[0];

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }
  });
}));

// DELETE /api/auth/sessions - Удаление всех сессий пользователя
router.delete('/sessions', authenticateToken, asyncHandler(async (req, res) => {
  const deletedSessions = await sql`
    DELETE FROM user_sessions 
    WHERE user_id = ${req.user.id}
    RETURNING id
  `;

  res.json({
    message: `Удалено сессий: ${deletedSessions.length}`,
    deletedCount: deletedSessions.length
  });
}));

export default router; 