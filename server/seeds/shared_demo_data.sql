-- Общие демонстрационные данные для всех пользователей UX/UI Lab

-- Создание демонстрационных проектов для каждого пользователя
DO $$
DECLARE
    user_record RECORD;
    project_id INTEGER;
    analysis_id INTEGER;
BEGIN
    -- Для каждого пользователя в системе
    FOR user_record IN SELECT id, username FROM users LOOP
        
        -- Создание демонстрационных проектов
        INSERT INTO projects (name, description, project_type, website_url, figma_url, user_id, status, created_at, updated_at)
        VALUES 
        ('E-commerce Интернет-магазин', 'Комплексный анализ UX/UI интернет-магазина с фокусом на конверсию и удобство покупок', 'website', 'https://demo-ecommerce.uxuilab.com', NULL, user_record.id, 'active', NOW() - INTERVAL '30 days', NOW()),
        ('Мобильный Банкинг', 'Дизайн-система и интерфейсы мобильного банковского приложения', 'figma', NULL, 'https://figma.com/file/banking-mobile-demo', user_record.id, 'active', NOW() - INTERVAL '20 days', NOW()),
        ('Образовательная платформа', 'UX/UI платформы для онлайн-обучения с акцентом на вовлеченность студентов', 'website', 'https://demo-education.uxuilab.com', NULL, user_record.id, 'active', NOW() - INTERVAL '15 days', NOW()),
        ('SaaS Dashboard', 'Интерфейс аналитической панели для B2B продукта', 'website', 'https://demo-saas.uxuilab.com', NULL, user_record.id, 'active', NOW() - INTERVAL '10 days', NOW()),
        ('Медицинское приложение', 'Мобильное приложение для телемедицины и записи к врачам', 'figma', NULL, 'https://figma.com/file/medical-telemedicine', user_record.id, 'active', NOW() - INTERVAL '5 days', NOW());
        
        -- Создание анализов для E-commerce проекта
        SELECT id INTO project_id FROM projects WHERE name = 'E-commerce Интернет-магазин' AND user_id = user_record.id;
        
        INSERT INTO analyses (project_id, analysis_type, status, score, issues_found, started_at, completed_at, created_at, results)
        VALUES 
        (project_id, 'complete', 'completed', 87, 12, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', 
         '{"scannedPages": 25, "totalIssues": 12, "processingTime": 180, "wcagLevel": "AA", "passedCriteria": 42, "failedCriteria": 12, "navigationScore": 85, "contentScore": 90, "layoutScore": 88}'::jsonb),
        
        (project_id, 'accessibility', 'completed', 94, 3, NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days',
         '{"scannedPages": 15, "totalIssues": 3, "processingTime": 120, "wcagLevel": "AA", "passedCriteria": 47, "failedCriteria": 3}'::jsonb),
        
        (project_id, 'performance', 'completed', 82, 8, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days',
         '{"scannedPages": 20, "totalIssues": 8, "processingTime": 200, "loadTime": 2100, "firstContentfulPaint": 850, "largestContentfulPaint": 1950}'::jsonb);
        
        -- Создание анализов для Мобильного банкинга
        SELECT id INTO project_id FROM projects WHERE name = 'Мобильный Банкинг' AND user_id = user_record.id;
        
        INSERT INTO analyses (project_id, analysis_type, status, score, issues_found, started_at, completed_at, created_at, results)
        VALUES 
        (project_id, 'design', 'completed', 91, 4, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days',
         '{"scannedPages": 12, "totalIssues": 4, "processingTime": 90, "navigationScore": 92, "contentScore": 89, "layoutScore": 93}'::jsonb),
        
        (project_id, 'usability', 'completed', 89, 6, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days',
         '{"scannedPages": 10, "totalIssues": 6, "processingTime": 110, "navigationScore": 87, "contentScore": 91, "layoutScore": 89}'::jsonb),
        
        (project_id, 'accessibility', 'running', NULL, 0, NOW() - INTERVAL '2 days', NULL, NOW() - INTERVAL '2 days', NULL);
        
        -- Создание анализов для образовательной платформы
        SELECT id INTO project_id FROM projects WHERE name = 'Образовательная платформа' AND user_id = user_record.id;
        
        INSERT INTO analyses (project_id, analysis_type, status, score, issues_found, started_at, completed_at, created_at, results)
        VALUES 
        (project_id, 'complete', 'pending', NULL, 0, NULL, NULL, NOW() - INTERVAL '1 day', NULL),
        
        (project_id, 'performance', 'completed', 85, 7, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days',
         '{"scannedPages": 18, "totalIssues": 7, "processingTime": 160, "loadTime": 1800, "firstContentfulPaint": 750, "largestContentfulPaint": 1600}'::jsonb);
        
        -- Создание анализов для SaaS Dashboard
        SELECT id INTO project_id FROM projects WHERE name = 'SaaS Dashboard' AND user_id = user_record.id;
        
        INSERT INTO analyses (project_id, analysis_type, status, score, issues_found, started_at, completed_at, created_at, results)
        VALUES 
        (project_id, 'usability', 'completed', 92, 3, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days',
         '{"scannedPages": 8, "totalIssues": 3, "processingTime": 70, "navigationScore": 94, "contentScore": 89, "layoutScore": 93}'::jsonb),
        
        (project_id, 'accessibility', 'failed', NULL, 0, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NULL);
        
        -- Создание отчетов
        SELECT a.id INTO analysis_id FROM analyses a 
        JOIN projects p ON a.project_id = p.id 
        WHERE p.name = 'E-commerce Интернет-магазин' AND p.user_id = user_record.id AND a.analysis_type = 'complete';
        
        INSERT INTO reports (project_id, analysis_id, report_type, filename, file_path, file_size, status, download_count, created_at)
        SELECT 
            p.id,
            analysis_id,
            'pdf',
            'ecommerce_full_analysis.pdf',
            '/reports/ecommerce_full_' || p.id || '_' || analysis_id || '.pdf',
            2850000,
            'ready',
            15,
            NOW() - INTERVAL '25 days'
        FROM projects p WHERE p.name = 'E-commerce Интернет-магазин' AND p.user_id = user_record.id;
        
        SELECT a.id INTO analysis_id FROM analyses a 
        JOIN projects p ON a.project_id = p.id 
        WHERE p.name = 'E-commerce Интернет-магазин' AND p.user_id = user_record.id AND a.analysis_type = 'accessibility';
        
        INSERT INTO reports (project_id, analysis_id, report_type, filename, file_path, file_size, status, download_count, created_at)
        SELECT 
            p.id,
            analysis_id,
            'pdf',
            'accessibility_detailed_report.pdf',
            '/reports/accessibility_' || p.id || '_' || analysis_id || '.pdf',
            1450000,
            'ready',
            8,
            NOW() - INTERVAL '22 days'
        FROM projects p WHERE p.name = 'E-commerce Интернет-магазин' AND p.user_id = user_record.id;
        
        SELECT a.id INTO analysis_id FROM analyses a 
        JOIN projects p ON a.project_id = p.id 
        WHERE p.name = 'Мобильный Банкинг' AND p.user_id = user_record.id AND a.analysis_type = 'design';
        
        INSERT INTO reports (project_id, analysis_id, report_type, filename, file_path, file_size, status, download_count, created_at)
        SELECT 
            p.id,
            analysis_id,
            'pdf',
            'mobile_banking_design_audit.pdf',
            '/reports/design_audit_' || p.id || '_' || analysis_id || '.pdf',
            2100000,
            'ready',
            12,
            NOW() - INTERVAL '18 days'
        FROM projects p WHERE p.name = 'Мобильный Банкинг' AND p.user_id = user_record.id;
        
        -- Дополнительные отчеты
        INSERT INTO reports (project_id, analysis_id, report_type, filename, file_path, file_size, status, download_count, created_at)
        SELECT 
            p.id,
            NULL,
            'pdf',
            'monthly_summary_report.pdf',
            '/reports/monthly_summary_' || p.id || '.pdf',
            950000,
            'generating',
            0,
            NOW() - INTERVAL '1 day'
        FROM projects p WHERE p.name = 'SaaS Dashboard' AND p.user_id = user_record.id;
        
    END LOOP;
END $$; 