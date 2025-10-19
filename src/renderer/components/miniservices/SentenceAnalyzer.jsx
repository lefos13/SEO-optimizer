/**
 * Sentence Analyzer - Mini Service Component
 * Analyzes sentence and paragraph structure with detailed metrics
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceContainer from './MiniServiceContainer';
import { scrollToResults } from '../../utils/scrollUtils';

const getWordCount = text => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const SentenceAnalyzer = () => {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('en');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const wordCount = getWordCount(content);

  const handleAnalyze = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Please enter content to analyze');
      return;
    }

    if (!window.electronAPI?.readability?.analyzeStructure) {
      setError('Readability service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.readability.analyzeStructure(
        trimmed,
        {
          language,
        }
      );
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err.message || 'Analysis failed');
      console.error('Structure analysis error:', err);
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
        <label htmlFor="sentence-content">Content to Analyze</label>
        <textarea
          id="sentence-content"
          rows="8"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste your content here..."
          className="form-control"
        />
        <small className="form-help">Word count: {wordCount} words</small>
      </div>

      <div className="form-group">
        <label htmlFor="sentence-language">Content Language</label>
        <select
          id="sentence-language"
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

  const renderResults = () => (
    <>
      <Card className="results-card" title="Sentence Insights">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">
              {results.structure.sentences.count}
            </div>
            <div className="stat-label">Total Sentences</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {results.structure.sentences.averageLength}
            </div>
            <div className="stat-label">Avg Length</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {results.structure.sentences.medianLength}
            </div>
            <div className="stat-label">Median Length</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {results.structure.sentences.longSentences.length}
            </div>
            <div className="stat-label">Long Sentences</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {results.structure.sentences.shortSentences.length}
            </div>
            <div className="stat-label">Short Sentences</div>
          </div>
        </div>

        <div className="distribution-grid">
          {results.structure.sentences.distribution.map(bucket => (
            <div key={bucket.range} className="distribution-item">
              <div className="distribution-range">{bucket.range} words</div>
              <div className="distribution-count">{bucket.count}</div>
            </div>
          ))}
        </div>

        {results.structure.sentences.longestSentence && (
          <div className="structure-highlight">
            <h4>
              Longest Sentence (
              {results.structure.sentences.longestSentence.length} words)
            </h4>
            <p>{results.structure.sentences.longestSentence.text}</p>
          </div>
        )}
      </Card>

      <Card className="results-card" title="Paragraph Insights">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">
              {results.structure.paragraphs.count}
            </div>
            <div className="stat-label">Total Paragraphs</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {results.structure.paragraphs.averageWords}
            </div>
            <div className="stat-label">Avg Words</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {results.structure.paragraphs.averageSentences}
            </div>
            <div className="stat-label">Avg Sentences</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {results.structure.paragraphs.longParagraphs.length}
            </div>
            <div className="stat-label">Long Paragraphs</div>
          </div>
        </div>

        <div className="distribution-grid">
          {results.structure.paragraphs.distribution.map(bucket => (
            <div key={bucket.range} className="distribution-item">
              <div className="distribution-range">{bucket.range}</div>
              <div className="distribution-count">{bucket.count}</div>
            </div>
          ))}
        </div>

        <div className="paragraph-list">
          {results.structure.paragraphs.items.slice(0, 4).map(item => (
            <div key={item.index} className="paragraph-item">
              <div className="paragraph-meta">
                <span className="paragraph-index">Paragraph {item.index}</span>
                <span className="paragraph-score">{item.readingEase}</span>
              </div>
              <div className="paragraph-details">
                <span>{item.words} words</span>
                <span>{item.sentences} sentences</span>
                <span>{item.label}</span>
              </div>
              <p>{item.text.substring(0, 150)}...</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );

  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🧱</div>
        <h3>Sentence & Paragraph Structure</h3>

        <div className="info-section">
          <h4>📏 Sentence Analysis</h4>
          <p>
            Understand how your sentences vary in length. Longer sentences (20+
            words) can fatigue readers, while very short sentences may seem
            choppy. A mix of lengths creates engaging rhythm.
          </p>
        </div>

        <div className="info-section">
          <h4>🏗️ Paragraph Pacing</h4>
          <p>
            Longer paragraphs (120+ words) can overwhelm readers. Breaking
            content into focused sections of 40–120 words improves scannability
            and engagement.
          </p>
        </div>

        <div className="info-section">
          <h4>✨ Best Practices</h4>
          <ul className="info-list">
            <li>Mix short (5–10 words) and medium (15–20 words) sentences</li>
            <li>Keep paragraphs under 120 words for web content</li>
            <li>Use one main idea per paragraph</li>
            <li>Start paragraphs with strong topic sentences</li>
          </ul>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer
      title="🧱 Sentence & Paragraph Analyzer"
      description="Examine sentence lengths, pacing, and paragraph structure for optimal readability."
      onAnalyze={handleAnalyze}
      onClear={handleClear}
      loading={loading}
      error={error}
      results={results}
      analyzeButtonText="Analyze Structure"
      analyzeButtonDisabled={false}
      inputCardTitle="Content & Settings"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default SentenceAnalyzer;
