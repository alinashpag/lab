import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiTrendingUp, 
  FiUsers, 
  FiTarget, 
  FiCheckCircle,
  FiPlus,
  FiArrowRight,
  FiActivity,
  FiClock,
  FiBarChart2,
  FiAlertTriangle,
  FiEye,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const DashboardContainer = styled.div`
  padding: 0;
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const DashboardHeader = styled.div`
  margin-bottom: 2rem;
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary}, 
    ${props => props.theme.colors.secondary}
  );
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.1"><circle cx="30" cy="30" r="4"/></g></svg>') repeat;
    animation: float 20s infinite linear;
  }

  @keyframes float {
    0% { transform: translateX(0) translateY(0); }
    100% { transform: translateX(-60px) translateY(-60px); }
  }
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const QuickActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    flex: 1;
    justify-content: center;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.small};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const StatCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatCardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}15;
  color: ${props => props.color};
`;

const StatCardValue = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const StatCardLabel = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const StatCardTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${props => props.trend === 'up' ? props.theme.colors.success : props.theme.colors.error};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.small};
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChartPlaceholder = styled.div`
  height: 300px;
  background: ${props => props.theme.colors.background};
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textMuted};
  text-align: center;
  gap: 1rem;
`;

const ActivitySection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.small};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color}15;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const ActivityDescription = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const ActivityTime = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  flex-shrink: 0;
`;

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedAnalyses: 0,
    activeUsers: 0,
    successRate: 0
  });

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    analytics: [],
    projectTypes: [],
    monthlyActivity: []
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Данные для графиков (временные, до загрузки реальных данных)
  const analyticsData = [
    { name: 'Янв', проекты: 12, анализы: 24, отчеты: 18 },
    { name: 'Фев', проекты: 19, анализы: 38, отчеты: 28 },
    { name: 'Мар', проекты: 15, анализы: 32, отчеты: 25 },
    { name: 'Апр', проекты: 22, анализы: 45, отчеты: 35 },
    { name: 'Май', проекты: 28, анализы: 52, отчеты: 42 },
    { name: 'Июн', проекты: 25, анализы: 48, отчеты: 38 }
  ];

  const projectTypesData = [
    { name: 'Веб-сайты', value: 45, color: '#6366f1' },
    { name: 'Мобильные', value: 30, color: '#10b981' },
    { name: 'Figma', value: 15, color: '#f59e0b' },
    { name: 'Другое', value: 10, color: '#ec4899' }
  ];

  const performanceData = [
    { name: 'Пн', оценка: 85 },
    { name: 'Вт', оценка: 92 },
    { name: 'Ср', оценка: 78 },
    { name: 'Чт', оценка: 89 },
    { name: 'Пт', оценка: 95 },
    { name: 'Сб', оценка: 88 },
    { name: 'Вс', оценка: 91 }
  ];

  // Загрузка данных
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('uxui_lab_token');
        
        // Загружаем статистику проектов
        const projectsResponse = await fetch('/api/projects?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Загружаем статистику анализов
        const analysesResponse = await fetch('/api/analysis', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Загружаем отчеты
        const reportsResponse = await fetch('/api/reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (projectsResponse.ok && analysesResponse.ok && reportsResponse.ok) {
          const projectsData = await projectsResponse.json();
          const analysesData = await analysesResponse.json();
          const reportsData = await reportsResponse.json();

          // Обновляем статистику
          setStats({
            totalProjects: projectsData.pagination?.total || projectsData.projects?.length || 0,
            completedAnalyses: analysesData.analyses?.filter(a => a.status === 'completed').length || 0,
            activeUsers: 1, // Временно
            successRate: Math.round((analysesData.analyses?.filter(a => a.status === 'completed').length || 0) * 100 / (analysesData.analyses?.length || 1))
          });

          // Обновляем активность
          const activities = [
            ...projectsData.projects?.slice(0, 2).map(p => ({
              id: `project-${p.id}`,
              title: 'Проект создан',
              description: p.name,
              time: new Date(p.created_at).toLocaleDateString('ru-RU'),
              type: 'project',
              color: '#6366f1'
            })) || [],
            ...analysesData.analyses?.slice(0, 2).map(a => ({
              id: `analysis-${a.id}`,
              title: a.status === 'completed' ? 'Анализ завершен' : 'Анализ запущен',
              description: a.name || `Анализ #${a.id}`,
              time: new Date(a.created_at).toLocaleDateString('ru-RU'),
              type: 'analysis',
              color: a.status === 'completed' ? '#10b981' : '#f59e0b'
            })) || []
          ];

          setRecentActivity(activities.slice(0, 4));
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 17) return 'Добрый день';
    return 'Добрый вечер';
  };

  const getUserName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.username || 'Пользователь';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'analysis': return FiBarChart2;
      case 'project': return FiTarget;
      case 'report': return FiCheckCircle;
      case 'user': return FiUsers;
      default: return FiActivity;
    }
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <WelcomeSection>
          <WelcomeContent>
            <WelcomeTitle>
              {getGreeting()}, {getUserName()}!
            </WelcomeTitle>
            <WelcomeSubtitle>
              Добро пожаловать в UX/UI Lab. Давайте создадим что-то удивительное сегодня.
            </WelcomeSubtitle>
            <QuickActions>
              <QuickActionButton to="/projects/new">
                <FiPlus size={18} />
                Новый проект
              </QuickActionButton>
              <QuickActionButton to="/analysis">
                <FiBarChart2 size={18} />
                Запустить анализ
              </QuickActionButton>
            </QuickActions>
          </WelcomeContent>
        </WelcomeSection>

        <StatsGrid>
          <StatCard>
            <StatCardHeader>
              <StatCardIcon color="#6366f1">
                <FiTarget size={24} />
              </StatCardIcon>
            </StatCardHeader>
            <StatCardValue>{stats.totalProjects}</StatCardValue>
            <StatCardLabel>Всего проектов</StatCardLabel>
            <StatCardTrend trend="up">
              <FiTrendingUp size={12} />
              +12% за месяц
            </StatCardTrend>
          </StatCard>

          <StatCard>
            <StatCardHeader>
              <StatCardIcon color="#10b981">
                <FiCheckCircle size={24} />
              </StatCardIcon>
            </StatCardHeader>
            <StatCardValue>{stats.completedAnalyses}</StatCardValue>
            <StatCardLabel>Завершенных анализов</StatCardLabel>
            <StatCardTrend trend="up">
              <FiTrendingUp size={12} />
              +8% за месяц
            </StatCardTrend>
          </StatCard>

          <StatCard>
            <StatCardHeader>
              <StatCardIcon color="#ec4899">
                <FiUsers size={24} />
              </StatCardIcon>
            </StatCardHeader>
            <StatCardValue>{stats.activeUsers}</StatCardValue>
            <StatCardLabel>Активных пользователей</StatCardLabel>
            <StatCardTrend trend="up">
              <FiTrendingUp size={12} />
              +15% за месяц
            </StatCardTrend>
          </StatCard>

          <StatCard>
            <StatCardHeader>
              <StatCardIcon color="#f59e0b">
                <FiActivity size={24} />
              </StatCardIcon>
            </StatCardHeader>
            <StatCardValue>{stats.successRate}%</StatCardValue>
            <StatCardLabel>Успешность анализов</StatCardLabel>
            <StatCardTrend trend="up">
              <FiTrendingUp size={12} />
              +2% за месяц
            </StatCardTrend>
          </StatCard>
        </StatsGrid>
      </DashboardHeader>

      <ContentGrid>
        <ChartSection>
          <SectionTitle>
            <FiBarChart2 size={20} />
            Аналитика за последние месяцы
          </SectionTitle>
          
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ 
              fontSize: '1rem', 
              marginBottom: '1rem', 
              color: '#6366f1', 
              fontWeight: '600' 
            }}>
              Активность по месяцам
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="проекты" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="анализы" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="отчеты" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '2rem',
            '@media (max-width: 768px)': {
              gridTemplateColumns: '1fr'
            }
          }}>
            <div>
              <h4 style={{ 
                fontSize: '1rem', 
                marginBottom: '1rem', 
                color: '#10b981', 
                fontWeight: '600' 
              }}>
                Производительность за неделю
              </h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="оценка" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 style={{ 
                fontSize: '1rem', 
                marginBottom: '1rem', 
                color: '#ec4899', 
                fontWeight: '600' 
              }}>
                Типы проектов
              </h4>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={projectTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      fontSize: '12px',
                      paddingTop: '10px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartSection>

        <ActivitySection>
          <SectionTitle>
            <FiClock size={20} />
            Последняя активность
          </SectionTitle>
          <ActivityList>
            {recentActivity.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <ActivityItem key={activity.id}>
                  <ActivityIcon color={activity.color}>
                    <IconComponent size={18} />
                  </ActivityIcon>
                  <ActivityContent>
                    <ActivityTitle>{activity.title}</ActivityTitle>
                    <ActivityDescription>{activity.description}</ActivityDescription>
                  </ActivityContent>
                  <ActivityTime>{activity.time}</ActivityTime>
                </ActivityItem>
              );
            })}
          </ActivityList>
        </ActivitySection>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default DashboardPage; 