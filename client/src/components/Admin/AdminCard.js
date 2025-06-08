import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const CardContainer = styled(Link)`
  display: block;
  padding: 1.5rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.color || props.theme.colors.primary};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 10px;
  background: ${props => props.color || props.theme.colors.primary}15;
  color: ${props => props.color || props.theme.colors.primary};
  font-size: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

const CardValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0.5rem 0;
  line-height: 1;
`;

const CardSubtitle = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMuted};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChangeIndicator = styled.span`
  color: ${props => props.positive ? '#10B981' : '#EF4444'};
  font-weight: 500;
`;

const AdminCard = ({ icon, title, value, subtitle, color, link }) => {
  // Извлекаем информацию о росте из subtitle
  const isPositiveChange = subtitle?.includes('+');
  
  return (
    <CardContainer to={link} color={color}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <IconContainer color={color}>
          {icon}
        </IconContainer>
      </CardHeader>
      
      <CardValue>
        {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
      </CardValue>
      
      {subtitle && (
        <CardSubtitle>
          {isPositiveChange ? (
            <ChangeIndicator positive>
              {subtitle}
            </ChangeIndicator>
          ) : (
            subtitle
          )}
        </CardSubtitle>
      )}
    </CardContainer>
  );
};

export default AdminCard; 