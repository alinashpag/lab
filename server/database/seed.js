import bcrypt from 'bcryptjs';
import sql from './connection.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Заполнение базы данных тестовыми данными...');

    // Создание тестового пользователя
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Пытаемся создать пользователя с новой схемой, если не получится - используем старую
    let user;
    try {
      user = await sql`
        INSERT INTO users (username, email, password_hash, first_name, role, email_verified)
        VALUES ('admin', 'admin@uxuilab.com', ${hashedPassword}, 'Администратор', 'admin', true)
        ON CONFLICT (email) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          role = EXCLUDED.role,
          password_hash = EXCLUDED.password_hash
        RETURNING id, username, email, first_name, role
      `;
    } catch (error) {
      console.log('Пробуем со старой схемой базы данных...');
      user = await sql`
        INSERT INTO users (username, email, password, name, role, email_verified)
        VALUES ('admin', 'admin@uxuilab.com', ${hashedPassword}, 'Администратор', 'admin', true)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          password = EXCLUDED.password
        RETURNING id, username, email, name, role
      `;
    }
    
    console.log('✅ Создан пользователь:', user[0]);

    // Создание тестовых проектов
    const projects = [
      {
        name: 'E-commerce Dashboard',
        description: 'Анализ интерфейса административной панели для интернет-магазина',
        project_type: 'website',
        website_url: 'https://example-shop.com/admin',
        status: 'active'
      },
      {
        name: 'Mobile Banking App',
        description: 'UX анализ мобильного приложения банка',
        project_type: 'figma',
        figma_url: 'https://figma.com/file/xyz',
        status: 'active'
      },
      {
        name: 'Landing Page Design',
        description: 'Анализ посадочной страницы продукта',
        project_type: 'website',
        website_url: 'https://example-landing.com',
        status: 'active'
      }
    ];

    for (const project of projects) {
      const createdProject = await sql`
        INSERT INTO projects (user_id, name, description, project_type, website_url, figma_url, status)
        VALUES (${user[0].id}, ${project.name}, ${project.description}, ${project.project_type}, 
                ${project.website_url || null}, ${project.figma_url || null}, ${project.status})
        RETURNING id, name
      `;
      console.log('✅ Создан проект:', createdProject[0]);

      // Создание тестового анализа для каждого проекта
      const analysisTypes = ['accessibility', 'usability', 'performance'];
      const randomType = analysisTypes[Math.floor(Math.random() * analysisTypes.length)];
      
      const analysis = await sql`
        INSERT INTO analyses (project_id, analysis_type, status, score, issues_found, 
                             results, completed_at)
        VALUES (${createdProject[0].id}, ${randomType}, 'completed', 
                ${Math.floor(Math.random() * 41) + 60}, ${Math.floor(Math.random() * 20) + 1},
                '{"summary": "Анализ завершен", "recommendations": ["Улучшить контрастность", "Добавить alt-теги"]}',
                NOW() - INTERVAL '1 hour')
        RETURNING id, analysis_type, score
      `;
      console.log('✅ Создан анализ:', analysis[0]);

      // Создание отчета для анализа
      const report = await sql`
        INSERT INTO reports (project_id, analysis_id, report_type, filename, 
                           file_path, status, expires_at)
        VALUES (${createdProject[0].id}, ${analysis[0].id}, 'pdf', 
                ${`report_${createdProject[0].id}_${Date.now()}.pdf`},
                ${`/reports/report_${createdProject[0].id}_${Date.now()}.pdf`},
                'ready', NOW() + INTERVAL '30 days')
        RETURNING id, filename
      `;
      console.log('✅ Создан отчет:', report[0]);
    }

    // Создание дополнительного обычного пользователя
    const regularUserPassword = await bcrypt.hash('password123', 12);
    let regularUser;
    try {
      regularUser = await sql`
        INSERT INTO users (username, email, password_hash, first_name, role, email_verified)
        VALUES ('demo', 'demo@uxuilab.com', ${regularUserPassword}, 'Демо пользователь', 'user', true)
        ON CONFLICT (email) DO UPDATE SET
          first_name = EXCLUDED.first_name
        RETURNING id, username, email, first_name, role
      `;
    } catch (error) {
      regularUser = await sql`
        INSERT INTO users (username, email, password, name, role, email_verified)
        VALUES ('demo', 'demo@uxuilab.com', ${regularUserPassword}, 'Демо пользователь', 'user', true)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name
        RETURNING id, username, email, name, role
      `;
    }
    
    // Создание третьего тестового пользователя
    const testUserPassword = await bcrypt.hash('password123', 12);
    let testUser;
    try {
      testUser = await sql`
        INSERT INTO users (username, email, password_hash, first_name, role, email_verified)
        VALUES ('test', 'test@example.com', ${testUserPassword}, 'Тестовый пользователь', 'user', true)
        ON CONFLICT (email) DO UPDATE SET
          first_name = EXCLUDED.first_name
        RETURNING id, username, email, first_name, role
      `;
    } catch (error) {
      testUser = await sql`
        INSERT INTO users (username, email, password, name, role, email_verified)
        VALUES ('test', 'test@example.com', ${testUserPassword}, 'Тестовый пользователь', 'user', true)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name
        RETURNING id, username, email, name, role
      `;
    }
    console.log('✅ Создан обычный пользователь:', regularUser[0]);
    console.log('✅ Создан тестовый пользователь:', testUser[0]);

    // Создание тестовых уведомлений
    const notifications = [
      {
        user_id: user[0].id,
        type: 'analysis_completed',
        title: 'Анализ завершён',
        message: 'Анализ доступности для проекта "E-commerce Dashboard" успешно завершён.',
        data: { project_id: 1, analysis_id: 1, score: 85 }
      },
      {
        user_id: user[0].id,
        type: 'report_ready',
        title: 'Отчёт готов',
        message: 'Отчёт по проекту "Mobile Banking App" готов к скачиванию.',
        data: { project_id: 2, report_id: 1 }
      },
      {
        user_id: user[0].id,
        type: 'system_update',
        title: 'Обновление системы',
        message: 'Добавлены новые возможности анализа цветовых схем и типографики.',
        data: { version: '1.2.0' }
      },
      {
        user_id: regularUser[0].id,
        type: 'welcome',
        title: 'Добро пожаловать!',
        message: 'Спасибо за регистрацию в UX/UI Lab. Создайте свой первый проект для анализа.',
        data: {}
      },
      {
        user_id: regularUser[0].id,
        type: 'tip',
        title: 'Совет дня',
        message: 'Используйте анализ доступности, чтобы сделать ваш интерфейс более инклюзивным.',
        data: { category: 'accessibility' }
      },
      {
        user_id: testUser[0].id,
        type: 'analysis_started',
        title: 'Анализ запущен',
        message: 'Начат анализ производительности для проекта "Landing Page Design".',
        data: { project_id: 3, analysis_type: 'performance' }
      },
      {
        user_id: testUser[0].id,
        type: 'quota_warning',
        title: 'Лимит анализов',
        message: 'Использовано 8 из 10 бесплатных анализов в этом месяце.',
        data: { used: 8, total: 10 }
      }
    ];

    for (const notification of notifications) {
      const createdNotification = await sql`
        INSERT INTO notifications (user_id, type, title, message, data, is_read)
        VALUES (${notification.user_id}, ${notification.type}, ${notification.title}, 
                ${notification.message}, ${JSON.stringify(notification.data)}, 
                ${Math.random() > 0.5})
        RETURNING id, title, type
      `;
      console.log('✅ Создано уведомление:', createdNotification[0]);
    }

    console.log('🎉 Заполнение базы данных завершено!');
    console.log('');
    console.log('📋 Данные для входа:');
    console.log('Администратор: admin@uxuilab.com / password123');
    console.log('Демо пользователь: demo@uxuilab.com / password123');
    console.log('Тестовый пользователь: test@example.com / password123');
    console.log('');

    return true;

  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    return false;
  }
};

// Запуск если файл вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then((success) => {
      if (success) {
        console.log('База данных успешно заполнена!');
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

export default seedDatabase; 