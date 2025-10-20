/**
 * Sitemap Analyzer Component
 * Analyzes XML sitemaps for SEO compliance
 */
import React, { useState } from 'react';
import MiniServiceWrapper from './MiniServiceWrapper';
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

  return (
    <MiniServiceWrapper
      title="Sitemap Analyzer"
      description="Analyze XML sitemaps for SEO compliance and best practices"
    >
      <div className="input-section">
        <div className="form-group">
          <label>Paste your sitemap.xml content</label>
          <textarea
            className="form-control"
            rows={10}
            placeholder="<?xml version='1.0'?><urlset>..."
            value={xmlContent}
            onChange={e => setXmlContent(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAnalyze}
          disabled={!xmlContent.trim() || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Sitemap'}
        </button>
      </div>

      {analysis && (
        <div className="results-section">
          <div className="score-card">
            <div className="score-badge">{analysis.score}</div>
            <div>Total URLs: {analysis.urlCount}</div>
            <div>Status: {analysis.isValid ? '✓ Valid' : '✗ Invalid'}</div>
          </div>

          {analysis.issues.length > 0 && (
            <div className="issues-card">
              <h4>Issues ({analysis.issues.length})</h4>
              {analysis.issues.map((issue, idx) => (
                <div key={idx} className="issue-item">
                  <span className={`badge badge-${issue.type}`}>
                    {issue.impact}
                  </span>
                  {issue.message}
                </div>
              ))}
            </div>
          )}

          {analysis.recommendations.length > 0 && (
            <div className="recommendations-card">
              <h4>Recommendations</h4>
              {analysis.recommendations.map((rec, idx) => (
                <div key={idx} className="recommendation-item">
                  <strong>{rec.category}:</strong> {rec.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </MiniServiceWrapper>
  );
};

export default SitemapAnalyzer;
