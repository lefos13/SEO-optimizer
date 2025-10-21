/**
 * Robots.txt Analyzer Component
 * Parses and validates robots.txt files
 */
import React, { useState } from 'react';
import MiniServiceContainer from './MiniServiceContainer';
import Card from '../ui/Card';
import { analyzeRobotsTxt } from '../../../analyzers/technical';
import type { RobotsAnalysis } from '../../../analyzers/technical';

const RobotsTxtAnalyzer: React.FC = () => {
  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState<RobotsAnalysis | null>(null);

  const handleAnalyze = () => {
    if (!content.trim()) return;

    try {
      const result = analyzeRobotsTxt(content);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const renderInputs = () => (
    <div className="input-section">
      <div className="form-group">
        <label>Paste your robots.txt content</label>
        <textarea
          className="form-control"
          rows={10}
          placeholder={
            'User-agent: *\nDisallow: /admin/\nSitemap: https://example.com/sitemap.xml'
          }
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAnalyze()}
        />
      </div>
    </div>
  );

  const renderResults = () =>
    analysis && (
      <div className="results-section">
        <Card className="score-card enhanced-score-card">
          <div className={`score-badge ${getScoreColor(analysis.score)}`}>
            <div className="score-value">{analysis.score}</div>
            <div className="score-label">Robots Health</div>
            <div
              className={`score-status ${analysis.isValid ? 'valid' : 'invalid'}`}
            >
              {analysis.isValid ? 'Valid' : 'Has Issues'}
            </div>
          </div>
          <div className="score-details">
            <div className="detail-item">
              <span className="label">Total Rules</span>
              <br />
              <span className="value">{analysis.rules.length}</span>
            </div>
            <div className="detail-item">
              <span className="label">Sitemaps</span>
              <br />
              <span className="value">{analysis.sitemaps.length}</span>
            </div>
          </div>
        </Card>

        {analysis.issues.length > 0 && (
          <Card className="issues-card">
            <h4>Issues ({analysis.issues.length})</h4>
            {analysis.issues.map((issue, idx) => (
              <div key={idx} className="issue-item">
                <span className={`badge badge-${issue.type}`}>
                  {issue.impact}
                </span>
                {issue.message}
                {issue.lineNumber && <span> (Line {issue.lineNumber})</span>}
              </div>
            ))}
          </Card>
        )}

        <Card className="results-card">
          <div className="card-header">
            <h3>Parsed Rules</h3>
          </div>
          <div className="card-body">
            {analysis.rules.map((rule, idx) => (
              <div key={idx} className="rule-item">
                <strong>User-agent: {rule.userAgent}</strong>
                <ul>
                  {rule.directives.map((directive, dIdx) => (
                    <li key={dIdx}>
                      {directive.type}: {directive.value}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );

  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🤖</div>
        <h3>Why Robots.txt Matters</h3>
        <div className="info-section">
          <h4>📊 Crawling Control</h4>
          <ul>
            <li>
              <strong>Control Access:</strong> Manage crawler access to
              sensitive or duplicate areas.
            </li>
            <li>
              <strong>Crawl Budget:</strong> Prevent waste by excluding
              non-important pages.
            </li>
            <li>
              <strong>Sitemaps:</strong> Reference your sitemap locations for
              discovery.
            </li>
          </ul>
        </div>
        <div className="info-section">
          <h4>💡 Pro Tips</h4>
          <ul>
            <li>Never block important content with Disallow.</li>
            <li>Use wildcard patterns carefully.</li>
            <li>Include absolute URLs for Sitemaps.</li>
          </ul>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer
      title="Robots.txt Analyzer"
      description="Parse and validate robots.txt files for crawling directives"
      onAnalyze={handleAnalyze}
      onClear={() => setAnalysis(null)}
      loading={false}
      error={null}
      results={analysis}
      analyzeButtonText="Analyze Robots.txt"
      analyzeButtonDisabled={!content.trim()}
      inputCardTitle="Robots.txt Content"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default RobotsTxtAnalyzer;
