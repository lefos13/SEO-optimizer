/**
 * Internal Link Recommender - Mini Service Component
 * Generates internal linking recommendations
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceContainer from './MiniServiceContainer';
import { scrollToResults } from '../../utils/scrollUtils';

// Type definitions
interface Page {
  title: string;
  url: string;
  keywords: string[];
}

interface Score {
  score: number;
  label: string;
}

interface LinkAnalysis {
  total: number;
  internal: number;
  external: number;
  ratio: number;
}

interface AnchorText {
  descriptive: number;
  generic: number;
  quality: number;
}

interface LinkingOpportunity {
  page: string;
  url: string;
  relevance: number;
  reason: string;
}

interface LinkRecommendation {
  title: string;
  message: string;
  anchorText?: string;
}

interface InternalLinkResults {
  score: Score;
  linkAnalysis: LinkAnalysis;
  anchorText: AnchorText;
  opportunities: LinkingOpportunity[];
  recommendations: LinkRecommendation[];
}

const InternalLinkRecommender: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [pagesInput, setPagesInput] = useState<string>('');
  const [results, setResults] = useState<InternalLinkResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      const pages: Page[] = pagesInput
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
        .filter((page): page is Page => page !== null);

      const result = await window.electronAPI.content.recommendInternalLinks(
        trimmed,
        pages
      ) as unknown as InternalLinkResults;
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Internal linking analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setContent('');
    setPagesInput('');
    setResults(null);
    setError(null);
    setLoading(false);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  // Render functions
  const renderInputs = () => (
    <>
      <div className="form-group">
        <label htmlFor="link-content">Content to Analyze</label>
        <textarea
          id="link-content"
          rows={6}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste your content here..."
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label htmlFor="link-pages">
          Existing Pages (one per line: Title | URL | keywords,comma-separated)
        </label>
        <textarea
          id="link-pages"
          rows={6}
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
    </>
  );

  const renderResults = () => {
    if (!results) return null;

    return (
      <>
        <Card className="results-card">
          <h3>🔗 Internal Linking Analysis</h3>

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
                <span className="metric-value">{results.linkAnalysis.total}</span>
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
          {results.anchorText && (
            <div className="analysis-section">
              <h4>⚓ Anchor Text Quality</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">Descriptive:</span>
                  <span className="metric-value">
                    {results.anchorText.descriptive}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Generic:</span>
                  <span className="metric-value">
                    {results.anchorText.generic}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Quality Score:</span>
                  <span className="metric-value">
                    {results.anchorText.quality}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Linking Opportunities */}
          {results.opportunities && results.opportunities.length > 0 && (
            <div className="analysis-section">
              <h4>🎯 Linking Opportunities</h4>
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
          {results.recommendations && results.recommendations.length > 0 && (
            <div className="analysis-section">
              <h4>💡 Optimization Recommendations</h4>
              <div className="recommendations-list">
                {results.recommendations.map((rec, idx) => (
                  <div key={idx} className="recommendation-item">
                    <strong>{rec.title}</strong>
                    <p>{rec.message}</p>
                    {rec.anchorText && (
                      <div className="anchor-suggestion">
                        <span className="anchor-label">Suggested anchor:</span>
                        <span className="anchor-text">
                          &quot;{rec.anchorText}&quot;
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </>
    );
  };

  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🔗</div>
        <h3>Internal Link Recommender</h3>

        <div className="info-section">
          <h4>What you&apos;ll see</h4>
          <p>
            Analysis of current internal links and recommended linking
            opportunities.
          </p>
        </div>

        <div className="info-section">
          <h4>Quick Tips</h4>
          <ul className="info-list">
            <li>Use descriptive anchor text rather than generic phrases.</li>
            <li>
              Maintain a healthy internal linking ratio (avoid zero internal
              links).
            </li>
            <li>
              Link to relevant pages to distribute authority and improve
              navigation.
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer<InternalLinkResults>
      title="🔗 Internal Link Recommender"
      description="Analyze current internal links and discover new linking opportunities."
      onAnalyze={handleAnalyze}
      onClear={handleClear}
      loading={loading}
      error={error}
      results={results}
      analyzeButtonText="Analyze Links"
      analyzeButtonDisabled={false}
      inputCardTitle="Content & Existing Pages"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default InternalLinkRecommender;
