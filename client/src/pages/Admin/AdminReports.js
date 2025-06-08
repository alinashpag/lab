 import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiFileText, FiDownload, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
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
      case 'ready': return '#059669';
      case 'generating': return '#D97706';
      case 'failed': return '#DC2626';
      default: return '#6B7280';
    }
  }}20;
  color: ${props => {
    switch (props.status) {
      case 'ready': return '#059669';
      case 'generating': return '#D97706';
      case 'failed': return '#DC2626';
      default: return '#6B7280';
    }
  }};
`;

const DownloadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }

  &:disabled {
    background: ${props => props.theme.colors.border};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textMuted};
`;

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем статистику и список отчетов
      const [statsResponse, reportsResponse] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('uxui_lab_token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/reports', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('uxui_lab_token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.reports);
      }

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData || []);
      }

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (reportId) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('uxui_lab_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Получаем имя файла из заголовков ответа
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `report-${reportId}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка скачивания отчета');
      }
    } catch (err) {
      console.error('Ошибка скачивания:', err);
      alert(`Ошибка скачивания отчета: ${err.message}`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready': return <FiCheckCircle />;
      case 'generating': return <FiClock />;
      case 'failed': return <FiAlertCircle />;
      default: return <FiFileText />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready': return 'Готов';
      case 'generating': return 'Генерируется';
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
        <Title>Управление отчетами</Title>
        <Subtitle>Мониторинг и управление всеми отчетами в системе</Subtitle>
      </Header>

      {stats && (
        <StatsRow>
          <StatCard>
            <StatIcon color="#059669">
              <FiCheckCircle />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.ready || 0}</StatValue>
              <StatLabel>Готовые</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#D97706">
              <FiClock />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.generating || 0}</StatValue>
              <StatLabel>Генерируются</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#4F46E5">
              <FiDownload />
            </StatIcon>
            <StatContent>
              <StatValue>{stats.downloads || 0}</StatValue>
              <StatLabel>Скачиваний</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#7C3AED">
              <FiFileText />
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
              <Th>Название</Th>
              <Th>Тип</Th>
              <Th>Проект</Th>
              <Th>Статус</Th>
              <Th>Размер</Th>
              <Th>Создан</Th>
              <Th>Действия</Th>
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.slice(0, 50).map((report) => (
                <tr key={report.id}>
                  <Td>#{report.id}</Td>
                  <Td>{report.name || `Отчет #${report.id}`}</Td>
                  <Td>{report.type || report.report_type || 'PDF'}</Td>
                  <Td>{report.project_name || report.projectName || `Проект #${report.project_id || report.projectId}`}</Td>
                  <Td>
                    <StatusBadge status={report.status}>
                      {getStatusIcon(report.status)} {getStatusText(report.status)}
                    </StatusBadge>
                  </Td>
                  <Td>{formatFileSize(report.file_size || report.fileSize)}</Td>
                  <Td>
                    {report.created_at || report.createdAt 
                      ? new Date(report.created_at || report.createdAt).toLocaleDateString('ru-RU')
                      : '-'}
                  </Td>
                  <Td>
                    <DownloadButton
                      onClick={() => handleDownload(report.id)}
                      disabled={report.status !== 'ready'}
                    >
                      <FiDownload />
                      Скачать
                    </DownloadButton>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan="8" style={{ textAlign: 'center', color: '#6B7280' }}>
                  Отчеты не найдены
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminReports; 