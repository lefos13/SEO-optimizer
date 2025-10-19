/**
 * Keyword Clusterer - Mini Service Component
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceContainer from './MiniServiceContainer';
import { scrollToResults } from '../../utils/scrollUtils';

const KeywordClusterer = () => {
  const [keywords, setKeywords] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCluster = async () => {
    if (!keywords.trim()) {
      setError('Please enter keywords to cluster');
      return;
    }

    const keywordList = keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k);
    if (keywordList.length < 2) {
      setError('Need at least 2 keywords for clustering');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.keyword.cluster(keywordList, '');
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err.message || 'Clustering failed');
      console.error('Clustering error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setKeywords('');
    setResults(null);
    setError(null);
    setLoading(false);
  };

  // Render functions
  const renderInputs = () => (
    <>
      <div className="form-group">
        <label htmlFor="keywords">Keywords (comma-separated)</label>
        <textarea
          id="keywords"
          rows="6"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="seo tools, best seo software, seo analyzer, content optimization, optimize content, keyword research..."
          className="form-control"
        />
        <small className="form-help">
          Enter at least 2 keywords to cluster
        </small>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}
    </>
  );

  const renderResults = () => (
    <>
      <Card className="summary-card">
        <h3>📊 Advanced Clustering Summary</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{results.totalKeywords}</div>
            <div className="stat-label">Total Keywords</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{results.totalClusters}</div>
            <div className="stat-label">Clusters Found</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {results.avgClusterSize.toFixed(1)}
            </div>
            <div className="stat-label">Avg Cluster Size</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{results.singleton}</div>
            <div className="stat-label">Standalone Keywords</div>
          </div>
        </div>

        {results.options && (
          <div className="clustering-options">
            <h4>Clustering Settings</h4>
            <div className="options-grid">
              <div className="option-item">
                <strong>Strategy:</strong>{' '}
                {results.options.strategy === 'jaccard'
                  ? 'Jaccard Similarity'
                  : 'Semantic Analysis'}
              </div>
              <div className="option-item">
                <strong>Similarity Threshold:</strong>{' '}
                {Math.round(results.options.similarityThreshold * 100)}%
              </div>
            </div>
          </div>
        )}
      </Card>

      {results.insights && results.insights.length > 0 && (
        <Card className="insights-card">
          <h3>💡 Clustering Insights</h3>
          <div className="insights-list">
            {results.insights.map((insight, index) => (
              <div
                key={index}
                className={`insight-item insight-${insight.type}`}
              >
                <span className="insight-icon">
                  {insight.type === 'success'
                    ? '✅'
                    : insight.type === 'warning'
                      ? '⚠️'
                      : 'ℹ️'}
                </span>
                <span className="insight-message">{insight.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="results-card">
        <h3>🔗 Smart Keyword Clusters</h3>
        <div className="cluster-results">
          {results.clusters.map((cluster, index) => (
            <div key={index} className="cluster-item">
              <div className="cluster-header">
                <div className="cluster-title">
                  <span className="cluster-icon">📌</span>
                  <span className="cluster-primary">{cluster.primary}</span>
                  <span className="cluster-size-badge">
                    {cluster.size} keyword{cluster.size !== 1 ? 's' : ''}
                  </span>
                  {cluster.quality && (
                    <span
                      className={`cluster-quality-badge quality-${cluster.quality >= 70 ? 'high' : cluster.quality >= 50 ? 'medium' : 'low'}`}
                    >
                      Quality: {cluster.quality}/100
                    </span>
                  )}
                </div>
              </div>

              {cluster.suggestedName &&
                cluster.suggestedName !== cluster.primary && (
                  <div className="cluster-suggested-name">
                    <strong>Suggested Content Title:</strong>{' '}
                    {cluster.suggestedName}
                  </div>
                )}

              {cluster.theme && (
                <div className="cluster-theme">
                  <strong>Theme:</strong> {cluster.theme}
                </div>
              )}

              {cluster.commonWords && cluster.commonWords.length > 0 && (
                <div className="cluster-common-words">
                  <strong>Common terms:</strong>{' '}
                  {cluster.commonWords
                    .map(cw => {
                      const percentage =
                        cw.frequency && !isNaN(cw.frequency)
                          ? Math.round(cw.frequency * 100)
                          : 0;
                      return `${cw.word} (${percentage}%)`;
                    })
                    .join(', ')}
                </div>
              )}

              {cluster.related && cluster.related.length > 0 && (
                <div className="cluster-related">
                  <strong>Related keywords:</strong>
                  <ul className="related-list">
                    {cluster.related.map((rel, idx) => (
                      <li key={idx} className="related-item">
                        <span className="related-keyword">{rel.keyword}</span>
                        <span className="similarity-badge">
                          {rel.similarity}% similar
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {cluster.size === 1 && (
                <div className="cluster-standalone">
                  <span className="standalone-badge">
                    Standalone keyword - consider adding related terms for
                    better clustering
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
  );

  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🎯</div>
        <h3>Why Keyword Clustering Matters</h3>

        <div className="info-section">
          <h4>📊 Content Strategy Optimization</h4>
          <p>
            Instead of creating separate pages for each keyword, clustering
            helps you identify thematic groups that can be covered in single,
            comprehensive pieces of content. This approach is more efficient and
            user-friendly.
          </p>
        </div>

        <div className="info-section">
          <h4>🎯 SEO Benefits</h4>
          <ul className="benefits-list">
            <li>
              <strong>Topic Authority:</strong> Create in-depth content that
              ranks for multiple related terms
            </li>
            <li>
              <strong>Internal Linking:</strong> Better site structure with
              thematic content clusters
            </li>
            <li>
              <strong>Semantic SEO:</strong> Help search engines understand your
              content&apos;s context
            </li>
            <li>
              <strong>Long-tail Targeting:</strong> Discover keyword variations
              for better ranking opportunities
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>🔍 How It Works</h4>
          <ul className="info-list">
            <li>
              <strong>Similarity Analysis:</strong> Keywords are compared based
              on shared words and semantic meaning
            </li>
            <li>
              <strong>Smart Grouping:</strong> Related keywords are
              automatically grouped into thematic clusters
            </li>
            <li>
              <strong>Quality Scoring:</strong> Each cluster gets a quality
              score based on cohesion and relevance
            </li>
            <li>
              <strong>Content Themes:</strong> Identifies the main topic or
              theme of each cluster
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>💡 Pro Tips</h4>
          <div className="tips-grid">
            <div className="tip-item">
              <strong>Start Broad:</strong> Include variations of your main
              keywords to discover natural groupings
            </div>
            <div className="tip-item">
              <strong>Quality Over Quantity:</strong> Focus on high-quality
              clusters (70+ score) for content creation
            </div>
            <div className="tip-item">
              <strong>Content Planning:</strong> Use cluster names as content
              pillars for your website structure
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer
      title="🔗 Smart Keyword Clusterer"
      description="Automatically group related keywords into thematic clusters to optimize your content strategy and improve SEO performance."
      onAnalyze={handleCluster}
      onClear={handleClear}
      loading={loading}
      error={error}
      results={results}
      analyzeButtonText="Cluster Keywords"
      analyzeButtonDisabled={false}
      inputCardTitle="Keywords to Cluster"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default KeywordClusterer;
