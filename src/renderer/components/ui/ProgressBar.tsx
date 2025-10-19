/**
 * Progress Bar Component
 * Displays progress with color-coded visual indicator
 */
import React from 'react';

export type ProgressBarVariant = 'primary' | 'success' | 'info' | 'warning' | 'danger';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: ProgressBarVariant;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  variant = 'primary',
}) => {
  const percentage = Math.round((value / max) * 100);

  // Color based on percentage or variant
  let colorClass = 'progress-primary';
  if (variant !== 'primary') {
    colorClass = `progress-${variant}`;
  } else {
    if (percentage >= 90) colorClass = 'progress-success';
    else if (percentage >= 70) colorClass = 'progress-info';
    else if (percentage >= 50) colorClass = 'progress-warning';
    else colorClass = 'progress-danger';
  }

  return (
    <div className="progress-bar-container">
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          {showPercentage && (
            <span className="progress-percentage">{percentage}%</span>
          )}
        </div>
      )}
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${colorClass}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
