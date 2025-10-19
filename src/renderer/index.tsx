/**
 * Renderer process entry point
 * This file is the entry point for the React application
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles/main.scss';

// Initialize React application
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
});
