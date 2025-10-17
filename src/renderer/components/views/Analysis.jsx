/**
 * Analysis View
 * Content analysis interface
 */
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Analysis = () => {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">Content Analysis</h1>
        <p className="view-subtitle">
          Analyze your content for SEO optimization
        </p>
      </div>

      <div className="analysis-layout">
        <Card title="Content Input" className="analysis-input">
          <div className="form-group">
            <Input
              label="Content Title"
              placeholder="Enter your content title..."
              fullWidth
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content Body</label>
            <textarea
              className="textarea"
              placeholder="Paste your content here for analysis..."
              rows="10"
            ></textarea>
            <span className="form-help">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </span>
          </div>

          <div className="form-group">
            <Input
              label="Target Keywords"
              placeholder="keyword1, keyword2, keyword3"
              fullWidth
            />
            <span className="form-help">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </span>
          </div>

          <div className="button-group">
            <Button variant="primary" size="large">
              🔍 Analyze Content
            </Button>
            <Button variant="secondary" size="large">
              🔄 Reset
            </Button>
          </div>
        </Card>

        <Card title="Analysis Results" className="analysis-results">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Analysis Yet</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Submit
              content for analysis to see results here.
            </p>
            <p className="text-muted">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analysis;
