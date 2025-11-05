/**
 * Window Controls Component
 * Custom window controls for frameless Electron window
 */
import React, { useState, useEffect } from 'react';

const WindowControls: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      if (window.electronAPI?.window?.isMaximized) {
        const maximized = await window.electronAPI.window.isMaximized();
        setIsMaximized(maximized);
      }
    };

    checkMaximized();
    // Check periodically for window state changes
    const interval = setInterval(checkMaximized, 500);
    return () => clearInterval(interval);
  }, []);

  const handleMinimize = async () => {
    if (window.electronAPI?.window?.minimize) {
      await window.electronAPI.window.minimize();
    }
  };

  const handleMaximize = async () => {
    if (window.electronAPI?.window?.maximize) {
      await window.electronAPI.window.maximize();
      // Update state after a short delay
      setTimeout(async () => {
        if (window.electronAPI?.window?.isMaximized) {
          const maximized = await window.electronAPI.window.isMaximized();
          setIsMaximized(maximized);
        }
      }, 100);
    }
  };

  const handleClose = async () => {
    if (window.electronAPI?.window?.close) {
      await window.electronAPI.window.close();
    }
  };

  return (
    <div className="window-controls">
      <button
        className="window-control window-control--minimize"
        onClick={handleMinimize}
        title="Minimize"
        aria-label="Minimize window"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M1 6H11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <button
        className="window-control window-control--maximize"
        onClick={handleMaximize}
        title={isMaximized ? 'Restore' : 'Maximize'}
        aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
      >
        {isMaximized ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 3H9V9H3V3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 5H6V1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 4V10H7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 1H10V7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <button
        className="window-control window-control--close"
        onClick={handleClose}
        title="Close"
        aria-label="Close window"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M1 1L11 11M11 1L1 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default WindowControls;
