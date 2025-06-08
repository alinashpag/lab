import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.size === 'large' ? '3rem' : '2rem'};
  min-height: ${props => props.fullScreen ? '100vh' : 'auto'};
  background: ${props => props.overlay ? 'rgba(0, 0, 0, 0.1)' : 'transparent'};
  position: ${props => props.overlay ? 'fixed' : 'static'};
  top: ${props => props.overlay ? '0' : 'auto'};
  left: ${props => props.overlay ? '0' : 'auto'};
  right: ${props => props.overlay ? '0' : 'auto'};
  bottom: ${props => props.overlay ? '0' : 'auto'};
  z-index: ${props => props.overlay ? '9999' : 'auto'};
`;

const Spinner = styled.div`
  width: ${props => {
    switch (props.size) {
      case 'small': return '20px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '20px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  border: ${props => {
    const width = props.size === 'small' ? '2px' : props.size === 'large' ? '4px' : '3px';
    return `${width} solid ${props.theme.colors.border}`;
  }};
  border-top: ${props => {
    const width = props.size === 'small' ? '2px' : props.size === 'large' ? '4px' : '3px';
    return `${width} solid ${props.theme.colors.primary}`;
  }};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '0.75rem';
      case 'large': return '1.125rem';
      default: return '0.875rem';
    }
  }};
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const DotsContainer = styled.span`
  display: inline-block;
`;

const Dot = styled.span`
  animation: ${pulse} 1.4s ease-in-out infinite both;
  animation-delay: ${props => props.delay};
  
  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
  &:nth-child(3) { animation-delay: 0s; }
`;

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Загрузка', 
  fullScreen = false, 
  overlay = false 
}) => {
  return (
    <SpinnerContainer 
      size={size} 
      fullScreen={fullScreen} 
      overlay={overlay}
    >
      <Spinner size={size} />
      {text && (
        <LoadingText size={size}>
          {text}
          <DotsContainer>
            <Dot>.</Dot>
            <Dot>.</Dot>
            <Dot>.</Dot>
          </DotsContainer>
        </LoadingText>
      )}
    </SpinnerContainer>
  );
};

export default LoadingSpinner; 