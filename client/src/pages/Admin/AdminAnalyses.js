 import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiActivity, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textMuted};
  font-size: 1rem;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatContent = styled.div``;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMuted};
`;

const TableContainer = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: ${props => props.theme.colors.background};
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};

  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#059669';
      case 'running': return '#DC2626';
      case 'pending': return '#D97706';
      case 'failed': return '#DC2626';
      default: return '#6B7280';
    }
  }}20;
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#059669';
      case 'running': return '#DC2626';
      case 'pending': return '#D97706';
      case 'failed': return '#DC2626';
      default: return '#6B7280';
    }
  }};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textMuted};
`;

const AdminAnalyses = () => {
  const [stats, setStats] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем статистику и список анализов
      const [statsResponse, analysesResponse] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('uxui_lab_token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/analysis', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('uxui_lab_token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.analyses);
      }

      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json();
        setAnalyses(analysesData || []);
      }

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FiCheckCircle />;
      case 'running': return <FiActivity />;
      case 'pending': return <FiClock />;
      case 'failed': return <FiXCircle />;
      default: return <FiAlertCircle />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Завершён';
      case 'running': return 'Выполняется';
      case 'pending': return 'Ожидает';
      case 'failed': return 'Ошибка';
      default: return 'Неизвестно';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          <h2>Ошибка загрузки данных</h2>
          <p>{error}</p>
          <button onClick={loadData}>Попробовать снова</button>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Управление анализами</Title>
        <Subtitle>Мониторинг и управление всеми анализами в системе</Subtitle>
      </Header>

      {stats && (
        <StatsRow>
          <StatCard>
            <StatIcon color="#059669">
              <FiCheckCircle />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.completed || 0}</StatValue>
              <StatLabel>Завершено</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#DC2626">
              <FiActivity />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.running || 0}</StatValue>
              <StatLabel>Выполняется</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#D97706">
              <FiClock />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.pending || 0}</StatValue>
              <StatLabel>Ожидает</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#DC2626">
              <FiXCircle />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.failed || 0}</StatValue>
              <StatLabel>Ошибки</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#4F46E5">
              <FiActivity />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.total || 0}</StatValue>
              <StatLabel>Всего</StatLabel>
            </StatContent>
          </StatCard>
        </StatsRow>
      )}

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Тип анализа</Th>
              <Th>Проект</Th>
              <Th>Статус</Th>
              <Th>Оценка</Th>
              <Th>Создан</Th>
              <Th>Завершён</Th>
            </tr>
          </thead>
          <tbody>
            {analyses.length > 0 ? (
              analyses.slice(0, 50).map((analysis) => (
                <tr key={analysis.id}>
                  <Td>#{analysis.id}</Td>
                  <Td>{analysis.analysis_type || analysis.analysisType || 'Не указан'}</Td>
                  <Td>{analysis.project_name || analysis.projectName || `Проект #${analysis.project_id || analysis.projectId}`}</Td>
                  <Td>
                    <StatusBadge status={analysis.status}>
                      {getStatusIcon(analysis.status)} {getStatusText(analysis.status)}
                    </StatusBadge>
                  </Td>
                  <Td>{analysis.score ? `${analysis.score}/100` : '-'}</Td>
                  <Td>
                    {analysis.created_at || analysis.createdAt 
                      ? new Date(analysis.created_at || analysis.createdAt).toLocaleDateString('ru-RU')
                      : '-'}
                  </Td>
                  <Td>
                    {analysis.completed_at || analysis.completedAt
                      ? new Date(analysis.completed_at || analysis.completedAt).toLocaleDateString('ru-RU')
                      : '-'}
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan="7" style={{ textAlign: 'center', color: '#6B7280' }}>
                  Анализы не найдены
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminAnalyses; 