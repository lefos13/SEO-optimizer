/**
 * Sitemap Analyzer Component
 * Analyzes XML sitemaps for SEO compliance
 */
import React, { useState } from 'react';
import MiniServiceContainer from './MiniServiceContainer';
import Card from '../ui/Card';
import { analyzeSitemap } from '../../../analyzers/technical';
import type { SitemapAnalysis } from '../../../analyzers/technical';

const SitemapAnalyzer: React.FC = () => {
  const [xmlContent, setXmlContent] = useState('');
  const [analysis, setAnalysis] = useState<SitemapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    if (!xmlContent.trim()) return;

    setLoading(true);
    try {
      const result = analyzeSitemap(xmlContent);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const renderInputs = () => (
    <div className="input-section">
      <div className="form-group">
        <label>Paste your sitemap.xml content</label>
        <textarea
          className="form-control"
          rows={10}
          placeholder={"<?xml version='1.0'?><urlset>..."}
          value={xmlContent}
          onChange={e => setXmlContent(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAnalyze()}
        />
      </div>
    </div>
  );

  const renderResults = () =>
    analysis && (
      <div className="results-section">
        <Card className="score-card enhanced-score-card">
          <div className={`score-badge ${getScoreColor(analysis.score)}`}>
            <div className="score-value">{analysis.score}</div>
            <div className="score-label">Sitemap Health</div>
            <div
              className={`score-status ${analysis.isValid ? 'valid' : 'invalid'}`}
            >
              {analysis.isValid ? 'Valid' : 'Invalid'}
            </div>
          </div>
          <div className="score-details">
            <div className="detail-item">
              <span className="label">Total URLs</span>
              <br />
              <span className="value">{analysis.urlCount}</span>
            </div>
            <div className="detail-item">
              <span className="label">Valid URLs</span>
              <br />
              <span className="value">{analysis.statistics.validUrls}</span>
            </div>
          </div>
        </Card>

        {analysis.issues.length > 0 && (
          <Card className="issues-card">
            <h4>Issues ({analysis.issues.length})</h4>
            {analysis.issues.map((issue, idx) => (
              <div key={idx} className="issue-item">
                <span className={`badge badge-${issue.type}`}>
                  {issue.impact}
                </span>
                {issue.message}
              </div>
            ))}
          </Card>
        )}

        {analysis.recommendations.length > 0 && (
          <Card className="results-card">
            <div className="card-header">
              <h3>Recommendations</h3>
            </div>
            <div className="card-body">
              {analysis.recommendations.map((rec, idx) => (
                <div key={idx} className="recommendation-item">
                  <strong>{rec.category}:</strong> {rec.message}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );

  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🗺️</div>
        <h3>Why Sitemaps Matter</h3>
        <div className="info-section">
          <h4>📊 Discovery & Indexing</h4>
          <ul>
            <li>
              <strong>Discovery:</strong> Help search engines find important
              URLs.
            </li>
            <li>
              <strong>Metadata:</strong> Provide lastmod, priority, and
              changefreq.
            </li>
            <li>
              <strong>Coverage:</strong> Separate large sites into multiple
              sitemaps.
            </li>
          </ul>
        </div>
        <div className="info-section">
          <h4>💡 Pro Tips</h4>
          <ul>
            <li>Keep each sitemap under 50,000 URLs or 50MB uncompressed.</li>
            <li>
              Use absolute URLs and keep them consistent with site canonicals.
            </li>
            <li>
              Include only indexable URLs (200 status, canonical, non-noindex).
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer
      title="Sitemap Analyzer"
      description="Analyze XML sitemaps for SEO compliance and best practices"
      onAnalyze={handleAnalyze}
      onClear={() => setAnalysis(null)}
      loading={loading}
      error={null}
      results={analysis}
      analyzeButtonText="Analyze Sitemap"
      analyzeButtonDisabled={!xmlContent.trim() || loading}
      inputCardTitle="Sitemap XML"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default SitemapAnalyzer;
