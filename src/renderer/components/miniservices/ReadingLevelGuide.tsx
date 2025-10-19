/**
 * Reading Level Guide - Mini Service Component
 * Displays recommended reading levels and audience fit analysis
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceContainer from './MiniServiceContainer';
import { scrollToResults } from '../../utils/scrollUtils';

interface AudienceFit {
  audience: string;
  suitable: boolean;
}

interface EducationStage {
  label: string;
  range: string;
}

interface ReadingLevels {
  recommendedGrade: number;
  recommendedLabel: string;
  audienceFit: AudienceFit[];
  educationStages: EducationStage[];
}

interface ReadingLevelResults {
  readingLevels: ReadingLevels;
}

const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const ReadingLevelGuide: React.FC = () => {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('en');
  const [results, setResults] = useState<ReadingLevelResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = getWordCount(content);

  const handleAnalyze = async (): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Please enter content to analyze');
      return;
    }

    if (!window.electronAPI?.readability?.analyzeReadingLevels) {
      setError('Readability service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = (await window.electronAPI.readability.analyzeReadingLevels(
        trimmed,
        {
          language,
        }
      )) as unknown as ReadingLevelResults;
      setResults(result);
      scrollToResults();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      console.error('Reading levels analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setResults(null);
    setError(null);
  };

  // Render functions
  const renderInputs = (): React.ReactNode => (
    <>
      <div className="form-group">
        <label htmlFor="level-content">Content to Analyze</label>
        <textarea
          id="level-content"
          rows={8}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste your content here..."
          className="form-control"
        />
        <small className="form-help">Word count: {wordCount} words</small>
      </div>

      <div className="form-group">
        <label htmlFor="level-language">Content Language</label>
        <select
          id="level-language"
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

  const renderResults = (): React.ReactNode => (
    <>
      <Card className="results-card" title="Recommended Reading Level">
        <div className="reading-level">
          <div className="reading-grade">
            Grade {results?.readingLevels.recommendedGrade}
          </div>
          <div className="reading-label">
            {results?.readingLevels.recommendedLabel}
          </div>
        </div>
        <p className="card-description">
          This is the average grade level based on multiple readability
          formulas. Younger audiences may find it challenging; older audiences
          may find it simple.
        </p>
      </Card>

      <Card className="results-card" title="Audience Fit">
        <div className="audience-fit">
          {results?.readingLevels.audienceFit.map(item => (
            <div
              key={item.audience}
              className={`audience-item ${item.suitable ? 'fit' : 'no-fit'}`}
            >
              <span className="audience-label">{item.audience}</span>
              <span className="audience-status">
                {item.suitable ? '✅ Suitable' : '⚠️ May Be Challenging'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="results-card" title="Education Stages">
        <div className="education-stages">
          {results?.readingLevels.educationStages.map(stage => (
            <div key={stage.label} className="stage-item">
              <div className="stage-label">{stage.label}</div>
              <div className="stage-range">{stage.range}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );

  const renderInfoCard = (): React.ReactNode => (
    <Card className="info-card">
      <div className="info-content">
        <div className="info-icon">🎓</div>
        <h3>Understanding Reading Levels</h3>

        <div className="info-section">
          <h4>📚 Grade Levels</h4>
          <p>
            Reading levels are expressed as U.S. school grades. Grade 6 means a
            typical 6th grader can read the text. Grades 13–16 represent
            college-level content.
          </p>
        </div>

        <div className="info-section">
          <h4>👥 Audience Alignment</h4>
          <p>
            Your content should match your target audience&apos;s reading
            ability. Blog posts often target grades 7–9 (accessible yet
            engaging). Academic papers target grades 13+.
          </p>
        </div>

        <div className="info-section">
          <h4>💡 Common Targets</h4>
          <ul className="info-list">
            <li>
              <strong>Blog Posts:</strong> Grades 7–9 (broad appeal)
            </li>
            <li>
              <strong>News Articles:</strong> Grades 8–10 (quick reading)
            </li>
            <li>
              <strong>Marketing Copy:</strong> Grades 6–8 (easy scanning)
            </li>
            <li>
              <strong>Technical Documentation:</strong> Grades 12–14
              (specialists)
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );

  return (
    <MiniServiceContainer<ReadingLevelResults>
      title="🎓 Reading Level Guide"
      description="Discover the recommended reading grade level and which audiences your content suits best."
      onAnalyze={handleAnalyze}
      onClear={handleClear}
      loading={loading}
      error={error}
      results={results}
      analyzeButtonText="Determine Reading Level"
      analyzeButtonDisabled={false}
      inputCardTitle="Content & Settings"
      renderInputs={renderInputs}
      renderResults={renderResults}
      renderInfoCard={renderInfoCard}
    />
  );
};

export default ReadingLevelGuide;
