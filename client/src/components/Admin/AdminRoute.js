import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import styled from 'styled-components';

const AccessDeniedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
`;

const AccessDeniedTitle = styled.h1`
  font-size: 3rem;
  color: ${props => props.theme.colors.error};
  margin-bottom: 1rem;
`;

const AccessDeniedMessage = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme.colors.textMuted};
  margin-bottom: 2rem;
  max-width: 500px;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const AdminRoute = ({ children, requiredRole = 'admin' }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Проверка роли пользователя
  const hasAccess = () => {
    if (!user?.role) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  };

  if (!hasAccess()) {
    return (
      <AccessDeniedContainer>
        <AccessDeniedTitle>403</AccessDeniedTitle>
        <AccessDeniedMessage>
          У вас недостаточно прав для доступа к этой странице. 
          Требуется роль: {Array.isArray(requiredRole) ? requiredRole.join(' или ') : requiredRole}
        </AccessDeniedMessage>
        <BackButton onClick={() => window.history.back()}>
          Вернуться назад
        </BackButton>
      </AccessDeniedContainer>
    );
  }

  return children;
};

export default AdminRoute; 