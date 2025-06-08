import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiMenu, 
  FiSearch, 
  FiBell, 
  FiUser, 
  FiSettings, 
  FiLogOut,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiCheck,
  FiTrash2
} from 'react-icons/fi';

const HeaderContainer = styled.header`
  height: 70px;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${props => props.theme.shadows.small};

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 400px;
  flex: 1;

  @media (max-width: 640px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  transition: all 0.2s ease;

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
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textMuted};
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: 0.75rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: ${props => props.theme.colors.error};
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationsDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  box-shadow: ${props => props.theme.shadows.large};
  width: 380px;
  max-height: 500px;
  overflow-y: auto;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;

  @media (max-width: 640px) {
    width: 320px;
    right: -10px;
  }
`;

const NotificationsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const NotificationsTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const NotificationsActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SmallIconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: ${props => props.theme.borderRadius.small};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }
`;

const NotificationItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease;
  position: relative;
  opacity: ${props => props.isRead ? 0.7 : 1};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }

  &:last-child {
    border-bottom: none;
  }

  ${props => !props.isRead && `
    border-left: 3px solid ${props.theme.colors.primary};
    padding-left: calc(1rem - 3px);
  `}
`;

const NotificationContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
`;

const NotificationText = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NotificationMessage = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
`;

const NotificationTime = styled.div`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.75rem;
`;

const NotificationItemActions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const EmptyNotifications = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

const ViewAllButton = styled(Link)`
  display: block;
  padding: 0.75rem 1rem;
  text-align: center;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  border-top: 1px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }

  @media (max-width: 640px) {
    span {
      display: none;
    }
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  box-shadow: ${props => props.theme.shadows.large};
  min-width: 200px;
  padding: 0.5rem;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.medium};
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }

  &.danger {
    color: ${props => props.theme.colors.error};
  }
`;

const UserInfo = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 0.5rem;
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
`;

const UserEmail = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Загрузка уведомлений
  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const token = localStorage.getItem('uxui_lab_token');
      
      const [notificationsResponse, unreadResponse] = await Promise.all([
        fetch('/api/notifications?limit=5', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/notifications/unread-count', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (notificationsResponse.ok && unreadResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        const unreadData = await unreadResponse.json();
        
        setNotifications(notificationsData.notifications || []);
        setUnreadCount(unreadData.unread_count || 0);
      }
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
    } finally {
      setNotificationsLoading(false);
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
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Ошибка обновления уведомления:', error);
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
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Ошибка обновления уведомлений:', error);
    }
  };

  // Удалить уведомление
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Ошибка удаления уведомления:', error);
    }
  };

  // Получить иконку уведомления
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'project_created': return '📁';
      case 'analysis_completed': return '📊';
      case 'report_ready': return '📄';
      case 'system': return '🔔';
      default: return '📢';
    }
  };

  // Форматирование времени
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'только что';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ч. назад`;
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  const getInitials = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Поиск:', searchQuery);
    }
  };

  const handleNotificationsToggle = () => {
    setNotificationsDropdownOpen(!notificationsDropdownOpen);
    if (!notificationsDropdownOpen) {
      loadNotifications();
    }
  };

  // Загрузка уведомлений при монтировании
  useEffect(() => {
    loadNotifications();
    
    // Обновление уведомлений каждые 30 секунд
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={onToggleSidebar}>
          <FiMenu size={20} />
        </MenuButton>

        <SearchContainer>
          <form onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Поиск проектов, анализов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon>
              <FiSearch size={16} />
            </SearchIcon>
          </form>
        </SearchContainer>
      </LeftSection>

      <RightSection>
        <IconButton onClick={theme.toggleTheme} title={theme.isDarkMode ? 'Светлая тема' : 'Темная тема'}>
          {theme.isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </IconButton>

        <div style={{ position: 'relative' }}>
          <IconButton 
            onClick={handleNotificationsToggle}
            title="Уведомления"
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <NotificationBadge>{unreadCount > 99 ? '99+' : unreadCount}</NotificationBadge>
            )}
          </IconButton>

          <NotificationsDropdown isOpen={notificationsDropdownOpen}>
            <NotificationsHeader>
              <NotificationsTitle>Уведомления</NotificationsTitle>
              <NotificationsActions>
                {unreadCount > 0 && (
                  <SmallIconButton onClick={markAllAsRead} title="Отметить все как прочитанные">
                    <FiCheck size={14} />
                  </SmallIconButton>
                )}
              </NotificationsActions>
            </NotificationsHeader>

            {notificationsLoading ? (
              <EmptyNotifications>Загрузка...</EmptyNotifications>
            ) : notifications.length === 0 ? (
              <EmptyNotifications>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <div>Нет уведомлений</div>
              </EmptyNotifications>
            ) : (
              <>
                {notifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id}
                    isRead={notification.is_read}
                  >
                    <NotificationContent>
                      <NotificationText>
                        <NotificationTitle>
                          <span>{getNotificationIcon(notification.type)}</span>
                          {notification.title}
                        </NotificationTitle>
                        <NotificationMessage>
                          {notification.message}
                        </NotificationMessage>
                        <NotificationTime>
                          {formatTime(notification.created_at)}
                        </NotificationTime>
                      </NotificationText>
                      
                      <NotificationItemActions>
                        {!notification.is_read && (
                          <SmallIconButton 
                            onClick={() => markAsRead(notification.id)}
                            title="Отметить как прочитанное"
                          >
                            <FiCheck size={12} />
                          </SmallIconButton>
                        )}
                        <SmallIconButton 
                          onClick={() => deleteNotification(notification.id)}
                          title="Удалить"
                        >
                          <FiTrash2 size={12} />
                        </SmallIconButton>
                      </NotificationItemActions>
                    </NotificationContent>
                  </NotificationItem>
                ))}
                
                <ViewAllButton 
                  to="/notifications" 
                  onClick={() => setNotificationsDropdownOpen(false)}
                >
                  Посмотреть все уведомления
                </ViewAllButton>
              </>
            )}
          </NotificationsDropdown>
        </div>

        <div style={{ position: 'relative' }}>
          <ProfileButton 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            title="Профиль пользователя"
          >
            <Avatar>
              {getInitials(user)}
            </Avatar>
            <span>{user?.firstName || user?.username}</span>
          </ProfileButton>

          <Dropdown isOpen={profileDropdownOpen}>
            <UserInfo>
              <UserName>{user?.firstName || user?.username}</UserName>
              <UserEmail>{user?.email}</UserEmail>
            </UserInfo>

            <DropdownItem onClick={() => {
              setProfileDropdownOpen(false);
              navigate('/profile');
            }}>
              <FiUser size={16} />
              Профиль
            </DropdownItem>

            <DropdownItem onClick={() => {
              setProfileDropdownOpen(false);
              navigate('/settings');
            }}>
              <FiSettings size={16} />
              Настройки
            </DropdownItem>

            <DropdownItem className="danger" onClick={handleLogout}>
              <FiLogOut size={16} />
              Выйти
            </DropdownItem>
          </Dropdown>
        </div>
      </RightSection>

      {/* Закрытие dropdown при клике вне них */}
      {(profileDropdownOpen || notificationsDropdownOpen) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => {
            setProfileDropdownOpen(false);
            setNotificationsDropdownOpen(false);
          }}
        />
      )}
    </HeaderContainer>
  );
};

export default Header; 