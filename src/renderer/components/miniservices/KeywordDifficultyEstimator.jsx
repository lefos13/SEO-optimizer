/**
 * Keyword Difficulty Estimator - Mini Service Component
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceContainer from './MiniServiceContainer';
import { scrollToResults } from '../../utils/scrollUtils';

const KeywordDifficultyEstimator = () => {
  const [keywords, setKeywords] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEstimate = async () => {
    if (!keywords.trim()) {
      setError('Please enter keywords to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const keywordList = keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k);
      const result = await window.electronAPI.keyword.estimateDifficulty(
        keywordList,
        ''
      );
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err.message || 'Estimation failed');
      console.error('Difficulty estimation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults(null);
    setError(null);
  };

  // Render functions
  const renderInputs = () => (
    <div className="form-group">
      <label htmlFor="keywords">Keywords (comma-separated)</label>
      <textarea
        id="keywords"
        rows="5"
        value={keywords}
        onChange={e => setKeywords(e.target.value)}
        placeholder="seo optimization, best seo tools, how to do seo..."
        className="form-control"
      />
    </div>
  );

  const renderResults = () => (
    <>
      <Card className="summary-card">
        <h3>📊 Distribution</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#10b981' }}>
              {results.distribution.easy}
            </div>
            <div className="stat-label">Easy</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {results.distribution.medium}
            </div>
            <div className="stat-label">Medium</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {results.distribution.hard}
            </div>
            <div className="stat-label">Hard</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#991b1b' }}>
              {results.distribution.veryHard}
            </div>
            <div className="stat-label">Very Hard</div>
          </div>
        </div>
      </Card>

      <Card className="results-card">
        <h3>🎯 Difficulty Estimates</h3>
        <div className="difficulty-results">
          {results.estimates.map((est, index) => (
            <div key={index} className="difficulty-item">
              <div className="difficulty-header">
                <span className="difficulty-keyword">{est.keyword}</span>
                <span
                  className="difficulty-badge"
                  style={{ backgroundColor: est.color }}
                >
                  {est.level} ({est.score}/100)
                </span>
              </div>
              <div className="difficulty-bar">
                <div
                  className="difficulty-fill"
                  style={{
                    width: `${est.score}%`,
                    backgroundColor: est.color,
                  }}
                />
              </div>
              <p className="difficulty-recommendation">{est.recommendation}</p>
            </div>
          ))}
        </div>
      </Card>

      {results.easiest && results.easiest.length > 0 && (
        <Card className="insights-card">
          <h3>💡 Quick Insights</h3>
          <div className="insights-grid">
            <div className="insight-section">
              <h4 style={{ color: '#10b981' }}>✅ Easiest Targets</h4>
              <ul>
                {results.easiest.map((kw, idx) => (
                  <li key={idx}>
                    {kw.keyword} ({kw.score})
                  </li>
                ))}
              </ul>
            </div>
            <div className="insight-section">
              <h4 style={{ color: '#ef4444' }}>⚠️ Hardest Challenges</h4>
              <ul>
                {results.hardest.map((kw, idx) => (
                  <li key={idx}>
                    {kw.keyword} ({kw.score})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </>
  );

  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">📊</div>
        <h3>Understanding Keyword Difficulty</h3>

        <div className="info-section">
          <h4>🎯 What is Keyword Difficulty?</h4>
          <p>
            Keyword difficulty estimates how challenging it would be to rank for
            a specific term in search engine results. It considers factors like
            competition, search volume, and the effort required to achieve top
            rankings.
          </p>
        </div>

        <div className="info-section">
          <h4>📈 Difficulty Levels</h4>
          <ul className="info-list">
            <li>
              <strong>Easy (0-30):</strong> Low competition keywords, often
              long-tail phrases, good for beginners and new websites
            </li>
            <li>
              <strong>Medium (30-60):</strong> Moderate competition, requires
              quality content and some SEO effort
            </li>
            <li>
              <strong>Hard (60-80):</strong> High competition keywords,
              typically require strong domain authority and extensive
              optimization
            </li>
            <li>
              <strong>Very Hard (80-100):</strong> Extremely competitive terms
              dominated by large, authoritative websites
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>🔍 Assessment Factors</h4>
          <ul className="info-list">
            <li>
              <strong>Keyword Length:</strong> Shorter keywords are generally
              more competitive
            </li>
            <li>
              <strong>Commercial Intent:</strong> Purchase-related terms often
              have higher difficulty
            </li>
            <li>
              <strong>Generic Terms:</strong> Broad, popular words increase
              competition
            </li>
            <li>
              <strong>Question-Based:</strong> &quot;How-to&quot; and question
              keywords tend to be easier
            </li>
            <li>
              <strong>Numbers & Specificity:</strong> Specific terms with
              numbers are often less competitive
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>💡 Strategic Applications</h4>
          <div className="tips-grid">
            <div className="tip-item">
              <strong>Content Planning:</strong> Start with easier keywords to
              build momentum and authority
            </div>
            <div className="tip-item">
              <strong>Resource Allocation:</strong> Focus SEO efforts on
              keywords matching your current capabilities
            </div>
            <div className="tip-item">
              <strong>Long-term Strategy:</strong> Use difficulty scores to plan
              content roadmaps and growth targets
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer
      title="📊 Keyword Difficulty Estimator"
      description="Estimate keyword difficulty based on length, intent, and competition indicators."
      onAnalyze={handleEstimate}
      onClear={handleClear}
      loading={loading}
      error={error}
      results={results}
      analyzeButtonText="Estimate Difficulty"
      analyzeButtonDisabled={!keywords.trim()}
      inputCardTitle="Keywords to Analyze"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default KeywordDifficultyEstimator;
