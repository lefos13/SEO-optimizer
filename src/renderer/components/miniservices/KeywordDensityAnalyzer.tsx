/**
 * Keyword Density Analyzer - Mini Service Component
 * Analyzes keyword density with visual distribution charts
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceContainer from './MiniServiceContainer';
import { scrollToResults } from '../../utils/scrollUtils';

type DensityStatus = 'optimal' | 'underused' | 'overused';
type KeywordType = 'phrase' | 'word';
type RecommendationType = 'success' | 'warning' | 'critical';

interface Summary {
  optimal: number;
  underused: number;
  overused: number;
}

interface Position {
  percentage: number;
}

interface DensityResult {
  keyword: string;
  type: KeywordType;
  density: number;
  count: number;
  status: DensityStatus;
  positions?: Position[];
}

interface Recommendation {
  keyword: string;
  message: string;
  type: RecommendationType;
}

interface KeywordCount {
  keyword: string;
  count: number;
}

interface DistributionSection {
  section: string;
  totalKeywords: number;
  keywordCounts: KeywordCount[];
}

interface KeywordDensityResults {
  totalWords: number;
  summary: Summary;
  densityResults: DensityResult[];
  recommendations?: Recommendation[];
  distribution?: DistributionSection[];
}

const KeywordDensityAnalyzer: React.FC = () => {
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState('');
  const [results, setResults] = useState<KeywordDensityResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('Please enter content to analyze');
      return;
    }

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
      const result = (await window.electronAPI.keyword.analyzeDensity(
        content,
        keywordList
      )) as unknown as KeywordDensityResults;
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Keyword density analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults(null);
    setError(null);
  };

  const getStatusColor = (status: DensityStatus): string => {
    switch (status) {
      case 'optimal':
        return '#10b981';
      case 'underused':
        return '#f59e0b';
      case 'overused':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: DensityStatus): string => {
    switch (status) {
      case 'optimal':
        return '✅';
      case 'underused':
        return '⚠️';
      case 'overused':
        return '❌';
      default:
        return '❓';
    }
  };

  // Render functions
  const renderInputs = () => (
    <>
      <div className="form-group">
        <label htmlFor="content">Content to Analyze</label>
        <textarea
          id="content"
          rows={8}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste your content here (HTML or plain text)..."
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label htmlFor="keywords">Keywords (comma-separated)</label>
        <input
          id="keywords"
          type="text"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="keyword1, keyword2, keyword3..."
          className="form-control"
        />
        <small className="form-help">
          Enter keywords separated by commas. You can include single words or
          phrases.
        </small>
      </div>
    </>
  );

  const renderResults = () => (
    <>
      <Card className="summary-card">
        <h3>📊 Analysis Summary</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">
              {results?.totalWords.toLocaleString()}
            </div>
            <div className="stat-label">Total Words</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{results?.summary.optimal}</div>
            <div className="stat-label">Optimal Density</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{results?.summary.underused}</div>
            <div className="stat-label">Underused</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{results?.summary.overused}</div>
            <div className="stat-label">Overused</div>
          </div>
        </div>
      </Card>

      <Card className="results-card">
        <h3>📈 Keyword Density Results</h3>
        <div className="density-results">
          {results?.densityResults.map((result, index) => (
            <div key={index} className="density-item">
              <div className="density-header">
                <span className="density-keyword">
                  {getStatusIcon(result.status)} {result.keyword}
                  <span className="keyword-type-badge">{result.type}</span>
                </span>
                <span
                  className="density-value"
                  style={{ color: getStatusColor(result.status) }}
                >
                  {result.density}%
                </span>
              </div>

              <div className="density-details">
                <div className="detail-item">
                  <span className="detail-label">Count:</span>
                  <span className="detail-value">{result.count}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span
                    className="detail-value"
                    style={{ color: getStatusColor(result.status) }}
                  >
                    {result.status}
                  </span>
                </div>
              </div>

              {/* Density bar visualization */}
              <div className="density-bar-container">
                <div className="density-bar-labels">
                  <span>0%</span>
                  <span className="optimal-range">1-3% (Optimal)</span>
                  <span>5%</span>
                </div>
                <div className="density-bar-track">
                  <div
                    className="optimal-zone"
                    style={{ left: '20%', width: '40%' }}
                  />
                  <div
                    className="density-marker"
                    style={{
                      left: `${Math.min(result.density * 20, 100)}%`,
                      backgroundColor: getStatusColor(result.status),
                    }}
                  />
                </div>
              </div>

              {/* Distribution visualization */}
              {result.positions && result.positions.length > 0 && (
                <div className="position-distribution">
                  <div className="distribution-label">
                    Position Distribution:
                  </div>
                  <div className="distribution-track">
                    {result.positions.map((pos, idx) => (
                      <div
                        key={idx}
                        className="position-dot"
                        style={{
                          left: `${pos.percentage}%`,
                          backgroundColor: getStatusColor(result.status),
                        }}
                        title={`Position ${idx + 1}: ${Math.round(pos.percentage)}%`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {results?.recommendations && results.recommendations.length > 0 && (
        <Card className="recommendations-card">
          <h3>💡 Recommendations</h3>
          <div className="recommendations-list">
            {results.recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-item ${rec.type}`}>
                <div className="recommendation-icon">
                  {rec.type === 'success' && '✅'}
                  {rec.type === 'warning' && '⚠️'}
                  {rec.type === 'critical' && '❌'}
                </div>
                <div className="recommendation-content">
                  <div className="recommendation-keyword">{rec.keyword}</div>
                  <div className="recommendation-message">{rec.message}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {results?.distribution && (
        <Card className="distribution-card">
          <h3>📍 Content Distribution</h3>
          <p className="card-description">
            Shows how keywords are distributed across different sections of your
            content.
          </p>
          <div className="distribution-sections">
            {results.distribution.map((section, index) => (
              <div key={index} className="section-item">
                <div className="section-header">
                  <span className="section-name">{section.section}</span>
                  <span className="section-total">
                    {section.totalKeywords} keywords
                  </span>
                </div>
                {section.keywordCounts.length > 0 && (
                  <div className="section-keywords">
                    {section.keywordCounts
                      .filter(kc => kc.count > 0)
                      .map((kc, idx) => (
                        <div key={idx} className="section-keyword">
                          <span className="keyword-name">{kc.keyword}</span>
                          <span className="keyword-count">{kc.count}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );

  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🔍</div>
        <h3>Mastering Keyword Density</h3>

        <div className="info-section">
          <h4>🎯 What is Keyword Density?</h4>
          <p>
            Keyword density measures how frequently your target keywords appear
            in your content relative to the total word count. It&apos;s a
            crucial factor in on-page SEO that helps search engines understand
            your content&apos;s relevance while avoiding over-optimization
            penalties.
          </p>
        </div>

        <div className="info-section">
          <h4>📈 Optimal Density Ranges</h4>
          <ul className="info-list">
            <li>
              <strong>1-3% (Optimal):</strong> The sweet spot where keywords
              appear naturally without being overused. This range typically
              provides the best ranking potential.
            </li>
            <li>
              <strong>&lt;1% (Underused):</strong> Keywords may not be prominent
              enough for search engines to recognize topical relevance. Consider
              increasing usage naturally.
            </li>
            <li>
              <strong>&gt;3% (Overused):</strong> Risk of keyword stuffing
              penalties. Search engines may view this as manipulative and reduce
              rankings.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>🔍 Advanced Analysis Features</h4>
          <ul className="info-list">
            <li>
              <strong>Phrase Recognition:</strong> Multi-word phrases are
              counted as complete units rather than individual words, providing
              more accurate density calculations.
            </li>
            <li>
              <strong>Content Distribution:</strong> Analyzes keyword placement
              across different content sections (introduction, body, conclusion)
              for optimal user experience.
            </li>
            <li>
              <strong>Position Tracking:</strong> Visual indicators show exactly
              where keywords appear in your content, helping you achieve natural
              distribution.
            </li>
            <li>
              <strong>Smart Recommendations:</strong> Actionable suggestions to
              optimize density based on current usage patterns and best
              practices.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>💡 Density Optimization Tips</h4>
          <div className="tips-grid">
            <div className="tip-item">
              <strong>Natural Integration:</strong> Use keywords in headings,
              subheadings, and naturally within sentences
            </div>
            <div className="tip-item">
              <strong>LSI Keywords:</strong> Include semantically related terms
              to improve overall topical relevance
            </div>
            <div className="tip-item">
              <strong>Content Length:</strong> Longer, comprehensive content
              allows for more natural keyword distribution
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer
      title="🔍 Keyword Density Analyzer"
      description="Analyze how often your target keywords appear in your content with detailed distribution metrics."
      onAnalyze={handleAnalyze}
      onClear={handleClear}
      loading={loading}
      error={error}
      results={results}
      analyzeButtonText="Analyze Density"
      analyzeButtonDisabled={!content.trim() || !keywords.trim()}
      inputCardTitle="Content & Keywords"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default KeywordDensityAnalyzer;
