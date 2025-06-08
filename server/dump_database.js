#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config({ path: 'config.env' });

const execAsync = promisify(exec);

const createDatabaseDump = async () => {
  try {
    console.log('📦 Создание дампа базы данных...');
    console.log('='.repeat(50));

    // Получаем параметры подключения к БД
    const dbConfig = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'uxui_lab',
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password'
    };

    console.log('🔧 Параметры подключения:');
    console.log(`   Хост: ${dbConfig.host}`);
    console.log(`   Порт: ${dbConfig.port}`);
    console.log(`   База данных: ${dbConfig.database}`);
    console.log(`   Пользователь: ${dbConfig.username}`);
    console.log('');

    // Создаем папку для дампов если её нет
    const dumpsDir = path.join(process.cwd(), 'database_dumps');
    if (!fs.existsSync(dumpsDir)) {
      fs.mkdirSync(dumpsDir, { recursive: true });
      console.log(`📁 Создана папка для дампов: ${dumpsDir}`);
    }

    // Генерируем имя файла с текущей датой и временем
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .split('.')[0];
    
    const dumpFileName = `${dbConfig.database}_dump_${timestamp}.sql`;
    const dumpFilePath = path.join(dumpsDir, dumpFileName);

    // Создаем дамп с данными
    console.log('⏳ Создание дампа с данными...');
    const pgDumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} --no-password -f "${dumpFilePath}" --verbose --clean --if-exists --create`;
    
    // Устанавливаем пароль через переменную окружения
    const env = { ...process.env, PGPASSWORD: dbConfig.password };

    try {
      const { stdout, stderr } = await execAsync(pgDumpCommand, { env });
      
      if (stderr && !stderr.includes('NOTICE')) {
        console.log('⚠️  Предупреждения:', stderr);
      }
      
      console.log('✅ Дамп с данными создан успешно!');
    } catch (error) {
      throw new Error(`Ошибка создания дампа: ${error.message}`);
    }

    // Создаем дамп только схемы (без данных)
    const schemaDumpFileName = `${dbConfig.database}_schema_${timestamp}.sql`;
    const schemaDumpFilePath = path.join(dumpsDir, schemaDumpFileName);

    console.log('⏳ Создание дампа схемы (без данных)...');
    const pgDumpSchemaCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} --no-password -f "${schemaDumpFilePath}" --schema-only --verbose --clean --if-exists --create`;

    try {
      await execAsync(pgDumpSchemaCommand, { env });
      console.log('✅ Дамп схемы создан успешно!');
    } catch (error) {
      console.log('⚠️  Не удалось создать дамп схемы:', error.message);
    }

    // Получаем информацию о созданных файлах
    const fullDumpStats = fs.statSync(dumpFilePath);
    const fullDumpSize = (fullDumpStats.size / 1024 / 1024).toFixed(2);

    console.log('');
    console.log('🎉 Дампы базы данных созданы!');
    console.log('='.repeat(50));
    console.log('📋 Информация о дампах:');
    console.log(`   Полный дамп: ${dumpFileName}`);
    console.log(`   Размер: ${fullDumpSize} MB`);
    console.log(`   Путь: ${dumpFilePath}`);

    if (fs.existsSync(schemaDumpFilePath)) {
      const schemaStats = fs.statSync(schemaDumpFilePath);
      const schemaSize = (schemaStats.size / 1024).toFixed(2);
      console.log(`   Дамп схемы: ${schemaDumpFileName}`);
      console.log(`   Размер схемы: ${schemaSize} KB`);
      console.log(`   Путь схемы: ${schemaDumpFilePath}`);
    }

    console.log('');
    console.log('📖 Как восстановить дамп:');
    console.log(`   psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f "${dumpFilePath}"`);
    console.log('');
    console.log('💡 Примечания:');
    console.log('   • Дамп содержит команды DROP и CREATE для пересоздания БД');
    console.log('   • Используйте дамп схемы для создания структуры без данных');
    console.log('   • Храните дампы в безопасном месте');

  } catch (error) {
    console.error('❌ Ошибка создания дампа:', error.message);
    console.log('');
    console.log('🔧 Возможные причины ошибки:');
    console.log('   • pg_dump не установлен или недоступен');
    console.log('   • Неверные параметры подключения к БД');
    console.log('   • Недостаточные права доступа к БД');
    console.log('   • База данных недоступна');
    console.log('');
    console.log('📚 Установка pg_dump:');
    console.log('   macOS: brew install postgresql');
    console.log('   Ubuntu: sudo apt-get install postgresql-client');
    console.log('   Windows: Скачайте PostgreSQL с официального сайта');
  } finally {
    process.exit(0);
  }
};

// Запуск создания дампа
createDatabaseDump(); 