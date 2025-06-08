import React, { createContext, useContext, useState, useEffect } from 'react';

// Создание контекста
const AuthContext = createContext();

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

// Провайдер контекста аутентификации
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Проверка токена при загрузке приложения
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Проверка валидности токена через API
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        setIsAuthenticated(true);
      } else {
        // Токен недействителен
        localStorage.removeItem('uxui_lab_token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Ошибка проверки аутентификации:', error);
      localStorage.removeItem('uxui_lab_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Функция входа
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('uxui_lab_token', data.tokens.accessToken);
        localStorage.setItem('uxui_lab_refresh_token', data.tokens.refreshToken);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, data };
      } else {
        setError(data.error || data.message || 'Ошибка входа');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Ошибка соединения с сервером';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Функция регистрации
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          confirmPassword: userData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('uxui_lab_token', data.tokens.accessToken);
        localStorage.setItem('uxui_lab_refresh_token', data.tokens.refreshToken);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, data };
      } else {
        setError(data.error || data.message || 'Ошибка регистрации');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Ошибка соединения с сервером';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Функция выхода
  const logout = async () => {
    try {
      const token = localStorage.getItem('uxui_lab_token');
      const refreshToken = localStorage.getItem('uxui_lab_refresh_token');
      
      if (token) {
        // Уведомляем сервер о выходе
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      // Очищаем локальное состояние
      localStorage.removeItem('uxui_lab_token');
      localStorage.removeItem('uxui_lab_refresh_token');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  // Обновление данных пользователя
  const updateUser = async (updateData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, data };
      } else {
        setError(data.error || 'Ошибка обновления профиля');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Ошибка соединения с сервером';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Смена пароля
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('uxui_lab_token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        setError(data.error || 'Ошибка смены пароля');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Ошибка соединения с сервером';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Очистка ошибок
  const clearError = () => {
    setError(null);
  };

  // Значение контекста
  const value = {
    user,
    loading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 