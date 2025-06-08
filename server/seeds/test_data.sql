-- Тестовые данные для UX/UI Lab

-- Очистка существующих тестовых данных
DELETE FROM reports WHERE project_id IN (SELECT id FROM projects WHERE user_id IN (1, 2));
DELETE FROM analyses WHERE project_id IN (SELECT id FROM projects WHERE user_id IN (1, 2));
DELETE FROM projects WHERE user_id IN (1, 2);

-- Создание администратора (если не существует)
INSERT INTO users (id, username, name, email, password, role, created_at, updated_at) 
VALUES (
  1,
  'admin', 
  'Администратор', 
  'admin@uxuilab.com', 
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfdBJpFLqoXADKW', -- пароль: password123
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  username = 'admin',
  name = 'Администратор',
  email = 'admin@uxuilab.com',
  role = 'admin',
  updated_at = NOW();

-- Создание тестового пользователя (если не существует)
INSERT INTO users (id, username, name, email, password, role, created_at, updated_at) 
VALUES (
  2,
  'testuser', 
  'Тестовый пользователь', 
  'test@example.com', 
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfdBJpFLqoXADKW', -- пароль: password123
  'user',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  username = 'testuser',
  name = 'Тестовый пользователь',
  email = 'test@example.com',
  role = 'user',
  updated_at = NOW();

-- Создание тестовых проектов для администратора (ID = 1)
INSERT INTO projects (name, description, project_type, website_url, figma_url, user_id, status, created_at, updated_at)
VALUES 
('Интернет-магазин Техники', 'Анализ UX/UI интернет-магазина электроники с фокусом на удобство покупок', 'website', 'https://example-shop.com', NULL, 1, 'active', NOW() - INTERVAL '30 days', NOW()),
('Мобильное приложение Банка', 'Дизайн-система и пользовательский интерфейс банковского приложения', 'figma', NULL, 'https://figma.com/file/banking-app', 1, 'active', NOW() - INTERVAL '15 days', NOW()),
('Корпоративный сайт', 'Редизайн корпоративного сайта с улучшенной навигацией', 'website', 'https://corporate-site.com', NULL, 1, 'active', NOW() - INTERVAL '7 days', NOW()),
('Образовательная платформа', 'UX/UI дизайн онлайн-платформы для обучения студентов', 'website', 'https://eduplatform.com', NULL, 1, 'active', NOW() - INTERVAL '5 days', NOW()),
('Медицинское приложение', 'Мобильное приложение для записи к врачу и консультаций', 'figma', NULL, 'https://figma.com/file/medical-app', 1, 'active', NOW() - INTERVAL '3 days', NOW());

-- Создание тестовых проектов для пользователя (ID = 2)
INSERT INTO projects (name, description, project_type, website_url, figma_url, user_id, status, created_at, updated_at)
VALUES 
('Новостной портал', 'Редизайн новостного сайта с улучшенной читаемостью', 'website', 'https://news-portal.com', NULL, 2, 'active', NOW() - INTERVAL '2 days', NOW()),
('Стартап Landing Page', 'Посадочная страница для стартапа в сфере технологий', 'website', 'https://startup-landing.com', NULL, 2, 'active', NOW() - INTERVAL '1 day', NOW()),
('Приложение для фитнеса', 'Дизайн мобильного приложения для тренировок и питания', 'figma', NULL, 'https://figma.com/file/fitness-app', 2, 'active', NOW(), NOW());

-- Создание анализов для администратора
INSERT INTO analyses (project_id, analysis_type, status, score, issues_found, started_at, completed_at, created_at, results)
SELECT 
  p.id,
  'complete',
  'completed',
  85,
  5,
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '25 days',
  '{"scannedPages": 15, "totalIssues": 5, "processingTime": 120, "wcagLevel": "AA", "passedCriteria": 35, "failedCriteria": 5}'::jsonb
FROM projects p WHERE p.name = 'Интернет-магазин Техники' AND p.user_id = 1;

INSERT INTO analyses (project_id, analysis_type, status, score, issues_found, started_at, completed_at, created_at, results)
SELECT 
  p.id,
  'accessibility',
  'completed',
  92,
  2,
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days',
  '{"scannedPages": 8, "totalIssues": 2, "processingTime": 90, "wcagLevel": "AA", "passedCriteria": 38, "failedCriteria": 2}'::jsonb
FROM projects p WHERE p.name = 'Интернет-магазин Техники' AND p.user_id = 1;

INSERT INTO analyses (project_id, analysis_type, status, score, issues_found, started_at, completed_at, created_at, results)
SELECT 
  p.id,
  'performance',
  'completed',
  78,
  8,
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '18 days',
  '{"scannedPages": 12, "totalIssues": 8, "processingTime": 180, "loadTime": 2300, "firstContentfulPaint": 800, "largestContentfulPaint": 2100}'::jsonb
FROM projects p WHERE p.name = 'Интернет-магазин Техники' AND p.user_id = 1;

INSERT INTO analyses (project_id, analysis_type, status, score, issues_found, started_at, completed_at, created_at, results)
SELECT 
  p.id,
  'design',
  'completed',
  88,
  3,
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '12 days',
  '{"scannedPages": 6, "totalIssues": 3, "processingTime": 60, "navigationScore": 85, "contentScore": 90, "layoutScore": 88}'::jsonb
FROM projects p WHERE p.name = 'Мобильное приложение Банка' AND p.user_id = 1;

INSERT INTO analyses (project_id, analysis_type, status, score, issues_found, started_at, completed_at, created_at, results)
SELECT 
  p.id,
  'usability',
  'running',
  NULL,
  0,
  NOW() - INTERVAL '2 days',
  NULL,
  NOW() - INTERVAL '2 days',
  NULL
FROM projects p WHERE p.name = 'Мобильное приложение Банка' AND p.user_id = 1;

-- Создание анализов для пользователя
INSERT INTO analyses (project_id, analysis_type, status, score, issues_found, started_at, completed_at, created_at, results)
SELECT 
  p.id,
  'complete',
  'pending',
  NULL,
  0,
  NULL,
  NULL,
  NOW() - INTERVAL '1 day',
  NULL
FROM projects p WHERE p.name = 'Новостной портал' AND p.user_id = 2;

INSERT INTO analyses (project_id, analysis_type, status, score, issues_found, started_at, completed_at, created_at, results)
SELECT 
  p.id,
  'performance',
  'completed',
  82,
  6,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  '{"scannedPages": 10, "totalIssues": 6, "processingTime": 150, "loadTime": 1800, "firstContentfulPaint": 600, "largestContentfulPaint": 1500}'::jsonb
FROM projects p WHERE p.name = 'Стартап Landing Page' AND p.user_id = 2;

-- Создание отчетов
INSERT INTO reports (project_id, analysis_id, report_type, filename, file_path, file_size, status, download_count, created_at)
SELECT 
  p.id,
  a.id,
  'pdf',
  'full_analysis_report.pdf',
  '/reports/full_analysis_' || p.id || '.pdf',
  2048576,
  'ready',
  12,
  NOW() - INTERVAL '25 days'
FROM projects p 
JOIN analyses a ON a.project_id = p.id 
WHERE p.name = 'Интернет-магазин Техники' AND p.user_id = 1 AND a.analysis_type = 'complete';

INSERT INTO reports (project_id, analysis_id, report_type, filename, file_path, file_size, status, download_count, created_at)
SELECT 
  p.id,
  a.id,
  'pdf',
  'accessibility_report.pdf',
  '/reports/accessibility_' || p.id || '.pdf',
  1024768,
  'ready',
  8,
  NOW() - INTERVAL '20 days'
FROM projects p 
JOIN analyses a ON a.project_id = p.id 
WHERE p.name = 'Интернет-магазин Техники' AND p.user_id = 1 AND a.analysis_type = 'accessibility';

INSERT INTO reports (project_id, analysis_id, report_type, filename, file_path, file_size, status, download_count, created_at)
SELECT 
  p.id,
  a.id,
  'pdf',
  'design_audit_report.pdf',
  '/reports/design_' || p.id || '.pdf',
  1536000,
  'ready',
  5,
  NOW() - INTERVAL '12 days'
FROM projects p 
JOIN analyses a ON a.project_id = p.id 
WHERE p.name = 'Мобильное приложение Банка' AND p.user_id = 1 AND a.analysis_type = 'design';

-- Обновление последовательностей
SELECT setval('users_id_seq', GREATEST(2, (SELECT MAX(id) FROM users)));
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));
SELECT setval('analyses_id_seq', (SELECT MAX(id) FROM analyses));
SELECT setval('reports_id_seq', (SELECT MAX(id) FROM reports)); 