#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import readline from 'readline';

// Загружаем переменные окружения
dotenv.config({ path: 'config.env' });

const execAsync = promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const createDatabaseDumpInteractive = async () => {
  try {
    console.log('📦 Интерактивное создание дампа базы данных');
    console.log('='.repeat(50));
    console.log('');

    // Получаем параметры подключения к БД
    const dbConfig = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'uxui_lab',
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password'
    };

    console.log('🔧 Текущие параметры подключения:');
    console.log(`   Хост: ${dbConfig.host}`);
    console.log(`   Порт: ${dbConfig.port}`);
    console.log(`   База данных: ${dbConfig.database}`);
    console.log(`   Пользователь: ${dbConfig.username}`);
    console.log('');

    // Предложить изменить параметры
    const changeParams = await question('🔧 Изменить параметры подключения? (y/n): ');
    
    if (changeParams.toLowerCase() === 'y' || changeParams.toLowerCase() === 'yes' || changeParams.toLowerCase() === 'да') {
      dbConfig.host = await question(`Хост (${dbConfig.host}): `) || dbConfig.host;
      dbConfig.port = await question(`Порт (${dbConfig.port}): `) || dbConfig.port;
      dbConfig.database = await question(`База данных (${dbConfig.database}): `) || dbConfig.database;
      dbConfig.username = await question(`Пользователь (${dbConfig.username}): `) || dbConfig.username;
      
      const changePassword = await question('Изменить пароль? (y/n): ');
      if (changePassword.toLowerCase() === 'y' || changePassword.toLowerCase() === 'yes' || changePassword.toLowerCase() === 'да') {
        dbConfig.password = await question('Новый пароль: ');
      }
    }

    console.log('');
    console.log('📋 Выберите тип дампа:');
    console.log('   1. Полный дамп (структура + данные)');
    console.log('   2. Только структура (схема без данных)');
    console.log('   3. Только данные (без структуры)');
    console.log('   4. Создать все типы дампов');
    
    const dumpType = await question('Выберите опцию (1-4): ');

    console.log('');
    console.log('📁 Выберите формат дампа:');
    console.log('   1. SQL текст (.sql)');
    console.log('   2. Пользовательский архив (.dump) - бинарный');
    console.log('   3. Tar архив (.tar)');
    
    const formatType = await question('Выберите формат (1-3): ');

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

    // Определяем расширение файла и формат
    let extension, formatFlag;
    switch (formatType) {
      case '2':
        extension = 'dump';
        formatFlag = '-Fc';
        break;
      case '3':
        extension = 'tar';
        formatFlag = '-Ft';
        break;
      default:
        extension = 'sql';
        formatFlag = '';
    }

    // Устанавливаем пароль через переменную окружения
    const env = { ...process.env, PGPASSWORD: dbConfig.password };

    console.log('');
    console.log('⏳ Создание дампа...');

    const createdFiles = [];

    // Функция для создания дампа
    const createDump = async (type, suffix, additionalFlags = '') => {
      const fileName = `${dbConfig.database}_${suffix}_${timestamp}.${extension}`;
      const filePath = path.join(dumpsDir, fileName);

      const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} --no-password ${formatFlag} ${additionalFlags} -f "${filePath}" --verbose --clean --if-exists`;

      try {
        await execAsync(command, { env });
        console.log(`✅ ${type} создан: ${fileName}`);
        
        const stats = fs.statSync(filePath);
        const size = formatFlag ? (stats.size / 1024 / 1024).toFixed(2) + ' MB' : (stats.size / 1024).toFixed(2) + ' KB';
        
        createdFiles.push({
          name: fileName,
          path: filePath,
          type: type,
          size: size
        });
        
        return true;
      } catch (error) {
        console.log(`❌ Ошибка создания ${type.toLowerCase()}: ${error.message}`);
        return false;
      }
    };

    // Создаем дампы в зависимости от выбора
    switch (dumpType) {
      case '1':
        await createDump('Полный дамп', 'full', '--create');
        break;
      case '2':
        await createDump('Дамп структуры', 'schema', '--schema-only --create');
        break;
      case '3':
        await createDump('Дамп данных', 'data', '--data-only');
        break;
      case '4':
        await createDump('Полный дамп', 'full', '--create');
        await createDump('Дамп структуры', 'schema', '--schema-only --create');
        await createDump('Дамп данных', 'data', '--data-only');
        break;
      default:
        console.log('❌ Неверный выбор. Создается полный дамп по умолчанию.');
        await createDump('Полный дамп', 'full', '--create');
    }

    console.log('');
    console.log('🎉 Процесс создания дампа завершен!');
    console.log('='.repeat(50));
    
    if (createdFiles.length > 0) {
      console.log('📋 Созданные файлы:');
      createdFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.type}`);
        console.log(`      Файл: ${file.name}`);
        console.log(`      Размер: ${file.size}`);
        console.log(`      Путь: ${file.path}`);
        console.log('');
      });

      console.log('📖 Команды для восстановления:');
      createdFiles.forEach((file) => {
        if (file.name.includes('.sql')) {
          console.log(`   ${file.type}: psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f "${file.path}"`);
        } else {
          console.log(`   ${file.type}: pg_restore -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} "${file.path}"`);
        }
      });
    }

    console.log('');
    console.log('💡 Рекомендации:');
    console.log('   • Храните дампы в безопасном месте');
    console.log('   • Регулярно создавайте резервные копии');
    console.log('   • Проверяйте возможность восстановления дампов');
    console.log('   • Используйте сжатие для больших баз данных');

  } catch (error) {
    console.error('❌ Ошибка создания дампа:', error.message);
    console.log('');
    console.log('🔧 Возможные причины ошибки:');
    console.log('   • pg_dump не установлен или недоступен');
    console.log('   • Неверные параметры подключения к БД');
    console.log('   • Недостаточные права доступа к БД');
    console.log('   • База данных недоступна');
  } finally {
    rl.close();
    process.exit(0);
  }
};

// Запуск интерактивного создания дампа
createDatabaseDumpInteractive(); 