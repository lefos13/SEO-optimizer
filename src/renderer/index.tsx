import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

/**
 * Renderer process entry point
 * Initializes React and mounts the main App component
 */

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Create React root and render the app
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log initialization in development
if (process.env.NODE_ENV === 'development') {
  console.log('SEO Optimizer renderer initialized');

  // Test IPC communication
  window.electronAPI
    .ping()
    .then(response => {
      console.log('IPC test:', response);
    })
    .catch(error => {
      console.error('IPC test failed:', error);
    });
}
