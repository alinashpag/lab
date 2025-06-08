import sql from './connection.js';

// Функция для создания базы данных и таблиц
export const runMigrations = async () => {
  try {
    console.log('🚀 Запуск миграций базы данных...');

    // Создание таблицы пользователей
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'analyst')),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Таблица users создана');

    // Создание таблицы проектов
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        project_type VARCHAR(20) NOT NULL CHECK (project_type IN ('website', 'figma', 'images')),
        website_url TEXT,
        figma_url TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Таблица projects создана');

    // Создание таблицы файлов проекта
    await sql`
      CREATE TABLE IF NOT EXISTS project_files (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        original_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Таблица project_files создана');

    // Создание таблицы анализов
    await sql`
      CREATE TABLE IF NOT EXISTS analyses (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        analysis_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
        results JSONB DEFAULT '{}',
        score INTEGER CHECK (score >= 0 AND score <= 100),
        issues_found INTEGER DEFAULT 0,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Таблица analyses создана');

    // Создание таблицы отчетов
    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        analysis_id INTEGER REFERENCES analyses(id) ON DELETE CASCADE,
        report_type VARCHAR(20) DEFAULT 'pdf' CHECK (report_type IN ('pdf', 'html', 'json')),
        filename VARCHAR(255),
        file_path TEXT,
        file_size INTEGER,
        status VARCHAR(20) DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'expired', 'failed')),
        expires_at TIMESTAMP WITH TIME ZONE,
        download_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Таблица reports создана');

    // Создание таблицы сессий
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        ip_address INET,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Таблица user_sessions создана');

    // Создание индексов для оптимизации
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analyses_project_id ON analyses(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash)`;
    console.log('✅ Индексы созданы');

    // Создание триггера для обновления updated_at
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
        ) THEN
          CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at'
        ) THEN
          CREATE TRIGGER update_projects_updated_at
            BEFORE UPDATE ON projects
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$
    `;
    console.log('✅ Тригgers созданы');

    console.log('🎉 Миграции успешно завершены!');
    return true;

  } catch (error) {
    console.error('❌ Ошибка при выполнении миграций:', error);
    return false;
  }
};

// Запуск миграций если файл выполняется напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('Миграции завершены, закрытие соединения...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Критическая ошибка:', error);
      process.exit(1);
    });
}

export default runMigrations; 