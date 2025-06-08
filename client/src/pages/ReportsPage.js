import React, { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { 
  FiDownload, FiEye, FiSearch, FiCalendar,
  FiFileText, FiBarChart2, FiTrendingUp, FiShare2,
  FiPrinter, FiTrash2, FiRefreshCw, FiGrid,
  FiList
} from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.variant === 'primary' ? 'white' : props.theme.colors.text};
  border: 1px solid ${props => props.variant === 'primary' ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;

  &:hover {
    background: ${props => props.variant === 'primary' ? props.theme.colors.primaryDark : props.theme.colors.surfaceHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  font-weight: 500;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textMuted};
`;

const Select = styled.select`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.75rem 1rem;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.small};
  overflow: hidden;
`;

const ViewButton = styled.button`
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.surfaceHover};
  }
`;

const ReportsList = styled.div`
  display: ${props => props.viewMode === 'grid' ? 'grid' : 'flex'};
  ${props => props.viewMode === 'grid' ? 
    'grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;' : 
    'flex-direction: column; gap: 1rem;'
  }
`;

const ReportCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 1.5rem;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-right: ${props => props.hasScore ? '60px' : '0'};
`;

const ReportInfo = styled.div`
  flex: 1;
`;

const ReportTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const ReportProject = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const ReportActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
`;

const ReportType = styled.div`
  background: ${props => {
    switch (props.type) {
      case 'full': return props.theme.colors.primary + '20';
      case 'accessibility': return props.theme.colors.success + '20';
      case 'performance': return props.theme.colors.warning + '20';
      case 'design': return props.theme.colors.info + '20';
      default: return props.theme.colors.textMuted + '20';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'full': return props.theme.colors.primary;
      case 'accessibility': return props.theme.colors.success;
      case 'performance': return props.theme.colors.warning;
      case 'design': return props.theme.colors.info;
      default: return props.theme.colors.textMuted;
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ReportMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MetaLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
`;

const MetaValue = styled.span`
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
`;

const IconButton = styled.button`
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.small};
  padding: 0.5rem;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ScoreCircle = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => {
    const score = props.score;
    if (score >= 80) return props.theme.colors.success;
    if (score >= 60) return props.theme.colors.warning;
    return props.theme.colors.error;
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  text-align: center;
  margin: 2rem 0;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${props => props.theme.zIndex?.modal || 1000};
`;

const ModalContent = styled.div`
  background-color: ${props => props.theme.colors.surface};
  padding: 2rem;
  border-radius: ${props => props.theme.borderRadius.large};
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text};
  font-size: 1.5rem;
  cursor: pointer;
`;

const ReportsPage = () => {
  const theme = useTheme();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    avgScore: 0,
    downloads: 0
  });
  
  // Фильтры и поиск
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Модальное окно предварительного просмотра
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedReportPreview, setSelectedReportPreview] = useState(null);

  // Загрузка данных
  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch('/api/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
        
        // Подсчет статистики
        const total = data.reports?.length || 0;
        const now = new Date();
        const thisMonth = data.reports?.filter(r => {
          const reportDate = new Date(r.created_at);
          return reportDate.getMonth() === now.getMonth() && 
                 reportDate.getFullYear() === now.getFullYear();
        }).length || 0;
        const avgScore = total > 0 
          ? Math.round(data.reports.reduce((sum, r) => sum + (r.score || 0), 0) / total)
          : 0;
        const downloads = data.reports?.reduce((sum, r) => sum + (r.download_count || 0), 0) || 0;
        
        setStats({ total, thisMonth, avgScore, downloads });
      } else {
        throw new Error('Ошибка загрузки отчетов');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Скачивание отчета
  const downloadReport = async (reportId, format = 'pdf') => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/reports/${reportId}/download?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Обновить счетчик скачиваний
        loadReports();
      } else {
        throw new Error('Ошибка скачивания отчета');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Удаление отчета
  const deleteReport = async (reportId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отчет?')) {
      return;
    }

    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadReports();
      } else {
        throw new Error('Ошибка удаления отчета');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Получение иконки типа отчета
  const getTypeIcon = (type) => {
    switch (type) {
      case 'full': return <FiFileText size={14} />;
      case 'accessibility': return <FiEye size={14} />;
      case 'performance': return <FiTrendingUp size={14} />;
      case 'design': return <FiBarChart2 size={14} />;
      default: return <FiFileText size={14} />;
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Фильтрация отчетов
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || report.report_type === typeFilter;
    const matchesProject = !projectFilter || report.project_id?.toString() === projectFilter;
    
    return matchesSearch && matchesType && matchesProject;
  });

  // Просмотр отчета
  const viewReport = async (reportId) => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/reports/${reportId}/preview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedReportPreview(data.preview);
        setShowPreviewModal(true);
      } else {
        throw new Error('Ошибка загрузки предварительного просмотра');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Поделиться отчетом
  const shareReport = async (reportId) => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/reports/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const shareUrl = `${window.location.origin}/reports/${reportId}/public`;
        
        if (navigator.share) {
          await navigator.share({
            title: `Отчет: ${data.report.name}`,
            text: 'UX/UI анализ отчет',
            url: shareUrl,
          });
        } else {
          await navigator.clipboard.writeText(shareUrl);
          alert('Ссылка скопирована в буфер обмена!');
        }
      } else {
        throw new Error('Ошибка получения отчета');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Печать отчета
  const printReport = async (reportId) => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/reports/${reportId}/preview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Создаем новое окно для печати
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Отчет: ${data.preview.name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1, h2, h3 { color: #333; }
                .section { margin-bottom: 30px; }
                .title { border-bottom: 2px solid #007bff; padding-bottom: 10px; }
              </style>
            </head>
            <body>
              <h1>${data.preview.name}</h1>
              <p>Проект: ${data.preview.project?.name || 'Неизвестен'}</p>
              <p>Дата: ${new Date(data.preview.created_at).toLocaleDateString('ru-RU')}</p>
              
              <div class="section">
                <h2 class="title">${data.preview.content.executive_summary.title}</h2>
                <pre style="white-space: pre-line;">${data.preview.content.executive_summary.content}</pre>
              </div>
              
              <div class="section">
                <h2 class="title">${data.preview.content.methodology.title}</h2>
                <pre style="white-space: pre-line;">${data.preview.content.methodology.content}</pre>
              </div>
              
              <div class="section">
                <h2 class="title">${data.preview.content.detailed_findings.title}</h2>
                <pre style="white-space: pre-line;">${data.preview.content.detailed_findings.content}</pre>
              </div>
              
              <div class="section">
                <h2 class="title">${data.preview.content.recommendations.title}</h2>
                <pre style="white-space: pre-line;">${data.preview.content.recommendations.content}</pre>
              </div>
              
              <div class="section">
                <h2 class="title">${data.preview.content.appendix.title}</h2>
                <pre style="white-space: pre-line;">${data.preview.content.appendix.content}</pre>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      } else {
        throw new Error('Ошибка загрузки отчета для печати');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <Container>
      <Header>
        <Title>Отчеты</Title>
        <Actions>
          <ViewToggle>
            <ViewButton 
              active={viewMode === 'grid'} 
              onClick={() => setViewMode('grid')}
            >
              <FiGrid size={18} />
            </ViewButton>
            <ViewButton 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
            >
              <FiList size={18} />
            </ViewButton>
          </ViewToggle>
          <Button onClick={loadReports}>
            <FiRefreshCw size={18} />
            Обновить
          </Button>
        </Actions>
      </Header>

      {/* Статистика */}
      <Stats>
        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Всего отчетов</StatLabel>
            </div>
            <StatIcon color={theme.colors.primary}>
              <FiFileText size={20} />
            </StatIcon>
          </StatHeader>
        </StatCard>
        
        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.thisMonth}</StatValue>
              <StatLabel>За этот месяц</StatLabel>
            </div>
            <StatIcon color={theme.colors.success}>
              <FiCalendar size={20} />
            </StatIcon>
          </StatHeader>
        </StatCard>
        
        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.avgScore}</StatValue>
              <StatLabel>Средняя оценка</StatLabel>
            </div>
            <StatIcon color={theme.colors.warning}>
              <FiBarChart2 size={20} />
            </StatIcon>
          </StatHeader>
        </StatCard>
        
        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.downloads}</StatValue>
              <StatLabel>Скачиваний</StatLabel>
            </div>
            <StatIcon color={theme.colors.info}>
              <FiDownload size={20} />
            </StatIcon>
          </StatHeader>
        </StatCard>
      </Stats>

      {/* Фильтры */}
      <Filters>
        <SearchContainer>
          <SearchIcon>
            <FiSearch size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Поиск отчетов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <Select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Все типы</option>
          <option value="full">Полный отчет</option>
          <option value="accessibility">Доступность</option>
          <option value="performance">Производительность</option>
          <option value="design">Дизайн</option>
        </Select>

        <Select 
          value={projectFilter} 
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="">Все проекты</option>
          {/* Здесь будут проекты из API */}
        </Select>
      </Filters>

      {loading && <LoadingSpinner />}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && !error && filteredReports.length === 0 && (
        <EmptyState>
          <EmptyIcon>📄</EmptyIcon>
          <h3>Нет отчетов</h3>
          <p>Создайте первый анализ, чтобы получить отчет</p>
        </EmptyState>
      )}

      {!loading && !error && filteredReports.length > 0 && (
        <ReportsList viewMode={viewMode}>
          {filteredReports.map((report) => (
            <ReportCard key={report.id}>
              {report.score && (
                <ScoreCircle score={report.score}>
                  {report.score}
                </ScoreCircle>
              )}
              
              <ReportHeader>
                <ReportInfo>
                  <ReportTitle>{report.name || `Отчет #${report.id}`}</ReportTitle>
                  <ReportProject>Проект: {report.project_name || 'Неизвестен'}</ReportProject>
                </ReportInfo>
                <ReportActions>
                  <ReportType type={report.report_type}>
                    {getTypeIcon(report.report_type)}
                    {report.report_type === 'full' ? 'Полный' :
                     report.report_type === 'accessibility' ? 'Доступность' :
                     report.report_type === 'performance' ? 'Производительность' :
                     report.report_type === 'design' ? 'Дизайн' : 'Отчет'}
                  </ReportType>
                </ReportActions>
              </ReportHeader>

              <ReportMeta>
                <MetaItem>
                  <MetaLabel>Дата создания</MetaLabel>
                  <MetaValue>{formatDate(report.created_at)}</MetaValue>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Размер файла</MetaLabel>
                  <MetaValue>{report.file_size ? `${Math.round(report.file_size / 1024)}KB` : '—'}</MetaValue>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Скачиваний</MetaLabel>
                  <MetaValue>{report.download_count || 0}</MetaValue>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Формат</MetaLabel>
                  <MetaValue>{report.format?.toUpperCase() || 'PDF'}</MetaValue>
                </MetaItem>
              </ReportMeta>

              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginTop: '1rem',
                justifyContent: 'flex-end'
              }}>
                <IconButton title="Просмотр" onClick={() => viewReport(report.id)}>
                  <FiEye size={16} />
                </IconButton>
                <IconButton 
                  title="Скачать PDF"
                  onClick={() => downloadReport(report.id, 'pdf')}
                >
                  <FiDownload size={16} />
                </IconButton>
                <IconButton title="Поделиться" onClick={() => shareReport(report.id)}>
                  <FiShare2 size={16} />
                </IconButton>
                <IconButton title="Печать" onClick={() => printReport(report.id)}>
                  <FiPrinter size={16} />
                </IconButton>
                <IconButton 
                  title="Удалить"
                  onClick={() => deleteReport(report.id)}
                >
                  <FiTrash2 size={16} />
                </IconButton>
              </div>
            </ReportCard>
          ))}
        </ReportsList>
      )}

      {/* Модальное окно предварительного просмотра */}
      {showPreviewModal && (
        <Modal onClick={(e) => {
          if (e.target === e.currentTarget) setShowPreviewModal(false);
        }}>
          <ModalContent style={{ maxWidth: '1200px', maxHeight: '90vh' }}>
            <ModalHeader>
              <ModalTitle>Предварительный просмотр отчета</ModalTitle>
              <CloseButton onClick={() => setShowPreviewModal(false)}>
                ✕
              </CloseButton>
            </ModalHeader>

            {selectedReportPreview && (
              <div style={{ padding: '1rem 0' }}>
                {/* Заголовок отчета */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                  <h2 style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: theme.colors.primary,
                    fontSize: '1.5rem'
                  }}>
                    {selectedReportPreview.name || 'Отчет'}
                  </h2>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: theme.colors.textSecondary,
                    marginBottom: '1rem'
                  }}>
                    Проект: {selectedReportPreview.project?.name || 'Неизвестен'} | 
                    Дата создания: {new Date(selectedReportPreview.created_at).toLocaleDateString('ru-RU')}
                  </div>
                  <div style={{
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    <Button onClick={() => window.print()}>
                      🖨️ Печать
                    </Button>
                    <Button variant="primary">
                      📥 Скачать PDF
                    </Button>
                    <Button>
                      📤 Поделиться
                    </Button>
                  </div>
                </div>

                {/* Содержимое отчета */}
                {selectedReportPreview.content ? (
                  <div style={{ 
                    background: theme.colors.background,
                    padding: '2rem',
                    borderRadius: '8px',
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    fontSize: '0.875rem',
                    lineHeight: '1.6'
                  }}>
                    {/* Исполнительное резюме */}
                    {selectedReportPreview.content.executive_summary && (
                      <section style={{ marginBottom: '2rem' }}>
                        <h3 style={{ 
                          color: theme.colors.primary,
                          borderBottom: `2px solid ${theme.colors.primary}`,
                          paddingBottom: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          {selectedReportPreview.content.executive_summary.title || 'Исполнительное резюме'}
                        </h3>
                        <div style={{ 
                          whiteSpace: 'pre-line',
                          color: theme.colors.text
                        }}>
                          {selectedReportPreview.content.executive_summary.content || 'Содержимое отсутствует'}
                        </div>
                      </section>
                    )}

                    {/* Методология */}
                    {selectedReportPreview.content.methodology && (
                      <section style={{ marginBottom: '2rem' }}>
                        <h3 style={{ 
                          color: theme.colors.primary,
                          borderBottom: `2px solid ${theme.colors.primary}`,
                          paddingBottom: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          {selectedReportPreview.content.methodology.title || 'Методология'}
                        </h3>
                        <div style={{ 
                          whiteSpace: 'pre-line',
                          color: theme.colors.text
                        }}>
                          {selectedReportPreview.content.methodology.content || 'Содержимое отсутствует'}
                        </div>
                      </section>
                    )}

                    {/* Детальные результаты */}
                    {selectedReportPreview.content.detailed_findings && (
                      <section style={{ marginBottom: '2rem' }}>
                        <h3 style={{ 
                          color: theme.colors.primary,
                          borderBottom: `2px solid ${theme.colors.primary}`,
                          paddingBottom: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          {selectedReportPreview.content.detailed_findings.title || 'Детальные результаты'}
                        </h3>
                        <div style={{ 
                          whiteSpace: 'pre-line',
                          color: theme.colors.text
                        }}>
                          {selectedReportPreview.content.detailed_findings.content || 'Содержимое отсутствует'}
                        </div>
                      </section>
                    )}

                    {/* Рекомендации */}
                    {selectedReportPreview.content.recommendations && (
                      <section style={{ marginBottom: '2rem' }}>
                        <h3 style={{ 
                          color: theme.colors.primary,
                          borderBottom: `2px solid ${theme.colors.primary}`,
                          paddingBottom: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          {selectedReportPreview.content.recommendations.title || 'Рекомендации'}
                        </h3>
                        <div style={{ 
                          whiteSpace: 'pre-line',
                          color: theme.colors.text
                        }}>
                          {selectedReportPreview.content.recommendations.content || 'Содержимое отсутствует'}
                        </div>
                      </section>
                    )}

                    {/* Приложения */}
                    {selectedReportPreview.content.appendix && (
                      <section style={{ marginBottom: '2rem' }}>
                        <h3 style={{ 
                          color: theme.colors.primary,
                          borderBottom: `2px solid ${theme.colors.primary}`,
                          paddingBottom: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          {selectedReportPreview.content.appendix.title || 'Приложения'}
                        </h3>
                        <div style={{ 
                          whiteSpace: 'pre-line',
                          color: theme.colors.text
                        }}>
                          {selectedReportPreview.content.appendix.content || 'Содержимое отсутствует'}
                        </div>
                      </section>
                    )}
                  </div>
                ) : (
                  <div style={{
                    background: theme.colors.background,
                    padding: '2rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: theme.colors.textSecondary
                  }}>
                    <p>Содержимое отчета недоступно</p>
                  </div>
                )}

                {/* Нижние кнопки действий */}
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  justifyContent: 'center',
                  marginTop: '2rem',
                  paddingTop: '1rem',
                  borderTop: `1px solid ${theme.colors.border}`
                }}>
                  <Button onClick={() => setShowPreviewModal(false)}>
                    Закрыть
                  </Button>
                </div>
              </div>
            )}
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ReportsPage; 