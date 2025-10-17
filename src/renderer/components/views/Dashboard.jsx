/**
 * Dashboard View
 * Main overview and statistics page
 */
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const Dashboard = () => {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">Dashboard</h1>
        <p className="view-subtitle">
          Welcome to SEO Optimizer - Your content analysis overview
        </p>
      </div>

      <div className="dashboard-grid">
        <Card title="Total Analyses" className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Content pieces analyzed</div>
          <p className="stat-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore.
          </p>
        </Card>

        <Card title="Average Score" className="stat-card">
          <div className="stat-value">--</div>
          <div className="stat-label">SEO Score</div>
          <p className="stat-description">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo.
          </p>
        </Card>

        <Card title="Issues Found" className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Total issues</div>
          <p className="stat-description">
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla.
          </p>
        </Card>

        <Card title="Recent Activity" className="full-width">
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📄</div>
              <div className="activity-content">
                <h4>No activity yet</h4>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Start
                  analyzing content to see your activity here.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Quick Actions" className="full-width">
          <div className="action-buttons">
            <Button variant="primary" size="large">
              🔍 New Analysis
            </Button>
            <Button variant="secondary" size="large">
              📊 View Reports
            </Button>
            <Button variant="secondary" size="large">
              ⚙️ Settings
            </Button>
          </div>
          <p className="card-footer-text">
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
