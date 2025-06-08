import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiHome,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiUser,
  FiFolder,
  FiX,
  FiTarget,
  FiBell,
  FiShield,
  FiUsers,
  FiActivity
} from 'react-icons/fi';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: ${props => props.show ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${props => props.isOpen ? '280px' : '80px'};
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 999;
  overflow: hidden;

  @media (max-width: 768px) {
    width: ${props => props.isOpen ? '280px' : '0'};
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
    transition: transform 0.3s ease;
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};

  span {
    opacity: ${props => props.isOpen ? 1 : 0};
    transition: opacity 0.3s ease;
    white-space: nowrap;

    @media (max-width: 768px) {
      opacity: 1;
    }
  }
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.theme.colors.primary};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const CloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
`;

const NavSection = styled.div`
  margin-bottom: 1.5rem;
`;

const NavSectionTitle = styled.div`
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${props => props.theme.colors.textMuted};
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: opacity 0.3s ease;

  @media (max-width: 768px) {
    opacity: 1;
  }
`;

const NavItem = styled(Link).withConfig({
  shouldForwardProp: (prop) => !['isOpen', 'isActive'].includes(prop),
})`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }

  ${props => props.isActive && `
    background: ${props.theme.colors.primary}15;
    color: ${props.theme.colors.primary};
    border-right: 3px solid ${props.theme.colors.primary};

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: ${props.theme.colors.primary};
    }
  `}

  svg {
    flex-shrink: 0;
  }

  span {
    opacity: ${props => props.isOpen ? 1 : 0};
    transition: opacity 0.3s ease;

    @media (max-width: 768px) {
      opacity: 1;
    }
  }

  ${props => !props.isOpen && `
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
  `}
`;

const UserInfo = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: opacity 0.3s ease;

  @media (max-width: 768px) {
    opacity: 1;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  text-transform: capitalize;
`;

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      section: 'Основное',
      items: [
        { to: '/dashboard', icon: FiHome, label: 'Панель управления' },
        { to: '/projects', icon: FiFolder, label: 'Проекты' },
        { to: '/analysis', icon: FiBarChart2, label: 'Анализ' },
        { to: '/reports', icon: FiFileText, label: 'Отчеты' },
        { to: '/notifications', icon: FiBell, label: 'Уведомления' },
      ]
    },
    ...(user?.role === 'admin' ? [{
      section: 'Администрирование',
      items: [
        { to: '/admin', icon: FiShield, label: 'Админ-панель' },
        { to: '/admin/users', icon: FiUsers, label: 'Пользователи' },
        { to: '/admin/projects', icon: FiFolder, label: 'Проекты' },
      ]
    }] : []),
    {
      section: 'Пользователь',
      items: [
        { to: '/profile', icon: FiUser, label: 'Профиль' },
        { to: '/settings', icon: FiSettings, label: 'Настройки' },
      ]
    }
  ];

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username ? user.username[0].toUpperCase() : 'U';
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || 'Пользователь';
  };

  return (
    <>
      <Overlay show={isMobile && isOpen} onClick={onClose} />
      
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader isOpen={isOpen}>
          <Logo isOpen={isOpen}>
            <LogoIcon>
              <FiTarget size={20} />
            </LogoIcon>
            <span>UX/UI Lab</span>
          </Logo>
          
          <CloseButton onClick={onClose}>
            <FiX size={18} />
          </CloseButton>
        </SidebarHeader>

        <Navigation>
          {navigationItems.map((section, sectionIndex) => (
            <NavSection key={sectionIndex}>
              <NavSectionTitle isOpen={isOpen}>
                {section.section}
              </NavSectionTitle>
              
              {section.items.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  isOpen={isOpen}
                  isActive={location.pathname === item.to}
                  onClick={isMobile ? onClose : undefined}
                  title={!isOpen ? item.label : undefined}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavItem>
              ))}
            </NavSection>
          ))}
        </Navigation>

        <UserInfo isOpen={isOpen}>
          <UserAvatar>
            {getUserInitials()}
          </UserAvatar>
          <UserDetails>
            <UserName>{getUserDisplayName()}</UserName>
            <UserRole>{user?.role || 'user'}</UserRole>
          </UserDetails>
        </UserInfo>
      </SidebarContainer>
    </>
  );
};

export default Sidebar; 