/**
 * Content Gap Analyzer - Mini Service Component
 * Analyzes content gaps compared to target topics
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceWrapper from './MiniServiceWrapper';
import { scrollToResults } from '../../utils/scrollUtils';

const ContentGapAnalyzer = () => {
  const [content, setContent] = useState('');
  const [topics, setTopics] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Please enter content to analyze');
      return;
    }

    if (!topics.trim()) {
      setError('Please enter topics to check');
      return;
    }

    if (!window.electronAPI?.content?.analyzeGaps) {
      setError('Content service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const topicList = topics
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean);
      const result = await window.electronAPI.content.analyzeGaps(
        trimmed,
        topicList
      );
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err.message || 'Analysis failed');
      console.error('Content gap analysis error:', err);
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

  const getDepthColor = depth => {
    const colors = {
      none: 'var(--error)',
      mentioned: 'var(--warning)',
      shallow: 'var(--info)',
      moderate: 'var(--success)',
      deep: 'var(--success)',
    };
    return colors[depth] || 'var(--text-secondary)';
  };

  return (
    <MiniServiceWrapper
      title="🔍 Content Gap Analyzer"
      description="Identify missing topics and shallow coverage areas in your content."
    >
      <Card className="input-card">
        <h3>Content & Topics</h3>

        <div className="form-group">
          <label htmlFor="gap-content">Content to Analyze</label>
          <textarea
            id="gap-content"
            rows="6"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your content here..."
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="gap-topics">Topics to Check (one per line)</label>
          <textarea
            id="gap-topics"
            rows="6"
            value={topics}
            onChange={e => setTopics(e.target.value)}
            placeholder={
              'SEO best practices\nKeyword research\nOn-page optimization\nLink building strategies'
            }
            className="form-control"
          />
          <small className="form-help">
            Enter topics, questions, or subtopics you want to ensure are covered
          </small>
        </div>

        <div className="button-group">
          <button
            onClick={handleAnalyze}
            disabled={loading || !content.trim() || !topics.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Analyzing...' : 'Analyze Gaps'}
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
            <h3>📊 Content Gap Analysis</h3>

            {/* Score */}
            <div className="score-section">
              <div className="composite-score">
                <div
                  className="score-circle"
                  style={{ color: getScoreColor(results.score.score) }}
                >
                  <span className="score-value">{results.score.score}</span>
                  <span className="score-label">{results.score.label}</span>
                </div>
                <div className="score-details">
                  <h4>Topic Coverage Score</h4>
                  <p>
                    {results.meta.topicsCovered} of{' '}
                    {results.meta.topicsProvided} topics covered
                  </p>
                </div>
              </div>
            </div>

            {/* Coverage Overview */}
            <div className="analysis-section">
              <h4>📋 Topic Coverage Overview</h4>
              <div className="coverage-list">
                {results.coverage.map((topic, idx) => (
                  <div
                    key={idx}
                    className="coverage-item"
                    style={{
                      borderLeftColor: topic.covered
                        ? 'var(--success)'
                        : 'var(--error)',
                    }}
                  >
                    <div className="coverage-header">
                      <strong>{topic.topic}</strong>
                      <span className="coverage-status">
                        {topic.covered ? '✓ Covered' : '✗ Missing'}
                      </span>
                    </div>
                    <div className="coverage-details">
                      <div className="coverage-metric">
                        <span>In Headings:</span>
                        <span>{topic.inHeadings ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="coverage-metric">
                        <span>Depth:</span>
                        <span
                          style={{
                            color: getDepthColor(topic.depth),
                            fontWeight: 'bold',
                          }}
                        >
                          {topic.depth}
                        </span>
                      </div>
                      <div className="coverage-metric">
                        <span>Relevance:</span>
                        <span>{topic.relevance}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Depth Analysis */}
            <div className="analysis-section">
              <h4>📊 Content Depth Analysis</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">Words per Topic:</span>
                  <span className="metric-value">
                    {results.depth.wordsPerTopic}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Depth Level:</span>
                  <span className="metric-value">
                    {results.depth.depthLevel}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Deep Topics:</span>
                  <span className="metric-value">
                    {results.depth.deepTopics}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Shallow Topics:</span>
                  <span className="metric-value">
                    {results.depth.shallowTopics}
                  </span>
                </div>
              </div>
            </div>

            {/* Gaps */}
            {results.gaps.length > 0 && (
              <div className="analysis-section">
                <h4>⚠️ Missing Topics ({results.gaps.length})</h4>
                <ul className="gaps-list">
                  {results.gaps.map((gap, idx) => (
                    <li key={idx} className="gap-item">
                      {gap.topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            <div className="analysis-section">
              <h4>💡 Recommendations</h4>
              <div className="recommendations-list">
                {results.suggestions.map((sug, idx) => (
                  <div key={idx} className="recommendation-item">
                    <strong>{sug.title}</strong>
                    <p>{sug.message}</p>
                    <span className="rec-category">{sug.category}</span>
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

export default ContentGapAnalyzer;
