import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import App from './App.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { DateProvider } from './contexts/DateContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './styles/global.css';

const RoutedApp = () => {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={`${location.pathname}${location.search}`}>
      <App />
    </ErrorBoundary>
  );
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <DateProvider>
          <RoutedApp />
        </DateProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
