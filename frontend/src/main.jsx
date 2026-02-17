import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { DateProvider } from './contexts/DateContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <DateProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </DateProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
