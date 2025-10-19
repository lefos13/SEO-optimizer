/**
 * LSI Keyword Generator - Mini Service Component
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceContainer from './MiniServiceContainer';
import { scrollToResults } from '../../utils/scrollUtils';

interface LSISummary {
  phrases: number;
  words: number;
  avgLSIScore: number;
}

interface LSIKeyword {
  keyword: string;
  type: 'phrase' | 'word';
  lsiScore: number;
  frequency: number;
  relevance: number;
}

interface LSIResults {
  totalSuggestions: number;
  summary: LSISummary;
  lsiKeywords: LSIKeyword[];
}

const LSIKeywordGenerator: React.FC = () => {
  const [content, setContent] = useState('');
  const [mainKeywords, setMainKeywords] = useState('');
  const [maxSuggestions, setMaxSuggestions] = useState(15);
  const [results, setResults] = useState<LSIResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError('Please enter content to analyze');
      return;
    }

    if (content.trim().length < 200) {
      setError(
        'Content must be at least 200 characters long for LSI keyword generation. Current length: ' +
          content.trim().length
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const keywords = mainKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k);
      const result = (await window.electronAPI.keyword.generateLSI(
        content,
        keywords,
        maxSuggestions
      )) as unknown as LSIResults;
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'LSI generation failed');
      console.error('LSI generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setContent('');
    setMainKeywords('');
    setMaxSuggestions(15);
    setResults(null);
    setError(null);
    setLoading(false);
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
          placeholder="Paste your content here (minimum 200 characters required)..."
          className="form-control"
        />
        <small
          className={`form-help ${content.trim().length < 200 ? 'form-help-warning' : 'form-help-success'}`}
        >
          {content.trim().length < 200
            ? `Minimum 200 characters required. Current: ${content.trim().length} characters`
            : `${content.trim().length} characters - Ready for analysis`}
        </small>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="mainKeywords">Main Keywords</label>
          <input
            id="mainKeywords"
            type="text"
            value={mainKeywords}
            onChange={e => setMainKeywords(e.target.value)}
            placeholder="seo, optimization, ranking..."
            className="form-control"
          />
          <small className="form-help">Your primary target keywords</small>
        </div>

        <div className="form-group">
          <label htmlFor="maxSuggestions">Max Suggestions</label>
          <input
            id="maxSuggestions"
            type="number"
            min={5}
            max={30}
            value={maxSuggestions}
            onChange={e => setMaxSuggestions(parseInt(e.target.value) || 15)}
            className="form-control"
          />
        </div>
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
      <Card className="summary-card">
        <h3>📊 LSI Summary</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{results?.totalSuggestions}</div>
            <div className="stat-label">LSI Keywords</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{results?.summary.phrases}</div>
            <div className="stat-label">Phrases</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{results?.summary.words}</div>
            <div className="stat-label">Single Words</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {Math.round(results?.summary.avgLSIScore || 0)}
            </div>
            <div className="stat-label">Avg LSI Score</div>
          </div>
        </div>
      </Card>

      <Card className="results-card">
        <h3>🔑 LSI Keywords</h3>
        <p className="card-description">
          These semantically related terms can help search engines better
          understand your content topic.
        </p>
        <div className="lsi-results">
          {results?.lsiKeywords.map((lsi, index) => (
            <div key={index} className="lsi-item">
              <div className="lsi-rank">#{index + 1}</div>
              <div className="lsi-content">
                <div className="lsi-keyword">
                  {lsi.keyword}
                  <span className={`lsi-type-badge ${lsi.type}`}>
                    {lsi.type}
                  </span>
                </div>
                <div className="lsi-metrics">
                  <span className="metric">
                    <span className="metric-label">LSI Score:</span>
                    <span className="metric-value score-badge">
                      {lsi.lsiScore}
                    </span>
                  </span>
                  <span className="metric">
                    <span className="metric-label">Frequency:</span>
                    <span className="metric-value">{lsi.frequency}</span>
                  </span>
                  <span className="metric">
                    <span className="metric-label">Relevance:</span>
                    <span className="metric-value">{lsi.relevance}</span>
                  </span>
                </div>
                <div className="lsi-score-bar">
                  <div
                    className="score-fill"
                    style={{ width: `${lsi.lsiScore}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );

  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🧠</div>
        <h3>LSI Keywords: The Secret to Semantic SEO</h3>

        <div className="info-section">
          <h4>🧠 What are LSI Keywords?</h4>
          <p>
            Latent Semantic Indexing (LSI) keywords are terms and phrases that
            are semantically related to your main topic. They help search
            engines understand the context and depth of your content beyond just
            exact-match keywords.
          </p>
        </div>

        <div className="info-section">
          <h4>🎯 Why LSI Keywords Matter</h4>
          <ul className="benefits-list">
            <li>
              <strong>Enhanced Relevance:</strong> Demonstrate comprehensive
              topic coverage to search engines
            </li>
            <li>
              <strong>Improved Rankings:</strong> Help your content rank for a
              broader range of related searches
            </li>
            <li>
              <strong>Better User Experience:</strong> Create more informative,
              valuable content for readers
            </li>
            <li>
              <strong>Content Depth:</strong> Show expertise by covering related
              concepts and terminology
            </li>
            <li>
              <strong>Internal Linking:</strong> Natural opportunities to link
              between related content pieces
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>🔍 How LSI Analysis Works</h4>
          <ul className="info-list">
            <li>
              <strong>Content Parsing:</strong> Analyzes your text to identify
              meaningful terms and concepts
            </li>
            <li>
              <strong>Co-occurrence Detection:</strong> Finds words that
              frequently appear together with your main keywords
            </li>
            <li>
              <strong>Relevance Scoring:</strong> Rates LSI terms based on their
              contextual relationship to your topic
            </li>
            <li>
              <strong>Frequency Analysis:</strong> Considers how often terms
              appear to determine importance
            </li>
            <li>
              <strong>Type Classification:</strong> Distinguishes between
              phrases and single words for different applications
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>💡 LSI Implementation Strategies</h4>
          <div className="tips-grid">
            <div className="tip-item">
              <strong>Strategic Placement:</strong> Include LSI keywords in
              headings, subheadings, and throughout the content body
            </div>
            <div className="tip-item">
              <strong>Content Expansion:</strong> Use LSI terms to identify
              topics for additional content creation
            </div>
            <div className="tip-item">
              <strong>Voice Search Optimization:</strong> LSI keywords often
              align with natural language queries
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer
      title="🧠 LSI Keyword Generator"
      description="Discover semantically related keywords to enrich your content and improve topical relevance."
      onAnalyze={handleGenerate}
      onClear={handleClear}
      loading={loading}
      error={error}
      results={results}
      analyzeButtonText="Generate LSI Keywords"
      analyzeButtonDisabled={false}
      inputCardTitle="Content & Main Keywords"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default LSIKeywordGenerator;
