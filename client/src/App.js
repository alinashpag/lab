import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { createGlobalStyle } from 'styled-components';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { lightTheme, darkTheme } from './theme/theme';
import { useTheme } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Страницы
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import AnalysisPage from './pages/AnalysisPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Админ страницы
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminProjects from './pages/Admin/AdminProjects';
import AdminAnalyses from './pages/Admin/AdminAnalyses';
import AdminReports from './pages/Admin/AdminReports';
import AdminRoute from './components/Admin/AdminRoute';

// Глобальные стили
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${props => props.theme.typography.body.fontFamily};
    font-size: ${props => props.theme.typography.body.fontSize};
    line-height: ${props => props.theme.typography.body.lineHeight};
    color: ${props => props.theme.colors.text};
    background: ${props => props.theme.colors.background};
    transition: all 0.2s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
  }

  /* Скроллбар */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.textMuted};
  }

  /* Фокус для доступности */
  :focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  /* Кнопки */
  button {
    font-family: inherit;
    cursor: pointer;
  }

  /* Ссылки */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* Формы */
  input, textarea, select {
    font-family: inherit;
  }

  /* Переходы для темной/светлой темы */
  [data-theme] {
    transition: background-color 0.3s ease, color 0.3s ease;
  }
`;

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Компонент для публичных маршрутов (только для неавторизованных)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Основной компонент приложения
const AppContent = () => {
  const { theme } = useTheme();
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <StyledThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Публичные маршруты */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Защищенные маршруты */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Основные страницы */}
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="analysis" element={<AnalysisPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              
              {/* Пользовательские страницы */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              
              {/* Админ страницы */}
              <Route path="admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="admin/users" element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              } />
              <Route path="admin/projects" element={
                <AdminRoute>
                  <AdminProjects />
                </AdminRoute>
              } />
              <Route path="admin/analyses" element={
                <AdminRoute>
                  <AdminAnalyses />
                </AdminRoute>
              } />
              <Route path="admin/reports" element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              } />
            </Route>

            {/* 404 страница */}
            <Route
              path="*"
              element={
                <div style={{ 
                  minHeight: '100vh', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '2rem'
                }}>
                  <div>
                    <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
                    <h2 style={{ marginBottom: '1rem' }}>Страница не найдена</h2>
                    <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
                      Запрашиваемая страница не существует или была перемещена.
                    </p>
                    <a 
                      href="/dashboard" 
                      style={{ 
                        color: '#6366f1', 
                        textDecoration: 'underline' 
                      }}
                    >
                      Вернуться на главную
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </StyledThemeProvider>
  );
};

// Главный компонент App
const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App; 