/**
 * Language Guidance Panel - Mini Service Component
 * Displays language-specific readability rules and best practices
 */
import React, { useState } from 'react';
import Card from '../ui/Card';
import MiniServiceWrapper from './MiniServiceWrapper';
import { scrollToResults } from '../../utils/scrollUtils';

const getWordCount = text => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const LanguageGuidancePanel = () => {
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

    if (!window.electronAPI?.readability?.analyzeLanguageGuidance) {
      setError('Readability service is not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result =
        await window.electronAPI.readability.analyzeLanguageGuidance(trimmed, {
          language,
        });
      setResults(result);
      scrollToResults();
    } catch (err) {
      setError(err.message || 'Analysis failed');
      console.error('Language guidance analysis error:', err);
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
      title="🌐 Language Guidance"
      description="Learn language-specific best practices and rules for optimizing readability."
    >
      <Card className="input-card">
        <h3>Content & Settings</h3>

        <div className="form-group">
          <label htmlFor="lang-content">Content to Analyze</label>
          <textarea
            id="lang-content"
            rows="8"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your content here..."
            className="form-control"
          />
          <small className="form-help">Word count: {wordCount} words</small>
        </div>

        <div className="form-group">
          <label htmlFor="lang-language">Content Language</label>
          <select
            id="lang-language"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="form-control"
          >
            <option value="en">English</option>
            <option value="el">Greek</option>
          </select>
          <small className="form-help">
            Select the language to see specific guidance rules
          </small>
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
            {loading ? 'Analyzing...' : 'Get Language Guidance'}
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
          <>
            <Card className="summary-card" title="Content Analysis">
              <div className="content-analysis-summary">
                <div className="analysis-row">
                  <span className="analysis-label">Language:</span>
                  <span className="analysis-value">
                    {results.languageGuidance.language}
                  </span>
                </div>
                <div className="analysis-row">
                  <span className="analysis-label">Overall Readability:</span>
                  <span className="analysis-value">
                    {
                      results.languageGuidance.contentAnalysis
                        .overallReadability
                    }
                  </span>
                </div>
                <div className="analysis-row">
                  <span className="analysis-label">Score:</span>
                  <span className="analysis-value">
                    {Math.round(results.languageGuidance.contentAnalysis.score)}
                    /100
                  </span>
                </div>
                <div className="analysis-row">
                  <span className="analysis-label">SEO Readability:</span>
                  <span className="analysis-value">
                    {results.languageGuidance.contentAnalysis.seoReadability}
                  </span>
                </div>
                <div className="analysis-row">
                  <span className="analysis-label">Target Audience:</span>
                  <span className="analysis-value">
                    {results.languageGuidance.contentAnalysis.targetAudience}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="results-card" title="SEO Impact Assessment">
              <div className="seo-impact-grid">
                <div className="seo-metric">
                  <div className="metric-header">
                    <span className="metric-label">Crawlability</span>
                    <span
                      className={`metric-score score-${results.languageGuidance.seoImpact.crawlability.status.toLowerCase()}`}
                    >
                      {results.languageGuidance.seoImpact.crawlability.score}
                    </span>
                  </div>
                  <div className="metric-status">
                    {results.languageGuidance.seoImpact.crawlability.status}
                  </div>
                  <div className="metric-reason">
                    {results.languageGuidance.seoImpact.crawlability.reason}
                  </div>
                </div>

                <div className="seo-metric">
                  <div className="metric-header">
                    <span className="metric-label">User Engagement</span>
                    <span
                      className={`metric-score score-${results.languageGuidance.seoImpact.userEngagement.status.toLowerCase()}`}
                    >
                      {results.languageGuidance.seoImpact.userEngagement.score}
                    </span>
                  </div>
                  <div className="metric-status">
                    {results.languageGuidance.seoImpact.userEngagement.status}
                  </div>
                  <div className="metric-reason">
                    {results.languageGuidance.seoImpact.userEngagement.reason}
                  </div>
                </div>

                <div className="seo-metric">
                  <div className="metric-header">
                    <span className="metric-label">Mobile Friendliness</span>
                    <span
                      className={`metric-score score-${results.languageGuidance.seoImpact.mobileFriendliness.status.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {
                        results.languageGuidance.seoImpact.mobileFriendliness
                          .score
                      }
                    </span>
                  </div>
                  <div className="metric-status">
                    {
                      results.languageGuidance.seoImpact.mobileFriendliness
                        .status
                    }
                  </div>
                  <div className="metric-reason">
                    {
                      results.languageGuidance.seoImpact.mobileFriendliness
                        .reason
                    }
                  </div>
                </div>

                <div className="seo-metric">
                  <div className="metric-header">
                    <span className="metric-label">Voice Search</span>
                    <span
                      className={`metric-score score-${results.languageGuidance.seoImpact.voiceSearchOptimization.status.toLowerCase()}`}
                    >
                      {
                        results.languageGuidance.seoImpact
                          .voiceSearchOptimization.score
                      }
                    </span>
                  </div>
                  <div className="metric-status">
                    {
                      results.languageGuidance.seoImpact.voiceSearchOptimization
                        .status
                    }
                  </div>
                  <div className="metric-reason">
                    {
                      results.languageGuidance.seoImpact.voiceSearchOptimization
                        .reason
                    }
                  </div>
                </div>

                <div className="seo-metric">
                  <div className="metric-header">
                    <span className="metric-label">Featured Snippets</span>
                    <span
                      className={`metric-score score-${results.languageGuidance.seoImpact.featuredSnippetPotential.status.toLowerCase()}`}
                    >
                      {
                        results.languageGuidance.seoImpact
                          .featuredSnippetPotential.score
                      }
                    </span>
                  </div>
                  <div className="metric-status">
                    {
                      results.languageGuidance.seoImpact
                        .featuredSnippetPotential.status
                    }
                  </div>
                  <div className="metric-reason">
                    {
                      results.languageGuidance.seoImpact
                        .featuredSnippetPotential.reason
                    }
                  </div>
                </div>
              </div>
            </Card>

            {results.languageGuidance.specificIssues &&
              results.languageGuidance.specificIssues.length > 0 && (
                <Card className="results-card" title="Specific Issues Found">
                  <div className="issues-list">
                    {results.languageGuidance.specificIssues.map(
                      (issue, index) => (
                        <div
                          key={`${issue.category}-${index}`}
                          className={`issue-item severity-${issue.severity}`}
                        >
                          <div className="issue-header">
                            <span
                              className={`severity-badge ${issue.severity}`}
                            >
                              {issue.severity.toUpperCase()}
                            </span>
                            <span className="issue-category">
                              {issue.category}
                            </span>
                          </div>
                          <div className="issue-finding">{issue.finding}</div>
                          <div className="issue-impact">
                            <strong>Impact:</strong> {issue.impact}
                          </div>
                          {issue.examples && issue.examples.length > 0 && (
                            <div className="issue-examples">
                              <strong>Examples:</strong>
                              {issue.examples.map((example, exIdx) => (
                                <div
                                  key={`ex-${exIdx}`}
                                  className="example-item"
                                >
                                  <span className="example-count">
                                    ({example.wordCount} words)
                                  </span>
                                  <span className="example-text">
                                    {example.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </Card>
              )}

            <Card className="results-card" title="Actionable SEO Advice">
              <div className="advice-list">
                {results.languageGuidance.actionableAdvice &&
                results.languageGuidance.actionableAdvice.length > 0 ? (
                  results.languageGuidance.actionableAdvice.map(
                    (advice, index) => (
                      <div
                        key={`${advice.rule}-${index}`}
                        className={`advice-item priority-${advice.priority}`}
                      >
                        <div className="advice-header">
                          <span className={`priority-badge ${advice.priority}`}>
                            {advice.priority === 'critical' && '🚨'}
                            {advice.priority === 'high' && '⚠️'}
                            {advice.priority === 'medium' && 'ℹ️'}
                            {advice.priority === 'low' && '💡'}
                            {advice.priority === 'maintenance' && '✅'}
                          </span>
                          <span className="advice-rule">{advice.rule}</span>
                        </div>
                        <div className="advice-reason">
                          <strong>Why:</strong> {advice.reason}
                        </div>
                        <div className="advice-action">
                          <strong>Action:</strong> {advice.action}
                        </div>
                        <div className="advice-seo-impact">
                          <strong>SEO Impact:</strong> {advice.seoImpact}
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p>No actionable advice available.</p>
                )}
              </div>
            </Card>

            {results.languageGuidance.strengthsIdentified &&
              results.languageGuidance.strengthsIdentified.length > 0 && (
                <Card className="results-card" title="Strengths Identified">
                  <div className="strengths-list">
                    {results.languageGuidance.strengthsIdentified.map(
                      (strength, index) => (
                        <div
                          key={`${strength.category}-${index}`}
                          className="strength-item"
                        >
                          <div className="strength-icon">✅</div>
                          <div className="strength-content">
                            <div className="strength-category">
                              {strength.category}
                            </div>
                            <div className="strength-text">
                              {strength.strength}
                            </div>
                            <div className="strength-benefit">
                              <strong>Benefit:</strong> {strength.benefit}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </Card>
              )}
          </>
        )}

        {!results && !error && (
          <Card className="info-card">
            <div className="info-content">
              <div className="info-icon">🌐</div>
              <h3>Smart Language &amp; SEO Analysis</h3>

              <div className="info-section">
                <h4>📊 Dynamic Content Analysis</h4>
                <p>
                  Unlike static checklists, this tool analyzes YOUR actual
                  content to identify specific readability issues and their SEO
                  impact. Get personalized, actionable advice based on your
                  text.
                </p>
              </div>

              <div className="info-section">
                <h4>� What You&apos;ll Get</h4>
                <ul className="info-list">
                  <li>
                    <strong>SEO Impact Assessment:</strong> Crawlability, user
                    engagement, mobile friendliness, voice search readiness, and
                    featured snippet potential scores
                  </li>
                  <li>
                    <strong>Specific Issues:</strong> Exact problems found in
                    your content with examples and severity levels
                  </li>
                  <li>
                    <strong>Actionable Advice:</strong> Prioritized
                    recommendations with clear actions and expected SEO impact
                  </li>
                  <li>
                    <strong>Strengths Identified:</strong> Recognition of what
                    you&apos;re doing well to maintain
                  </li>
                </ul>
              </div>

              <div className="info-section">
                <h4>🔍 SEO-Focused Analysis</h4>
                <p>
                  All guidance is tailored for SEO optimization, considering:
                </p>
                <ul className="info-list">
                  <li>Search engine crawling and indexing efficiency</li>
                  <li>User engagement signals (dwell time, bounce rate)</li>
                  <li>Mobile reading patterns and responsive design</li>
                  <li>Voice search compatibility and conversational tone</li>
                  <li>Featured snippet and rich result eligibility</li>
                </ul>
              </div>

              <div className="info-section">
                <h4>🌍 Language-Aware Recommendations</h4>
                <p>
                  Analysis adapts to English and Greek content patterns,
                  providing language-specific SEO guidance based on regional
                  search behaviors and reading preferences.
                </p>
              </div>

              <div className="info-section">
                <h4>� How It Works</h4>
                <ol className="info-list">
                  <li>Paste or type your content (40+ words recommended)</li>
                  <li>Select the correct language</li>
                  <li>Click &quot;Get Language Guidance&quot;</li>
                  <li>Review specific issues and prioritized advice</li>
                  <li>Apply recommendations to boost SEO performance</li>
                </ol>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MiniServiceWrapper>
  );
};

export default LanguageGuidancePanel;
