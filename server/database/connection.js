import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: 'config.env' });

// Конфигурация подключения к PostgreSQL
const sql = postgres({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'uxui_lab',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: true,
  onnotice: process.env.NODE_ENV === 'development' ? console.log : false,
  debug: process.env.NODE_ENV === 'development',
  transform: {
    undefined: null,
  },
  connection: {
    application_name: 'uxui-lab'
  }
});

// Функция query для совместимости с существующим кодом
export const query = async (text, params = []) => {
  try {
    const result = await sql.unsafe(text, params);
    return { rows: result };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Тест подключения
export const testConnection = async () => {
  try {
    const result = await sql`SELECT version()`;
    console.log('✅ Подключение к PostgreSQL успешно установлено');
    console.log('Версия PostgreSQL:', result[0].version);
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL:', error.message);
    return false;
  }
};

// Graceful shutdown
export const closeConnection = async () => {
  try {
    await sql.end({ timeout: 5 });
    console.log('🔐 Соединение с базой данных закрыто');
  } catch (error) {
    console.error('Ошибка при закрытии соединения:', error.message);
  }
};

// Обработка сигналов для graceful shutdown
process.on('SIGINT', closeConnection);
process.on('SIGTERM', closeConnection);

export default sql; 