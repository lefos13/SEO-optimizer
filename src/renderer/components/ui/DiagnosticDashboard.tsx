/**
 * Diagnostic Dashboard Component
 * Displays recommendation system health status, metrics, and troubleshooting information
 */
import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';

// Type definitions for health monitoring data
interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  responseTime?: number;
}

interface SystemHealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  database: HealthCheckResult;
  recommendations: HealthCheckResult;
  performance: {
    averageResponseTime: number;
    successRate: number;
    recentOperations: number;
  };
  timestamp: string;
}

interface PerformanceStats {
  totalOperations: number;
  successRate: number;
  averageResponseTime: number;
  operationsByType: Record<string, number>;
  recentFailures: Array<{
    operationType: string;
    duration: number;
    timestamp: string;
    errorMessage?: string;
  }>;
}

const DiagnosticDashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(
    null
  );
  const [performanceStats, setPerformanceStats] =
    useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch health status
  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const status = (await window.electronAPI.invoke(
        'health:check'
      )) as SystemHealthStatus;
      setHealthStatus(status);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch health status'
      );
      console.error('Failed to fetch health status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch performance metrics
  const fetchPerformanceStats = async () => {
    try {
      const stats = (await window.electronAPI.invoke(
        'health:metrics'
      )) as PerformanceStats;
      setPerformanceStats(stats);
    } catch (err) {
      console.error('Failed to fetch performance stats:', err);
    }
  };

  // Reset health monitor
  const resetHealthMonitor = async () => {
    try {
      setLoading(true);
      await window.electronAPI.invoke('health:reset');
      await fetchHealthStatus();
      await fetchPerformanceStats();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to reset health monitor'
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh) {
      interval = setInterval(() => {
        fetchHealthStatus();
        fetchPerformanceStats();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  // Initial load
  useEffect(() => {
    fetchHealthStatus();
    fetchPerformanceStats();
  }, []);

  // Status indicator component
  const StatusIndicator: React.FC<{
    status: 'healthy' | 'warning' | 'critical';
  }> = ({ status }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'healthy':
          return '#22c55e';
        case 'warning':
          return '#f59e0b';
        case 'critical':
          return '#ef4444';
        default:
          return '#6b7280';
      }
    };

    const getStatusIcon = () => {
      switch (status) {
        case 'healthy':
          return '✅';
        case 'warning':
          return '⚠️';
        case 'critical':
          return '❌';
        default:
          return '❓';
      }
    };

    return (
      <span
        className="status-indicator"
        style={{ color: getStatusColor(), fontWeight: 'bold' }}
      >
        {getStatusIcon()} {status.toUpperCase()}
      </span>
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="diagnostic-dashboard">
      <div className="dashboard-header">
        <h3>🏥 System Health Dashboard</h3>
        <div className="dashboard-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (30s)
          </label>
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              fetchHealthStatus();
              fetchPerformanceStats();
            }}
            disabled={loading}
          >
            🔄 Refresh
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={resetHealthMonitor}
            disabled={loading}
          >
            🔄 Reset Monitor
          </Button>
        </div>
      </div>

      {error && <div className="notification notification-error">{error}</div>}

      {loading && !healthStatus && (
        <div className="loading-indicator">
          <span>🔄 Loading health status...</span>
        </div>
      )}

      {healthStatus && (
        <div className="health-status-grid">
          {/* Overall Status */}
          <Card title="Overall System Health">
            <div className="status-overview">
              <div className="status-main">
                <StatusIndicator status={healthStatus.overall} />
              </div>
              <div className="status-timestamp">
                Last checked: {formatTimestamp(healthStatus.timestamp)}
              </div>
            </div>
          </Card>

          {/* Database Health */}
          <Card title="Database Health">
            <div className="health-details">
              <div className="health-status">
                <StatusIndicator status={healthStatus.database.status} />
              </div>
              <div className="health-message">
                {healthStatus.database.message}
              </div>
              {healthStatus.database.responseTime && (
                <div className="health-metric">
                  Response time:{' '}
                  {formatDuration(healthStatus.database.responseTime)}
                </div>
              )}
              {healthStatus.database.details && (
                <details className="health-details-expand">
                  <summary>View Details</summary>
                  <pre>
                    {JSON.stringify(healthStatus.database.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </Card>

          {/* Recommendations Health */}
          <Card title="Recommendations System">
            <div className="health-details">
              <div className="health-status">
                <StatusIndicator status={healthStatus.recommendations.status} />
              </div>
              <div className="health-message">
                {healthStatus.recommendations.message}
              </div>
              {healthStatus.recommendations.responseTime && (
                <div className="health-metric">
                  Response time:{' '}
                  {formatDuration(healthStatus.recommendations.responseTime)}
                </div>
              )}
              {healthStatus.recommendations.details && (
                <details className="health-details-expand">
                  <summary>View Details</summary>
                  <pre>
                    {JSON.stringify(
                      healthStatus.recommendations.details,
                      null,
                      2
                    )}
                  </pre>
                </details>
              )}
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card title="Performance Metrics">
            <div className="performance-metrics">
              <div className="metric-item">
                <span className="metric-label">Average Response Time:</span>
                <span className="metric-value">
                  {formatDuration(healthStatus.performance.averageResponseTime)}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Success Rate:</span>
                <span className="metric-value">
                  {(healthStatus.performance.successRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Recent Operations:</span>
                <span className="metric-value">
                  {healthStatus.performance.recentOperations}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {performanceStats && (
        <div className="performance-stats-section">
          <Card title="📊 Detailed Performance Statistics">
            <div className="stats-grid">
              <div className="stat-group">
                <h4>Operation Summary</h4>
                <div className="metric-item">
                  <span className="metric-label">Total Operations:</span>
                  <span className="metric-value">
                    {performanceStats.totalOperations}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Overall Success Rate:</span>
                  <span className="metric-value">
                    {(performanceStats.successRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Average Response Time:</span>
                  <span className="metric-value">
                    {formatDuration(performanceStats.averageResponseTime)}
                  </span>
                </div>
              </div>

              <div className="stat-group">
                <h4>Operations by Type</h4>
                {Object.entries(performanceStats.operationsByType).map(
                  ([type, count]) => (
                    <div key={type} className="metric-item">
                      <span className="metric-label">{type}:</span>
                      <span className="metric-value">{count}</span>
                    </div>
                  )
                )}
              </div>

              {performanceStats.recentFailures.length > 0 && (
                <div className="stat-group">
                  <h4>Recent Failures</h4>
                  <div className="failures-list">
                    {performanceStats.recentFailures
                      .slice(0, 5)
                      .map((failure, index) => (
                        <div key={index} className="failure-item">
                          <div className="failure-header">
                            <span className="failure-type">
                              {failure.operationType}
                            </span>
                            <span className="failure-time">
                              {formatTimestamp(failure.timestamp)}
                            </span>
                          </div>
                          <div className="failure-duration">
                            Duration: {formatDuration(failure.duration)}
                          </div>
                          {failure.errorMessage && (
                            <div className="failure-error">
                              Error: {failure.errorMessage}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Troubleshooting Guide */}
      <Card title="🔧 Troubleshooting Guide">
        <div className="troubleshooting-guide">
          <div className="guide-section">
            <h4>Common Issues & Solutions</h4>
            <div className="guide-item">
              <strong>❌ Database Connection Failed:</strong>
              <ul>
                <li>Check if the database file exists and is accessible</li>
                <li>Verify file permissions for the database directory</li>
                <li>Try restarting the application</li>
                <li>Check available disk space</li>
              </ul>
            </div>
            <div className="guide-item">
              <strong>⚠️ Slow Performance:</strong>
              <ul>
                <li>Check system memory usage</li>
                <li>Close other resource-intensive applications</li>
                <li>Clear old data if database is large</li>
                <li>Restart the application to clear caches</li>
              </ul>
            </div>
            <div className="guide-item">
              <strong>❌ Recommendations Not Saving:</strong>
              <ul>
                <li>Verify database write permissions</li>
                <li>Check if analysis ID exists</li>
                <li>Ensure recommendation data is valid</li>
                <li>Try clearing and re-running the analysis</li>
              </ul>
            </div>
            <div className="guide-item">
              <strong>❌ Recommendations Not Loading:</strong>
              <ul>
                <li>Verify the analysis was completed successfully</li>
                <li>Check if recommendations were saved properly</li>
                <li>Try refreshing the analysis results</li>
                <li>Check browser console for JavaScript errors</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DiagnosticDashboard;
