/**
 * Layout Component
 * Provides the main application layout with sidebar navigation and content area
 */
import React from 'react';
import PropTypes from 'prop-types';
import Navigation from './Navigation';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navigation />
      <main className="main-content">
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
