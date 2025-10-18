/**
 * Internal Link Recommender - Mini Service Component
 * Generates internal linking recommendations
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceWrapper from './MiniServiceWrapper';

const InternalLinkRecommender = () => {
  const [content, setContent] = useState('');
  const [pagesInput, setPagesInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Please enter content to analyze');
      return;
    }

    if (!window.electronAPI?.content?.recommendInternalLinks) {
      setError('Content service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse pages input (format: title|url|keywords per line)
      const pages = pagesInput
        .split('\n')
        .map(line => {
          const parts = line.split('|').map(p => p.trim());
          if (parts.length >= 2) {
            return {
              title: parts[0],
              url: parts[1],
              keywords: parts[2] ? parts[2].split(',').map(k => k.trim()) : [],
            };
          }
          return null;
        })
        .filter(Boolean);

      const result = await window.electronAPI.content.recommendInternalLinks(
        trimmed,
        pages
      );
      setResults(result);
    } catch (err) {
      setError(err.message || 'Analysis failed');
      console.error('Internal linking analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults(null);
    setError(null);
  };

  const getScoreColor = score => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <MiniServiceWrapper
      title="🔗 Internal Link Recommender"
      description="Analyze current internal links and discover new linking opportunities."
    >
      <Card className="input-card">
        <h3>Content & Existing Pages</h3>

        <div className="form-group">
          <label htmlFor="link-content">Content to Analyze</label>
          <textarea
            id="link-content"
            rows="6"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your content here..."
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="link-pages">
            Existing Pages (one per line: Title | URL |
            keywords,comma-separated)
          </label>
          <textarea
            id="link-pages"
            rows="6"
            value={pagesInput}
            onChange={e => setPagesInput(e.target.value)}
            placeholder={
              'SEO Guide | /seo-guide | SEO,optimization\nContent Marketing | /content-marketing | content,marketing'
            }
            className="form-control"
          />
          <small className="form-help">
            Format: Title | URL | keywords (optional)
          </small>
        </div>

        <div className="button-group">
          <button
            onClick={handleAnalyze}
            disabled={loading || !content.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Analyzing...' : 'Analyze Links'}
          </button>
          {results && (
            <button onClick={handleClear} className="btn btn-secondary">
              Clear Results
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
      </Card>

      {results && (
        <Card className="results-card">
          <h3>🔗 Internal Linking Analysis</h3>

          {/* Score */}
          <div className="score-section">
            <div className="composite-score">
              <div
                className="score-circle"
                style={{ borderColor: getScoreColor(results.score.score) }}
              >
                <span className="score-value">{results.score.score}</span>
                <span className="score-label">{results.score.label}</span>
              </div>
              <div className="score-details">
                <h4>Internal Linking Score</h4>
              </div>
            </div>
          </div>

          {/* Current Links */}
          <div className="analysis-section">
            <h4>📊 Current Link Analysis</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Total Links:</span>
                <span className="metric-value">
                  {results.linkAnalysis.total}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Internal Links:</span>
                <span className="metric-value">
                  {results.linkAnalysis.internal}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">External Links:</span>
                <span className="metric-value">
                  {results.linkAnalysis.external}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Internal Ratio:</span>
                <span className="metric-value">
                  {results.linkAnalysis.ratio}%
                </span>
              </div>
            </div>
          </div>

          {/* Anchor Text Analysis */}
          <div className="analysis-section">
            <h4>⚓ Anchor Text Quality</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Descriptive:</span>
                <span className="metric-value">
                  {results.anchorAnalysis.descriptive}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Generic:</span>
                <span className="metric-value">
                  {results.anchorAnalysis.generic}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Empty:</span>
                <span className="metric-value">
                  {results.anchorAnalysis.empty}
                </span>
              </div>
            </div>
          </div>

          {/* Opportunities */}
          {results.opportunities.length > 0 && (
            <div className="analysis-section">
              <h4>💡 Linking Opportunities</h4>
              <div className="opportunities-list">
                {results.opportunities.map((opp, idx) => (
                  <div key={idx} className="opportunity-item">
                    <div className="opp-header">
                      <strong>{opp.page}</strong>
                      <span className="opp-relevance">
                        Relevance: {opp.relevance}
                      </span>
                    </div>
                    <div className="opp-url">{opp.url}</div>
                    <div className="opp-reason">{opp.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="analysis-section">
            <h4>📝 Recommendations</h4>
            <div className="recommendations-list">
              {results.recommendations.map((rec, idx) => (
                <div key={idx} className="recommendation-item">
                  <strong>{rec.title}</strong>
                  <p>{rec.message}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </MiniServiceWrapper>
  );
};

export default InternalLinkRecommender;
