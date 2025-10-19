/**
 * Readability Improvements - Mini Service Component
 * Provides actionable suggestions for improving readability
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceContainer from './MiniServiceContainer';
import { scrollToResults } from '../../utils/scrollUtils';

interface CompositeScore {
  score: number;
  label: string;
}

interface Totals {
  words: number | { length: number };
  sentences: number | { length: number };
  paragraphs: number | { length: number };
  averageSentenceLength: number | { length: number };
  complexWordRatio: number | { length: number };
}

interface SentenceAnalysis {
  longSentences?: unknown[];
}

interface ParagraphAnalysis {
  longParagraphs?: unknown[];
}

interface Structure {
  sentences?: SentenceAnalysis;
  paragraphs?: ParagraphAnalysis;
}

interface Recommendation {
  title: string;
  message: string;
  type: 'success' | 'warning' | 'critical';
}

interface ReadabilityImprovementResults {
  compositeScore?: CompositeScore;
  totals?: Totals;
  structure?: Structure;
  recommendations?: Recommendation[];
}

const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const ReadabilityImprovements: React.FC = () => {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('en');
  const [results, setResults] = useState<ReadabilityImprovementResults | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = getWordCount(content);

  const handleAnalyze = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Please enter content to analyze');
      return;
    }

    if (!window.electronAPI?.readability?.analyzeImprovements) {
      setError('Readability service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = (await window.electronAPI.readability.analyzeImprovements(
        trimmed,
        {
          language,
        }
      )) as unknown as ReadabilityImprovementResults;
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Improvements analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setContent('');
    setResults(null);
    setError(null);
    setLoading(false);
  };

  // Render functions
  const renderInputs = () => (
    <>
      <div className="form-group">
        <label htmlFor="improve-content">Content to Analyze</label>
        <textarea
          id="improve-content"
          rows={8}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste your content here..."
          className="form-control"
        />
        <small className="form-help">Word count: {wordCount} words</small>
      </div>

      <div className="form-group">
        <label htmlFor="improve-language">Content Language</label>
        <select
          id="improve-language"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="form-control"
        >
          <option value="en">English</option>
          <option value="el">Greek</option>
        </select>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}
    </>
  );

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const getMetricValue = (
    value: number | { length: number } | undefined
  ): number => {
    if (value === undefined) return 0;
    if (typeof value === 'object' && 'length' in value) {
      return value.length || 0;
    }
    return value || 0;
  };

  const renderResults = () => (
    <>
      {/* Composite Score */}
      {results?.compositeScore && (
        <Card className="score-card">
          <div className="score-section">
            <div className="composite-score">
              <div
                className="score-circle"
                style={{
                  color: getScoreColor(results.compositeScore.score),
                  boxShadow: `0 0 15px ${getScoreColor(results.compositeScore.score)}40`,
                  background: `linear-gradient(135deg, ${getScoreColor(results.compositeScore.score)}10, ${getScoreColor(results.compositeScore.score)}30)`,
                }}
              >
                <span className="score-value">
                  {Math.round(results.compositeScore.score || 0)}
                </span>
                <span className="score-label">
                  {results.compositeScore.label}
                </span>
              </div>
              <div className="score-details">
                <h4>Readability Score</h4>
                <p>
                  Your content readability is rated as{' '}
                  <strong>{results.compositeScore.label}</strong>
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Content Totals */}
      {results?.totals && (
        <Card className="totals-card">
          <h3>📊 Content Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Word Count:</span>
              <span className="metric-value">
                {getMetricValue(results.totals.words)}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Sentences:</span>
              <span className="metric-value">
                {getMetricValue(results.totals.sentences)}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Paragraphs:</span>
              <span className="metric-value">
                {getMetricValue(results.totals.paragraphs)}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Avg Sentence Length:</span>
              <span className="metric-value">
                {getMetricValue(results.totals.averageSentenceLength)}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Complex Word Ratio:</span>
              <span className="metric-value">
                {typeof results.totals.complexWordRatio === 'number'
                  ? `${(results.totals.complexWordRatio * 100).toFixed(1)}%`
                  : typeof results.totals.complexWordRatio === 'object'
                    ? `${(getMetricValue(results.totals.complexWordRatio) * 100).toFixed(1)}%`
                    : 'N/A'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Structure Analysis */}
      {results?.structure && (
        <Card className="structure-card">
          <h3>🏗️ Structure Analysis</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Long Sentences:</span>
              <span className="metric-value">
                {Array.isArray(results.structure.sentences?.longSentences)
                  ? results.structure.sentences.longSentences.length
                  : 0}
              </span>
              <div className="metric-status">
                {Array.isArray(results.structure.sentences?.longSentences) &&
                results.structure.sentences.longSentences.length > 0
                  ? 'Consider breaking these up'
                  : 'Well balanced'}
              </div>
            </div>
            <div className="metric-item">
              <span className="metric-label">Long Paragraphs:</span>
              <span className="metric-value">
                {Array.isArray(results.structure.paragraphs?.longParagraphs)
                  ? results.structure.paragraphs.longParagraphs.length
                  : 0}
              </span>
              <div className="metric-status">
                {Array.isArray(results.structure.paragraphs?.longParagraphs) &&
                results.structure.paragraphs.longParagraphs.length > 0
                  ? 'Consider dividing into sections'
                  : 'Well segmented'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {results?.recommendations && Array.isArray(results.recommendations) && (
        <Card className="recommendations-card" title="Improvement Suggestions">
          <div className="recommendations-list">
            {results.recommendations.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className={`recommendation-item ${item.type}`}
              >
                <div className="recommendation-icon">
                  {item.type === 'success' && '✅'}
                  {item.type === 'warning' && '⚠️'}
                  {item.type === 'critical' && '❌'}
                </div>
                <div className="recommendation-content">
                  <div className="recommendation-keyword">{item.title}</div>
                  <div className="recommendation-message">{item.message}</div>
                </div>
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
        <div className="info-icon">💡</div>
        <h3>Readability Improvement Tips</h3>

        <div className="info-section">
          <h4>🎯 What Are Suggestions?</h4>
          <p>
            After analyzing your content, this tool provides specific,
            actionable recommendations to make your writing more accessible and
            engaging. Each suggestion addresses a distinct readability
            challenge.
          </p>
        </div>

        <div className="info-section">
          <h4>✅ Success Tips</h4>
          <ul className="info-list">
            <li>Your readability score is strong—maintain current standards</li>
            <li>No major adjustments needed; continue best practices</li>
          </ul>
        </div>

        <div className="info-section">
          <h4>⚠️ Common Warnings</h4>
          <ul className="info-list">
            <li>
              <strong>Long Sentences:</strong> Break them into smaller units
            </li>
            <li>
              <strong>Complex Vocabulary:</strong> Replace with simpler
              alternatives
            </li>
            <li>
              <strong>Long Paragraphs:</strong> Divide into focused sections
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>❌ Critical Issues</h4>
          <ul className="info-list">
            <li>Very low readability scores (below 30)</li>
            <li>Pervasive use of overly technical or archaic language</li>
            <li>Very long, run-on sentences that obscure meaning</li>
          </ul>
        </div>

        <div className="info-section">
          <h4>🔧 Quick Actions</h4>
          <div className="tips-grid">
            <div className="tip-item">
              <strong>Shorten:</strong> Aim for 15–20 word sentences on average
            </div>
            <div className="tip-item">
              <strong>Simplify:</strong> Use common words your audience knows
            </div>
            <div className="tip-item">
              <strong>Chunk:</strong> Break long paragraphs into 3–4 sentence
              blocks
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer
      title="💡 Readability Improvements"
      description="Get specific, actionable suggestions to enhance your content readability."
      onAnalyze={handleAnalyze}
      onClear={handleClear}
      loading={loading}
      error={error}
      results={results}
      analyzeButtonText="Get Suggestions"
      analyzeButtonDisabled={false}
      inputCardTitle="Content & Settings"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default ReadabilityImprovements;
