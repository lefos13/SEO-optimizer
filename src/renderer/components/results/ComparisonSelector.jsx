/**
 * ComparisonSelector Component
 * Allows users to select which analysis to compare with the current one
 * Features:
 * - Display list of available analyses
 * - Filter by date range or project
 * - Sort by score or date
 * - Quick select for previous analysis
 * - Visual indicators for selected analysis
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import {
  parseDate,
  formatDate,
  calculateTimeDiff,
} from '../../utils/dateUtils';

const ComparisonSelector = ({
  currentAnalysisId,
  projectId,
  currentAnalysis,
  selectedAnalysisId,
  onSelectAnalysis,
}) => {
  const [availableAnalyses, setAvailableAnalyses] = useState([]);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'score'
  const [error, setError] = useState(null);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);

  // Load available analyses for the project
  const loadAvailableAnalyses = async () => {
    setLoadingAnalyses(true);
    setError(null);

    try {
      const analyses = await window.electronAPI.analyses.getByProject(
        projectId,
        { limit: 50, orderBy: 'createdAt DESC' }
      );

      if (analyses) {
        // Filter out the current analysis and parse data
        const filtered = analyses
          .filter(a => a.id !== currentAnalysisId)
          .map(analysis => {
            // Parse the date string properly, handling timezone offset
            const dateStr = analysis.created_at || analysis.createdAt;

            // Debug: Log the raw date from database
            console.log('Raw date from DB:', dateStr);

            const createdDate = parseDate(dateStr);

            // Debug: Log the parsed date
            console.log(
              'Parsed date:',
              createdDate?.toISOString(),
              'Local:',
              createdDate?.toString()
            );

            return {
              ...analysis,
              score: analysis.overall_score || 0,
              maxScore: analysis.max_score || 100,
              grade: analysis.grade || 'F',
              createdDate,
            };
          });

        setAvailableAnalyses(filtered);
      }
    } catch (err) {
      console.error('Error loading available analyses:', err);
      setError('Failed to load analyses for comparison');
    } finally {
      setLoadingAnalyses(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadAvailableAnalyses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const getSortedAnalyses = () => {
    const sorted = [...availableAnalyses];

    if (sortBy === 'date') {
      sorted.sort((a, b) => b.createdDate - a.createdDate);
    } else if (sortBy === 'score') {
      sorted.sort((a, b) => b.score - a.score);
    }

    return sorted;
  };

  const getScoreVariant = score => {
    const percentage = (score / 100) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const sortedAnalyses = getSortedAnalyses();

  if (loadingAnalyses) {
    return (
      <Card className="comparison-selector">
        <div className="selector-loading">
          <div className="loading-spinner"></div>
          <p>Loading available analyses...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="comparison-selector comparison-selector-error">
        <div className="selector-error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <Button
            variant="secondary"
            size="small"
            onClick={loadAvailableAnalyses}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (availableAnalyses.length === 0) {
    return (
      <Card className="comparison-selector">
        <div className="selector-empty">
          <div className="empty-icon">📊</div>
          <h3>No Previous Analyses</h3>
          <p>
            This is your first analysis for this project. Compare future
            analyses to track improvements.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="comparison-selector">
      <div className="selector-header">
        <h3 className="selector-title">Select Analysis to Compare</h3>
        <div className="selector-controls">
          <div className="sort-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Most Recent</option>
              <option value="score">Highest Score</option>
            </select>
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={loadAvailableAnalyses}
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      <div className="analyses-list">
        {sortedAnalyses.map(analysis => {
          const isSelected = selectedAnalysisId === analysis.id;
          const scorePercentage = (analysis.score / analysis.maxScore) * 100;
          const isImprovement =
            currentAnalysis && analysis.score < currentAnalysis.score;
          const isRegression =
            currentAnalysis && analysis.score > currentAnalysis.score;

          return (
            <div
              key={analysis.id}
              className={`analysis-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectAnalysis(analysis.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectAnalysis(analysis.id);
                }
              }}
            >
              <div className="item-content">
                <div className="item-header">
                  <div className="item-info">
                    <span className="item-label">
                      {formatDate(analysis.createdDate)}
                    </span>
                    <span className="item-time">
                      {calculateTimeDiff(analysis.createdDate)}
                    </span>
                  </div>

                  <div className="item-score-section">
                    <div className="item-score">
                      <span className="score-value">{analysis.score}</span>
                      <span className="score-max">/ {analysis.maxScore}</span>
                    </div>
                    <Badge
                      variant={getScoreVariant(analysis.score)}
                      size="small"
                    >
                      {analysis.grade}
                    </Badge>
                  </div>
                </div>

                <ProgressBar
                  value={scorePercentage}
                  variant={getScoreVariant(analysis.score)}
                  size="small"
                  showLabel={false}
                />

                {isImprovement && (
                  <div className="item-indicator improvement">
                    <span className="indicator-icon">📈</span>
                    <span className="indicator-text">This is older</span>
                  </div>
                )}
                {isRegression && (
                  <div className="item-indicator regression">
                    <span className="indicator-icon">📉</span>
                    <span className="indicator-text">This is older</span>
                  </div>
                )}
              </div>

              <div className="item-selector">
                <input
                  type="radio"
                  name="comparison-analysis"
                  value={analysis.id}
                  checked={isSelected}
                  onChange={() => onSelectAnalysis(analysis.id)}
                  className="selector-radio"
                  aria-label={`Select analysis from ${formatDate(analysis.createdDate)}`}
                />
                <span className="selector-checkmark"></span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

ComparisonSelector.propTypes = {
  currentAnalysisId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  currentAnalysis: PropTypes.shape({
    score: PropTypes.number,
    maxScore: PropTypes.number,
    grade: PropTypes.string,
  }),
  selectedAnalysisId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelectAnalysis: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default ComparisonSelector;
