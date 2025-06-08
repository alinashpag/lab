import React, { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { 
  FiDownload, FiEye, FiSearch,
  FiBarChart2, FiAlertCircle,
  FiCheckCircle, FiClock, FiTrash2, FiRefreshCw,
  FiPlus
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
  background: ${props => props.variant === 'primary' 
    ? `linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.primaryDark})`
    : props.variant === 'success'
    ? `linear-gradient(135deg, ${props.theme.colors.success}, ${props.theme.colors.success}dd)`
    : props.variant === 'danger'
    ? `linear-gradient(135deg, ${props.theme.colors.error}, ${props.theme.colors.error}dd)`
    : props.theme.colors.surface};
  color: ${props => ['primary', 'success', 'danger'].includes(props.variant)
    ? 'white' 
    : props.theme.colors.text};
  border: ${props => ['primary', 'success', 'danger'].includes(props.variant)
    ? 'none'
    : `1px solid ${props.theme.colors.border}`};
  padding: 0.75rem 1.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.medium};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  background: ${props => props.color + '20'};
  color: ${props => props.color};
  padding: 0.75rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const Filters = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  color: ${props => props.theme.colors.text};
  min-width: 250px;
  position: relative;

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  z-index: 1;
`;

const Select = styled.select`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.75rem 1rem;
  color: ${props => props.theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const AnalysisList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const AnalysisCard = styled.div`
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

const AnalysisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const AnalysisInfo = styled.div`
  flex: 1;
`;

const AnalysisTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const AnalysisProject = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const AnalysisStatus = styled.div`
  background: ${props => {
    switch (props.status) {
      case 'completed': return props.theme.colors.success + '20';
      case 'running': return props.theme.colors.warning + '20';
      case 'failed': return props.theme.colors.error + '20';
      case 'pending': return props.theme.colors.info + '20';
      default: return props.theme.colors.textMuted + '20';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return props.theme.colors.success;
      case 'running': return props.theme.colors.warning;
      case 'failed': return props.theme.colors.error;
      case 'pending': return props.theme.colors.info;
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

const AnalysisActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
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

const AnalysisDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
`;

const DetailValue = styled.span`
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
`;

const Progress = styled.div`
  width: 100%;
  height: 6px;
  background: ${props => props.theme.colors.border};
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.progress || 0}%;
  transition: width 0.3s ease;
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

// Модальное окно создания анализа
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.small};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const AnalysisPage = () => {
  const theme = useTheme();
  
  const [analyses, setAnalyses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    running: 0,
    failed: 0
  });
  
  // Фильтры и поиск
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('');
  
  // Модальное окно
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');

  // Модальное окно результатов анализа
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedAnalysisResults, setSelectedAnalysisResults] = useState(null);

  // Загрузка данных
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('uxui_lab_token');
      
      // Параллельная загрузка анализов и проектов
      const [analysesResponse, projectsResponse] = await Promise.all([
        fetch('/api/analysis', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (analysesResponse.ok && projectsResponse.ok) {
        const analysesData = await analysesResponse.json();
        const projectsData = await projectsResponse.json();
        
        setAnalyses(analysesData.analyses || []);
        setProjects(projectsData.projects || []);
        
        // Подсчет статистики
        const total = analysesData.analyses?.length || 0;
        const completed = analysesData.analyses?.filter(a => a.status === 'completed').length || 0;
        const running = analysesData.analyses?.filter(a => a.status === 'running').length || 0;
        const failed = analysesData.analyses?.filter(a => a.status === 'failed').length || 0;
        
        setStats({ total, completed, running, failed });
      } else {
        throw new Error('Ошибка загрузки данных');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Создание анализа
  const createAnalysis = async () => {
    if (!selectedProject) return;
    
    try {
      setCreateLoading(true);
      
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: selectedProject,
          analysis_type: 'complete'
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setSelectedProject('');
        loadData();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка создания анализа');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Удаление анализа
  const deleteAnalysis = async (analysisId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот анализ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/analysis/${analysisId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadData();
      } else {
        throw new Error('Ошибка удаления анализа');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Получение иконки статуса
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FiCheckCircle size={14} />;
      case 'running': return <FiClock size={14} />;
      case 'failed': return <FiAlertCircle size={14} />;
      default: return <FiClock size={14} />;
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

  // Фильтрация анализов
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || analysis.status === statusFilter;
    const matchesProject = !projectFilter || analysis.project_id?.toString() === projectFilter;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  // Просмотр результатов анализа
  const viewAnalysisResults = async (analysisId) => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/analysis/${analysisId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedAnalysisResults(data);
        setShowResultsModal(true);
      } else {
        throw new Error('Ошибка загрузки результатов анализа');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Скачивание отчета анализа
  const downloadAnalysisReport = async (analysisId) => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      
      // Сначала проверим, есть ли готовый отчет для анализа
      const reportsResponse = await fetch(`/api/reports?analysis_id=${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        if (reportsData.reports && reportsData.reports.length > 0) {
          const report = reportsData.reports[0];
          
          // Скачиваем существующий отчет
          const downloadResponse = await fetch(`/api/reports/${report.id}/download`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (downloadResponse.ok) {
            const blob = await downloadResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analysis-report-${analysisId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } else {
            throw new Error('Ошибка скачивания отчета');
          }
        } else {
          // Создаем новый отчет для анализа
          const createReportResponse = await fetch('/api/reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              analysis_id: analysisId,
              report_type: 'analysis',
              format: 'pdf'
            }),
          });

          if (createReportResponse.ok) {
            alert('Отчет создается. Он будет доступен в разделе "Отчеты" через несколько минут.');
          } else {
            throw new Error('Ошибка создания отчета');
          }
        }
      } else {
        throw new Error('Ошибка проверки отчетов');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Container>
      <Header>
        <Title>Анализ интерфейсов</Title>
        <Actions>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus size={18} />
            Запустить анализ
          </Button>
          <Button onClick={loadData}>
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
              <StatLabel>Всего анализов</StatLabel>
            </div>
            <StatIcon color={theme.colors.primary}>
              <FiBarChart2 size={20} />
            </StatIcon>
          </StatHeader>
        </StatCard>
        
        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.completed}</StatValue>
              <StatLabel>Завершено</StatLabel>
            </div>
            <StatIcon color={theme.colors.success}>
              <FiCheckCircle size={20} />
            </StatIcon>
          </StatHeader>
        </StatCard>
        
        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.running}</StatValue>
              <StatLabel>Выполняется</StatLabel>
            </div>
            <StatIcon color={theme.colors.warning}>
              <FiClock size={20} />
            </StatIcon>
          </StatHeader>
        </StatCard>
        
        <StatCard>
          <StatHeader>
            <div>
              <StatValue>{stats.failed}</StatValue>
              <StatLabel>Ошибки</StatLabel>
            </div>
            <StatIcon color={theme.colors.error}>
              <FiAlertCircle size={20} />
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
            placeholder="Поиск анализов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <Select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Все статусы</option>
          <option value="completed">Завершено</option>
          <option value="running">Выполняется</option>
          <option value="failed">Ошибка</option>
          <option value="pending">Ожидание</option>
        </Select>

        <Select 
          value={projectFilter} 
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="">Все проекты</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
      </Filters>

      {loading && <LoadingSpinner />}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && !error && filteredAnalyses.length === 0 && (
        <EmptyState>
          <EmptyIcon>📊</EmptyIcon>
          <h3>Нет анализов</h3>
          <p>Запустите первый анализ для оценки вашего интерфейса</p>
        </EmptyState>
      )}

      {!loading && !error && filteredAnalyses.length > 0 && (
        <AnalysisList>
          {filteredAnalyses.map((analysis) => (
            <AnalysisCard key={analysis.id}>
              <AnalysisHeader>
                <AnalysisInfo>
                  <AnalysisTitle>{analysis.name || `Анализ #${analysis.id}`}</AnalysisTitle>
                  <AnalysisProject>Проект: {analysis.project_name || 'Неизвестен'}</AnalysisProject>
                </AnalysisInfo>
                <AnalysisActions>
                  <AnalysisStatus status={analysis.status}>
                    {getStatusIcon(analysis.status)}
                    {analysis.status === 'completed' ? 'Завершен' :
                     analysis.status === 'running' ? 'Выполняется' :
                     analysis.status === 'failed' ? 'Ошибка' : 'Ожидание'}
                  </AnalysisStatus>
                  
                  <IconButton title="Просмотр" disabled={analysis.status !== 'completed'} onClick={() => viewAnalysisResults(analysis.id)}>
                    <FiEye size={16} />
                  </IconButton>
                  <IconButton title="Скачать отчет" disabled={analysis.status !== 'completed'} onClick={() => downloadAnalysisReport(analysis.id)}>
                    <FiDownload size={16} />
                  </IconButton>
                  <IconButton 
                    title="Удалить"
                    onClick={() => deleteAnalysis(analysis.id)}
                  >
                    <FiTrash2 size={16} />
                  </IconButton>
                </AnalysisActions>
              </AnalysisHeader>

              {analysis.status === 'running' && (
                <Progress>
                  <ProgressBar progress={analysis.progress || 0} />
                </Progress>
              )}

              <AnalysisDetails>
                <DetailItem>
                  <DetailLabel>Тип анализа</DetailLabel>
                  <DetailValue>{analysis.analysis_type || 'Полный'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Дата создания</DetailLabel>
                  <DetailValue>{formatDate(analysis.created_at)}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Длительность</DetailLabel>
                  <DetailValue>
                    {analysis.duration ? `${Math.round(analysis.duration / 1000)}с` : '—'}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Оценка</DetailLabel>
                  <DetailValue>
                    {analysis.score ? `${analysis.score}/100` : '—'}
                  </DetailValue>
                </DetailItem>
              </AnalysisDetails>
            </AnalysisCard>
          ))}
        </AnalysisList>
      )}

      {/* Модальное окно создания анализа */}
      {showCreateModal && (
        <Modal onClick={(e) => {
          if (e.target === e.currentTarget) setShowCreateModal(false);
        }}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Запустить новый анализ</ModalTitle>
              <CloseButton onClick={() => setShowCreateModal(false)}>
                ✕
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label htmlFor="project">Выберите проект *</Label>
              <Select
                id="project"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                required
                style={{ width: '100%' }}
              >
                <option value="">Выберите проект...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button 
                type="button" 
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
              >
                Отмена
              </Button>
              <Button 
                variant="primary"
                onClick={createAnalysis}
                disabled={createLoading || !selectedProject}
              >
                {createLoading ? <LoadingSpinner size="small" /> : 'Запустить анализ'}
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Модальное окно результатов анализа */}
      {showResultsModal && (
        <Modal onClick={(e) => {
          if (e.target === e.currentTarget) setShowResultsModal(false);
        }}>
          <ModalContent style={{ maxWidth: '1000px', maxHeight: '90vh' }}>
            <ModalHeader>
              <ModalTitle>Результаты анализа</ModalTitle>
              <CloseButton onClick={() => setShowResultsModal(false)}>
                ✕
              </CloseButton>
            </ModalHeader>

            {selectedAnalysisResults && (
              <div style={{ padding: '1rem 0' }}>
                {/* Общая информация */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {selectedAnalysisResults.results.name}
                    <span style={{
                      background: theme.colors.success + '20',
                      color: theme.colors.success,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      Оценка: {selectedAnalysisResults.results.score}/100
                    </span>
                  </h3>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem',
                    background: theme.colors.background,
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <strong>Проект:</strong>
                      <div>{selectedAnalysisResults.results.project.name}</div>
                    </div>
                    <div>
                      <strong>Тип анализа:</strong>
                      <div>{selectedAnalysisResults.results.type || 'Полный анализ'}</div>
                    </div>
                    <div>
                      <strong>Время выполнения:</strong>
                      <div>{Math.round((selectedAnalysisResults.results.duration || 12000) / 1000)}с</div>
                    </div>
                    <div>
                      <strong>Всего проблем:</strong>
                      <div>{selectedAnalysisResults.results.results.summary.total_issues}</div>
                    </div>
                  </div>
                </div>

                {/* Сводка по критичности */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Распределение по критичности</h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    <div style={{ 
                      background: theme.colors.error + '10', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: `1px solid ${theme.colors.error}20`
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.error }}>
                        {selectedAnalysisResults.results.results.summary.critical}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>Критические</div>
                    </div>
                    <div style={{ 
                      background: theme.colors.warning + '10', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: `1px solid ${theme.colors.warning}20`
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.warning }}>
                        {selectedAnalysisResults.results.results.summary.high}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>Высокие</div>
                    </div>
                    <div style={{ 
                      background: theme.colors.info + '10', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: `1px solid ${theme.colors.info}20`
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.info }}>
                        {selectedAnalysisResults.results.results.summary.medium}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>Средние</div>
                    </div>
                    <div style={{ 
                      background: theme.colors.success + '10', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: `1px solid ${theme.colors.success}20`
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.success }}>
                        {selectedAnalysisResults.results.results.summary.low}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>Низкие</div>
                    </div>
                  </div>
                </div>

                {/* Детальные результаты по категориям */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Детальный анализ по категориям</h4>
                  {selectedAnalysisResults.results.results.categories.map((category, index) => (
                    <div key={index} style={{ 
                      background: theme.colors.surface,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      padding: '1.5rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <h5 style={{ margin: 0, fontSize: '1.1rem' }}>{category.name}</h5>
                        <span style={{
                          background: category.score >= 80 ? theme.colors.success + '20' : 
                                     category.score >= 60 ? theme.colors.warning + '20' : 
                                     theme.colors.error + '20',
                          color: category.score >= 80 ? theme.colors.success : 
                                 category.score >= 60 ? theme.colors.warning : 
                                 theme.colors.error,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {category.score}/100
                        </span>
                      </div>
                      
                      {category.issues.map((issue, issueIndex) => (
                        <div key={issueIndex} style={{ 
                          background: theme.colors.background,
                          padding: '1rem',
                          borderRadius: '6px',
                          marginBottom: '0.5rem',
                          borderLeft: `4px solid ${
                            issue.severity === 'high' ? theme.colors.error :
                            issue.severity === 'medium' ? theme.colors.warning :
                            theme.colors.info
                          }`
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem'
                          }}>
                            <h6 style={{ margin: 0, fontSize: '0.95rem' }}>{issue.title}</h6>
                            <span style={{
                              background: issue.severity === 'high' ? theme.colors.error + '20' :
                                         issue.severity === 'medium' ? theme.colors.warning + '20' :
                                         theme.colors.info + '20',
                              color: issue.severity === 'high' ? theme.colors.error :
                                     issue.severity === 'medium' ? theme.colors.warning :
                                     theme.colors.info,
                              padding: '0.125rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {issue.severity === 'high' ? 'Высокая' :
                               issue.severity === 'medium' ? 'Средняя' : 'Низкая'}
                            </span>
                          </div>
                          <p style={{ 
                            margin: '0 0 0.5rem 0', 
                            fontSize: '0.875rem',
                            color: theme.colors.textSecondary 
                          }}>
                            {issue.description}
                          </p>
                          <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>
                            <strong>Элементы:</strong> {issue.element} | 
                            <strong> Расположение:</strong> {issue.location}
                          </div>
                          <div style={{ 
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            background: theme.colors.success + '10',
                            borderRadius: '4px',
                            fontSize: '0.875rem'
                          }}>
                            <strong>💡 Рекомендация:</strong> {issue.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Технические детали */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Технические показатели</h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem',
                    background: theme.colors.background,
                    padding: '1rem',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <strong>Время загрузки:</strong>
                      <div>{selectedAnalysisResults.results.results.technical_details.page_load_time}</div>
                    </div>
                    <div>
                      <strong>Размер страницы:</strong>
                      <div>{selectedAnalysisResults.results.results.technical_details.total_page_size}</div>
                    </div>
                    <div>
                      <strong>Количество запросов:</strong>
                      <div>{selectedAnalysisResults.results.results.technical_details.number_of_requests}</div>
                    </div>
                    <div>
                      <strong>LCP:</strong>
                      <div>{selectedAnalysisResults.results.results.technical_details.largest_contentful_paint}</div>
                    </div>
                    <div>
                      <strong>CLS:</strong>
                      <div>{selectedAnalysisResults.results.results.technical_details.cumulative_layout_shift}</div>
                    </div>
                    <div>
                      <strong>FID:</strong>
                      <div>{selectedAnalysisResults.results.results.technical_details.first_input_delay}</div>
                    </div>
                  </div>
                </div>

                {/* Рекомендации */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Общие рекомендации</h4>
                  <div style={{ 
                    background: theme.colors.info + '10',
                    border: `1px solid ${theme.colors.info}20`,
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    {selectedAnalysisResults.results.results.summary.recommendations.map((rec, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        marginBottom: '0.5rem' 
                      }}>
                        <span style={{ 
                          color: theme.colors.info,
                          marginRight: '0.5rem',
                          fontSize: '1.2rem'
                        }}>
                          •
                        </span>
                        <span style={{ fontSize: '0.875rem' }}>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Кнопки действий */}
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  justifyContent: 'flex-end',
                  marginTop: '2rem',
                  paddingTop: '1rem',
                  borderTop: `1px solid ${theme.colors.border}`
                }}>
                  <Button onClick={() => window.print()}>
                    📄 Печать
                  </Button>
                  <Button onClick={() => downloadAnalysisReport(selectedAnalysisResults.results.id)}>
                    📥 Скачать отчет
                  </Button>
                  <Button variant="primary" onClick={() => setShowResultsModal(false)}>
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

export default AnalysisPage; 