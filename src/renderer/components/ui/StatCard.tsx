/**
 * Stat Card Component
 * Displays a single statistic with icon and description
 */
import React from 'react';
import Card from './Card';

export type StatCardVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type TrendDirection = 'up' | 'down';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: TrendDirection;
  variant?: StatCardVariant;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
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
    <Card className={cardClasses}>
      <div className="stat-card-header" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
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

export default StatCard;
