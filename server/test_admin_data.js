import sql from './database/connection.js';

const createTestData = async () => {
  try {
    console.log('🚀 Создание тестовых данных для админ-панели...');

    // Создаем тестового пользователя
    const testUser = await sql`
      INSERT INTO users (username, email, password_hash, first_name, last_name, role)
      VALUES ('testuser', 'test@example.com', '$2a$10$dummy.hash.for.test', 'Тест', 'Пользователь', 'user')
      ON CONFLICT (email) DO UPDATE SET 
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name
      RETURNING id
    `;

    const userId = testUser[0].id;
    console.log(`✅ Создан тестовый пользователь с ID: ${userId}`);

    // Создаем тестовые проекты
    const projects = [
      {
        name: 'Интернет-магазин электроники',
        description: 'Современный e-commerce сайт с большим каталогом товаров',
        website_url: 'https://example-electronics.com',
        project_type: 'website'
      },
      {
        name: 'Мобильное приложение банка',
        description: 'Приложение для мобильного банкинга с биометрической аутентификацией',
        project_type: 'mobile'
      },
      {
        name: 'Figma дизайн-система',
        description: 'Корпоративная дизайн-система для продуктовой команды',
        figma_url: 'https://figma.com/design-system',
        project_type: 'figma'
      }
    ];

    for (const project of projects) {
      const createdProject = await sql`
        INSERT INTO projects (user_id, name, description, website_url, figma_url, project_type, status)
        VALUES (${userId}, ${project.name}, ${project.description}, ${project.website_url || null}, ${project.figma_url || null}, ${project.project_type}, 'active')
        ON CONFLICT (user_id, name) DO UPDATE SET 
          description = EXCLUDED.description,
          website_url = EXCLUDED.website_url,
          figma_url = EXCLUDED.figma_url,
          project_type = EXCLUDED.project_type
        RETURNING id
      `;

      const projectId = createdProject[0].id;
      console.log(`✅ Создан проект: "${project.name}" с ID: ${projectId}`);

      // Создаем анализы для каждого проекта
      const analyses = [
        {
          name: 'Аудит доступности',
          analysis_type: 'accessibility',
          status: 'completed',
          score: Math.floor(Math.random() * 30) + 70
        },
        {
          name: 'Анализ производительности',
          analysis_type: 'performance',
          status: 'completed',
          score: Math.floor(Math.random() * 25) + 65
        },
        {
          name: 'UX/UI анализ',
          analysis_type: 'complete',
          status: 'running',
          score: null
        }
      ];

      for (const analysis of analyses) {
        const createdAnalysis = await sql`
          INSERT INTO analyses (project_id, name, analysis_type, status, score, started_at, completed_at)
          VALUES (
            ${projectId}, 
            ${analysis.name}, 
            ${analysis.analysis_type}, 
            ${analysis.status},
            ${analysis.score},
            ${analysis.status !== 'pending' ? new Date(Date.now() - Math.random() * 86400000) : null},
            ${analysis.status === 'completed' ? new Date() : null}
          )
          ON CONFLICT DO NOTHING
          RETURNING id
        `;

        if (createdAnalysis.length > 0) {
          console.log(`  ✅ Создан анализ: "${analysis.name}"`);
        }
      }

      // Создаем отчеты для проекта
      const reports = [
        {
          name: `Полный отчет по UX/UI - ${project.name}`,
          report_type: 'comprehensive',
          status: 'ready',
          file_size: Math.floor(Math.random() * 2000000) + 500000 // 0.5-2.5MB
        },
        {
          name: `Отчет по доступности - ${project.name}`,
          report_type: 'accessibility',
          status: 'ready',
          file_size: Math.floor(Math.random() * 1000000) + 300000 // 0.3-1.3MB
        }
      ];

      for (const report of reports) {
        const createdReport = await sql`
          INSERT INTO reports (project_id, name, report_type, status, file_size, download_count)
          VALUES (
            ${projectId}, 
            ${report.name}, 
            ${report.report_type}, 
            ${report.status},
            ${report.file_size},
            ${Math.floor(Math.random() * 10)}
          )
          ON CONFLICT DO NOTHING
          RETURNING id
        `;

        if (createdReport.length > 0) {
          console.log(`  ✅ Создан отчет: "${report.name}"`);
        }
      }
    }

    // Создаем дополнительных пользователей
    const additionalUsers = [
      {
        username: 'designer',
        email: 'designer@company.com',
        first_name: 'Анна',
        last_name: 'Дизайнер',
        role: 'user'
      },
      {
        username: 'developer',
        email: 'dev@company.com',
        first_name: 'Максим',
        last_name: 'Разработчик',
        role: 'user'
      },
      {
        username: 'manager',
        email: 'pm@company.com',
        first_name: 'Елена',
        last_name: 'Менеджер',
        role: 'moderator'
      }
    ];

    for (const user of additionalUsers) {
      await sql`
        INSERT INTO users (username, email, password_hash, first_name, last_name, role)
        VALUES (${user.username}, ${user.email}, '$2a$10$dummy.hash.for.test', ${user.first_name}, ${user.last_name}, ${user.role})
        ON CONFLICT (email) DO UPDATE SET 
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          role = EXCLUDED.role
      `;
      console.log(`✅ Создан пользователь: ${user.first_name} ${user.last_name}`);
    }

    console.log('🎉 Тестовые данные успешно созданы!');
    console.log('📊 Теперь админ-панель будет отображать реальные данные');
    
  } catch (error) {
    console.error('❌ Ошибка создания тестовых данных:', error);
  } finally {
    process.exit(0);
  }
};

createTestData(); 