/**
 * Redirect Chain Analyzer Component
 * Detects and analyzes redirect chains and loops
 */
import React, { useState } from 'react';
import MiniServiceContainer from './MiniServiceContainer';
import Card from '../ui/Card';
import { checkURL } from '../../../analyzers/technical';
import type { RedirectAnalysis } from '../../../analyzers/technical';

const RedirectChainAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<RedirectAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await checkURL(url);
      setAnalysis(result);
    } catch (error) {
      console.error('Check error:', error);
      setError(error instanceof Error ? error.message : 'Check failed');
    } finally {
      setLoading(false);
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
        <label>Enter URL to Check</label>
        <input
          type="text"
          className="form-control"
          placeholder="https://example.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
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
            <div className="score-label">Redirect Health</div>
            <div
              className={`score-status ${analysis.totalRedirects === 0 ? 'valid' : 'invalid'}`}
            >
              {analysis.totalRedirects === 0 ? 'Direct' : 'Has Redirects'}
            </div>
          </div>
          <div className="score-details">
            <div className="detail-item">
              <span className="label">Total Redirects</span>
              <br />
              <span className="value">{analysis.totalRedirects}</span>
            </div>
            <div className="detail-item">
              <span className="label">Direct Access</span>
              <br />
              <span className="value">
                {analysis.totalRedirects === 0 ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </Card>

        {analysis.chain.length > 0 && (
          <Card className="results-card">
            <div className="card-header">
              <h3>Redirect Chain</h3>
            </div>
            <div className="card-body">
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
          </Card>
        )}

        {analysis.issues.length > 0 && (
          <Card className="issues-card">
            <h4>Issues</h4>
            {analysis.issues.map((issue, idx) => (
              <div key={idx} className="issue-item">
                {issue.message}
                <div className="suggestion">{issue.suggestion}</div>
              </div>
            ))}
          </Card>
        )}
      </div>
    );

  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🔁</div>
        <h3>Why Redirect Chains Matter</h3>
        <div className="info-section">
          <h4>📊 SEO & Performance Impact</h4>
          <ul>
            <li>
              <strong>Page Speed:</strong> Each hop adds latency and delays
              rendering.
            </li>
            <li>
              <strong>Link Equity:</strong> Long chains dilute link signals.
            </li>
            <li>
              <strong>Reliability:</strong> Chains increase the chance of
              failures and loops.
            </li>
          </ul>
        </div>
        <div className="info-section">
          <h4>💡 Pro Tips</h4>
          <ul>
            <li>Prefer a single 301 redirect directly to the final URL.</li>
            <li>Avoid mixing 301/302 unnecessarily.</li>
            <li>
              Ensure HTTPS and trailing slash normalization is handled once.
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer
      title="Redirect Chain Analyzer"
      description="Detect and analyze redirect chains, loops, and performance issues"
      onAnalyze={handleAnalyze}
      onClear={() => {
        setAnalysis(null);
        setUrl('');
        setError(null);
      }}
      loading={loading}
      error={error}
      results={analysis}
      analyzeButtonText="Check Redirects"
      analyzeButtonDisabled={!url.trim() || loading}
      inputCardTitle="URL to Check"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default RedirectChainAnalyzer;
