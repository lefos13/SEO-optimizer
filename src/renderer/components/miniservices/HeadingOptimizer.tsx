/**
 * Heading Optimizer - Mini Service Component
 * Generates heading optimization suggestions
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceContainer from './MiniServiceContainer';
import { scrollToResults } from '../../utils/scrollUtils';

// Type definitions
interface Score {
  score: number;
  label: string;
}

interface HeadingAnalysis {
  total: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  hasH1: boolean;
  hasProperHierarchy: boolean;
}

interface KeywordUsage {
  totalKeywords: number;
  keywordsInHeadings: number;
  percentage: number;
}

interface LengthAnalysis {
  optimal: number;
  tooLong: number;
  tooShort: number;
}

interface Suggestion {
  title: string;
  message: string;
  category: string;
  type: 'error' | 'warning' | 'info' | 'success';
}

interface HeadingOptimizerResults {
  score: Score;
  analysis: HeadingAnalysis;
  keywordUsage: KeywordUsage;
  lengthAnalysis: LengthAnalysis;
  suggestions: Suggestion[];
}

const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const HeadingOptimizer: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [results, setResults] = useState<HeadingOptimizerResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = getWordCount(content);

  const handleAnalyze = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Please enter content to analyze');
      return;
    }

    if (!window.electronAPI?.content?.optimizeHeadings) {
      setError('Content service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const keywordList = keywords
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
      const result = (await window.electronAPI.content.optimizeHeadings(
        trimmed,
        keywordList
      )) as unknown as HeadingOptimizerResults;
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Heading optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setContent('');
    setKeywords('');
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
        <label htmlFor="heading-content">
          Content to Analyze (HTML or Plain Text)
        </label>
        <textarea
          id="heading-content"
          rows={8}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste your content here..."
          className="form-control"
        />
        <div className="input-meta">
          <span>Words: {wordCount}</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="heading-keywords">
          Target Keywords (comma-separated)
        </label>
        <input
          type="text"
          id="heading-keywords"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="e.g., SEO, content marketing, digital strategy"
          className="form-control"
        />
      </div>
    </>
  );

  const renderResults = () => {
    if (!results) return null;

    return (
      <>
        <Card className="results-card">
          <h3>🎯 Heading Optimization Results</h3>

          {/* Overall Score */}
          <div className="score-section">
            <div className="composite-score">
              <div className="score-details">
                <h4>Heading Optimization Score</h4>
                <p>
                  Your headings are rated as{' '}
                  <span style={{ color: getScoreColor(results.score.score) }}>
                    {results.score.label}
                  </span>
                </p>
              </div>
              <div
                className="score-circle"
                style={{ color: getScoreColor(results.score.score) }}
              >
                <span className="score-value">{results.score.score}</span>
                <span className="score-label">{results.score.label}</span>
              </div>
            </div>
          </div>

          {/* Heading Structure */}
          <div className="analysis-section">
            <h4>📊 Heading Structure</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Total Headings:</span>
                <span className="metric-value">{results.analysis.total}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">H1:</span>
                <span className="metric-value">
                  {results.analysis.h1Count}
                  {results.analysis.hasH1 ? ' ✓' : ' ✗'}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">H2:</span>
                <span className="metric-value">{results.analysis.h2Count}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">H3:</span>
                <span className="metric-value">{results.analysis.h3Count}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Proper Hierarchy:</span>
                <span className="metric-value">
                  {results.analysis.hasProperHierarchy ? 'Yes ✓' : 'No ✗'}
                </span>
              </div>
            </div>
          </div>

          {/* Keyword Usage */}
          {results.keywordUsage && results.keywordUsage.totalKeywords > 0 && (
            <div className="analysis-section">
              <h4>🎯 Keyword Usage in Headings</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">Keywords in Headings:</span>
                  <span className="metric-value">
                    {results.keywordUsage.keywordsInHeadings} /{' '}
                    {results.keywordUsage.totalKeywords}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Coverage:</span>
                  <span className="metric-value">
                    {results.keywordUsage.percentage}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Length Analysis */}
          <div className="analysis-section">
            <h4>📏 Heading Length Analysis</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Optimal Length:</span>
                <span className="metric-value">
                  {results.lengthAnalysis.optimal}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Too Long (&gt;10 words):</span>
                <span className="metric-value">
                  {results.lengthAnalysis.tooLong}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Too Short (&lt;3 words):</span>
                <span className="metric-value">
                  {results.lengthAnalysis.tooShort}
                </span>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {results.suggestions && results.suggestions.length > 0 && (
            <div className="analysis-section">
              <h4>💡 Optimization Suggestions</h4>
              <div className="recommendations-list">
                {results.suggestions.map((sug, idx) => {
                  const getTypeInfo = (
                    type: string
                  ): { icon: string; color: string } => {
                    const types: Record<
                      string,
                      { icon: string; color: string }
                    > = {
                      error: { icon: '❌', color: 'var(--error)' },
                      warning: { icon: '⚠️', color: 'var(--warning)' },
                      info: { icon: 'ℹ️', color: 'var(--info)' },
                      success: { icon: '✅', color: 'var(--success)' },
                    };
                    return (types[type] || types.info) as {
                      icon: string;
                      color: string;
                    };
                  };
                  const typeInfo = getTypeInfo(sug.type);
                  return (
                    <div key={idx} className="recommendation-item">
                      <div
                        className="rec-icon"
                        style={{ color: typeInfo.color }}
                      >
                        {typeInfo.icon}
                      </div>
                      <div className="rec-content">
                        <strong>{sug.title}</strong>
                        <p>{sug.message}</p>
                        <span className="rec-category">{sug.category}</span>
                      </div>
                    </div>
                  );
                })}
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
        <div className="info-icon">📋</div>
        <h3>Heading Optimizer</h3>

        <div className="info-section">
          <h4>What you&apos;ll see</h4>
          <p>
            Suggestions for improving heading hierarchy, length and keyword
            usage.
          </p>
        </div>

        <div className="info-section">
          <h4>Quick Tips</h4>
          <ul className="info-list">
            <li>Use a single H1 and structure H2/H3 logically.</li>
            <li>Keep headings concise (3-10 words) and keyword-focused.</li>
            <li>Avoid skipping heading levels to improve accessibility.</li>
          </ul>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer<HeadingOptimizerResults>
      title="📋 Heading Optimizer"
      description="Optimize your headings for SEO with keyword usage and length analysis."
      onAnalyze={handleAnalyze}
      onClear={handleClear}
      loading={loading}
      error={error}
      results={results}
      analyzeButtonText="Optimize Headings"
      analyzeButtonDisabled={false}
      inputCardTitle="Content & Keywords"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default HeadingOptimizer;
