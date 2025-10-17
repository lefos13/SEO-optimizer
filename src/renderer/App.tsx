import React from 'react';
import './styles/App.css';

/**
 * Main App component
 * Root component for the SEO Optimizer application
 */
const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>SEO Optimizer</h1>
        <p>Your standalone SEO analysis and optimization tool</p>
      </header>

      <main className="app-main">
        <div className="welcome-container">
          <h2>Welcome to SEO Optimizer</h2>
          <p>A powerful desktop application for analyzing and optimizing your content for SEO.</p>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🔍 Content Analysis</h3>
              <p>Comprehensive SEO analysis with actionable recommendations</p>
            </div>
            <div className="feature-card">
              <h3>🌐 Multi-language</h3>
              <p>Support for English and Greek content</p>
            </div>
            <div className="feature-card">
              <h3>🛠️ Mini-services</h3>
              <p>Keyword generator, readability analyzer, and more</p>
            </div>
            <div className="feature-card">
              <h3>💾 Local Storage</h3>
              <p>All your data stored securely on your device</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>SEO Optimizer v1.0.0 - Built with Electron & React</p>
      </footer>
    </div>
  );
};

export default App;
