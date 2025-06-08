import React, { createContext, useContext, useState, useEffect } from 'react';

// Создание контекста
export const ThemeContext = createContext();

// Хук для использования контекста темы
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider');
  }
  return context;
};

// Провайдер контекста темы
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Загрузка темы из localStorage при инициализации
  useEffect(() => {
    const savedTheme = localStorage.getItem('uxui_lab_theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    } else {
      // Определение системной темы
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Сохранение темы в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('uxui_lab_theme', theme);
    
    // Обновление CSS-переменных для системных элементов
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Переключение темы
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Установка конкретной темы
  const setThemeMode = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  // Проверка, является ли текущая тема темной
  const isDarkMode = theme === 'dark';

  // Значение контекста
  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme: setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 