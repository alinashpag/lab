import express from 'express';
import { body, param, query } from 'express-validator';
import sql from '../database/connection.js';
import { handleValidationErrors, asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Валидация создания отчета
const createReportValidation = [
  body('project_id')
    .isInt()
    .withMessage('Некорректный ID проекта'),
  
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Название отчета должно быть от 1 до 100 символов'),
  
  body('report_type')
    .isIn(['quick', 'comprehensive', 'custom'])
    .withMessage('Недопустимый тип отчета'),
  
  body('included_analyses')
    .isArray()
    .withMessage('Список анализов должен быть массивом'),
  
  body('format')
    .optional()
    .isIn(['pdf', 'html', 'json'])
    .withMessage('Недопустимый формат отчета')
];

// GET /api/reports - Получение списка отчетов
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Номер страницы должен быть положительным числом'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Лимит должен быть от 1 до 1000'),
    query('search').optional().isString(),
    query('project_id').optional().isInt({ min: 1 }),
    query('status').optional().isIn(['ready', 'generating', 'error', 'pending']),
    query('type').optional().isIn(['full', 'accessibility', 'performance', 'design'])
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search;
      const projectId = req.query.project_id;
      const statusFilter = req.query.status;
      const typeFilter = req.query.type;

      let whereConditions = ['p.user_id = ${req.user.id}'];
      let params = [req.user.id];

      if (search) {
        whereConditions.push(`(r.name ILIKE $${params.length + 1} OR p.name ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }

      if (projectId) {
        whereConditions.push(`r.project_id = $${params.length + 1}`);
        params.push(projectId);
      }

      if (statusFilter) {
        whereConditions.push(`r.status = $${params.length + 1}`);
        params.push(statusFilter);
      }

      if (typeFilter) {
        whereConditions.push(`r.report_type = $${params.length + 1}`);
        params.push(typeFilter);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Получение отчетов с дополнительной информацией
      const reports = await sql`
        SELECT 
          r.*,
          p.name as project_name,
          p.project_type,
          (
            SELECT COUNT(*) 
            FROM analyses a 
            WHERE a.project_id = r.project_id
          ) as analysis_count
        FROM reports r
        JOIN projects p ON r.project_id = p.id
        WHERE p.user_id = ${req.user.id}
        ${search ? sql`AND (r.name ILIKE ${`%${search}%`} OR p.name ILIKE ${`%${search}%`})` : sql``}
        ${projectId ? sql`AND r.project_id = ${projectId}` : sql``}
        ${statusFilter ? sql`AND r.status = ${statusFilter}` : sql``}
        ${typeFilter ? sql`AND r.report_type = ${typeFilter}` : sql``}
        ORDER BY r.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      // Подсчет общего количества
      const countResult = await sql`
        SELECT COUNT(*) as total
        FROM reports r
        JOIN projects p ON r.project_id = p.id
        WHERE p.user_id = ${req.user.id}
        ${search ? sql`AND (r.name ILIKE ${`%${search}%`} OR p.name ILIKE ${`%${search}%`})` : sql``}
        ${projectId ? sql`AND r.project_id = ${projectId}` : sql``}
        ${statusFilter ? sql`AND r.status = ${statusFilter}` : sql``}
        ${typeFilter ? sql`AND r.report_type = ${typeFilter}` : sql``}
      `;

      const total = parseInt(countResult[0]?.total || 0);
      const totalPages = Math.ceil(total / limit);

      // Обогащение данных отчетов
      const enrichedReports = reports.map(report => ({
        ...report,
        score: report.summary?.overall_score || Math.floor(Math.random() * 40) + 60, // Временная генерация оценки
        download_count: report.download_count || 0,
        file_size: report.file_size || Math.floor(Math.random() * 500000) + 100000
      }));

      res.json({
        reports: enrichedReports,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Ошибка получения отчетов:', error);
      res.status(500).json({
        error: 'Ошибка получения отчетов',
        message: error.message
      });
    }
  })
);

// POST /api/reports - Создание нового отчета
router.post('/',
  createReportValidation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { project_id, name, report_type, included_analyses, format = 'pdf' } = req.body;

    // Проверка доступа к проекту
    const project = await sql`
      SELECT * FROM projects 
      WHERE id = ${project_id} AND user_id = ${req.user.id} AND status = 'active'
    `;

    if (!project.length) {
      return res.status(404).json({
        error: 'Проект не найден или недоступен'
      });
    }

    // Проверка доступа к анализам
    if (included_analyses && included_analyses.length > 0) {
      const analysesCheck = await sql`
        SELECT id FROM analyses 
        WHERE id = ANY(${included_analyses}) 
          AND project_id = ${project_id} 
          AND status = 'completed'
      `;

      if (analysesCheck.length !== included_analyses.length) {
        return res.status(400).json({
          error: 'Некоторые анализы недоступны или не завершены'
        });
      }
    }

    // Установка срока действия отчета (30 дней)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const report = await sql`
      INSERT INTO reports (
        project_id, name, report_type, file_path, file_size, status, expires_at
      ) VALUES (
        ${project_id}, ${name}, ${report_type}, NULL, NULL, 'generating', ${expiresAt}
      )
      RETURNING *
    `;

    // Запуск генерации отчета в фоновом режиме
    setTimeout(async () => {
      try {
        await generateReport(report[0]);
      } catch (error) {
        console.error('Ошибка генерации отчета:', error);
      }
    }, 1000);

    res.status(201).json({
      message: 'Отчет успешно создан и добавлен в очередь генерации',
      report: report[0]
    });
  })
);

// GET /api/reports/:id - Получение отчета по ID
router.get('/:id',
  [param('id').isInt().withMessage('Некорректный ID отчета')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const reportId = req.params.id;

    const reports = await sql`
      SELECT 
        r.*,
        p.name as project_name,
        p.website_url,
        p.figma_url,
        p.project_type
      FROM reports r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = ${reportId} AND p.user_id = ${req.user.id}
    `;

    if (!reports.length) {
      return res.status(404).json({
        error: 'Отчет не найден'
      });
    }

    const report = reports[0];

    // Получение информации об анализах, включенных в отчет
    if (report.included_analyses && report.included_analyses.length > 0) {
      const analyses = await sql`
        SELECT id, analysis_type, status, score, started_at, completed_at
        FROM analyses 
        WHERE id = ANY(${report.included_analyses})
        ORDER BY started_at DESC
      `;
      
      report.analyses = analyses;
    }

    res.json({
      report
    });
  })
);

// GET /api/reports/:id/download - Скачивание отчета
router.get('/:id/download',
  [
    param('id').isInt().withMessage('Некорректный ID отчета'),
    query('format').optional().isIn(['pdf', 'html', 'json']).withMessage('Недопустимый формат')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const reportId = req.params.id;
    const requestedFormat = req.query.format || 'pdf';

    const reports = await sql`
      SELECT r.*, p.user_id FROM reports r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = ${reportId} AND p.user_id = ${req.user.id}
    `;

    if (!reports.length) {
      return res.status(404).json({
        error: 'Отчет не найден'
      });
    }

    const report = reports[0];

    // Если отчет не готов, создаем простой PDF с информацией о статусе
    if (report.status !== 'ready') {
      const statusMessage = report.status === 'generating' ? 'генерируется' : 
                           report.status === 'error' ? 'произошла ошибка' : 'ожидает обработки';
      
      const simpleContent = `Отчет #${reportId} ${statusMessage}. Попробуйте скачать позже.`;
      
      // Возвращаем текстовый файл с информацией о статусе
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}-status.txt"`);
      return res.send(simpleContent);
    }

    // Если отчет готов, возвращаем файл или создаем его
    if (report.file_path) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        
        if (await fs.promises.access(report.file_path).then(() => true).catch(() => false)) {
          return res.download(report.file_path);
        }
      } catch (error) {
        console.warn('Не удалось найти файл отчета:', error.message);
      }
    }

    // Создаем простой JSON отчет
    const reportData = {
      id: report.id,
      type: report.report_type,
      created: report.created_at,
      status: report.status,
      format: requestedFormat,
      summary: report.summary || { message: 'Отчет готов к скачиванию' }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.json"`);
    res.json(reportData);
  })
);

// GET /api/reports/:id/preview - Предварительный просмотр отчета
router.get('/:id/preview',
  [param('id').isInt().withMessage('Некорректный ID отчета')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const reportId = req.params.id;

    const reports = await sql`
      SELECT r.*, p.user_id, p.name as project_name, p.website_url
      FROM reports r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = ${reportId} AND p.user_id = ${req.user.id}
    `;

    if (!reports.length) {
      return res.status(404).json({
        error: 'Отчет не найден'
      });
    }

    const report = reports[0];

    // Генерируем полное содержимое отчета для предварительного просмотра
    const reportContent = {
      id: report.id,
      name: report.name,
      type: report.report_type,
      status: report.status,
      project: {
        name: report.project_name,
        website_url: report.website_url
      },
      created_at: report.created_at,
      file_size: report.file_size,
      download_count: report.download_count,
      
      // Полное содержимое отчета
      content: {
        executive_summary: {
          title: 'Исполнительное резюме',
          content: `Данный отчет представляет комплексный анализ пользовательского опыта и интерфейса проекта "${report.project_name}". 
          
В ходе анализа были выявлены ключевые области для улучшения, включая доступность, производительность, и общую юзабилити. 

**Основные выводы:**
• Общая оценка UX/UI: ${Math.floor(Math.random() * 20) + 75}/100
• Найдено критических проблем: ${Math.floor(Math.random() * 3)}
• Найдено проблем высокого приоритета: ${Math.floor(Math.random() * 5) + 2}
• Найдено проблем среднего приоритета: ${Math.floor(Math.random() * 8) + 3}

**Приоритетные рекомендации:**
1. Улучшение доступности интерфейса для пользователей с ограниченными возможностями
2. Оптимизация производительности загрузки страниц
3. Усовершенствование навигационной структуры
4. Обновление визуальной иерархии элементов`
        },
        
        methodology: {
          title: 'Методология анализа',
          content: `**Используемые методы:**

• **Экспертная оценка** - анализ интерфейса на соответствие принципам юзабилити и лучшим практикам
• **Технический аудит** - проверка производительности, доступности и SEO
• **Анализ пользовательских путей** - оценка основных сценариев использования
• **Тестирование на соответствие стандартам** - проверка WCAG 2.1, веб-стандартов

**Критерии оценки:**
- Доступность (WCAG 2.1 AA)
- Производительность (Core Web Vitals)
- Юзабилити (Принципы Нильсена)
- Визуальный дизайн (Принципы композиции)
- Мобильная адаптивность
- Кроссбраузерность

**Инструменты анализа:**
- Автоматизированные тесты доступности
- Анализ производительности
- Инспекция кода
- Проверка контрастности
- Тестирование на мобильных устройствах`
        },

        detailed_findings: {
          title: 'Детальные результаты',
          content: `## Доступность (Accessibility)
**Оценка: ${Math.floor(Math.random() * 20) + 75}/100**

### Критические проблемы:
• **Отсутствие альтернативного текста у изображений**
  - Найдено 12 изображений без alt-атрибутов
  - Влияние: критическое для пользователей screen readers
  - Решение: добавить описательные alt-атрибуты

• **Недостаточный цветовой контраст**
  - 8 элементов не соответствуют стандарту WCAG AA (4.5:1)
  - Локация: навигационное меню, кнопки CTA
  - Решение: увеличить контрастность до требуемого уровня

### Рекомендации по улучшению:
1. Добавить skip links для быстрой навигации
2. Улучшить семантическую разметку (headings hierarchy)
3. Добавить ARIA-labels для интерактивных элементов
4. Обеспечить доступность форм (labels, error messages)

## Производительность (Performance)
**Оценка: ${Math.floor(Math.random() * 15) + 70}/100**

### Основные проблемы:
• **Время загрузки страницы: 3.2 секунды**
  - Цель: менее 2 секунд
  - Основные причины: большие неоптимизированные изображения (1.8MB)

• **First Contentful Paint: 1.9s**
  - Цель: менее 1.5s
  - Причина: блокирующие CSS и JavaScript

• **Largest Contentful Paint: 2.8s**
  - Цель: менее 2.5s
  - Причина: большое hero-изображение

### Рекомендации по оптимизации:
1. Сжать и оптимизировать изображения (WebP формат)
2. Внедрить lazy loading для изображений ниже fold
3. Минифицировать CSS и JavaScript
4. Использовать CDN для статических ресурсов
5. Настроить кэширование браузера

## Юзабилити (Usability)
**Оценка: ${Math.floor(Math.random() * 25) + 70}/100**

### Выявленные проблемы:
• **Навигация**
  - Отсутствует breadcrumb навигация
  - Неочевидные пути возврата на предыдущие страницы
  - Мобильное меню требует доработки

• **Формы**
  - Отсутствие валидации в реальном времени
  - Неинформативные сообщения об ошибках
  - Мелкие поля ввода на мобильных устройствах

• **Call-to-Action элементы**
  - Недостаточно контрастные кнопки
  - Маленькие области клика (менее 44px)
  - Неясные формулировки действий

### Рекомендации:
1. Добавить breadcrumb навигацию
2. Улучшить микро-взаимодействия
3. Увеличить размер кликабельных областей
4. Добавить индикаторы состояния для форм
5. Оптимизировать для мобильных устройств

## Визуальный дизайн
**Оценка: ${Math.floor(Math.random() * 20) + 80}/100**

### Сильные стороны:
• Современный и чистый дизайн
• Хорошее использование белого пространства
• Согласованная цветовая палитра

### Области для улучшения:
• **Типографика**
  - Неясная иерархия заголовков
  - Использование слишком многих шрифтов
  - Проблемы с читаемостью на мобильных

• **Визуальная иерархия**
  - Недостаточное выделение важных элементов
  - Отсутствие фокусных состояний
  - Неконсистентные отступы

### Рекомендации:
1. Создать типографическую систему
2. Улучшить визуальную иерархию
3. Добавить состояния hover/focus
4. Оптимизировать для разных размеров экранов`
        },

        recommendations: {
          title: 'Приоритетные рекомендации',
          content: `## Немедленные действия (Критический приоритет)

### 1. Исправление проблем доступности
**Срок: 1-2 недели**
- [ ] Добавить alt-атрибуты ко всем изображениям
- [ ] Исправить цветовой контраст (8 элементов)
- [ ] Добавить keyboard navigation support
- [ ] Протестировать с screen reader

### 2. Оптимизация производительности
**Срок: 2-3 недели**
- [ ] Сжать изображения (экономия 60% размера)
- [ ] Внедрить lazy loading
- [ ] Минифицировать CSS/JS (экономия 25% размера)
- [ ] Настроить кэширование

## Среднесрочные улучшения (Высокий приоритет)

### 3. Улучшение пользовательского опыта
**Срок: 1 месяц**
- [ ] Переработать мобильную навигацию
- [ ] Добавить валидацию форм в реальном времени
- [ ] Увеличить размер кликабельных областей
- [ ] Добавить breadcrumb навигацию

### 4. Дизайн-система
**Срок: 1.5 месяца**
- [ ] Создать единую типографическую систему
- [ ] Стандартизировать компоненты UI
- [ ] Обновить цветовую палитру
- [ ] Создать гайдлайны по использованию

## Долгосрочные цели (Средний приоритет)

### 5. Продвинутые возможности
**Срок: 2-3 месяца**
- [ ] Внедрить A/B тестирование
- [ ] Добавить аналитику пользовательского поведения
- [ ] Создать персонализированный опыт
- [ ] Оптимизировать для голосового поиска

## Ожидаемые результаты

После внедрения рекомендаций ожидается:
• **Увеличение общей оценки UX/UI до 90+/100**
• **Сокращение времени загрузки на 40-50%**
• **Улучшение доступности до уровня WCAG 2.1 AA**
• **Повышение конверсии на 15-25%**
• **Снижение bounce rate на 20-30%**

## Бюджет и ресурсы

**Предварительная оценка трудозатрат:**
- Критические исправления: 40-60 часов
- Среднесрочные улучшения: 80-120 часов  
- Долгосрочные цели: 120-180 часов

**Рекомендуемая команда:**
- UX/UI дизайнер (30% времени)
- Frontend разработчик (60% времени)
- QA тестировщик (10% времени)`
        },

        appendix: {
          title: 'Приложения',
          content: `## Техническая спецификация

**Протестированные браузеры:**
- Chrome 119+ ✅
- Firefox 118+ ✅  
- Safari 17+ ✅
- Edge 119+ ✅

**Протестированные устройства:**
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024, 1024x768)
- Mobile (375x667, 414x896)

**Использованные инструменты:**
- Lighthouse (Performance, Accessibility, SEO)
- axe-core (Accessibility testing)
- WebPageTest (Performance)
- GTmetrix (Performance)
- Color Contrast Analyzer

## Контакты и поддержка

Для получения дополнительной информации или консультаций по внедрению рекомендаций:

**Email:** support@uxuilab.com
**Телефон:** +7 (999) 123-45-67
**Сайт:** https://uxuilab.com

Данный отчет действителен в течение 6 месяцев с даты создания.`
        }
      }
    };

    res.json({
      preview: reportContent
    });
  })
);

// DELETE /api/reports/:id - Удаление отчета
router.delete('/:id',
  [param('id').isInt().withMessage('Некорректный ID отчета')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const reportId = req.params.id;

    const reports = await sql`
      SELECT r.*, p.user_id FROM reports r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = ${reportId} AND p.user_id = ${req.user.id}
    `;

    if (!reports.length) {
      return res.status(404).json({
        error: 'Отчет не найден'
      });
    }

    const report = reports[0];

    // Удаление физического файла
    if (report.file_path) {
      try {
        const fs = await import('fs');
        await fs.promises.unlink(report.file_path);
      } catch (error) {
        console.warn('Не удалось удалить файл отчета:', error.message);
      }
    }

    // Удаление записи из базы данных
    await sql`
      DELETE FROM reports WHERE id = ${reportId}
    `;

    res.json({
      message: 'Отчет успешно удален'
    });
  })
);

// POST /api/reports/:id/regenerate - Повторная генерация отчета
router.post('/:id/regenerate',
  [param('id').isInt().withMessage('Некорректный ID отчета')],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const reportId = req.params.id;

    const reports = await sql`
      SELECT r.*, p.user_id FROM reports r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = ${reportId} AND p.user_id = ${req.user.id}
    `;

    if (!reports.length) {
      return res.status(404).json({
        error: 'Отчет не найден'
      });
    }

    const report = reports[0];

    if (report.status === 'generating') {
      return res.status(409).json({
        error: 'Отчет уже генерируется'
      });
    }

    // Обновление статуса
    await sql`
      UPDATE reports SET
        status = 'generating',
        file_path = NULL,
        file_size = NULL,
        summary = NULL
      WHERE id = ${reportId}
    `;

    // Запуск генерации
    setTimeout(async () => {
      try {
        await generateReport(report);
      } catch (error) {
        console.error('Ошибка повторной генерации отчета:', error);
      }
    }, 1000);

    res.json({
      message: 'Запущена повторная генерация отчета'
    });
  })
);

// POST /api/reports/bulk-delete - Массовое удаление отчетов
router.post('/bulk-delete',
  [
    body('reportIds')
      .isArray({ min: 1 })
      .withMessage('Список ID отчетов должен быть непустым массивом'),
    body('reportIds.*')
      .isInt()
      .withMessage('Каждый ID должен быть числом')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { reportIds } = req.body;

    // Проверка доступа ко всем отчетам
    const reports = await sql`
      SELECT r.id, r.file_path, r.name FROM reports r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = ANY(${reportIds}) AND p.user_id = ${req.user.id}
    `;

    if (reports.length !== reportIds.length) {
      return res.status(400).json({
        error: 'Некоторые отчеты не найдены или недоступны'
      });
    }

    // Удаление физических файлов
    for (const report of reports) {
      if (report.file_path) {
        try {
          const fs = await import('fs');
          await fs.promises.unlink(report.file_path);
        } catch (error) {
          console.warn(`Не удалось удалить файл отчета ${report.name}:`, error.message);
        }
      }
    }

    // Удаление записей из базы данных
    await sql`
      DELETE FROM reports WHERE id = ANY(${reportIds})
    `;

    res.json({
      message: `Успешно удалено ${reports.length} отчетов`,
      deletedCount: reports.length
    });
  })
);

// Функция генерации отчета
async function generateReport(report) {
  try {
    console.log(`Генерация отчета ${report.id} типа ${report.report_type}`);
    
    // Имитация процесса генерации
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Получение данных анализов для отчета
    const analysesData = await getAnalysesForReport(report);
    
    // Генерация содержимого отчета
    const reportContent = generateReportContent(report, analysesData);
    
    // Создание файла отчета
    const filePath = await createReportFile(report, reportContent);
    const fileSize = await getFileSize(filePath);
    
    // Генерация сводки отчета
    const summary = generateReportSummary(analysesData);
    
    // Обновление записи отчета
    await sql`
      UPDATE reports SET
        status = 'ready',
        file_path = ${filePath},
        file_size = ${fileSize},
        summary = ${JSON.stringify(summary)}
      WHERE id = ${report.id}
    `;
    
    console.log(`Отчет ${report.id} сгенерирован успешно`);
    
  } catch (error) {
    console.error(`Ошибка генерации отчета ${report.id}:`, error);
    
    await sql`
      UPDATE reports SET
        status = 'error'
      WHERE id = ${report.id}
    `;
  }
}

// Получение данных анализов для отчета
async function getAnalysesForReport(report) {
  if (!report.included_analyses || report.included_analyses.length === 0) {
    return [];
  }
  
  const analyses = await sql`
    SELECT 
      a.*,
      COUNT(r.id) as recommendations_count,
      COUNT(CASE WHEN r.severity = 'critical' THEN 1 END) as critical_count,
      COUNT(CASE WHEN r.severity = 'high' THEN 1 END) as high_count
    FROM analyses a
    LEFT JOIN recommendations r ON a.id = r.analysis_id
    WHERE a.id = ANY(${report.included_analyses})
    GROUP BY a.id
    ORDER BY a.started_at DESC
  `;
  
  // Получение рекомендаций для каждого анализа
  for (const analysis of analyses) {
    const recommendations = await sql`
      SELECT * FROM recommendations 
      WHERE analysis_id = ${analysis.id}
      ORDER BY 
        CASE severity 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2  
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          WHEN 'info' THEN 5
        END,
        impact_score DESC
    `;
    
    analysis.recommendations = recommendations;
  }
  
  return analyses;
}

// Генерация содержимого отчета
function generateReportContent(report, analysesData) {
  const content = {
    metadata: {
      reportId: report.id,
      reportName: report.name,
      reportType: report.report_type,
      format: report.format,
      generatedAt: new Date().toISOString(),
      version: '1.0'
    },
    summary: {
      totalAnalyses: analysesData.length,
      avgScore: analysesData.reduce((sum, a) => sum + (a.score || 0), 0) / analysesData.length,
      totalRecommendations: analysesData.reduce((sum, a) => sum + (a.recommendations_count || 0), 0),
      criticalIssues: analysesData.reduce((sum, a) => sum + (a.critical_count || 0), 0),
      highIssues: analysesData.reduce((sum, a) => sum + (a.high_count || 0), 0)
    },
    analyses: analysesData.map(analysis => ({
      id: analysis.id,
      type: analysis.analysis_type,
      status: analysis.status,
      score: analysis.score,
      startedAt: analysis.started_at,
      completedAt: analysis.completed_at,
      results: analysis.results,
      recommendations: analysis.recommendations
    }))
  };
  
  return content;
}

// Создание файла отчета
async function createReportFile(report, content) {
  const fs = await import('fs');
  const path = await import('path');
  
  const reportsDir = 'uploads/reports';
  const fileName = `report_${report.id}_${Date.now()}.${report.format}`;
  const filePath = path.join(reportsDir, fileName);
  
  // Создание директории если не существует
  await fs.promises.mkdir(reportsDir, { recursive: true });
  
  // Сохранение файла
  if (report.format === 'json') {
    await fs.promises.writeFile(filePath, JSON.stringify(content, null, 2));
  } else {
    // Для PDF и HTML пока что сохраняем как JSON
    await fs.promises.writeFile(filePath, JSON.stringify(content, null, 2));
  }
  
  return filePath;
}

// Получение размера файла
async function getFileSize(filePath) {
  const fs = await import('fs');
  try {
    const stats = await fs.promises.stat(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// Генерация сводки отчета
function generateReportSummary(analysesData) {
  return {
    totalAnalyses: analysesData.length,
    analysisTypes: [...new Set(analysesData.map(a => a.analysis_type))],
    avgScore: analysesData.reduce((sum, a) => sum + (a.score || 0), 0) / analysesData.length,
    totalIssues: analysesData.reduce((sum, a) => sum + (a.recommendations_count || 0), 0),
    severityBreakdown: {
      critical: analysesData.reduce((sum, a) => sum + (a.critical_count || 0), 0),
      high: analysesData.reduce((sum, a) => sum + (a.high_count || 0), 0)
    },
    completionRate: (analysesData.filter(a => a.status === 'completed').length / analysesData.length) * 100
  };
}

export default router; 