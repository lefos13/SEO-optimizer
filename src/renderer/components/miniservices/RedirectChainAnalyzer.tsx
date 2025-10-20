/**
 * Redirect Chain Analyzer Component
 * Detects and analyzes redirect chains and loops
 */
import React, { useState } from 'react';
import MiniServiceWrapper from './MiniServiceWrapper';
import { checkURL } from '../../../analyzers/technical';
import type { RedirectAnalysis } from '../../../analyzers/technical';

const RedirectChainAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<RedirectAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      const result = await checkURL(url);
      setAnalysis(result);
    } catch (error) {
      console.error('Check error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MiniServiceWrapper
      title="Redirect Chain Analyzer"
      description="Detect and analyze redirect chains, loops, and performance issues"
    >
      <div className="input-section">
        <div className="form-group">
          <label>Enter URL to Check</label>
          <input
            type="text"
            className="form-control"
            placeholder="https://example.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleCheck}
          disabled={!url.trim() || loading}
        >
          {loading ? 'Checking...' : 'Check Redirects'}
        </button>
      </div>

      {analysis && (
        <div className="results-section">
          <div className="score-card">
            <div className="score-badge">{analysis.score}</div>
            <div>Total Redirects: {analysis.totalRedirects}</div>
            <div>
              Status:{' '}
              {analysis.totalRedirects === 0 ? '✓ Direct' : '⚠ Has Redirects'}
            </div>
          </div>

          {analysis.chain.length > 0 && (
            <div className="chain-card">
              <h4>Redirect Chain</h4>
              {analysis.chain.map((step, idx) => (
                <div key={idx} className="chain-step">
                  <div className="step-number">{idx + 1}</div>
                  <div className="step-url">{step.url}</div>
                  <div className="step-status">
                    {step.statusCode} {step.statusText}
                  </div>
                </div>
              ))}
            </div>
          )}

          {analysis.issues.length > 0 && (
            <div className="issues-card">
              <h4>Issues</h4>
              {analysis.issues.map((issue, idx) => (
                <div key={idx} className="issue-item">
                  {issue.message}
                  <div className="suggestion">{issue.suggestion}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </MiniServiceWrapper>
  );
};

export default RedirectChainAnalyzer;
