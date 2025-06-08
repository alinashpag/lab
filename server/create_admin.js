#!/usr/bin/env node
import bcrypt from 'bcryptjs';
import sql from './database/connection.js';

const createAdmin = async () => {
  try {
    console.log('🔐 Создание нового администратора...');

    // Запросить данные у пользователя или использовать дефолтные
    const adminData = {
      username: process.argv[2] || 'admin',
      email: process.argv[3] || 'admin@uxuilab.com',
      password: process.argv[4] || 'admin123',
      firstName: process.argv[5] || 'Администратор'
    };

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminData.email)) {
      throw new Error('Некорректный формат email');
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Попытка создать пользователя с новой схемой БД
    let admin;
    try {
      admin = await sql`
        INSERT INTO users (username, email, password_hash, first_name, role, email_verified, created_at, updated_at)
        VALUES (${adminData.username}, ${adminData.email}, ${hashedPassword}, ${adminData.firstName}, 'admin', true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          role = 'admin',
          password_hash = EXCLUDED.password_hash,
          updated_at = NOW()
        RETURNING id, username, email, first_name, role, created_at
      `;
    } catch (error) {
      // Fallback для старой схемы БД
      console.log('Используется старая схема базы данных...');
      admin = await sql`
        INSERT INTO users (username, email, password, name, role, email_verified, created_at, updated_at)
        VALUES (${adminData.username}, ${adminData.email}, ${hashedPassword}, ${adminData.firstName}, 'admin', true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = 'admin',
          password = EXCLUDED.password,
          updated_at = NOW()
        RETURNING id, username, email, name, role, created_at
      `;
    }

    console.log('✅ Администратор успешно создан!');
    console.log('📋 Данные администратора:');
    console.log(`   ID: ${admin[0].id}`);
    console.log(`   Username: ${admin[0].username}`);
    console.log(`   Email: ${admin[0].email}`);
    console.log(`   Имя: ${admin[0].first_name || admin[0].name}`);
    console.log(`   Роль: ${admin[0].role}`);
    console.log(`   Создан: ${admin[0].created_at}`);
    console.log('');
    console.log('🔑 Данные для входа:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Пароль: ${adminData.password}`);
    console.log('');
    console.log('⚠️  Обязательно смените пароль после первого входа!');

  } catch (error) {
    console.error('❌ Ошибка создания администратора:', error.message);
    console.log('');
    console.log('📖 Использование:');
    console.log('   node create_admin.js [username] [email] [password] [firstName]');
    console.log('');
    console.log('📝 Примеры:');
    console.log('   node create_admin.js');
    console.log('   node create_admin.js admin admin@company.com mypassword "Главный Админ"');
    console.log('   node create_admin.js superuser super@domain.com securepass123 "Супер Пользователь"');
  } finally {
    process.exit(0);
  }
};

// Запуск создания администратора
createAdmin(); 