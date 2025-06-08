import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: 'config.env' });

// Подключение к PostgreSQL с базой данных по умолчанию
const sql = postgres({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: 'postgres', // Подключаемся к базе по умолчанию
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 30,
});

const createDatabase = async () => {
  try {
    console.log('🔗 Подключение к PostgreSQL...');
    
    // Проверяем существует ли база данных
    const dbName = process.env.POSTGRES_DB || 'uxui_lab';
    
    const existingDb = await sql`
      SELECT 1 FROM pg_database WHERE datname = ${dbName}
    `;

    if (existingDb.length > 0) {
      console.log(`✅ База данных "${dbName}" уже существует`);
    } else {
      // Создаем базу данных
      console.log(`📝 Создание базы данных "${dbName}"...`);
      await sql.unsafe(`CREATE DATABASE "${dbName}"`);
      console.log(`🎉 База данных "${dbName}" успешно создана!`);
    }

    await sql.end();
    return true;

  } catch (error) {
    console.error('❌ Ошибка при создании базы данных:', error);
    await sql.end();
    return false;
  }
};

// Запуск если файл вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  createDatabase()
    .then((success) => {
      if (success) {
        console.log('Теперь можно запустить миграции: npm run db:migrate');
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Критическая ошибка:', error);
      process.exit(1);
    });
}

export default createDatabase; 