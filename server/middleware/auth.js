import jwt from 'jsonwebtoken';
import sql from '../database/connection.js';

// Middleware для проверки JWT токена
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Токен доступа отсутствует',
        message: 'Необходимо войти в систему'
      });
    }

    // Проверка токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Проверка активности пользователя в базе (поддержка старой и новой схемы)
    let user;
    try {
      user = await sql`
        SELECT id, username, email, role, is_active, email_verified
        FROM users 
        WHERE id = ${decoded.userId} AND is_active = true
      `;
    } catch (error) {
      // Пробуем со старой схемой (без поля is_active)
      user = await sql`
        SELECT id, username, email, role, email_verified
        FROM users 
        WHERE id = ${decoded.userId}
      `;
    }

    if (!user.length) {
      return res.status(401).json({
        error: 'Пользователь не найден или неактивен',
        message: 'Необходимо войти в систему заново'
      });
    }

    // Добавление информации о пользователе в запрос
    req.user = user[0];
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Недействительный токен',
        message: 'Необходимо войти в систему заново'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Токен истек',
        message: 'Сессия истекла, необходимо войти в систему заново'
      });
    }

    console.error('Ошибка аутентификации:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      message: 'Ошибка при проверке токена'
    });
  }
};

// Middleware для проверки ролей
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Пользователь не аутентифицирован'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Недостаточно прав доступа',
        message: `Требуется роль: ${allowedRoles.join(' или ')}`,
        userRole
      });
    }

    next();
  };
};

// Middleware для проверки администратора
export const requireAdmin = requireRole('admin');

// Middleware для проверки аналитика или администратора
export const requireAnalyst = requireRole(['admin', 'analyst']);

// Middleware для проверки подтвержденного email
export const requireEmailVerified = (req, res, next) => {
  if (!req.user.email_verified) {
    return res.status(403).json({
      error: 'Требуется подтверждение email',
      message: 'Необходимо подтвердить адрес электронной почты для выполнения этого действия'
    });
  }
  next();
};

// Функция генерации JWT токена
export const generateToken = (userId, options = {}) => {
  const payload = { userId };
  const defaultOptions = {
    expiresIn: '24h',
    issuer: 'uxui-lab',
    audience: 'uxui-lab-users'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    ...defaultOptions,
    ...options
  });
};

// Функция генерации refresh токена
export const generateRefreshToken = (userId) => {
  return generateToken(userId, { expiresIn: '7d' });
};

// Функция проверки токена без middleware
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}; 