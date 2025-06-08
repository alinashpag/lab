// Общие цвета
const colors = {
  // Основные цвета
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#8b5cf6',
  secondary: '#ec4899',
  secondaryDark: '#db2777',
  secondaryLight: '#f472b6',

  // Системные цвета
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Серые оттенки
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};

// Точки останова для адаптивного дизайна
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Светлая тема
export const lightTheme = {
  colors: {
    // Основные цвета
    primary: colors.primary,
    primaryDark: colors.primaryDark,
    primaryLight: colors.primaryLight,
    secondary: colors.secondary,
    secondaryDark: colors.secondaryDark,
    secondaryLight: colors.secondaryLight,

    // Системные цвета
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,

    // Фоны
    background: '#ffffff',
    surface: '#ffffff',
    surfaceHover: colors.gray50,

    // Текст
    text: colors.gray900,
    textSecondary: colors.gray600,
    textMuted: colors.gray500,

    // Границы
    border: colors.gray200,
    borderHover: colors.gray300,

    // Дополнительные серые
    gray50: colors.gray50,
    gray100: colors.gray100,
    gray200: colors.gray200,
    gray300: colors.gray300,
    gray400: colors.gray400,
    gray500: colors.gray500,
    gray600: colors.gray600,
    gray700: colors.gray700,
    gray800: colors.gray800,
    gray900: colors.gray900,
  },

  // Точки останова
  breakpoints,

  // Тени
  shadows: {
    small: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    extraLarge: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Радиус границ
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    extraLarge: '16px',
    full: '9999px',
  },

  // Типографика
  typography: {
    heading: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '700',
      lineHeight: '1.2',
    },
    body: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    caption: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.4',
    },
  },

  // Z-индексы
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },

  // Переходы
  transitions: {
    default: 'all 0.2s ease',
    fast: 'all 0.1s ease',
    slow: 'all 0.3s ease',
  },
};

// Темная тема
export const darkTheme = {
  colors: {
    // Основные цвета
    primary: colors.primary,
    primaryDark: colors.primaryDark,
    primaryLight: colors.primaryLight,
    secondary: colors.secondary,
    secondaryDark: colors.secondaryDark,
    secondaryLight: colors.secondaryLight,

    // Системные цвета
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,

    // Фоны
    background: colors.gray900,
    surface: colors.gray800,
    surfaceHover: colors.gray700,

    // Текст
    text: colors.gray50,
    textSecondary: colors.gray300,
    textMuted: colors.gray400,

    // Границы
    border: colors.gray700,
    borderHover: colors.gray600,

    // Дополнительные серые
    gray50: colors.gray50,
    gray100: colors.gray100,
    gray200: colors.gray200,
    gray300: colors.gray300,
    gray400: colors.gray400,
    gray500: colors.gray500,
    gray600: colors.gray600,
    gray700: colors.gray700,
    gray800: colors.gray800,
    gray900: colors.gray900,
  },

  // Точки останова
  breakpoints,

  // Тени (более заметные для темной темы)
  shadows: {
    small: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    extraLarge: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },

  // Остальные свойства идентичны светлой теме
  borderRadius: lightTheme.borderRadius,
  typography: lightTheme.typography,
  zIndex: lightTheme.zIndex,
  transitions: lightTheme.transitions,
};

const themeConfig = { lightTheme, darkTheme };

export default themeConfig;

// Утилиты для работы с темами
export const getTheme = (themeName = 'light') => {
  return themeName === 'dark' ? darkTheme : lightTheme;
};

// Миксины для медиа-запросов
export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.md})`,
  tablet: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media (min-width: ${breakpoints.lg})`,
  
  // Дополнительные
  smallMobile: `@media (max-width: ${breakpoints.sm})`,
  largeMobile: `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`,
  smallDesktop: `@media (min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`,
  largeDesktop: `@media (min-width: ${breakpoints.xl})`,
};

// Анимации
export const animations = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(1rem); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
  `,
  slideDown: `
    @keyframes slideDown {
      from { 
        opacity: 0; 
        transform: translateY(-1rem); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
  `,
  slideLeft: `
    @keyframes slideLeft {
      from { 
        opacity: 0; 
        transform: translateX(1rem); 
      }
      to { 
        opacity: 1; 
        transform: translateX(0); 
      }
    }
  `,
  slideRight: `
    @keyframes slideRight {
      from { 
        opacity: 0; 
        transform: translateX(-1rem); 
      }
      to { 
        opacity: 1; 
        transform: translateX(0); 
      }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { 
        opacity: 1; 
      }
      50% { 
        opacity: 0.5; 
      }
    }
  `,
  spin: `
    @keyframes spin {
      from { 
        transform: rotate(0deg); 
      }
      to { 
        transform: rotate(360deg); 
      }
    }
  `,
};

// Утилитарные функции
export const rgba = (color, alpha) => {
  // Простая функция для добавления прозрачности к hex цвету
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const darken = (color, amount = 0.1) => {
  // Упрощенная функция затемнения цвета
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const lighten = (color, amount = 0.1) => {
  // Упрощенная функция осветления цвета
  const hex = color.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount));
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount));
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}; 