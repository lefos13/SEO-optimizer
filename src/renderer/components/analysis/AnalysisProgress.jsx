/**
 * AnalysisProgress Component
 * Real-time progress indicator for SEO analysis
 * Features:
 * - Multi-stage progress tracking
 * - Percentage completion
 * - Current stage display
 * - Estimated time remaining
 */
import React from 'react';
import PropTypes from 'prop-types';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';

const AnalysisProgress = ({
  isAnalyzing,
  currentStage,
  progress,
  estimatedTime,
}) => {
  const stages = [
    { id: 'init', label: 'Initializing', icon: '🔄' },
    { id: 'content', label: 'Analyzing Content', icon: '📝' },
    { id: 'keywords', label: 'Checking Keywords', icon: '🔑' },
    { id: 'technical', label: 'Technical Analysis', icon: '⚙️' },
    { id: 'recommendations', label: 'Generating Recommendations', icon: '💡' },
    { id: 'complete', label: 'Complete', icon: '✓' },
  ];

  if (!isAnalyzing) {
    return null;
  }

  const currentStageIndex = stages.findIndex(s => s.id === currentStage);
  const stageProgress = ((currentStageIndex + 1) / stages.length) * 100;
  const overallProgress = progress || stageProgress;

  const getCurrentStageInfo = () => {
    return stages.find(s => s.id === currentStage) || stages[0];
  };

  const stageInfo = getCurrentStageInfo();

  return (
    <div className="analysis-progress">
      <div className="progress-header">
        <div className="progress-title">
          <span className="progress-icon">{stageInfo.icon}</span>
          <span className="progress-label">{stageInfo.label}...</span>
        </div>
        <div className="progress-meta">
          <Badge variant="info" size="small">
            {Math.round(overallProgress)}%
          </Badge>
          {estimatedTime && (
            <span className="progress-time">~{estimatedTime}s remaining</span>
          )}
        </div>
      </div>

      <ProgressBar
        value={overallProgress}
        variant="primary"
        size="large"
        showLabel={false}
        animated={true}
      />

      {/* Stage Indicators */}
      <div className="progress-stages">
        {stages.slice(0, -1).map((stage, index) => {
          const isComplete = index < currentStageIndex;
          const isCurrent = stage.id === currentStage;

          return (
            <div
              key={stage.id}
              className={`progress-stage ${
                isComplete ? 'complete' : isCurrent ? 'current' : 'pending'
              }`}
            >
              <div className="stage-indicator">
                {isComplete ? (
                  <span className="stage-check">✓</span>
                ) : isCurrent ? (
                  <div className="stage-spinner" />
                ) : (
                  <span className="stage-dot" />
                )}
              </div>
              <span className="stage-label">{stage.label}</span>
            </div>
          );
        })}
      </div>

      <div className="progress-message">
        <p className="message-text">
          Please wait while we analyze your content. This usually takes 5-10
          seconds.
        </p>
      </div>
    </div>
  );
};

AnalysisProgress.propTypes = {
  isAnalyzing: PropTypes.bool.isRequired,
  currentStage: PropTypes.string,
  progress: PropTypes.number,
  estimatedTime: PropTypes.number,
};

export default AnalysisProgress;
