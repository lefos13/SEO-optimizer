/**
 * Navigation Component
 * Sidebar navigation with menu items
 */
import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
      description: 'Overview & Stats',
    },
    {
      path: '/analysis',
      icon: '🔍',
      label: 'Analysis',
      description: 'Content Analysis',
    },
    {
      path: '/reports',
      icon: '�️',
      label: 'Mini-Services',
      description: 'SEO Tools',
    },
    {
      path: '/settings',
      icon: '⚙️',
      label: 'Settings',
      description: 'Configuration',
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">SEO Optimizer</span>
        </div>
        <div className="logo-subtitle">Content Analysis Tool</div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map(item => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="version-info">
          <span className="version-label">Version</span>
          <span className="version-number">1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Navigation;
