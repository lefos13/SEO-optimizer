/**
 * ScoreBreakdown Component
 * Displays detailed score analysis with category breakdowns
 * Features:
 * - Overall score with circular progress
 * - Category-wise score breakdown
 * - Grade display
 * - Visual progress bars
 */
import React from 'react';
import PropTypes from 'prop-types';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';

const ScoreBreakdown = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="score-breakdown-empty">
        <p>No analysis data available</p>
      </div>
    );
  }

  const { score, maxScore, grade, categoryScores } = analysis;

  // Handle cases where score or maxScore might be 0 or invalid
  const validScore = score || 0;
  const validMaxScore = maxScore || 100;
  const percentage =
    validMaxScore > 0 ? Math.round((validScore / validMaxScore) * 100) : 0;

  // Calculate grade variant for badge
  const getGradeVariant = grade => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'success';
      case 'B+':
      case 'B':
        return 'info';
      case 'C+':
      case 'C':
        return 'warning';
      default:
        return 'danger';
    }
  };

  // Get category icon
  const getCategoryIcon = category => {
    const icons = {
      'Content Quality': '📝',
      'Technical SEO': '⚙️',
      'Meta Information': '🏷️',
      Readability: '📖',
      Performance: '⚡',
      Security: '🔒',
      Mobile: '📱',
    };
    return icons[category] || '📊';
  };

  return (
    <div className="score-breakdown">
      {/* Overall Score Section */}
      <div className="score-breakdown-header">
        <div className="overall-score">
          <div className="circular-progress">
            <svg className="progress-ring" width="160" height="160">
              <circle
                className="progress-ring-circle-bg"
                cx="80"
                cy="80"
                r="70"
              />
              <circle
                className="progress-ring-circle"
                cx="80"
                cy="80"
                r="70"
                style={{
                  strokeDasharray: `${2 * Math.PI * 70}`,
                  strokeDashoffset: `${2 * Math.PI * 70 * (1 - percentage / 100)}`,
                }}
              />
            </svg>
            <div className="progress-ring-content">
              <div className="score-value">{validScore}</div>
              <div className="score-max">/ {validMaxScore}</div>
            </div>
          </div>

          <div className="score-details">
            <h3 className="score-title">Overall SEO Score</h3>
            <div className="score-meta">
              <Badge variant={getGradeVariant(grade)} size="large">
                Grade: {grade}
              </Badge>
              <span className="score-percentage">{percentage}%</span>
            </div>
            <ProgressBar
              value={percentage}
              variant={
                percentage >= 80
                  ? 'success'
                  : percentage >= 60
                    ? 'info'
                    : percentage >= 40
                      ? 'warning'
                      : 'danger'
              }
              showLabel={false}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="category-breakdown">
        <h4 className="breakdown-title">Score Breakdown by Category</h4>
        <div className="category-list">
          {categoryScores && Object.keys(categoryScores).length > 0 ? (
            Object.entries(categoryScores).map(([category, data]) => {
              // Ensure data has required fields
              const catScore = data.score || 0;
              const catMaxScore = data.maxScore || 0;
              const catPassed = data.passed || 0;
              const catFailed = data.failed || 0;
              const categoryPercentage =
                catMaxScore > 0
                  ? Math.round((catScore / catMaxScore) * 100)
                  : 0;

              return (
                <div key={category} className="category-item">
                  <div className="category-header">
                    <div className="category-info">
                      <span className="category-icon">
                        {getCategoryIcon(category)}
                      </span>
                      <span className="category-name">{category}</span>
                    </div>
                    <div className="category-score">
                      <span className="score-numbers">
                        {catScore} / {catMaxScore}
                      </span>
                      <Badge
                        variant={
                          categoryPercentage >= 80
                            ? 'success'
                            : categoryPercentage >= 60
                              ? 'info'
                              : categoryPercentage >= 40
                                ? 'warning'
                                : 'danger'
                        }
                        size="small"
                      >
                        {categoryPercentage}%
                      </Badge>
                    </div>
                  </div>
                  <ProgressBar
                    value={categoryPercentage}
                    variant={
                      categoryPercentage >= 80
                        ? 'success'
                        : categoryPercentage >= 60
                          ? 'info'
                          : categoryPercentage >= 40
                            ? 'warning'
                            : 'danger'
                    }
                    showLabel={false}
                    size="small"
                  />
                  <div className="category-meta">
                    <span className="passed-rules">✓ {catPassed} passed</span>
                    <span className="failed-rules">✗ {catFailed} failed</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="category-empty">
              <p>No category data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="score-stats">
        <div className="stat-item">
          <div className="stat-icon success">✓</div>
          <div className="stat-content">
            <div className="stat-value">{analysis.passedRules || 0}</div>
            <div className="stat-label">Passed Rules</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon danger">✗</div>
          <div className="stat-content">
            <div className="stat-value">{analysis.failedRules || 0}</div>
            <div className="stat-label">Failed Rules</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon warning">!</div>
          <div className="stat-content">
            <div className="stat-value">{analysis.warnings || 0}</div>
            <div className="stat-label">Warnings</div>
          </div>
        </div>
      </div>
    </div>
  );
};

ScoreBreakdown.propTypes = {
  analysis: PropTypes.shape({
    score: PropTypes.number.isRequired,
    maxScore: PropTypes.number.isRequired,
    grade: PropTypes.string.isRequired,
    categoryScores: PropTypes.object,
    passedRules: PropTypes.number,
    failedRules: PropTypes.number,
    warnings: PropTypes.number,
  }),
};

export default ScoreBreakdown;
