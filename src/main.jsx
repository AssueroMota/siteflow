import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PlatformProvider } from './contexts/PlatformContext';
import App from './routes/App';
import './styles/global.css';
import './styles/neon.css';
import './styles/marketing.css';
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PlatformProvider>
        <App />
      </PlatformProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
