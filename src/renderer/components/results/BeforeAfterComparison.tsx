/**
 * BeforeAfterComparison Component
 * Shows comparison between two analyses to track improvements
 * Features:
 * - Side-by-side score comparison
 * - Category-wise improvement tracking
 * - Visual indicators for improvements/regressions
 * - Change percentage calculations
 */
import React from 'react';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import Card from '../ui/Card';

interface CategoryScore {
  score: number;
  maxScore: number;
  passed: number;
  failed: number;
}

interface Analysis {
  score: number;
  maxScore: number;
  grade: string;
  categoryScores?: Record<string, CategoryScore>;
  passedRules?: number;
  failedRules?: number;
}

interface ChangeResult {
  diff: number;
  percentChange: number;
}

interface ChangeIndicator {
  icon: string;
  class: string;
  label: string;
}

export interface BeforeAfterComparisonProps {
  beforeAnalysis?: Analysis;
  afterAnalysis?: Analysis;
}

const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  beforeAnalysis,
  afterAnalysis,
}) => {
  if (!beforeAnalysis || !afterAnalysis) {
    return (
      <div className="comparison-empty">
        <div className="empty-icon">📊</div>
        <h3>No Comparison Data</h3>
        <p>Select two analyses to compare improvements over time.</p>
      </div>
    );
  }

  const calculateChange = (before: number, after: number): ChangeResult => {
    const diff = after - before;
    const percentChange = before !== 0 ? parseFloat(((diff / before) * 100).toFixed(1)) : 0;
    return { diff, percentChange };
  };

  const getChangeIndicator = (change: number): ChangeIndicator => {
    if (change > 0) return { icon: '📈', class: 'positive', label: 'Improved' };
    if (change < 0) return { icon: '📉', class: 'negative', label: 'Declined' };
    return { icon: '➡️', class: 'neutral', label: 'No Change' };
  };

  const beforeScore = beforeAnalysis.score;
  const afterScore = afterAnalysis.score;
  const scoreChange = calculateChange(beforeScore, afterScore);
  const scoreIndicator = getChangeIndicator(scoreChange.diff);

  const beforePercentage = Math.round(
    (beforeScore / beforeAnalysis.maxScore) * 100
  );
  const afterPercentage = Math.round(
    (afterScore / afterAnalysis.maxScore) * 100
  );

  return (
    <div className="before-after-comparison">
      {/* Overall Score Comparison */}
      <Card className="comparison-header">
        <h3 className="comparison-title">Overall Performance</h3>

        <div className="comparison-scores">
          <div className="score-column before">
            <div className="score-label">Before</div>
            <div className="score-display">
              <div className="score-value">{beforeScore}</div>
              <div className="score-max">/ {beforeAnalysis.maxScore}</div>
            </div>
            <Badge variant="info">{beforeAnalysis.grade}</Badge>
            <ProgressBar value={beforePercentage} variant="info" />
          </div>

          <div className="score-divider">
            <div className={`change-indicator ${scoreIndicator.class}`}>
              <span className="change-icon">{scoreIndicator.icon}</span>
              <span className="change-value">
                {scoreChange.diff > 0 ? '+' : ''}
                {scoreChange.diff}
              </span>
              <span className="change-percent">
                ({scoreChange.percentChange > 0 ? '+' : ''}
                {scoreChange.percentChange}%)
              </span>
              <span className="change-label">{scoreIndicator.label}</span>
            </div>
          </div>

          <div className="score-column after">
            <div className="score-label">After</div>
            <div className="score-display">
              <div className="score-value">{afterScore}</div>
              <div className="score-max">/ {afterAnalysis.maxScore}</div>
            </div>
            <Badge variant={afterPercentage >= 80 ? 'success' : 'warning'}>
              {afterAnalysis.grade}
            </Badge>
            <ProgressBar
              value={afterPercentage}
              variant={afterPercentage >= 80 ? 'success' : 'info'}
            />
          </div>
        </div>
      </Card>

      {/* Category Breakdown Comparison */}
      <Card className="comparison-categories">
        <h3 className="comparison-title">Category Improvements</h3>

        <div className="category-comparisons">
          {Object.entries(afterAnalysis.categoryScores || {}).map(
            ([category, afterData]) => {
              const beforeData = beforeAnalysis.categoryScores?.[category];
              if (!beforeData) return null;

              const change = calculateChange(beforeData.score, afterData.score);
              const indicator = getChangeIndicator(change.diff);

              const beforePercent = Math.round(
                (beforeData.score / beforeData.maxScore) * 100
              );
              const afterPercent = Math.round(
                (afterData.score / afterData.maxScore) * 100
              );

              return (
                <div key={category} className="category-comparison">
                  <div className="category-comparison-header">
                    <h4 className="category-name">{category}</h4>
                    <div className={`category-change ${indicator.class}`}>
                      <span className="change-icon">{indicator.icon}</span>
                      <span className="change-text">
                        {change.diff > 0 ? '+' : ''}
                        {change.diff} pts
                      </span>
                    </div>
                  </div>

                  <div className="category-comparison-bars">
                    <div className="comparison-bar">
                      <span className="bar-label">Before</span>
                      <ProgressBar value={beforePercent} variant="primary" />
                      <span className="bar-value">{beforeData.score}</span>
                    </div>

                    <div className="comparison-bar">
                      <span className="bar-label">After</span>
                      <ProgressBar
                        value={afterPercent}
                        variant={afterPercent >= 80 ? 'success' : 'info'}
                      />
                      <span className="bar-value">{afterData.score}</span>
                    </div>
                  </div>

                  <div className="category-comparison-meta">
                    <div className="meta-item">
                      <span className="meta-label">Rules Passed:</span>
                      <span
                        className={`meta-value ${afterData.passed > beforeData.passed ? 'improved' : ''}`}
                      >
                        {beforeData.passed} → {afterData.passed}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Rules Failed:</span>
                      <span
                        className={`meta-value ${afterData.failed < beforeData.failed ? 'improved' : ''}`}
                      >
                        {beforeData.failed} → {afterData.failed}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </Card>

      {/* Summary Stats */}
      <Card className="comparison-summary">
        <h3 className="comparison-title">Improvement Summary</h3>

        <div className="summary-stats">
          <div className="summary-stat">
            <div className="stat-icon success">✓</div>
            <div className="stat-content">
              <div className="stat-label">Rules Passed</div>
              <div className="stat-comparison">
                {beforeAnalysis.passedRules || 0} →{' '}
                {afterAnalysis.passedRules || 0}
                <span
                  className={`stat-change ${(afterAnalysis.passedRules || 0) - (beforeAnalysis.passedRules || 0) > 0 ? 'positive' : ''}`}
                >
                  (
                  {(afterAnalysis.passedRules || 0) -
                    (beforeAnalysis.passedRules || 0) >
                  0
                    ? '+'
                    : ''}
                  {(afterAnalysis.passedRules || 0) -
                    (beforeAnalysis.passedRules || 0)}
                  )
                </span>
              </div>
            </div>
          </div>

          <div className="summary-stat">
            <div className="stat-icon danger">✗</div>
            <div className="stat-content">
              <div className="stat-label">Rules Failed</div>
              <div className="stat-comparison">
                {beforeAnalysis.failedRules || 0} →{' '}
                {afterAnalysis.failedRules || 0}
                <span
                  className={`stat-change ${(beforeAnalysis.failedRules || 0) - (afterAnalysis.failedRules || 0) > 0 ? 'positive' : ''}`}
                >
                  (
                  {(afterAnalysis.failedRules || 0) -
                    (beforeAnalysis.failedRules || 0) >
                  0
                    ? '+'
                    : ''}
                  {(afterAnalysis.failedRules || 0) -
                    (beforeAnalysis.failedRules || 0)}
                  )
                </span>
              </div>
            </div>
          </div>

          <div className="summary-stat">
            <div className="stat-icon info">📊</div>
            <div className="stat-content">
              <div className="stat-label">Overall Progress</div>
              <div className="stat-comparison">
                <Badge
                  variant={
                    scoreIndicator.class === 'positive' ? 'success' : 'warning'
                  }
                  size="large"
                >
                  {scoreChange.percentChange > 0 ? '+' : ''}
                  {scoreChange.percentChange}% Change
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BeforeAfterComparison;
