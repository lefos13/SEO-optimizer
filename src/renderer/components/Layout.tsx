/**
 * Layout Component
 * Provides the main application layout with sidebar navigation and content area
 */
import React from 'react';
import Navigation from './Navigation';
import WindowControls from './ui/WindowControls';

export interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <div className="window-titlebar">
        <WindowControls />
      </div>
      <Navigation />
      <main className="main-content">
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
