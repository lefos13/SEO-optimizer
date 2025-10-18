/**
 * Heading Optimizer - Mini Service Component
 * Generates heading optimization suggestions
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceWrapper from './MiniServiceWrapper';

const getWordCount = text => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const HeadingOptimizer = () => {
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const wordCount = getWordCount(content);

  const handleAnalyze = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Please enter content to analyze');
      return;
    }

    if (!window.electronAPI?.content?.optimizeHeadings) {
      setError('Content service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const keywordList = keywords
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
      const result = await window.electronAPI.content.optimizeHeadings(
        trimmed,
        keywordList
      );
      setResults(result);
    } catch (err) {
      setError(err.message || 'Analysis failed');
      console.error('Heading optimization error:', err);
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

  const getRecommendationType = type => {
    const types = {
      error: { icon: '❌', color: 'var(--error)' },
      warning: { icon: '⚠️', color: 'var(--warning)' },
      info: { icon: 'ℹ️', color: 'var(--info)' },
      success: { icon: '✅', color: 'var(--success)' },
    };
    return types[type] || types.info;
  };

  return (
    <MiniServiceWrapper
      title="📋 Heading Optimizer"
      description="Optimize your headings for SEO with keyword usage and length analysis."
    >
      <Card className="input-card">
        <h3>Content & Keywords</h3>

        <div className="form-group">
          <label htmlFor="heading-content">
            Content to Analyze (HTML or Plain Text)
          </label>
          <textarea
            id="heading-content"
            rows="8"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your content here..."
            className="form-control"
          />
          <div className="input-meta">
            <span>Words: {wordCount}</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="heading-keywords">
            Target Keywords (comma-separated)
          </label>
          <input
            type="text"
            id="heading-keywords"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="e.g., SEO, content marketing, digital strategy"
            className="form-control"
          />
        </div>

        <div className="button-group">
          <button
            onClick={handleAnalyze}
            disabled={loading || !content.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Analyzing...' : 'Optimize Headings'}
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
        <Card className="results-card animate-card heading-optimizer-results">
          <div className="card-header">
            <h3>🎯 Heading Optimization Results</h3>
          </div>

          {/* Overall Score */}
          <div className="score-section">
            <div className="composite-score">
              <div className="score-details">
                <h4>Heading Optimization Score</h4>
                <p>
                  Your headings are rated as{' '}
                  <span style={{ color: getScoreColor(results.score.score) }}>
                    {results.score.label}
                  </span>
                </p>
              </div>
              {/* <div
                className="score-circle"
                style={{ borderColor: getScoreColor(results.score.score) }}
              >
                <span className="score-value">{results.score.score}</span>
                <span className="score-label">{results.score.label}</span>
              </div> */}
            </div>
          </div>

          {/* Heading Structure */}
          <div className="analysis-section">
            <h4>📊 Heading Structure</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Total Headings:</span>
                <span className="metric-value">{results.analysis.total}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">H1:</span>
                <span className="metric-value">
                  {results.analysis.h1Count}
                  {results.analysis.hasH1 ? ' ✓' : ' ✗'}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">H2:</span>
                <span className="metric-value">{results.analysis.h2Count}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">H3:</span>
                <span className="metric-value">{results.analysis.h3Count}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Proper Hierarchy:</span>
                <span className="metric-value">
                  {results.analysis.hasProperHierarchy ? 'Yes ✓' : 'No ✗'}
                </span>
              </div>
            </div>
          </div>

          {/* Keyword Usage */}
          {results.keywordUsage.totalKeywords > 0 && (
            <div className="analysis-section">
              <h4>🎯 Keyword Usage in Headings</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">Keywords in Headings:</span>
                  <span className="metric-value">
                    {results.keywordUsage.keywordsInHeadings} /{' '}
                    {results.keywordUsage.totalKeywords}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Coverage:</span>
                  <span className="metric-value">
                    {results.keywordUsage.percentage}%
                  </span>
                </div>
              </div>

              <div className="keyword-usage-list">
                <h5>Keyword Details:</h5>
                <ul>
                  {results.keywordUsage.usage.map((kw, idx) => (
                    <li key={idx}>
                      <strong>{kw.keyword}</strong>:{' '}
                      {kw.inHeadings ? (
                        <span className="text-success">
                          Found ({kw.count} {kw.count === 1 ? 'time' : 'times'})
                          ✓
                        </span>
                      ) : (
                        <span className="text-error">Not found ✗</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Length Analysis */}
          <div className="analysis-section">
            <h4>📏 Heading Length Analysis</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Optimal Length:</span>
                <span className="metric-value">
                  {results.lengthAnalysis.optimal}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Too Long (&gt;10 words):</span>
                <span className="metric-value">
                  {results.lengthAnalysis.tooLong}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Too Short (&lt;3 words):</span>
                <span className="metric-value">
                  {results.lengthAnalysis.tooShort}
                </span>
              </div>
            </div>

            {results.lengthAnalysis.details.length > 0 && (
              <div className="heading-details">
                <h5>Heading Details:</h5>
                <ul>
                  {results.lengthAnalysis.details.map((h, idx) => (
                    <li key={idx}>
                      <strong>{h.level.toUpperCase()}</strong>: {h.text}{' '}
                      <span className="text-muted">
                        ({h.length} words)
                        {h.length < 3 && ' - Too short'}
                        {h.length > 10 && ' - Too long'}
                        {h.length >= 3 && h.length <= 10 && ' ✓'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="analysis-section">
            <h4>💡 Optimization Suggestions</h4>
            <div className="recommendations-list">
              {results.suggestions.map((sug, idx) => {
                const typeInfo = getRecommendationType(sug.type);
                return (
                  <div
                    key={idx}
                    className="recommendation-item"
                    style={{ borderLeftColor: typeInfo.color }}
                  >
                    <span className="rec-icon">{typeInfo.icon}</span>
                    <div className="rec-content">
                      <strong>{sug.title}</strong>
                      <p>{sug.message}</p>
                      <span className="rec-category">{sug.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </MiniServiceWrapper>
  );
};

export default HeadingOptimizer;
