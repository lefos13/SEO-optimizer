/**
 * Readability Improvements - Mini Service Component
 * Provides actionable suggestions for improving readability
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceWrapper from './MiniServiceWrapper';

const getWordCount = text => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const ReadabilityImprovements = () => {
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

    if (!window.electronAPI?.readability?.analyzeImprovements) {
      setError('Readability service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.readability.analyzeImprovements(
        trimmed,
        {
          language,
        }
      );
      setResults(result);
    } catch (err) {
      setError(err.message || 'Analysis failed');
      console.error('Improvements analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults(null);
    setError(null);
  };

  return (
    <MiniServiceWrapper
      title="💡 Readability Improvements"
      description="Get specific, actionable suggestions to enhance your content readability."
    >
      <Card className="input-card">
        <h3>Content & Settings</h3>

        <div className="form-group">
          <label htmlFor="improve-content">Content to Analyze</label>
          <textarea
            id="improve-content"
            rows="8"
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

        <div className="button-group">
          <button
            onClick={handleAnalyze}
            disabled={loading || !content.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Analyzing...' : 'Get Suggestions'}
          </button>

          {results && (
            <button onClick={handleClear} className="btn btn-secondary">
              Clear Results
            </button>
          )}
        </div>
      </Card>

      <div className="results-container">
        {results && (
          <Card
            className="recommendations-card"
            title="Improvement Suggestions"
          >
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

        {!results && !error && (
          <Card className="info-card">
            <div className="info-content">
              <div className="info-icon">💡</div>
              <h3>Readability Improvement Tips</h3>

              <div className="info-section">
                <h4>🎯 What Are Suggestions?</h4>
                <p>
                  After analyzing your content, this tool provides specific,
                  actionable recommendations to make your writing more
                  accessible and engaging. Each suggestion addresses a distinct
                  readability challenge.
                </p>
              </div>

              <div className="info-section">
                <h4>✅ Success Tips</h4>
                <ul className="info-list">
                  <li>
                    Your readability score is strong—maintain current standards
                  </li>
                  <li>No major adjustments needed; continue best practices</li>
                </ul>
              </div>

              <div className="info-section">
                <h4>⚠️ Common Warnings</h4>
                <ul className="info-list">
                  <li>
                    <strong>Long Sentences:</strong> Break them into smaller
                    units
                  </li>
                  <li>
                    <strong>Complex Vocabulary:</strong> Replace with simpler
                    alternatives
                  </li>
                  <li>
                    <strong>Long Paragraphs:</strong> Divide into focused
                    sections
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
                    <strong>Shorten:</strong> Aim for 15–20 word sentences on
                    average
                  </div>
                  <div className="tip-item">
                    <strong>Simplify:</strong> Use common words your audience
                    knows
                  </div>
                  <div className="tip-item">
                    <strong>Chunk:</strong> Break long paragraphs into 3–4
                    sentence blocks
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MiniServiceWrapper>
  );
};

export default ReadabilityImprovements;
