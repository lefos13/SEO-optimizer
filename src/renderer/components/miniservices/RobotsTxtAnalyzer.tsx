/**
 * Robots.txt Analyzer Component
 * Parses and validates robots.txt files
 */
import React, { useState } from 'react';
import MiniServiceWrapper from './MiniServiceWrapper';
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

  return (
    <MiniServiceWrapper
      title="Robots.txt Analyzer"
      description="Parse and validate robots.txt files for crawling directives"
    >
      <div className="input-section">
        <div className="form-group">
          <label>Paste your robots.txt content</label>
          <textarea
            className="form-control"
            rows={10}
            placeholder="User-agent: *&#10;Disallow: /admin/&#10;Sitemap: https://example.com/sitemap.xml"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAnalyze}
          disabled={!content.trim()}
        >
          Analyze Robots.txt
        </button>
      </div>

      {analysis && (
        <div className="results-section">
          <div className="score-card">
            <div className="score-badge">{analysis.score}</div>
            <div>Status: {analysis.isValid ? '✓ Valid' : '✗ Has Issues'}</div>
            <div>Total Rules: {analysis.rules.length}</div>
            <div>Sitemaps: {analysis.sitemaps.length}</div>
          </div>

          {analysis.issues.length > 0 && (
            <div className="issues-card">
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
            </div>
          )}

          <div className="rules-card">
            <h4>Parsed Rules</h4>
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
        </div>
      )}
    </MiniServiceWrapper>
  );
};

export default RobotsTxtAnalyzer;
