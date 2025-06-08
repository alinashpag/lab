import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${props => props.sidebarOpen ? '280px' : '80px'};
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ContentContainer = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Отслеживание размера экрана
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Вызвать сразу

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <LayoutContainer>
      <Sidebar 
        isOpen={sidebarOpen} 
        isMobile={isMobile}
        onClose={closeSidebar}
      />
      <MainContainer sidebarOpen={sidebarOpen}>
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <ContentContainer>
          <Outlet />
        </ContentContainer>
        <Footer />
      </MainContainer>
    </LayoutContainer>
  );
};

export default Layout; 