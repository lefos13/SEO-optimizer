/**
 * RecommendationsList Component
 * Displays SEO recommendations with priority, status tracking, and actions
 * Features:
 * - Priority-based display (Critical, High, Medium, Low)
 * - Expandable recommendation details with action steps
 * - Status tracking (pending, in-progress, completed, dismissed)
 * - Impact estimation and score increase
 * - Before/after examples
 * - Resource links
 */
import React, { useState } from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

type Priority = 'critical' | 'high' | 'medium' | 'low';
type Status = 'pending' | 'in-progress' | 'completed' | 'dismissed';
type Effort = 'quick' | 'moderate' | 'significant';
type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface RecommendationAction {
  id: number;
  step: number;
  action_text: string;
  action_type: string;
}

interface RecommendationExample {
  before_example?: string;
  after_example?: string;
}

interface RecommendationResource {
  id: number;
  title: string;
  url: string;
}

interface Recommendation {
  id: string | number;
  title: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  category?: string;
  effort?: Effort;
  estimated_time?: string;
  score_increase?: number;
  percentage_increase?: number;
  why_explanation?: string;
  actions?: RecommendationAction[];
  example?: RecommendationExample;
  resources?: RecommendationResource[];
}

interface EffortBadge {
  variant: BadgeVariant;
  label: string;
}

export interface RecommendationsListProps {
  recommendations?: Recommendation[];
  onUpdateStatus?: (id: string | number, status: Status) => Promise<void>;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  onUpdateStatus,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(
    new Set()
  );

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="recommendations-empty">
        <div className="empty-icon">✨</div>
        <h3>Great Job!</h3>
        <p>No recommendations at this time. Your content is well optimized!</p>
      </div>
    );
  }

  const toggleExpanded = (id: string | number): void => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const getPriorityVariant = (priority?: Priority | string): BadgeVariant => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusVariant = (status?: Status | string): BadgeVariant => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'dismissed':
        return 'default';
      default:
        return 'warning';
    }
  };

  const getImpactIcon = (scoreIncrease?: number): string => {
    // Use score_increase to determine impact
    if (!scoreIncrease) return '💡';
    if (scoreIncrease >= 8) return '🚀'; // High impact
    if (scoreIncrease >= 5) return '📈'; // Medium impact
    if (scoreIncrease > 0) return '📊'; // Low impact
    return '💡'; // Default
  };

  const getEffortBadge = (effort?: Effort | string): EffortBadge => {
    switch (effort?.toLowerCase()) {
      case 'quick':
        return { variant: 'success', label: 'Quick Fix' };
      case 'moderate':
        return { variant: 'info', label: 'Moderate' };
      case 'significant':
        return { variant: 'warning', label: 'Significant' };
      default:
        return { variant: 'default', label: 'Unknown' };
    }
  };

  const handleStatusUpdate = async (
    recId: string | number,
    newStatus: Status
  ): Promise<void> => {
    if (onUpdateStatus) {
      await onUpdateStatus(recId, newStatus);
    }
  };

  // Group recommendations by priority
  const groupedRecommendations = recommendations.reduce<
    Record<string, Recommendation[]>
  >((acc, rec) => {
    const priority = rec.priority || 'medium';
    if (!acc[priority]) {
      acc[priority] = [];
    }
    acc[priority].push(rec);
    return acc;
  }, {});

  const priorityOrder: Priority[] = ['critical', 'high', 'medium', 'low'];

  return (
    <div className="recommendations-list">
      {priorityOrder.map(priority => {
        const recs = groupedRecommendations[priority];
        if (!recs || recs.length === 0) return null;

        return (
          <div key={priority} className="recommendation-group">
            <div className="group-header">
              <h4 className="group-title">
                {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
              </h4>
              <Badge variant={getPriorityVariant(priority)}>
                {recs.length} {recs.length === 1 ? 'issue' : 'issues'}
              </Badge>
            </div>

            <div className="group-items">
              {recs.map(rec => {
                const isExpanded = expandedIds.has(rec.id);

                return (
                  <Card key={rec.id} className="recommendation-card">
                    <div className="recommendation-header">
                      <div className="recommendation-info">
                        <div className="recommendation-title-row">
                          <span className="recommendation-icon">
                            {getImpactIcon(rec.score_increase)}
                          </span>
                          <h5 className="recommendation-title">{rec.title}</h5>
                        </div>
                        <div className="recommendation-meta">
                          <Badge
                            variant={getPriorityVariant(rec.priority)}
                            size="small"
                          >
                            {rec.priority}
                          </Badge>
                          <Badge
                            variant={getStatusVariant(rec.status)}
                            size="small"
                          >
                            {rec.status || 'pending'}
                          </Badge>
                          {rec.score_increase && rec.score_increase > 0 && (
                            <span className="impact-label">
                              +{rec.score_increase} points
                            </span>
                          )}
                          {rec.effort && (
                            <Badge
                              variant={getEffortBadge(rec.effort).variant}
                              size="small"
                            >
                              {getEffortBadge(rec.effort).label}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => toggleExpanded(rec.id)}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </Button>
                    </div>

                    <p className="recommendation-description">
                      {rec.description}
                    </p>

                    {isExpanded && (
                      <div className="recommendation-details">
                        {/* Action Steps */}
                        {rec.actions && rec.actions.length > 0 && (
                          <div className="detail-section">
                            <h6 className="detail-title">How to Fix</h6>
                            <ol className="action-list">
                              {rec.actions.map(action => (
                                <li
                                  key={action.id}
                                  className={`action-item action-${action.action_type}`}
                                >
                                  {action.action_text}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Impact Estimation */}
                        {rec.score_increase && rec.score_increase > 0 && (
                          <div className="detail-section impact-section">
                            <h6 className="detail-title">Expected Impact</h6>
                            <div className="impact-stats">
                              <div className="impact-stat">
                                <span className="stat-label">
                                  Score Increase:
                                </span>
                                <span className="stat-value">
                                  +{rec.percentage_increase}%
                                </span>
                              </div>
                              {rec.effort && (
                                <div className="impact-stat">
                                  <span className="stat-label">Effort:</span>
                                  <span className="stat-value">
                                    {rec.effort}
                                  </span>
                                </div>
                              )}
                              {rec.estimated_time && (
                                <div className="impact-stat">
                                  <span className="stat-label">Time:</span>
                                  <span className="stat-value">
                                    {rec.estimated_time}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Why This Matters */}
                        {rec.why_explanation && (
                          <div className="detail-section">
                            <h6 className="detail-title">Why This Matters</h6>
                            <p className="detail-text">{rec.why_explanation}</p>
                          </div>
                        )}

                        {/* Before/After Example */}
                        {rec.example && (
                          <div className="detail-section">
                            <h6 className="detail-title">Example</h6>
                            <div className="example-comparison">
                              {rec.example.before_example && (
                                <div className="example-before">
                                  <strong>❌ Before:</strong>
                                  <code>{rec.example.before_example}</code>
                                </div>
                              )}
                              {rec.example.after_example && (
                                <div className="example-after">
                                  <strong>✅ After:</strong>
                                  <code>{rec.example.after_example}</code>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Resources */}
                        {rec.resources && rec.resources.length > 0 && (
                          <div className="detail-section">
                            <h6 className="detail-title">Learn More</h6>
                            <ul className="resource-list">
                              {rec.resources.map(resource => (
                                <li key={resource.id}>
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {resource.title} ↗
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="recommendation-actions">
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() =>
                              handleStatusUpdate(rec.id, 'completed')
                            }
                            disabled={rec.status === 'completed'}
                          >
                            ✓ Mark Complete
                          </Button>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() =>
                              handleStatusUpdate(rec.id, 'in-progress')
                            }
                            disabled={rec.status === 'in-progress'}
                          >
                            🔄 In Progress
                          </Button>
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() =>
                              handleStatusUpdate(rec.id, 'dismissed')
                            }
                            disabled={rec.status === 'dismissed'}
                          >
                            ✗ Dismiss
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecommendationsList;
