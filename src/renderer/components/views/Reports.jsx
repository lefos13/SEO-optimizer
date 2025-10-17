/**
 * Reports View
 * SEO reports and history
 */
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const Reports = () => {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">SEO Reports</h1>
        <p className="view-subtitle">
          View and manage your content analysis reports
        </p>
      </div>

      <div className="reports-controls">
        <Button variant="primary">📥 Export Reports</Button>
        <Button variant="secondary">🔄 Refresh</Button>
      </div>

      <div className="reports-grid">
        <Card title="Report History" className="full-width">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Score</th>
                  <th>Issues</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="5" className="empty-table">
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <h3>No Reports Yet</h3>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Your analysis reports will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Report Statistics">
          <div className="report-stats">
            <div className="stat-item">
              <span className="stat-icon">📊</span>
              <div className="stat-info">
                <div className="stat-value">0</div>
                <div className="stat-label">Total Reports</div>
              </div>
            </div>
            <p className="stat-description">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </Card>

        <Card title="Top Issues">
          <div className="issues-list">
            <p className="text-muted">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
