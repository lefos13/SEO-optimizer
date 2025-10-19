/**
 * Content Structure Analyzer - Mini Service Component
 * Analyzes content structure with actionable insights
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceContainer from './MiniServiceContainer';
import { scrollToResults } from '../../utils/scrollUtils';

interface Score {
  score: number;
  label: string;
}

interface Headings {
  total: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  hasH1: boolean;
  hasH2: boolean;
  hasProperHierarchy: boolean;
  hierarchyIssues: string[];
}

interface Paragraphs {
  count: number;
  avgLength: number;
  shortParagraphs: number;
  mediumParagraphs: number;
  longParagraphs: number;
}

interface Lists {
  totalLists: number;
  unorderedLists: number;
  orderedLists: number;
  totalListItems: number;
  avgItemsPerList: number;
}

interface Media {
  totalMedia: number;
  images: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  videos: number;
  embeds: number;
}

interface Recommendation {
  title: string;
  message: string;
  category: string;
  type: 'error' | 'warning' | 'info' | 'success';
}

interface ContentStructureResults {
  score: Score;
  headings: Headings;
  paragraphs: Paragraphs;
  lists: Lists;
  media: Media;
  recommendations: Recommendation[];
}

const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const ContentStructureAnalyzer: React.FC = () => {
  const [content, setContent] = useState('');
  const [results, setResults] = useState<ContentStructureResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = getWordCount(content);

  const handleAnalyze = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Please enter content to analyze');
      return;
    }

    if (!window.electronAPI?.content?.analyzeStructure) {
      setError('Content service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = (await window.electronAPI.content.analyzeStructure(
        trimmed
      )) as unknown as ContentStructureResults;
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Content structure analysis error:', err);
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

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const getRecommendationType = (
    type: string
  ): { icon: string; color: string } => {
    const types: Record<string, { icon: string; color: string }> = {
      error: { icon: '❌', color: 'var(--error)' },
      warning: { icon: '⚠️', color: 'var(--warning)' },
      info: { icon: 'ℹ️', color: 'var(--info)' },
      success: { icon: '✅', color: 'var(--success)' },
    };
    return (types[type] || types.info) as { icon: string; color: string };
  };

  // Render functions
  const renderInputs = () => (
    <>
      <div className="form-group">
        <label htmlFor="structure-content">
          Content to Analyze (HTML or Plain Text)
        </label>
        <textarea
          id="structure-content"
          rows={10}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste your content here..."
          className="form-control"
        />
        <div className="input-meta">
          <span>Words: {wordCount}</span>
        </div>
      </div>
    </>
  );

  const renderResults = () => (
    <>
      <Card className="results-card animate-card content-structure-results">
        <div className="card-header">
          <h3>📊 Structure Analysis Results</h3>
        </div>

        {/* Overall Score */}
        <div className="score-section">
          <div className="composite-score">
            <div
              className="score-circle"
              style={{
                color: getScoreColor(results?.score.score || 0),
                boxShadow: `0 0 15px ${getScoreColor(results?.score.score || 0)}40`,
                background: `linear-gradient(135deg, ${getScoreColor(results?.score.score || 0)}10, ${getScoreColor(results?.score.score || 0)}30)`,
              }}
            >
              <span className="score-value">{results?.score.score}</span>
              <span className="score-label">{results?.score.label}</span>
            </div>
            <div className="score-details">
              <h4>Overall Structure Score</h4>
              <p>
                Your content structure is rated as{' '}
                <strong>{results?.score.label}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Headings Analysis */}
        <div className="analysis-section">
          <div className="section-header">
            <h4>📋 Headings Structure</h4>
          </div>
          <div className="metrics-grid seo-impact-grid">
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Total Headings</span>
                <span
                  className={`metric-score ${(results?.headings.total || 0) > 0 ? 'score-good' : 'score-poor'}`}
                >
                  {results?.headings.total}
                </span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">H1 Count</span>
                <span
                  className={`metric-score ${results?.headings.hasH1 ? 'score-good' : 'score-poor'}`}
                >
                  {results?.headings.h1Count}
                  {results?.headings.hasH1 ? ' ✓' : ' ✗'}
                </span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">H2 Count</span>
                <span
                  className={`metric-score ${results?.headings.hasH2 ? 'score-good' : 'score-poor'}`}
                >
                  {results?.headings.h2Count}
                  {results?.headings.hasH2 ? ' ✓' : ' ✗'}
                </span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">H3 Count</span>
                <span className="metric-score">
                  {results?.headings.h3Count}
                </span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Proper Hierarchy</span>
                <span
                  className={`metric-score ${results?.headings.hasProperHierarchy ? 'score-good' : 'score-poor'}`}
                >
                  {results?.headings.hasProperHierarchy ? 'Yes ✓' : 'No ✗'}
                </span>
              </div>
            </div>
          </div>

          {results && results.headings.hierarchyIssues.length > 0 && (
            <div className="issues-list">
              <strong>Issues:</strong>
              <ul className="issue-items">
                {results.headings.hierarchyIssues.map((issue, idx) => (
                  <li key={idx} className="issue-item severity-high">
                    <div className="issue-header">
                      <span className="severity-badge high">Attention</span>
                      <span className="issue-category">Heading Hierarchy</span>
                    </div>
                    <div className="issue-finding">{issue}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Paragraphs Analysis */}
        <div className="analysis-section">
          <div className="section-header">
            <h4>📝 Paragraph Structure</h4>
          </div>
          <div className="metrics-grid seo-impact-grid">
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Total Paragraphs</span>
                <span className="metric-score">
                  {results?.paragraphs.count}
                </span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Average Length</span>
                <span
                  className={`metric-score ${(results?.paragraphs.avgLength || 0) < 200 ? 'score-good' : 'score-average'}`}
                >
                  {results?.paragraphs.avgLength} words
                </span>
              </div>
              <div className="metric-status">
                {(results?.paragraphs.avgLength || 0) < 50
                  ? 'Very Short'
                  : (results?.paragraphs.avgLength || 0) < 100
                    ? 'Good Length'
                    : (results?.paragraphs.avgLength || 0) < 150
                      ? 'Moderate Length'
                      : 'Long Paragraphs'}
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Short Paragraphs</span>
                <span className="metric-score">
                  {results?.paragraphs.shortParagraphs}
                </span>
              </div>
              <div className="metric-reason">
                &lt;50 words - Great for readability
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Medium Paragraphs</span>
                <span className="metric-score">
                  {results?.paragraphs.mediumParagraphs}
                </span>
              </div>
              <div className="metric-reason">50-150 words - Good balance</div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Long Paragraphs</span>
                <span
                  className={`metric-score ${(results?.paragraphs.longParagraphs || 0) > 2 ? 'score-average' : 'score-good'}`}
                >
                  {results?.paragraphs.longParagraphs}
                </span>
              </div>
              <div className="metric-reason">
                &gt;150 words - May need breaking up
              </div>
            </div>
          </div>
        </div>

        {/* Lists Analysis */}
        <div className="analysis-section">
          <div className="section-header">
            <h4>📄 Lists & Formatting</h4>
          </div>
          <div className="metrics-grid seo-impact-grid">
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Total Lists</span>
                <span
                  className={`metric-score ${(results?.lists.totalLists || 0) > 0 ? 'score-good' : 'score-average'}`}
                >
                  {results?.lists.totalLists}
                </span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Unordered Lists</span>
                <span className="metric-score">
                  {results?.lists.unorderedLists}
                </span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Ordered Lists</span>
                <span className="metric-score">
                  {results?.lists.orderedLists}
                </span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">List Items</span>
                <span className="metric-score">
                  {results?.lists.totalListItems}
                </span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Avg Items/List</span>
                <span
                  className={`metric-score ${(results?.lists.avgItemsPerList || 0) >= 3 && (results?.lists.avgItemsPerList || 0) <= 7 ? 'score-good' : 'score-average'}`}
                >
                  {results?.lists.avgItemsPerList}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Media Analysis */}
        <div className="analysis-section">
          <div className="section-header">
            <h4>🖼️ Media Elements</h4>
          </div>
          <div className="metrics-grid seo-impact-grid">
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Total Media</span>
                <span
                  className={`metric-score ${(results?.media.totalMedia || 0) > 0 ? 'score-good' : 'score-average'}`}
                >
                  {results?.media.totalMedia}
                </span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Images</span>
                <span className="metric-score">{results?.media.images}</span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Images with Alt</span>
                <span
                  className={`metric-score ${(results?.media.images || 0) > 0 && results?.media.imagesWithAlt === results?.media.images ? 'score-good' : 'score-average'}`}
                >
                  {results?.media.imagesWithAlt}
                </span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Images without Alt</span>
                <span
                  className={`metric-score ${(results?.media.imagesWithoutAlt || 0) === 0 ? 'score-good' : 'score-poor'}`}
                >
                  {results?.media.imagesWithoutAlt}
                </span>
              </div>
              {(results?.media.imagesWithoutAlt || 0) > 0 && (
                <div className="metric-reason">
                  Missing alt text affects accessibility and SEO
                </div>
              )}
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Videos</span>
                <span className="metric-score">{results?.media.videos}</span>
              </div>
            </div>
            <div className="metric-item seo-metric">
              <div className="metric-header">
                <span className="metric-label">Embeds</span>
                <span className="metric-score">{results?.media.embeds}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="analysis-section">
          <div className="section-header">
            <h4>💡 Recommendations</h4>
          </div>
          <div className="advice-list">
            {results?.recommendations.map((rec, idx) => {
              const typeInfo = getRecommendationType(rec.type);
              const priorityClass =
                rec.type === 'error'
                  ? 'priority-high'
                  : rec.type === 'warning'
                    ? 'priority-medium'
                    : rec.type === 'success'
                      ? 'priority-low'
                      : 'priority-medium';

              return (
                <div key={idx} className={`advice-item ${priorityClass}`}>
                  <div className="advice-header">
                    <span className="priority-badge">{typeInfo.icon}</span>
                    <span className="advice-rule">{rec.title}</span>
                  </div>
                  <div className="advice-reason">{rec.message}</div>
                  <div className="advice-seo-impact">
                    <strong>Category:</strong> {rec.category}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </>
  );

  const renderInfoCard = () => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🏗️</div>
        <h3>Content Structure Analyzer</h3>

        <div className="info-section">
          <h4>What you&apos;ll see</h4>
          <p>
            A breakdown of your content&apos;s structural quality: headings
            hierarchy, paragraph lengths, list usage, and media elements.
          </p>
        </div>

        <div className="info-section">
          <h4>Key Metrics</h4>
          <ul className="info-list">
            <li>
              <strong>Headings:</strong> counts and hierarchy issues
            </li>
            <li>
              <strong>Paragraphs:</strong> average length and readability
            </li>
            <li>
              <strong>Lists:</strong> presence and average items
            </li>
            <li>
              <strong>Media:</strong> images, videos and alt text coverage
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>Quick Tips</h4>
          <ul className="info-list">
            <li>Ensure a single H1 and logical H2/H3 hierarchy.</li>
            <li>Use short paragraphs (&lt;50 words) for better readability.</li>
            <li>
              Add descriptive alt text to images for accessibility and SEO.
            </li>
            <li>
              Use lists for steps or grouped items to improve scanability.
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer
      title="🏗️ Content Structure Analyzer"
      description="Analyze your content's structural quality including headings, paragraphs, lists, and media elements."
      onAnalyze={handleAnalyze}
      onClear={handleClear}
      loading={loading}
      error={error}
      results={results}
      analyzeButtonText="Analyze Structure"
      analyzeButtonDisabled={false}
      inputCardTitle="Content Input"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default ContentStructureAnalyzer;
