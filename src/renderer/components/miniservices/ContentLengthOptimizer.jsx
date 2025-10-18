/**
 * Content Length Optimizer - Mini Service Component
 * Optimizes content length for target content type
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceWrapper from './MiniServiceWrapper';

const ContentLengthOptimizer = () => {
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('blog');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contentTypes = [
    { value: 'blog', label: 'Blog Post' },
    { value: 'guide', label: 'How-to Guide' },
    { value: 'listicle', label: 'Listicle' },
    { value: 'product', label: 'Product Page' },
    { value: 'news', label: 'News Article' },
    { value: 'pillar', label: 'Pillar Content' },
  ];

  const handleAnalyze = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Please enter content to analyze');
      return;
    }

    if (!window.electronAPI?.content?.optimizeLength) {
      setError('Content service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.content.optimizeLength(trimmed, {
        targetType,
      });
      setResults(result);
    } catch (err) {
      setError(err.message || 'Analysis failed');
      console.error('Content length optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults(null);
    setError(null);
  };

  const getStatusColor = status => {
    if (status === 'optimal') return 'var(--success)';
    if (status === 'too_short') return 'var(--error)';
    return 'var(--warning)';
  };

  return (
    <MiniServiceWrapper
      title="📏 Content Length Optimizer"
      description="Optimize your content length based on the target content type and industry standards."
    >
      <Card className="input-card">
        <h3>Content & Settings</h3>

        <div className="form-group">
          <label htmlFor="length-content">Content to Analyze</label>
          <textarea
            id="length-content"
            rows="8"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your content here..."
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="length-type">Content Type</label>
          <select
            id="length-type"
            value={targetType}
            onChange={e => setTargetType(e.target.value)}
            className="form-control"
          >
            {contentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="button-group">
          <button
            onClick={handleAnalyze}
            disabled={loading || !content.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Analyzing...' : 'Optimize Length'}
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
          <h3>📊 Content Length Analysis</h3>

          {/* Current Length */}
          <div className="analysis-section">
            <h4>📝 Current Content Metrics</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Word Count:</span>
                <span className="metric-value">
                  {results.currentLength.words}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Characters:</span>
                <span className="metric-value">
                  {results.currentLength.characters}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Reading Time:</span>
                <span className="metric-value">
                  {results.currentLength.readingTime} min
                </span>
              </div>
            </div>
          </div>

          {/* Ideal Range */}
          <div className="analysis-section">
            <h4>
              🎯 Ideal Range for{' '}
              {
                contentTypes.find(t => t.value === results.meta.targetType)
                  ?.label
              }
            </h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Minimum:</span>
                <span className="metric-value">
                  {results.idealRange.min} words
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Ideal:</span>
                <span className="metric-value">
                  {results.idealRange.ideal} words
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Maximum:</span>
                <span className="metric-value">
                  {results.idealRange.max} words
                </span>
              </div>
            </div>
          </div>

          {/* Length Analysis */}
          <div className="analysis-section">
            <h4>📈 Length Analysis</h4>
            <div
              className="status-badge"
              style={{
                backgroundColor: getStatusColor(results.lengthAnalysis.status),
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <strong>Status:</strong>{' '}
              {results.lengthAnalysis.status.replace('_', ' ').toUpperCase()}
              <br />
              <strong>Score:</strong> {results.lengthAnalysis.score}/100
              <br />
              <strong>Percentage of Ideal:</strong>{' '}
              {results.lengthAnalysis.percentageOfIdeal}%
            </div>
            <p>{results.lengthAnalysis.message}</p>
          </div>

          {/* Sections */}
          <div className="analysis-section">
            <h4>📚 Content Sections</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Major Sections (H2):</span>
                <span className="metric-value">
                  {results.sections.majorSections}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Subsections (H3):</span>
                <span className="metric-value">
                  {results.sections.subsections}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Proper Sectioning:</span>
                <span className="metric-value">
                  {results.sections.hasProperSectioning ? 'Yes ✓' : 'No ✗'}
                </span>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="analysis-section">
            <h4>💡 Optimization Suggestions</h4>
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
    </MiniServiceWrapper>
  );
};

export default ContentLengthOptimizer;
