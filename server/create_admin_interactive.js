#!/usr/bin/env node
import bcrypt from 'bcryptjs';
import sql from './database/connection.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const createAdminInteractive = async () => {
  try {
    console.log('🔐 Интерактивное создание администратора UX/UI Lab');
    console.log('='.repeat(50));
    console.log('');

    // Запрос данных у пользователя
    const username = await question('👤 Введите username администратора (по умолчанию: admin): ') || 'admin';
    
    let email;
    while (!email) {
      const inputEmail = await question('📧 Введите email администратора: ');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(inputEmail)) {
        email = inputEmail;
      } else {
        console.log('❌ Некорректный формат email. Попробуйте еще раз.');
      }
    }

    let password;
    while (!password) {
      const inputPassword = await question('🔑 Введите пароль (минимум 6 символов): ');
      if (inputPassword.length >= 6) {
        password = inputPassword;
      } else {
        console.log('❌ Пароль должен содержать минимум 6 символов. Попробуйте еще раз.');
      }
    }

    const firstName = await question('🏷️  Введите имя администратора (по умолчанию: Администратор): ') || 'Администратор';

    console.log('');
    console.log('📋 Проверьте введенные данные:');
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Пароль: ${'*'.repeat(password.length)}`);
    console.log(`   Имя: ${firstName}`);
    console.log('');

    const confirm = await question('✅ Подтвердите создание администратора (y/n): ');
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'да') {
      console.log('❌ Создание администратора отменено.');
      return;
    }

    console.log('');
    console.log('⏳ Создание администратора...');

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 12);

    // Попытка создать пользователя с новой схемой БД
    let admin;
    try {
      admin = await sql`
        INSERT INTO users (username, email, password_hash, first_name, role, email_verified, created_at, updated_at)
        VALUES (${username}, ${email}, ${hashedPassword}, ${firstName}, 'admin', true, NOW(), NOW())
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
        VALUES (${username}, ${email}, ${hashedPassword}, ${firstName}, 'admin', true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = 'admin',
          password = EXCLUDED.password,
          updated_at = NOW()
        RETURNING id, username, email, name, role, created_at
      `;
    }

    console.log('');
    console.log('🎉 Администратор успешно создан!');
    console.log('='.repeat(50));
    console.log('📋 Информация об администраторе:');
    console.log(`   ID: ${admin[0].id}`);
    console.log(`   Username: ${admin[0].username}`);
    console.log(`   Email: ${admin[0].email}`);
    console.log(`   Имя: ${admin[0].first_name || admin[0].name}`);
    console.log(`   Роль: ${admin[0].role}`);
    console.log(`   Создан: ${admin[0].created_at}`);
    console.log('');
    console.log('🔑 Данные для входа в систему:');
    console.log(`   Email: ${email}`);
    console.log(`   Пароль: ${password}`);
    console.log('');
    console.log('⚠️  Рекомендации по безопасности:');
    console.log('   • Смените пароль после первого входа');
    console.log('   • Используйте двухфакторную аутентификацию');
    console.log('   • Не передавайте данные доступа третьим лицам');
    console.log('');
    console.log('🌐 Адрес админ-панели: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Ошибка создания администратора:', error.message);
    console.log('');
    console.log('🔧 Возможные причины ошибки:');
    console.log('   • Проблемы с подключением к базе данных');
    console.log('   • Пользователь с таким email уже существует');
    console.log('   • Недостаточные права доступа к БД');
  } finally {
    rl.close();
    process.exit(0);
  }
};

// Запуск интерактивного создания администратора
createAdminInteractive(); 