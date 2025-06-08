import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Создание корневого элемента React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Рендеринг приложения
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Регистрация Service Worker для PWA (опционально)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Web Vitals для мониторинга производительности
if (process.env.NODE_ENV === 'production') {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
} 