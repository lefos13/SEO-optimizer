/**
 * Competitive Content Analyzer - Mini Service Component
 * Performs competitive content analysis
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceWrapper from './MiniServiceWrapper';
import { scrollToResults } from '../../utils/scrollUtils';

const CompetitiveContentAnalyzer = () => {
  const [content, setContent] = useState('');
  const [competitorsInput, setCompetitorsInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Please enter your content to analyze');
      return;
    }

    if (!window.electronAPI?.content?.analyzeCompetitive) {
      setError('Content service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse competitors (format: title|url|content per entry, separated by ---)
      const competitors = competitorsInput
        .split('---')
        .map(entry => {
          const lines = entry.trim().split('\n');
          if (lines.length >= 3) {
            return {
              title: lines[0].replace('Title:', '').trim(),
              url: lines[1].replace('URL:', '').trim(),
              content: lines.slice(2).join('\n').trim(),
            };
          }
          return null;
        })
        .filter(Boolean);

      const result = await window.electronAPI.content.analyzeCompetitive(
        trimmed,
        competitors
      );
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err.message || 'Analysis failed');
      console.error('Competitive analysis error:', err);
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

  const getStatusBadge = status => {
    const badges = {
      competitive: { text: 'Competitive', color: 'var(--success)' },
      longer: { text: 'Above Average', color: 'var(--success)' },
      shorter: { text: 'Below Average', color: 'var(--error)' },
      below: { text: 'Below Average', color: 'var(--warning)' },
    };
    return badges[status] || { text: status, color: 'var(--text-secondary)' };
  };

  return (
    <MiniServiceWrapper
      title="📊 Competitive Content Analyzer"
      description="Compare your content against competitors to identify strengths and opportunities."
    >
      <Card className="input-card">
        <h3>Your Content & Competitors</h3>

        <div className="form-group">
          <label htmlFor="comp-content">Your Content</label>
          <textarea
            id="comp-content"
            rows="6"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your content here..."
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="comp-competitors">
            Competitor Content (separate with ---)
          </label>
          <textarea
            id="comp-competitors"
            rows="8"
            value={competitorsInput}
            onChange={e => setCompetitorsInput(e.target.value)}
            placeholder={
              'Title: Competitor 1\nURL: https://competitor1.com\n<competitor content here>\n---\nTitle: Competitor 2\nURL: https://competitor2.com\n<competitor content here>'
            }
            className="form-control"
          />
          <small className="form-help">
            Format each competitor as: Title: [name], URL: [url], then content,
            separated by ---
          </small>
        </div>

        <div className="button-group">
          <button
            onClick={handleAnalyze}
            disabled={loading || !content.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Analyzing...' : 'Analyze vs Competitors'}
          </button>
          {results && (
            <button onClick={handleClear} className="btn btn-secondary">
              Clear Results
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
      </Card>

      <div className="results-container">
        {results && (
          <Card className="results-card">
            <h3>🏆 Competitive Analysis Results</h3>

            {/* Score */}
            <div className="score-section">
              <div className="composite-score">
                <div
                  className="score-circle"
                  style={{ color: getScoreColor(results.score.score) }}
                  aria-hidden="true"
                >
                  <span className="score-value">{results.score.score}</span>
                  <span className="score-label">{results.score.label}</span>
                </div>
                <div className="score-details">
                  <h4>Competitive Score</h4>
                  <p>
                    Compared against {results.meta.competitorsAnalyzed}{' '}
                    competitors
                  </p>
                </div>
              </div>
            </div>

            {/* Your Content */}
            <div className="analysis-section">
              <h4>📝 Your Content</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">Word Count:</span>
                  <span className="metric-value">
                    {results.yourContent.wordCount}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Headings:</span>
                  <span className="metric-value">
                    {results.yourContent.headingCount}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Images:</span>
                  <span className="metric-value">
                    {results.yourContent.imageCount}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Lists:</span>
                  <span className="metric-value">
                    {results.yourContent.listCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Competitor Averages */}
            <div className="analysis-section">
              <h4>📊 Competitor Averages</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">Avg Word Count:</span>
                  <span className="metric-value">
                    {results.averages.wordCount}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Avg Headings:</span>
                  <span className="metric-value">
                    {results.averages.headingCount}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Avg Images:</span>
                  <span className="metric-value">
                    {results.averages.imageCount}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Avg Lists:</span>
                  <span className="metric-value">
                    {results.averages.listCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Comparison */}
            <div className="analysis-section">
              <h4>⚖️ Comparison</h4>
              <div className="comparison-list">
                <div className="comparison-item">
                  <div className="comp-metric">
                    <strong>Word Count</strong>
                    <div
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusBadge(
                          results.comparison.wordCount.status
                        ).color,
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        display: 'inline-block',
                      }}
                    >
                      {getStatusBadge(results.comparison.wordCount.status).text}
                    </div>
                  </div>
                  <div className="comp-details">
                    Yours: {results.comparison.wordCount.value} | Avg:{' '}
                    {results.comparison.wordCount.average} | Diff:{' '}
                    {results.comparison.wordCount.difference > 0 ? '+' : ''}
                    {results.comparison.wordCount.difference} (
                    {results.comparison.wordCount.percentage}%)
                  </div>
                </div>

                <div className="comparison-item">
                  <div className="comp-metric">
                    <strong>Headings</strong>
                    <div
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusBadge(
                          results.comparison.headingCount.status
                        ).color,
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        display: 'inline-block',
                      }}
                    >
                      {
                        getStatusBadge(results.comparison.headingCount.status)
                          .text
                      }
                    </div>
                  </div>
                  <div className="comp-details">
                    Yours: {results.comparison.headingCount.value} | Avg:{' '}
                    {results.comparison.headingCount.average} | Diff:{' '}
                    {results.comparison.headingCount.difference > 0 ? '+' : ''}
                    {results.comparison.headingCount.difference}
                  </div>
                </div>

                <div className="comparison-item">
                  <div className="comp-metric">
                    <strong>Images</strong>
                    <div
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusBadge(
                          results.comparison.imageCount.status
                        ).color,
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        display: 'inline-block',
                      }}
                    >
                      {
                        getStatusBadge(results.comparison.imageCount.status)
                          .text
                      }
                    </div>
                  </div>
                  <div className="comp-details">
                    Yours: {results.comparison.imageCount.value} | Avg:{' '}
                    {results.comparison.imageCount.average} | Diff:{' '}
                    {results.comparison.imageCount.difference > 0 ? '+' : ''}
                    {results.comparison.imageCount.difference}
                  </div>
                </div>

                <div className="comparison-item">
                  <div className="comp-metric">
                    <strong>Lists</strong>
                    <div
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusBadge(
                          results.comparison.listCount.status
                        ).color,
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        display: 'inline-block',
                      }}
                    >
                      {getStatusBadge(results.comparison.listCount.status).text}
                    </div>
                  </div>
                  <div className="comp-details">
                    Yours: {results.comparison.listCount.value} | Avg:{' '}
                    {results.comparison.listCount.average} | Diff:{' '}
                    {results.comparison.listCount.difference > 0 ? '+' : ''}
                    {results.comparison.listCount.difference}
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Competitors */}
            {results.competitors.length > 0 && (
              <div className="analysis-section">
                <h4>🔍 Individual Competitors</h4>
                <div className="competitors-list">
                  {results.competitors.map((comp, idx) => (
                    <div key={idx} className="competitor-item">
                      <h5>{comp.title}</h5>
                      <div className="comp-url">{comp.url}</div>
                      <div className="comp-metrics">
                        Words: {comp.wordCount} | Headings: {comp.headingCount}{' '}
                        | Images: {comp.imageCount} | Lists: {comp.listCount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            <div className="analysis-section">
              <h4>💡 Competitive Insights</h4>
              <div className="recommendations-list">
                {results.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={'recommendation-item ' + insight.type}
                  >
                    <strong>{insight.title}</strong>
                    <p>{insight.message}</p>
                    <span className="rec-category">{insight.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </MiniServiceWrapper>
  );
};

export default CompetitiveContentAnalyzer;
