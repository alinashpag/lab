import { validationResult } from 'express-validator';

// Централизованный обработчик ошибок
export const errorHandler = (error, req, res, next) => {
  console.error('Ошибка сервера:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Ошибки валидации
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Ошибка валидации данных',
      message: error.message,
      details: error.details || []
    });
  }

  // Ошибки JWT
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

  // Ошибки базы данных PostgreSQL
  if (error.code) {
    switch (error.code) {
      case '23505': // Нарушение уникальности
        return res.status(409).json({
          error: 'Конфликт данных',
          message: 'Запись с такими данными уже существует',
          field: error.constraint
        });
      
      case '23503': // Нарушение внешнего ключа
        return res.status(400).json({
          error: 'Ошибка связи данных',
          message: 'Ссылка на несуществующую запись'
        });
      
      case '23502': // Нарушение NOT NULL
        return res.status(400).json({
          error: 'Отсутствуют обязательные данные',
          message: 'Не заполнены обязательные поля'
        });
      
      case '22001': // Строка слишком длинная
        return res.status(400).json({
          error: 'Данные слишком длинные',
          message: 'Превышена максимальная длина поля'
        });
      
      case '08006': // Ошибка соединения
        return res.status(503).json({
          error: 'Ошибка соединения с базой данных',
          message: 'Временно недоступно, попробуйте позже'
        });
      
      default:
        return res.status(500).json({
          error: 'Ошибка базы данных',
          message: process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'Внутренняя ошибка сервера'
        });
    }
  }

  // Ошибки Multer (загрузка файлов)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Файл слишком большой',
      message: `Максимальный размер файла: ${(process.env.MAX_FILE_SIZE / 1024 / 1024).toFixed(1)} МБ`
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Неожиданный файл',
      message: 'Недопустимый тип или количество файлов'
    });
  }

  // Ошибки статуса HTTP
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    return res.status(status).json({
      error: error.message || 'Ошибка клиента',
      message: getStatusMessage(status)
    });
  }

  // Общие ошибки
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Что-то пошло не так',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Middleware для обработки ошибок валидации
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Ошибка валидации данных',
      message: 'Переданы некорректные данные',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

// Middleware для асинхронных обработчиков
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Создание кастомной ошибки
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Вспомогательная функция для получения сообщения по статусу
const getStatusMessage = (status) => {
  const messages = {
    400: 'Некорректный запрос',
    401: 'Не авторизован',
    403: 'Доступ запрещен',
    404: 'Ресурс не найден',
    405: 'Метод не разрешен',
    409: 'Конфликт данных',
    413: 'Слишком большой запрос',
    422: 'Невозможно обработать',
    429: 'Слишком много запросов',
    500: 'Внутренняя ошибка сервера',
    502: 'Плохой шлюз',
    503: 'Сервис недоступен',
    504: 'Тайм-аут шлюза'
  };
  
  return messages[status] || 'Неизвестная ошибка';
};

// Обработчик для неперехваченных Promise отклонений
process.on('unhandledRejection', (reason, promise) => {
  console.error('Необработанное отклонение Promise:', reason);
  console.error('В Promise:', promise);
});

// Обработчик для неперехваченных исключений
process.on('uncaughtException', (error) => {
  console.error('Необработанное исключение:', error);
  process.exit(1);
}); 