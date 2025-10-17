/**
 * Settings View
 * Application configuration and preferences
 */
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Settings = () => {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">Settings</h1>
        <p className="view-subtitle">
          Configure your SEO Optimizer preferences
        </p>
      </div>

      <div className="settings-grid">
        <Card title="General Settings">
          <div className="form-group">
            <Input
              label="Application Language"
              placeholder="English"
              fullWidth
            />
            <span className="form-help">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </span>
          </div>

          <div className="form-group">
            <Input
              label="Default Analysis Language"
              placeholder="English / Greek"
              fullWidth
            />
            <span className="form-help">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris.
            </span>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox" />
              <span>Enable automatic updates</span>
            </label>
          </div>
        </Card>

        <Card title="Analysis Settings">
          <div className="form-group">
            <Input
              label="Minimum Content Length"
              placeholder="300"
              type="number"
              fullWidth
            />
            <span className="form-help">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum.
            </span>
          </div>

          <div className="form-group">
            <Input
              label="Target Keyword Density (%)"
              placeholder="2.5"
              type="number"
              fullWidth
            />
            <span className="form-help">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia.
            </span>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox" defaultChecked />
              <span>Include readability analysis</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox" defaultChecked />
              <span>Check for duplicate content</span>
            </label>
          </div>
        </Card>

        <Card title="Database Settings">
          <div className="form-group">
            <Input
              label="Database Location"
              placeholder="./data/seo-optimizer.db"
              fullWidth
              readOnly
            />
            <span className="form-help">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </span>
          </div>

          <div className="button-group">
            <Button variant="secondary">📂 Change Location</Button>
            <Button variant="secondary">🗑️ Clear Database</Button>
          </div>
        </Card>

        <Card title="About">
          <div className="about-info">
            <div className="about-item">
              <strong>Version:</strong> 1.0.0
            </div>
            <div className="about-item">
              <strong>License:</strong> MIT
            </div>
            <p className="text-muted mt-3">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
          </div>
        </Card>
      </div>

      <div className="settings-actions">
        <Button variant="primary" size="large">
          💾 Save Settings
        </Button>
        <Button variant="secondary" size="large">
          ↩️ Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default Settings;
