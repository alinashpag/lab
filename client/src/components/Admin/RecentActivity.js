import React from 'react';
import styled from 'styled-components';
import { FiUser, FiFolder, FiActivity, FiFileText, FiTrash2, FiEdit3 } from 'react-icons/fi';

const ActivityContainer = styled.div`
  padding: 1.5rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
`;

const ActivityHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ActivityTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
`;

const ActivitySubtitle = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMuted};
  margin: 0;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.border}20;
  }
`;

const ActivityIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  background: ${props => props.color || props.theme.colors.primary}15;
  color: ${props => props.color || props.theme.colors.primary};
  font-size: 1rem;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
`;

const ActivityTime = styled.span``;

const ActivityUser = styled.span`
  font-weight: 500;
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background: transparent;
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primary}10;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textMuted};
`;

const RecentActivity = ({ activities = [] }) => {
  // Заглушка данных для демонстрации
  const mockActivities = [
    {
      id: 1,
      type: 'user_registered',
      text: 'Новый пользователь зарегистрировался',
      user: 'demo@example.com',
      time: '2 минуты назад',
      icon: 'user',
      color: '#4F46E5'
    },
    {
      id: 2,
      type: 'project_created',
      text: 'Создан новый проект "E-commerce Dashboard"',
      user: 'admin@uxuilab.com',
      time: '15 минут назад',
      icon: 'folder',
      color: '#059669'
    },
    {
      id: 3,
      type: 'analysis_completed',
      text: 'Завершен анализ доступности для проекта "Banking App"',
      user: 'test@example.com',
      time: '1 час назад',
      icon: 'activity',
      color: '#DC2626'
    },
    {
      id: 4,
      type: 'report_generated',
      text: 'Сгенерирован отчёт по проекту "Educational Platform"',
      user: 'admin@uxuilab.com',
      time: '2 часа назад',
      icon: 'file',
      color: '#7C3AED'
    },
    {
      id: 5,
      type: 'user_updated',
      text: 'Пользователь обновил профиль',
      user: 'demo@uxuilab.com',
      time: '3 часа назад',
      icon: 'edit',
      color: '#059669'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'user': return <FiUser />;
      case 'folder': return <FiFolder />;
      case 'activity': return <FiActivity />;
      case 'file': return <FiFileText />;
      case 'edit': return <FiEdit3 />;
      case 'delete': return <FiTrash2 />;
      default: return <FiActivity />;
    }
  };

  const formatTime = (time) => {
    // Если время уже отформатировано, возвращаем как есть
    if (typeof time === 'string' && time.includes('назад')) {
      return time;
    }
    
    // Если это объект Date или timestamp, форматируем
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    return `${days} дн. назад`;
  };

  return (
    <ActivityContainer>
      <ActivityHeader>
        <ActivityTitle>Последняя активность</ActivityTitle>
        <ActivitySubtitle>Недавние действия в системе</ActivitySubtitle>
      </ActivityHeader>

      <ActivityList>
        {displayActivities.length > 0 ? (
          displayActivities.slice(0, 5).map((activity) => (
            <ActivityItem key={activity.id}>
              <ActivityIcon color={activity.color}>
                {getIcon(activity.icon)}
              </ActivityIcon>
              
              <ActivityContent>
                <ActivityText>{activity.text}</ActivityText>
                <ActivityMeta>
                  <ActivityUser>{activity.user}</ActivityUser>
                  <ActivityTime>{formatTime(activity.time)}</ActivityTime>
                </ActivityMeta>
              </ActivityContent>
            </ActivityItem>
          ))
        ) : (
          <EmptyState>
            <p>Нет данных об активности</p>
          </EmptyState>
        )}
      </ActivityList>

      {displayActivities.length > 5 && (
        <ViewAllButton>
          Показать всю активность
        </ViewAllButton>
      )}
    </ActivityContainer>
  );
};

export default RecentActivity; 