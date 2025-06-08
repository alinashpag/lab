import React, { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { 
  FiBell, FiCheck, FiTrash2, FiRefreshCw, 
  FiFilter, FiSearch, FiCheckCircle, FiX,
  FiFolder, FiBarChart2, FiFileText, FiUsers
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.color || props.theme.colors.text};
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

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  color: ${props => props.theme.colors.text};
  min-width: 250px;

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
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

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.isRead 
    ? props.theme.colors.border 
    : props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 1.5rem;
  transition: all 0.2s ease;
  position: relative;
  opacity: ${props => props.isRead ? 0.8 : 1};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.medium};
  }

  ${props => !props.isRead && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: ${props.theme.colors.primary};
      border-radius: 0 0 0 ${props.theme.borderRadius.large};
    }
  `}
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const NotificationInfo = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NotificationMessage = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMuted};
`;

const NotificationActions = styled.div`
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

const NotificationType = styled.span`
  background: ${props => {
    switch (props.type) {
      case 'project_created': return props.theme.colors.info + '20';
      case 'analysis_completed': return props.theme.colors.success + '20';
      case 'report_ready': return props.theme.colors.warning + '20';
      case 'system': return props.theme.colors.primary + '20';
      default: return props.theme.colors.textMuted + '20';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'project_created': return props.theme.colors.info;
      case 'analysis_completed': return props.theme.colors.success;
      case 'report_ready': return props.theme.colors.warning;
      case 'system': return props.theme.colors.primary;
      default: return props.theme.colors.textMuted;
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const PageButton = styled.button`
  background: ${props => props.active 
    ? props.theme.colors.primary 
    : props.theme.colors.surface};
  color: ${props => props.active 
    ? 'white' 
    : props.theme.colors.text};
  border: 1px solid ${props => props.active 
    ? props.theme.colors.primary 
    : props.theme.colors.border};
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.active 
      ? props.theme.colors.primaryDark 
      : props.theme.colors.surfaceHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  text-align: center;
  margin: 2rem 0;
  padding: 1rem;
  background: ${props => props.theme.colors.error}10;
  border: 1px solid ${props => props.theme.colors.error}20;
  border-radius: ${props => props.theme.borderRadius.medium};
`;

const NotificationsPage = () => {
  const theme = useTheme();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0
  });
  
  // Фильтры и поиск
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('all'); // all, read, unread
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Типы уведомлений
  const notificationTypes = {
    'project_created': { label: 'Проект создан', icon: FiFolder },
    'analysis_completed': { label: 'Анализ завершен', icon: FiBarChart2 },
    'report_ready': { label: 'Отчет готов', icon: FiFileText },
    'system': { label: 'Системное', icon: FiBell },
  };

  // Загрузка уведомлений
  const loadNotifications = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('uxui_lab_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (typeFilter) params.append('type', typeFilter);
      if (readFilter !== 'all') {
        params.append('is_read', readFilter === 'read' ? 'true' : 'false');
      }

      const response = await fetch(`/api/notifications?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setPagination(data.pagination || {});
        
        // Обновляем статистику
        setStats(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          unread: data.unread_count || 0
        }));
      } else {
        throw new Error('Ошибка загрузки уведомлений');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Отметить уведомление как прочитанное
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        ));
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      } else {
        throw new Error('Ошибка обновления уведомления');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Отметить все как прочитанные
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notification => 
          ({ ...notification, is_read: true })
        ));
        setStats(prev => ({ ...prev, unread: 0 }));
      } else {
        throw new Error('Ошибка обновления уведомлений');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Удалить уведомление
  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это уведомление?')) {
      return;
    }

    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setStats(prev => ({ ...prev, total: prev.total - 1 }));
      } else {
        throw new Error('Ошибка удаления уведомления');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Очистить прочитанные уведомления
  const clearReadNotifications = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить все прочитанные уведомления?')) {
      return;
    }

    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch('/api/notifications/clear-read', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => !n.is_read));
        loadNotifications(currentPage); // Перезагружаем текущую страницу
      } else {
        throw new Error('Ошибка очистки уведомлений');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Получить иконку уведомления
  const getNotificationIcon = (type) => {
    const IconComponent = notificationTypes[type]?.icon || FiBell;
    return <IconComponent size={16} />;
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Только что';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ч. назад`;
    } else if (diffInHours < 48) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Фильтрация уведомлений на клиенте (дополнительно к серверной фильтрации)
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Обработка смены страницы
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadNotifications(page);
  };

  // Обработка смены фильтров
  const handleFilterChange = () => {
    setCurrentPage(1);
    loadNotifications(1);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    handleFilterChange();
  }, [typeFilter, readFilter]);

  return (
    <Container>
      <Header>
        <Title>
          <FiBell size={28} />
          Уведомления
        </Title>
        <Actions>
          <Button onClick={() => loadNotifications(currentPage)}>
            <FiRefreshCw size={18} />
            Обновить
          </Button>
          {stats.unread > 0 && (
            <Button variant="success" onClick={markAllAsRead}>
              <FiCheckCircle size={18} />
              Отметить все как прочитанные
            </Button>
          )}
          <Button variant="danger" onClick={clearReadNotifications}>
            <FiTrash2 size={18} />
            Очистить прочитанные
          </Button>
        </Actions>
      </Header>

      {/* Статистика */}
      <Stats>
        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Всего уведомлений</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue color={theme.colors.warning}>{stats.unread}</StatValue>
          <StatLabel>Непрочитанные</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue color={theme.colors.success}>{stats.total - stats.unread}</StatValue>
          <StatLabel>Прочитанные</StatLabel>
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
            placeholder="Поиск уведомлений..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <Select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Все типы</option>
          {Object.entries(notificationTypes).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>

        <Select 
          value={readFilter} 
          onChange={(e) => setReadFilter(e.target.value)}
        >
          <option value="all">Все</option>
          <option value="unread">Непрочитанные</option>
          <option value="read">Прочитанные</option>
        </Select>
      </Filters>

      {loading && <LoadingSpinner />}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && !error && filteredNotifications.length === 0 && (
        <EmptyState>
          <EmptyIcon>🔔</EmptyIcon>
          <h3>Нет уведомлений</h3>
          <p>У вас пока нет уведомлений</p>
        </EmptyState>
      )}

      {!loading && !error && filteredNotifications.length > 0 && (
        <>
          <NotificationsList>
            {filteredNotifications.map((notification) => (
              <NotificationCard 
                key={notification.id} 
                isRead={notification.is_read}
              >
                <NotificationHeader>
                  <NotificationInfo>
                    <NotificationTitle>
                      {getNotificationIcon(notification.type)}
                      {notification.title}
                      <NotificationType type={notification.type}>
                        {notificationTypes[notification.type]?.label || notification.type}
                      </NotificationType>
                    </NotificationTitle>
                    <NotificationMessage>{notification.message}</NotificationMessage>
                    <NotificationMeta>
                      <span>{formatDate(notification.created_at)}</span>
                      {!notification.is_read && (
                        <span style={{ color: theme.colors.warning }}>• Новое</span>
                      )}
                    </NotificationMeta>
                  </NotificationInfo>
                  
                  <NotificationActions>
                    {!notification.is_read && (
                      <IconButton 
                        title="Отметить как прочитанное"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <FiCheck size={16} />
                      </IconButton>
                    )}
                    <IconButton 
                      title="Удалить"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <FiTrash2 size={16} />
                    </IconButton>
                  </NotificationActions>
                </NotificationHeader>
              </NotificationCard>
            ))}
          </NotificationsList>

          {/* Пагинация */}
          {pagination.pages > 1 && (
            <Pagination>
              <PageButton 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Предыдущая
              </PageButton>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.pages - 4, currentPage - 2)) + i;
                return (
                  <PageButton
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </PageButton>
                );
              })}
              
              <PageButton 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              >
                Следующая
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default NotificationsPage; 