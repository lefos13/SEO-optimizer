/**
 * Health Monitor for Recommendation System
 * Provides comprehensive monitoring, metrics collection, and health checks
 * for the recommendation storage and retrieval system
 */

import dbManager from './dbManager';

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  responseTime?: number;
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  operationType: 'save' | 'fetch' | 'health_check';
  duration: number;
  success: boolean;
  timestamp: string;
  analysisId?: number;
  recordCount?: number;
  errorMessage?: string;
}

/**
 * System health status interface
 */
export interface SystemHealthStatus {
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

/**
 * Health monitoring configuration
 */
interface HealthMonitorConfig {
  metricsRetentionHours: number;
  performanceThresholds: {
    slowOperationMs: number;
    criticalOperationMs: number;
    minSuccessRate: number;
  };
  alerting: {
    enabled: boolean;
    consecutiveFailuresThreshold: number;
  };
}

/**
 * Health Monitor class for recommendation system
 */
export class RecommendationHealthMonitor {
  private metrics: PerformanceMetrics[] = [];
  private consecutiveFailures = 0;
  private lastHealthCheck: SystemHealthStatus | null = null;
  private config: HealthMonitorConfig;

  constructor(config?: Partial<HealthMonitorConfig>) {
    this.config = {
      metricsRetentionHours: 24,
      performanceThresholds: {
        slowOperationMs: 5000,
        criticalOperationMs: 15000,
        minSuccessRate: 0.95,
      },
      alerting: {
        enabled: true,
        consecutiveFailuresThreshold: 3,
      },
      ...config,
    };
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<SystemHealthStatus> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    console.log('[HEALTH] 🏥 Starting comprehensive health check...');

    try {
      // Database connectivity check
      const databaseHealth = await this.checkDatabaseHealth();

      // Recommendations system check
      const recommendationsHealth = await this.checkRecommendationsHealth();

      // Performance metrics analysis
      const performanceMetrics = this.analyzePerformanceMetrics();

      // Determine overall health status
      const overall = this.determineOverallHealth([
        databaseHealth,
        recommendationsHealth,
      ]);

      const healthStatus: SystemHealthStatus = {
        overall,
        database: databaseHealth,
        recommendations: recommendationsHealth,
        performance: performanceMetrics,
        timestamp,
      };

      this.lastHealthCheck = healthStatus;

      // Record health check performance
      this.recordMetric({
        operationType: 'health_check',
        duration: Date.now() - startTime,
        success: overall !== 'critical',
        timestamp,
      });

      console.log(
        `[HEALTH] ✅ Health check completed (${Date.now() - startTime}ms):`,
        {
          overall,
          database: databaseHealth.status,
          recommendations: recommendationsHealth.status,
          performance: performanceMetrics,
        }
      );

      return healthStatus;
    } catch (error) {
      console.error(
        '[HEALTH] ❌ Health check failed:',
        (error as Error).message
      );

      const criticalStatus: SystemHealthStatus = {
        overall: 'critical',
        database: {
          status: 'critical',
          message: `Health check failed: ${(error as Error).message}`,
          timestamp,
        },
        recommendations: {
          status: 'critical',
          message: 'Unable to check due to health check failure',
          timestamp,
        },
        performance: {
          averageResponseTime: 0,
          successRate: 0,
          recentOperations: 0,
        },
        timestamp,
      };

      this.lastHealthCheck = criticalStatus;
      return criticalStatus;
    }
  }

  /**
   * Check database connectivity and basic operations
   */
  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // Test database manager initialization
      if (!dbManager.getStats()?.isInitialized) {
        return {
          status: 'critical',
          message: 'Database manager not initialized',
          timestamp,
          responseTime: Date.now() - startTime,
        };
      }

      // Get database instance
      const db = dbManager.getDb();
      if (!db) {
        return {
          status: 'critical',
          message: 'Database connection is null',
          timestamp,
          responseTime: Date.now() - startTime,
        };
      }

      // Test basic connectivity
      const connectivityTest = db.exec(
        'SELECT 1 as test_value, datetime("now") as current_time'
      );
      if (!connectivityTest || connectivityTest.length === 0) {
        return {
          status: 'critical',
          message: 'Database connectivity test failed',
          timestamp,
          responseTime: Date.now() - startTime,
        };
      }

      // Test table existence
      const tablesCheck = db.exec(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('recommendations', 'analyses', 'projects')
      `);

      const existingTables =
        tablesCheck.length > 0 && tablesCheck[0]
          ? tablesCheck[0].values.map(row => row[0])
          : [];

      const requiredTables = ['recommendations', 'analyses', 'projects'];
      const missingTables = requiredTables.filter(
        table => !existingTables.includes(table)
      );

      if (missingTables.length > 0) {
        return {
          status: 'critical',
          message: `Missing required tables: ${missingTables.join(', ')}`,
          details: { existingTables, missingTables },
          timestamp,
          responseTime: Date.now() - startTime,
        };
      }

      // Test database integrity
      const integrityCheck = db.exec('PRAGMA integrity_check(1)');
      const integrityResult =
        integrityCheck.length > 0 && integrityCheck[0]?.values?.[0]?.[0];

      if (integrityResult !== 'ok') {
        return {
          status: 'warning',
          message: `Database integrity check failed: ${integrityResult}`,
          timestamp,
          responseTime: Date.now() - startTime,
        };
      }

      // Get database statistics
      const stats = dbManager.getStats();
      const responseTime = Date.now() - startTime;

      return {
        status:
          responseTime > this.config.performanceThresholds.slowOperationMs
            ? 'warning'
            : 'healthy',
        message: 'Database connection healthy',
        details: {
          responseTime,
          stats,
          tablesFound: existingTables.length,
          integrityCheck: integrityResult,
        },
        timestamp,
        responseTime,
      };
    } catch (error) {
      return {
        status: 'critical',
        message: `Database health check failed: ${(error as Error).message}`,
        details: { error: (error as Error).message },
        timestamp,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check recommendations system health
   */
  private async checkRecommendationsHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      const db = dbManager.getDb();
      if (!db) {
        return {
          status: 'critical',
          message: 'Database not available for recommendations check',
          timestamp,
          responseTime: Date.now() - startTime,
        };
      }

      // Check recommendations table structure
      const tableInfo = db.exec('PRAGMA table_info(recommendations)');
      if (!tableInfo || tableInfo.length === 0 || !tableInfo[0]) {
        return {
          status: 'critical',
          message: 'Recommendations table not found or inaccessible',
          timestamp,
          responseTime: Date.now() - startTime,
        };
      }

      const columns = tableInfo[0].values.map(row => ({
        name: row[1],
        type: row[2],
        notNull: row[3],
      }));

      // Verify required columns exist
      const requiredColumns = [
        'id',
        'analysis_id',
        'title',
        'priority',
        'status',
      ];
      const missingColumns = requiredColumns.filter(
        reqCol => !columns.some(col => col.name === reqCol)
      );

      if (missingColumns.length > 0) {
        return {
          status: 'critical',
          message: `Missing required columns: ${missingColumns.join(', ')}`,
          details: {
            availableColumns: columns.map(c => c.name),
            missingColumns,
          },
          timestamp,
          responseTime: Date.now() - startTime,
        };
      }

      // Check data consistency
      const dataChecks = {
        totalRecommendations: 0,
        orphanedRecommendations: 0,
        recentActivity: 0,
      };

      // Total recommendations count
      const totalResult = db.exec(
        'SELECT COUNT(*) as count FROM recommendations'
      );
      dataChecks.totalRecommendations =
        totalResult.length > 0 && totalResult[0]?.values?.[0]?.[0]
          ? (totalResult[0].values[0][0] as number)
          : 0;

      // Check for orphaned recommendations (recommendations without valid analysis)
      const orphanedResult = db.exec(`
        SELECT COUNT(*) as count FROM recommendations r 
        LEFT JOIN analyses a ON r.analysis_id = a.id 
        WHERE a.id IS NULL
      `);
      dataChecks.orphanedRecommendations =
        orphanedResult.length > 0 && orphanedResult[0]?.values?.[0]?.[0]
          ? (orphanedResult[0].values[0][0] as number)
          : 0;

      // Check recent activity (last 24 hours)
      const recentResult = db.exec(`
        SELECT COUNT(*) as count FROM recommendations 
        WHERE created_at > datetime('now', '-24 hours')
      `);
      dataChecks.recentActivity =
        recentResult.length > 0 && recentResult[0]?.values?.[0]?.[0]
          ? (recentResult[0].values[0][0] as number)
          : 0;

      const responseTime = Date.now() - startTime;

      // Determine status based on checks
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message = 'Recommendations system healthy';

      if (dataChecks.orphanedRecommendations > 0) {
        status = 'warning';
        message = `Found ${dataChecks.orphanedRecommendations} orphaned recommendations`;
      }

      if (responseTime > this.config.performanceThresholds.slowOperationMs) {
        status = 'warning';
        message += ` (slow response: ${responseTime}ms)`;
      }

      return {
        status,
        message,
        details: {
          responseTime,
          dataChecks,
          columnCount: columns.length,
          requiredColumnsPresent: requiredColumns.length,
        },
        timestamp,
        responseTime,
      };
    } catch (error) {
      return {
        status: 'critical',
        message: `Recommendations health check failed: ${(error as Error).message}`,
        details: { error: (error as Error).message },
        timestamp,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Record performance metric
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Update consecutive failures counter
    if (!metric.success) {
      this.consecutiveFailures++;
    } else {
      this.consecutiveFailures = 0;
    }

    // Clean old metrics
    this.cleanOldMetrics();

    // Check for alerting conditions
    if (this.config.alerting.enabled) {
      this.checkAlertConditions(metric);
    }

    console.log(`[HEALTH] 📊 Recorded metric:`, {
      operation: metric.operationType,
      duration: metric.duration,
      success: metric.success,
      consecutiveFailures: this.consecutiveFailures,
    });
  }

  /**
   * Analyze performance metrics
   */
  private analyzePerformanceMetrics(): {
    averageResponseTime: number;
    successRate: number;
    recentOperations: number;
  } {
    const recentMetrics = this.getRecentMetrics(1); // Last hour

    if (recentMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        successRate: 1,
        recentOperations: 0,
      };
    }

    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const successfulOperations = recentMetrics.filter(m => m.success).length;

    return {
      averageResponseTime: totalDuration / recentMetrics.length,
      successRate: successfulOperations / recentMetrics.length,
      recentOperations: recentMetrics.length,
    };
  }

  /**
   * Get recent metrics within specified hours
   */
  private getRecentMetrics(hours: number): PerformanceMetrics[] {
    const cutoffTime = new Date(
      Date.now() - hours * 60 * 60 * 1000
    ).toISOString();
    return this.metrics.filter(m => m.timestamp >= cutoffTime);
  }

  /**
   * Clean old metrics based on retention policy
   */
  private cleanOldMetrics(): void {
    const cutoffTime = new Date(
      Date.now() - this.config.metricsRetentionHours * 60 * 60 * 1000
    ).toISOString();

    const originalLength = this.metrics.length;
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoffTime);

    if (this.metrics.length < originalLength) {
      console.log(
        `[HEALTH] 🧹 Cleaned ${originalLength - this.metrics.length} old metrics`
      );
    }
  }

  /**
   * Check for alert conditions
   */
  private checkAlertConditions(metric: PerformanceMetrics): void {
    // Check consecutive failures
    if (
      this.consecutiveFailures >=
      this.config.alerting.consecutiveFailuresThreshold
    ) {
      console.warn(
        `[HEALTH] 🚨 ALERT: ${this.consecutiveFailures} consecutive failures detected`
      );
    }

    // Check slow operations
    if (
      metric.duration > this.config.performanceThresholds.criticalOperationMs
    ) {
      console.warn(
        `[HEALTH] 🚨 ALERT: Critical slow operation detected (${metric.duration}ms)`
      );
    }

    // Check success rate
    const recentMetrics = this.getRecentMetrics(1);
    if (recentMetrics.length >= 10) {
      const successRate =
        recentMetrics.filter(m => m.success).length / recentMetrics.length;
      if (successRate < this.config.performanceThresholds.minSuccessRate) {
        console.warn(
          `[HEALTH] 🚨 ALERT: Low success rate detected (${(successRate * 100).toFixed(1)}%)`
        );
      }
    }
  }

  /**
   * Determine overall health status from individual checks
   */
  private determineOverallHealth(
    checks: HealthCheckResult[]
  ): 'healthy' | 'warning' | 'critical' {
    if (checks.some(check => check.status === 'critical')) {
      return 'critical';
    }
    if (checks.some(check => check.status === 'warning')) {
      return 'warning';
    }
    return 'healthy';
  }

  /**
   * Get current health status (cached or perform new check)
   */
  getCurrentHealthStatus(): SystemHealthStatus | null {
    return this.lastHealthCheck;
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    totalOperations: number;
    successRate: number;
    averageResponseTime: number;
    operationsByType: Record<string, number>;
    recentFailures: PerformanceMetrics[];
  } {
    const totalOperations = this.metrics.length;
    const successfulOperations = this.metrics.filter(m => m.success).length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);

    const operationsByType = this.metrics.reduce(
      (acc, m) => {
        acc[m.operationType] = (acc[m.operationType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const recentFailures = this.metrics.filter(m => !m.success).slice(-10); // Last 10 failures

    return {
      totalOperations,
      successRate:
        totalOperations > 0 ? successfulOperations / totalOperations : 1,
      averageResponseTime:
        totalOperations > 0 ? totalDuration / totalOperations : 0,
      operationsByType,
      recentFailures,
    };
  }

  /**
   * Reset metrics and counters
   */
  reset(): void {
    this.metrics = [];
    this.consecutiveFailures = 0;
    this.lastHealthCheck = null;
    console.log('[HEALTH] 🔄 Health monitor reset');
  }
}

// Export singleton instance
export const healthMonitor = new RecommendationHealthMonitor();

/**
 * Convenience function to record save operation metrics
 */
export function recordSaveMetrics(
  duration: number,
  success: boolean,
  analysisId: number,
  recordCount?: number,
  errorMessage?: string
): void {
  healthMonitor.recordMetric({
    operationType: 'save',
    duration,
    success,
    timestamp: new Date().toISOString(),
    analysisId,
    recordCount,
    errorMessage,
  });
}

/**
 * Convenience function to record fetch operation metrics
 */
export function recordFetchMetrics(
  duration: number,
  success: boolean,
  analysisId: number,
  recordCount?: number,
  errorMessage?: string
): void {
  healthMonitor.recordMetric({
    operationType: 'fetch',
    duration,
    success,
    timestamp: new Date().toISOString(),
    analysisId,
    recordCount,
    errorMessage,
  });
}
