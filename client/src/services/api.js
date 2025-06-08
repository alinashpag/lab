import axios from 'axios';
import { toast } from 'react-hot-toast';

// Базовая конфигурация Axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Создание основного экземпляра axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Создание экземпляра для аутентификации (без interceptors)
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Утилиты для работы с токенами
const TOKEN_KEY = 'uxui_lab_token';
const REFRESH_TOKEN_KEY = 'uxui_lab_refresh_token';

const tokenUtils = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('uxui_lab_user');
  },
};

// Флаг для предотвращения множественных запросов на обновление токена
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = tokenUtils.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ответов и автоматического обновления токенов
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и запрос еще не повторялся
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Если уже идет процесс обновления токена, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenUtils.getRefreshToken();

      if (!refreshToken) {
        processQueue(error, null);
        tokenUtils.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await authApi.post('/auth/refresh', {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
        
        tokenUtils.setTokens(accessToken, newRefreshToken);
        
        // Обновляем заголовок для оригинального запроса
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenUtils.clearTokens();
        
        toast.error('Сессия истекла. Необходимо войти в систему заново.');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API для аутентификации
export const authAPI = {
  // Регистрация
  register: (userData) => authApi.post('/auth/register', userData),
  
  // Вход в систему
  login: (credentials) => authApi.post('/auth/login', credentials),
  
  // Выход из системы
  logout: (data) => api.post('/auth/logout', data),
  
  // Обновление токена
  refreshToken: (data) => authApi.post('/auth/refresh', data),
  
  // Получение профиля
  getProfile: () => api.get('/auth/me'),
  
  // Удаление всех сессий
  clearAllSessions: () => api.delete('/auth/sessions'),
};

// API для пользователей
export const usersAPI = {
  // Получение списка пользователей
  getUsers: (params = {}) => api.get('/users', { params }),
  
  // Получение пользователя по ID
  getUser: (id) => api.get(`/users/${id}`),
  
  // Обновление профиля
  updateProfile: (data) => api.put('/users/profile', data),
  
  // Загрузка аватара
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Изменение пароля
  changePassword: (data) => api.put('/users/password', data),
  
  // Удаление пользователя
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// API для проектов
export const projectsAPI = {
  // Получение списка проектов
  getProjects: (params = {}) => api.get('/projects', { params }),
  
  // Создание проекта
  createProject: (data) => api.post('/projects', data),
  
  // Получение проекта по ID
  getProject: (id) => api.get(`/projects/${id}`),
  
  // Обновление проекта
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  
  // Удаление проекта
  deleteProject: (id) => api.delete(`/projects/${id}`),
  
  // Загрузка файлов для проекта
  uploadFiles: (projectId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post(`/projects/${projectId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Получение файлов проекта
  getProjectFiles: (projectId) => api.get(`/projects/${projectId}/files`),
  
  // Удаление файла
  deleteFile: (projectId, fileId) => api.delete(`/projects/${projectId}/files/${fileId}`),
};

// API для анализа
export const analysisAPI = {
  // Получение списка анализов
  getAnalyses: (params = {}) => api.get('/analysis', { params }),
  
  // Создание нового анализа
  createAnalysis: (data) => api.post('/analysis', data),
  
  // Получение анализа по ID
  getAnalysis: (id) => api.get(`/analysis/${id}`),
  
  // Запуск анализа
  startAnalysis: (id) => api.post(`/analysis/${id}/start`),
  
  // Остановка анализа
  stopAnalysis: (id) => api.post(`/analysis/${id}/stop`),
  
  // Получение результатов анализа
  getResults: (id) => api.get(`/analysis/${id}/results`),
  
  // Получение рекомендаций
  getRecommendations: (id) => api.get(`/analysis/${id}/recommendations`),
  
  // Отметка рекомендации как исправленной
  markRecommendationFixed: (analysisId, recommendationId) =>
    api.patch(`/analysis/${analysisId}/recommendations/${recommendationId}/fixed`),
  
  // Удаление анализа
  deleteAnalysis: (id) => api.delete(`/analysis/${id}`),
  
  // Получение статистики анализов
  getAnalysisStats: () => api.get('/analysis/stats'),
};

// API для отчетов
export const reportsAPI = {
  // Получение списка отчетов
  getReports: (params = {}) => api.get('/reports', { params }),
  
  // Создание отчета
  createReport: (data) => api.post('/reports', data),
  
  // Получение отчета по ID
  getReport: (id) => api.get(`/reports/${id}`),
  
  // Скачивание отчета
  downloadReport: (id, format = 'pdf') => api.get(`/reports/${id}/download`, {
    params: { format },
    responseType: 'blob',
  }),
  
  // Удаление отчета
  deleteReport: (id) => api.delete(`/reports/${id}`),
  
  // Предварительный просмотр отчета
  previewReport: (id) => api.get(`/reports/${id}/preview`),
};

// API для настроек
export const settingsAPI = {
  // Получение настроек приложения
  getSettings: () => api.get('/settings'),
  
  // Обновление настроек
  updateSettings: (data) => api.put('/settings', data),
  
  // Сброс настроек к умолчанию
  resetSettings: () => api.post('/settings/reset'),
};

// Утилитарные функции
export const utils = {
  // Проверка состояния сервера
  healthCheck: () => api.get('/health'),
  
  // Получение информации о файле
  getFileInfo: (url) => api.get('/utils/file-info', { params: { url } }),
  
  // Валидация URL
  validateUrl: (url) => api.post('/utils/validate-url', { url }),
  
  // Получение метаданных страницы
  getPageMetadata: (url) => api.get('/utils/page-metadata', { params: { url } }),
};

// Обработка ошибок для всех API
const handleApiError = (error, customMessage) => {
  const message = error.response?.data?.message || 
                 error.message || 
                 customMessage || 
                 'Произошла ошибка при выполнении запроса';
  
  console.error('API Error:', error);
  
  // Не показываем toast для ошибок аутентификации (они обрабатываются в AuthContext)
  if (error.response?.status !== 401) {
    toast.error(message);
  }
  
  throw error;
};

// Wrapper для API вызовов с обработкой ошибок
export const apiCall = async (apiFunction, errorMessage) => {
  try {
    return await apiFunction();
  } catch (error) {
    handleApiError(error, errorMessage);
  }
};

// Экспорт главного экземпляра API
export default api; 