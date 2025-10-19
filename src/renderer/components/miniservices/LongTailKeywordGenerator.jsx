/**
 * Long-tail Keyword Generator - Mini Service Component
 * Generates long-tail keyword suggestions from content
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceContainer from './MiniServiceContainer';
import { scrollToResults } from '../../utils/scrollUtils';

const LongTailKeywordGenerator = () => {
  const [content, setContent] = useState('');
  const [seedKeywords, setSeedKeywords] = useState('');
  const [maxSuggestions, setMaxSuggestions] = useState(20);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIntent, setActiveIntent] = useState('all');

  // Word count validation
  const getWordCount = text => {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  };

  const handleGenerate = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('Please enter content to analyze');
      return;
    }

    const wordCount = getWordCount(trimmedContent);
    if (wordCount < 100) {
      setError(
        `Content must be at least 100 words. Current: ${wordCount} words.`
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const seeds = seedKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k);
      const result = await window.electronAPI.keyword.generateLongTail(
        content,
        seeds,
        maxSuggestions
      );
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err.message || 'Generation failed');
      console.error('Long-tail generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults(null);
    setError(null);
  };

  const getIntentIcon = intent => {
    switch (intent) {
      case 'informational':
        return '📚';
      case 'commercial':
        return '🛍️';
      case 'transactional':
        return '💳';
      case 'navigational':
        return '🧭';
      default:
        return '🔍';
    }
  };

  const getSuggestionsToShow = () => {
    if (!results) return [];
    if (activeIntent === 'all') return results.suggestions;
    return results.byIntent[activeIntent] || [];
  };

  // Render functions
  const renderInputs = () => (
    <>
      <div className="form-group">
        <label htmlFor="content">Content to Analyze</label>
        <textarea
          id="content"
          rows="8"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste your content here (minimum 100 words recommended)..."
          className="form-control"
        />
        <small
          className={`form-help word-count ${getWordCount(content) >= 100 ? 'word-count-valid' : 'word-count-invalid'}`}
        >
          Word count: {getWordCount(content)} / 100 minimum
        </small>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="seedKeywords">Seed Keywords (optional)</label>
          <input
            id="seedKeywords"
            type="text"
            value={seedKeywords}
            onChange={e => setSeedKeywords(e.target.value)}
            placeholder="seo, optimization, keywords..."
            className="form-control"
          />
          <small className="form-help">
            Base keywords to focus the suggestions (leave empty for
            content-based suggestions)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="maxSuggestions">Max Suggestions</label>
          <input
            id="maxSuggestions"
            type="number"
            min="5"
            max="50"
            value={maxSuggestions}
            onChange={e => setMaxSuggestions(parseInt(e.target.value) || 20)}
            className="form-control"
          />
        </div>
      </div>
    </>
  );

  const renderResults = () => (
    <>
      <Card className="summary-card">
        <h3>📊 Generation Summary</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{results.totalPhrases}</div>
            <div className="stat-label">Total Suggestions</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {results.byIntent.informational?.length || 0}
            </div>
            <div className="stat-label">Informational</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {results.byIntent.commercial?.length || 0}
            </div>
            <div className="stat-label">Commercial</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {results.byIntent.transactional?.length || 0}
            </div>
            <div className="stat-label">Transactional</div>
          </div>
        </div>

        {/* Intent filter tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeIntent === 'all' ? 'active' : ''}`}
            onClick={() => setActiveIntent('all')}
          >
            All ({results.totalPhrases})
          </button>
          <button
            className={`filter-tab ${activeIntent === 'informational' ? 'active' : ''}`}
            onClick={() => setActiveIntent('informational')}
          >
            {getIntentIcon('informational')} Informational (
            {results.byIntent.informational?.length || 0})
          </button>
          <button
            className={`filter-tab ${activeIntent === 'commercial' ? 'active' : ''}`}
            onClick={() => setActiveIntent('commercial')}
          >
            {getIntentIcon('commercial')} Commercial (
            {results.byIntent.commercial?.length || 0})
          </button>
          <button
            className={`filter-tab ${activeIntent === 'transactional' ? 'active' : ''}`}
            onClick={() => setActiveIntent('transactional')}
          >
            {getIntentIcon('transactional')} Transactional (
            {results.byIntent.transactional?.length || 0})
          </button>
          <button
            className={`filter-tab ${activeIntent === 'navigational' ? 'active' : ''}`}
            onClick={() => setActiveIntent('navigational')}
          >
            {getIntentIcon('navigational')} Navigational (
            {results.byIntent.navigational?.length || 0})
          </button>
        </div>
      </Card>

      <Card className="results-card">
        <h3>🔑 Long-tail Keyword Suggestions</h3>
        {getSuggestionsToShow().length > 0 ? (
          <div className="longtail-results">
            {getSuggestionsToShow().map((suggestion, index) => (
              <div key={index} className="longtail-item">
                <div className="longtail-rank">#{index + 1}</div>
                <div className="longtail-content">
                  <div className="longtail-phrase">{suggestion.phrase}</div>
                  <div className="longtail-metrics">
                    <span className="metric">
                      <span className="metric-label">Score:</span>
                      <span className="metric-value score-badge">
                        {suggestion.totalScore}
                      </span>
                    </span>
                    <span className="metric">
                      <span className="metric-label">Frequency:</span>
                      <span className="metric-value">
                        {suggestion.frequency}
                      </span>
                    </span>
                    {suggestion.components && (
                      <>
                        <span className="metric">
                          <span className="metric-label">Relevance:</span>
                          <span className="metric-value">
                            {suggestion.components.relevance}
                          </span>
                        </span>
                        <span className="metric">
                          <span className="metric-label">Length:</span>
                          <span className="metric-value">
                            {suggestion.components.length}
                          </span>
                        </span>
                        {suggestion.components.specificity > 0 && (
                          <span className="metric">
                            <span className="metric-label">Specificity:</span>
                            <span className="metric-value">
                              {suggestion.components.specificity}
                            </span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="longtail-score-bar">
                    <div
                      className="score-fill"
                      style={{ width: `${suggestion.totalScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>
              No {activeIntent !== 'all' ? activeIntent : ''} keywords found.
              Try adjusting your content or seed keywords.
            </p>
          </div>
        )}
      </Card>
    </>
  );

  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🎯</div>
        <h3>Long-tail Keywords: The Low-Competition Goldmine</h3>

        <div className="info-section">
          <h4>🔍 What are Long-tail Keywords?</h4>
          <p>
            Long-tail keywords are longer, more specific search phrases
            (typically 3-5 words) that users type when they&apos;re further
            along in the buying cycle or have very specific information needs.
            They represent the &quot;long tail&quot; of search demand.
          </p>
        </div>

        <div className="info-section">
          <h4>💰 Why Long-tail Keywords Convert Better</h4>
          <ul className="benefits-list">
            <li>
              <strong>Lower Competition:</strong> Less websites competing for
              these specific terms
            </li>
            <li>
              <strong>Higher Intent:</strong> Users searching with long-tail
              queries often know exactly what they want
            </li>
            <li>
              <strong>Better Conversion Rates:</strong> More qualified traffic
              that&apos;s ready to take action
            </li>
            <li>
              <strong>Voice Search Friendly:</strong> Aligns with natural,
              conversational search queries
            </li>
            <li>
              <strong>Niche Targeting:</strong> Reach highly specific audience
              segments with precise needs
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>🎯 Search Intent Categories</h4>
          <ul className="info-list">
            <li>
              <strong>Informational:</strong> Educational queries like &quot;how
              to&quot;, &quot;guide&quot;, &quot;tutorial&quot; - users seeking
              knowledge and learning resources
            </li>
            <li>
              <strong>Commercial:</strong> Research-oriented searches like
              &quot;best&quot;, &quot;review&quot;, &quot;vs&quot; - users
              comparing options and gathering information before buying
            </li>
            <li>
              <strong>Transactional:</strong> Purchase-intent queries like
              &quot;buy&quot;, &quot;price&quot;, &quot;cheap&quot; - users
              ready to make a purchase or take action
            </li>
            <li>
              <strong>Navigational:</strong> Brand or site-specific searches
              like &quot;login&quot;, &quot;app&quot;, &quot;software&quot; -
              users looking for a specific website or service
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>🔧 How Long-tail Generation Works</h4>
          <ul className="info-list">
            <li>
              <strong>Content Analysis:</strong> Extracts meaningful phrases
              from your existing content
            </li>
            <li>
              <strong>Seed Keyword Expansion:</strong> Uses your main keywords
              as starting points for expansion
            </li>
            <li>
              <strong>Scoring Algorithm:</strong> Rates suggestions based on
              relevance, frequency, and specificity
            </li>
            <li>
              <strong>Intent Classification:</strong> Automatically categorizes
              keywords by search intent
            </li>
            <li>
              <strong>Quality Filtering:</strong> Ensures suggestions are
              natural and search-friendly
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>💡 Long-tail Optimization Tips</h4>
          <div className="tips-grid">
            <div className="tip-item">
              <strong>Content Depth:</strong> Create comprehensive content that
              naturally incorporates long-tail variations
            </div>
            <div className="tip-item">
              <strong>Question-Based Content:</strong> Answer specific questions
              users are asking in search
            </div>
            <div className="tip-item">
              <strong>Topic Clusters:</strong> Use long-tail keywords to build
              interconnected content ecosystems
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer
      title="🎯 Long-tail Keyword Generator"
      description="Discover long-tail keyword opportunities from your content with search intent classification."
      onAnalyze={handleGenerate}
      onClear={handleClear}
      loading={loading}
      error={error}
      results={results}
      analyzeButtonText="Generate Keywords"
      analyzeButtonDisabled={getWordCount(content) < 100}
      inputCardTitle="Content & Settings"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default LongTailKeywordGenerator;
