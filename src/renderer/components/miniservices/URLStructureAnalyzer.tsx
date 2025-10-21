/**
 * URL Structure Analyzer Component
 * Analyzes and optimizes URL structures for SEO
 */
import React, { useState } from 'react';
import MiniServiceContainer from './MiniServiceContainer';
import Card from '../ui/Card';
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

  // Helper functions must be accessible to renderResults and renderInfoCard
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

  // Info card for user tips
  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🔗</div>
        <h3>Why URL Structure Matters</h3>
        <div className="info-section">
          <h4>📊 SEO Impact</h4>
          <ul>
            <li>
              <strong>Readability:</strong> Clean, descriptive URLs are easier
              for users and search engines to understand.
            </li>
            <li>
              <strong>Keyword Usage:</strong> Including relevant keywords can
              improve rankings.
            </li>
            <li>
              <strong>Hierarchy:</strong> Logical structure helps search engines
              crawl your site efficiently.
            </li>
            <li>
              <strong>Short & Simple:</strong> Avoid unnecessary parameters and
              keep URLs concise.
            </li>
          </ul>
        </div>
        <div className="info-section">
          <h4>💡 Pro Tips</h4>
          <ul>
            <li>Use hyphens (-) to separate words, not underscores (_).</li>
            <li>Keep URLs lowercase and avoid special characters.</li>
            <li>Limit folder depth to improve crawlability.</li>
            <li>Redirect old URLs to new ones to preserve SEO value.</li>
            <li>Always use HTTPS for security and trust.</li>
          </ul>
        </div>
      </div>
    </Card>
  );

  // Inputs
  const renderInputs = () => (
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
      {/* Buttons only shown here, not in results */}
    </div>
  );

  // Results
  const renderResults = () =>
    analysis && (
      <div className="results-section">
        <Card className="score-card enhanced-score-card">
          <div className={`score-badge ${getScoreColor(analysis.score)}`}>
            <div className="score-value">{analysis.score}</div>
            <div className="score-label">SEO Score</div>
            <div
              className={`score-status ${analysis.isValid ? 'valid' : 'invalid'}`}
            >
              {analysis.isValid ? 'Valid' : 'Invalid'}
            </div>
          </div>
          <div className="score-details">
            <div className="detail-item">
              <span className="label">Length</span>
              <br />
              <span className="value">{analysis.components.length} chars</span>
            </div>
            <div className="detail-item">
              <span className="label">Depth</span>
              <br />
              <span className="value">{analysis.seoMetrics.depth} levels</span>
            </div>
          </div>
        </Card>
        {/* URL Components */}
        <Card className="info-card">
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
        </Card>
        {/* Issues */}
        {analysis.issues.length > 0 && (
          <Card className="issues-card">
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
          </Card>
        )}
        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <Card className="recommendations-card">
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
          </Card>
        )}
        {/* Optimized URL */}
        {optimization && optimization.optimized !== optimization.original && (
          <Card className="optimization-card">
            <h4>Optimized URL Suggestion</h4>
            <div className="url-comparison">
              <div className="url-item">
                <label>Original:</label>
                <code className="url-original">{optimization.original}</code>
              </div>
              <div className="url-arrow">→</div>
              <div className="url-item">
                <label>Optimized:</label>
                <code className="url-optimized">{optimization.optimized}</code>
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
          </Card>
        )}
        {/* SEO Metrics */}
        <Card className="metrics-card">
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
        </Card>
      </div>
    );

  return (
    <MiniServiceContainer
      title="🔗 URL Structure Analyzer"
      description="Analyze and optimize URL structures for better SEO performance."
      onAnalyze={handleAnalyze}
      onClear={handleClear}
      loading={loading}
      error={null}
      results={analysis}
      analyzeButtonText="Analyze URL"
      analyzeButtonDisabled={!url.trim() || loading}
      inputCardTitle="URL to Analyze"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
  // ...existing code...
};

export default URLStructureAnalyzer;
