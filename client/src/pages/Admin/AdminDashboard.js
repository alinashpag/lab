 import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiUsers, FiFolder, FiActivity, FiFileText } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminDashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
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
  font-size: 2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: ${props => props.theme.colors.textMuted};
`;

const StatSubtitle = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMuted};
  margin-top: 0.5rem;
`;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('uxui_lab_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        throw new Error('Ошибка загрузки статистики');
      }

    } catch (err) {
      console.error('Ошибка загрузки админ данных:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <AdminDashboardContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Ошибка загрузки админ-панели</h2>
          <p>{error}</p>
          <button onClick={fetchAdminData}>Попробовать снова</button>
        </div>
      </AdminDashboardContainer>
    );
  }

  return (
    <AdminDashboardContainer>
      <Header>
        <Title>Админ-панель</Title>
        <Subtitle>
          Добро пожаловать, {user?.firstName || user?.username}! 
          Управление системой UX/UI Lab.
        </Subtitle>
      </Header>

      <StatsGrid>
        <StatCard onClick={() => window.location.href = '/admin/users'}>
          <StatHeader>
            <StatIcon color="#4F46E5">
              <FiUsers />
            </StatIcon>
            <StatContent>
              <StatLabel>Пользователи</StatLabel>
              <StatValue>{stats?.users?.total || 0}</StatValue>
            </StatContent>
          </StatHeader>
          <StatSubtitle>+{stats?.users?.newThisMonth || 0} в этом месяце</StatSubtitle>
        </StatCard>
        
        <StatCard onClick={() => window.location.href = '/admin/projects'}>
          <StatHeader>
            <StatIcon color="#059669">
              <FiFolder />
            </StatIcon>
            <StatContent>
              <StatLabel>Проекты</StatLabel>
              <StatValue>{stats?.projects?.total || 0}</StatValue>
            </StatContent>
          </StatHeader>
          <StatSubtitle>{stats?.projects?.active || 0} активных</StatSubtitle>
        </StatCard>
        
        <StatCard onClick={() => window.location.href = '/admin/analyses'}>
          <StatHeader>
            <StatIcon color="#DC2626">
              <FiActivity />
            </StatIcon>
            <StatContent>
              <StatLabel>Анализы</StatLabel>
              <StatValue>{stats?.analyses?.total || 0}</StatValue>
            </StatContent>
          </StatHeader>
          <StatSubtitle>{stats?.analyses?.completed || 0} завершено</StatSubtitle>
        </StatCard>
        
        <StatCard onClick={() => window.location.href = '/admin/reports'}>
          <StatHeader>
            <StatIcon color="#7C3AED">
              <FiFileText />
            </StatIcon>
            <StatContent>
              <StatLabel>Отчёты</StatLabel>
              <StatValue>{stats?.reports?.total || 0}</StatValue>
            </StatContent>
          </StatHeader>
          <StatSubtitle>{stats?.reports?.downloads || 0} скачиваний</StatSubtitle>
        </StatCard>
      </StatsGrid>
    </AdminDashboardContainer>
  );
};

export default AdminDashboard; 