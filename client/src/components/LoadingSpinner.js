import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: ${props => props.fullScreen ? '50vh' : '200px'};
`;

const Spinner = styled.div`
  border: 4px solid ${props => props.theme.colors.border || '#f3f3f3'};
  border-top: 4px solid ${props => props.theme.colors.primary || '#007bff'};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;

const LoadingSpinner = ({ fullScreen = false }) => {
  return (
    <SpinnerContainer fullScreen={fullScreen}>
      <Spinner />
    </SpinnerContainer>
  );
};

export default LoadingSpinner; 