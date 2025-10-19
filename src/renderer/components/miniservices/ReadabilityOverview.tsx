/**
 * Readability Overview - Mini Service Component
 * Displays composite readability score, formula breakdowns, and content totals
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceContainer from './MiniServiceContainer';
import { scrollToResults } from '../../utils/scrollUtils';

// Type definitions
interface CompositeScore {
  score: number;
  label: string;
  gradeLevel: string;
}

interface Formula {
  id: string;
  label: string;
  score: number;
  normalized: number;
  color: string;
  gradeLevel: string;
  interpretation: string;
}

interface Summary {
  readingTimeMinutes: number;
  wordCount: number;
  language: string;
}

interface Totals {
  words: number;
  sentences: number;
  paragraphs: number;
  averageSentenceLength: number;
  complexWords: number;
  complexWordRatio: number;
}

interface ReadabilityOverviewResults {
  compositeScore: CompositeScore;
  formulas: Formula[];
  summary: Summary;
  totals: Totals;
}

const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const ReadabilityOverview: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [language, setLanguage] = useState<string>('en');
  const [results, setResults] = useState<ReadabilityOverviewResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = getWordCount(content);
  const minWords = language === 'el' ? 40 : 40;

  const handleAnalyze = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Please enter content to analyze');
      return;
    }

    if (!window.electronAPI?.readability?.analyzeOverview) {
      setError('Readability service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.readability.analyzeOverview(
        trimmed,
        {
          language,
        }
      ) as unknown as ReadabilityOverviewResults;
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Readability overview analysis error:', err);
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
    <>
      <div className="form-group">
        <label htmlFor="overview-content">Content to Analyze</label>
        <textarea
          id="overview-content"
          rows={8}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste your content here..."
          className="form-control"
        />
        <small
          className={`form-help word-count ${
            wordCount >= minWords ? 'word-count-valid' : 'word-count-invalid'
          }`}
        >
          Word count: {wordCount} / {minWords} recommended
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="overview-language">Content Language</label>
        <select
          id="overview-language"
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

  const renderResults = () => {
    if (!results) return null;

    return (
      <>
        <Card className="summary-card" title="Composite Score">
          <div className="readability-score">
            <div className="score-value">
              {Math.round(results.compositeScore.score || 0)}
            </div>
            <div className="score-label">{results.compositeScore.label}</div>
            <div className="score-grade">{results.compositeScore.gradeLevel}</div>
            <div className="score-meta">
              ≈ {results.summary.readingTimeMinutes} min •{' '}
              {results.summary.wordCount} words • {results.summary.language}
            </div>
          </div>
        </Card>

        <Card className="results-card" title="Formula Breakdown">
          <div className="formula-list">
            {results.formulas.map(formula => (
              <div key={formula.id} className="formula-item">
                <div className="formula-header">
                  <div className="formula-name">{formula.label}</div>
                  <div className="formula-score">{formula.score}</div>
                </div>
                <div className="formula-bar">
                  <div
                    className="formula-progress"
                    style={{
                      width: `${Math.min(Math.max(formula.normalized, 0), 100)}%`,
                      backgroundColor: formula.color,
                    }}
                  />
                </div>
                <div className="formula-meta">
                  <span>{formula.gradeLevel}</span>
                  <span>{formula.interpretation}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="results-card" title="Content Totals">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{results.totals.words}</div>
              <div className="stat-label">Words</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{results.totals.sentences}</div>
              <div className="stat-label">Sentences</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{results.totals.paragraphs}</div>
              <div className="stat-label">Paragraphs</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {results.totals.averageSentenceLength}
              </div>
              <div className="stat-label">Avg Sentence Length</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{results.totals.complexWords}</div>
              <div className="stat-label">Complex Words</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {(results.totals.complexWordRatio * 100).toFixed(1)}%
              </div>
              <div className="stat-label">Complex Word Ratio</div>
            </div>
          </div>
        </Card>
      </>
    );
  };

  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">📊</div>
        <h3>Readability Overview</h3>

        <div className="info-section">
          <h4>What You&apos;ll See</h4>
          <p>
            A comprehensive readability assessment powered by six
            industry-standard formulas: Flesch Reading Ease, Flesch-Kincaid,
            Gunning Fog, SMOG, Coleman-Liau, and Automated Readability Index.
          </p>
        </div>

        <div className="info-section">
          <h4>📈 Composite Score</h4>
          <p>
            Combines the Flesch Reading Ease (60% weight) with an average of
            grade-level metrics (40% weight) to produce a single, balanced
            readability score.
          </p>
        </div>

        <div className="info-section">
          <h4>💡 Key Metrics</h4>
          <ul className="info-list">
            <li>
              <strong>Total Words:</strong> Word count of your content
            </li>
            <li>
              <strong>Sentence Count:</strong> Number of sentences
            </li>
            <li>
              <strong>Paragraph Count:</strong> Number of paragraphs
            </li>
            <li>
              <strong>Complex Words:</strong> Words with 3+ syllables
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer<ReadabilityOverviewResults>
      title="📊 Readability Overview"
      description="Get a comprehensive readability score using multiple formulas and content totals."
      onAnalyze={handleAnalyze}
      onClear={handleClear}
      loading={loading}
      error={error}
      results={results}
      analyzeButtonText="Analyze Readability"
      analyzeButtonDisabled={false}
      inputCardTitle="Content & Settings"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default ReadabilityOverview;
