import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Импорт маршрутов
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import analysisRoutes from './routes/analysis.js';
import reportRoutes from './routes/reports.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';

// Импорт утилит
import { testConnection } from './database/connection.js';
import { runMigrations } from './database/migrate.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

// Конфигурация окружения
dotenv.config({ path: 'config.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Настройка rate limiting (отключено для разработки)
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 минут
  max: process.env.NODE_ENV === 'development' ? 10000 : (process.env.RATE_LIMIT_MAX || 1000), // максимум запросов
  message: {
    error: 'Слишком много запросов с этого IP, попробуйте позже.',
    retryAfter: Math.ceil((process.env.RATE_LIMIT_WINDOW || 15) * 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // Пропускаем в режиме разработки
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(limiter);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage()
  });
});

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/projects', authenticateToken, projectRoutes);
app.use('/api/analysis', authenticateToken, analysisRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// Fallback для SPA
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Эндпоинт не найден',
    message: `Маршрут ${req.method} ${req.originalUrl} не существует`,
    availableEndpoints: {
      auth: '/api/auth/*',
      users: '/api/users/*',
      projects: '/api/projects/*',
      analysis: '/api/analysis/*',
      reports: '/api/reports/*',
      health: '/api/health'
    }
  });
});

// Обработчик ошибок (должен быть последним)
app.use(errorHandler);

// Функция запуска сервера
const startServer = async () => {
  try {
    console.log('🚀 Запуск UX/UI Lab сервера...');
    
    // Проверка подключения к базе данных
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Не удалось подключиться к базе данных');
    }

    // Запуск миграций
    await runMigrations();

    // Создание папки для загрузок
    const uploadsDir = path.join(__dirname, '../uploads');
    const { mkdirSync, existsSync } = await import('fs');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 Создана папка для загрузок');
    }

    // Запуск сервера
    const server = app.listen(PORT, () => {
      console.log(`🌟 Сервер запущен на порту ${PORT}`);
      console.log(`📊 Режим: ${process.env.NODE_ENV}`);
      console.log(`🔗 Локальный URL: http://localhost:${PORT}`);
      console.log(`📚 API документация: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n⚡ Получен сигнал ${signal}, корректное завершение работы...`);
      
      server.close(async () => {
        console.log('🔒 HTTP сервер закрыт');
        
        // Закрытие соединения с БД происходит в connection.js
        console.log('👋 Процесс завершен корректно');
        process.exit(0);
      });

      // Принудительное завершение через 10 секунд
      setTimeout(() => {
        console.error('⏰ Принудительное завершение процесса');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error.message);
    process.exit(1);
  }
};

// Запуск сервера
startServer();

export default app; 