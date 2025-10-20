/**
 * URL Structure Analyzer Component
 * Analyzes and optimizes URL structures for SEO
 */
import React, { useState } from 'react';
import MiniServiceWrapper from './MiniServiceWrapper';
import { analyzeURL, generateOptimizedURL } from '../../../analyzers/technical';
import type {
  URLAnalysisResult,
  OptimizedURLSuggestion,
} from '../../../analyzers/technical';

const URLStructureAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<URLAnalysisResult | null>(null);
  const [optimization, setOptimization] =
    useState<OptimizedURLSuggestion | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      const result = analyzeURL(url);
      const optimized = generateOptimizedURL(url);

      setAnalysis(result);
      setOptimization(optimized);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setAnalysis(null);
    setOptimization(null);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getImpactClass = (impact: string): string => {
    if (impact === 'high') return 'badge-danger';
    if (impact === 'medium') return 'badge-warning';
    return 'badge-info';
  };

  return (
    <MiniServiceWrapper
      title="URL Structure Analyzer"
      description="Analyze and optimize URL structures for better SEO performance"
    >
      <div className="input-section">
        <div className="form-group">
          <label htmlFor="url-input">Enter URL to Analyze</label>
          <input
            id="url-input"
            type="text"
            className="form-control"
            placeholder="https://example.com/blog/seo-tips"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAnalyze()}
          />
        </div>

        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={!url.trim() || loading}
          >
            {loading ? 'Analyzing...' : 'Analyze URL'}
          </button>
          <button className="btn btn-secondary" onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>

      {analysis && (
        <div className="results-section">
          <div className="score-card">
            <div className={`score-badge ${getScoreColor(analysis.score)}`}>
              <div className="score-value">{analysis.score}</div>
              <div className="score-label">SEO Score</div>
            </div>
            <div className="score-details">
              <div className="detail-item">
                <span className="label">Status:</span>
                <span
                  className={`value ${analysis.isValid ? 'text-success' : 'text-danger'}`}
                >
                  {analysis.isValid ? 'Valid' : 'Invalid'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Length:</span>
                <span className="value">
                  {analysis.components.length} characters
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Depth:</span>
                <span className="value">
                  {analysis.seoMetrics.depth} levels
                </span>
              </div>
            </div>
          </div>

          {/* URL Components */}
          <div className="info-card">
            <h4>URL Components</h4>
            <div className="component-list">
              <div className="component-item">
                <span className="component-label">Protocol:</span>
                <code>{analysis.components.protocol}</code>
              </div>
              <div className="component-item">
                <span className="component-label">Domain:</span>
                <code>{analysis.components.domain}</code>
              </div>
              <div className="component-item">
                <span className="component-label">Path:</span>
                <code>{analysis.components.path || '/'}</code>
              </div>
              {analysis.components.pathSegments.length > 0 && (
                <div className="component-item">
                  <span className="component-label">Segments:</span>
                  <div className="segment-list">
                    {analysis.components.pathSegments.map((segment, idx) => (
                      <span key={idx} className="segment-badge">
                        {segment}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Issues */}
          {analysis.issues.length > 0 && (
            <div className="issues-card">
              <h4>Issues Found ({analysis.issues.length})</h4>
              <div className="issue-list">
                {analysis.issues.map((issue, idx) => (
                  <div key={idx} className={`issue-item issue-${issue.type}`}>
                    <div className="issue-header">
                      <span className={`badge ${getImpactClass(issue.impact)}`}>
                        {issue.impact}
                      </span>
                      <span className="issue-category">{issue.category}</span>
                    </div>
                    <p className="issue-message">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="recommendations-card">
              <h4>Recommendations</h4>
              <div className="recommendation-list">
                {analysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="recommendation-item">
                    <div className="rec-header">
                      <span className={`priority priority-${rec.priority}`}>
                        {rec.priority}
                      </span>
                      <span className="rec-category">{rec.category}</span>
                    </div>
                    <p className="rec-message">{rec.message}</p>
                    {rec.example && (
                      <div className="rec-example">
                        <strong>Example:</strong> <code>{rec.example}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optimized URL */}
          {optimization && optimization.optimized !== optimization.original && (
            <div className="optimization-card">
              <h4>Optimized URL Suggestion</h4>
              <div className="url-comparison">
                <div className="url-item">
                  <label>Original:</label>
                  <code className="url-original">{optimization.original}</code>
                </div>
                <div className="url-arrow">→</div>
                <div className="url-item">
                  <label>Optimized:</label>
                  <code className="url-optimized">
                    {optimization.optimized}
                  </code>
                </div>
              </div>

              {optimization.improvements.length > 0 && (
                <div className="improvements">
                  <strong>Improvements Made:</strong>
                  <ul>
                    {optimization.improvements.map((improvement, idx) => (
                      <li key={idx}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="score-improvement">
                <strong>Optimized Score:</strong>
                <span
                  className={`score-badge-small ${getScoreColor(optimization.score)}`}
                >
                  {optimization.score}
                </span>
              </div>
            </div>
          )}

          {/* SEO Metrics */}
          <div className="metrics-card">
            <h4>SEO Metrics</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">Readability Score</div>
                <div className="metric-value">
                  {analysis.seoMetrics.readabilityScore}/100
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Length Score</div>
                <div className="metric-value">
                  {analysis.seoMetrics.lengthScore}/100
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Structure Score</div>
                <div className="metric-value">
                  {analysis.seoMetrics.structureScore}/100
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">HTTPS Enabled</div>
                <div className="metric-value">
                  {analysis.seoMetrics.httpsEnabled ? '✓ Yes' : '✗ No'}
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Keywords Present</div>
                <div className="metric-value">
                  {analysis.seoMetrics.keywordPresence ? '✓ Yes' : '✗ No'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MiniServiceWrapper>
  );
};

export default URLStructureAnalyzer;
