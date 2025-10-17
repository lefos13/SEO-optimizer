/**
 * Stat Card Component
 * Displays a single statistic with icon and description
 */
import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = 'up',
  variant = 'default',
  onClick,
}) => {
  const cardClasses = `stat-card stat-card-${variant}`;

  return (
    <Card className={cardClasses} onClick={onClick}>
      <div className="stat-card-header">
        {icon && <div className="stat-card-icon">{icon}</div>}
        <div className="stat-card-content">
          <div className="stat-card-title">{title}</div>
          <div className="stat-card-value">{value}</div>
          {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
          {trend && (
            <div className={`stat-card-trend trend-${trendDirection}`}>
              <span className="trend-icon">
                {trendDirection === 'up' ? '↑' : '↓'}
              </span>
              <span className="trend-value">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  trend: PropTypes.string,
  trendDirection: PropTypes.oneOf(['up', 'down']),
  variant: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'warning',
    'danger',
    'info',
  ]),
  onClick: PropTypes.func,
};

export default StatCard;
