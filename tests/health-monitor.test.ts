/**
 * Health Monitor Test
 * Basic test to verify health monitoring functionality
 */

import { RecommendationHealthMonitor } from '../src/main/healthMonitor';

describe('RecommendationHealthMonitor', () => {
  let healthMonitor: RecommendationHealthMonitor;

  beforeEach(() => {
    healthMonitor = new RecommendationHealthMonitor();
  });

  afterEach(() => {
    healthMonitor.reset();
  });

  test('should initialize with default configuration', () => {
    expect(healthMonitor).toBeDefined();
    expect(healthMonitor.getCurrentHealthStatus()).toBeNull();
  });

  test('should record performance metrics', () => {
    const metric = {
      operationType: 'save' as const,
      duration: 100,
      success: true,
      timestamp: new Date().toISOString(),
      analysisId: 1,
      recordCount: 5,
    };

    healthMonitor.recordMetric(metric);

    const stats = healthMonitor.getPerformanceStats();
    expect(stats.totalOperations).toBe(1);
    expect(stats.successRate).toBe(1);
    expect(stats.operationsByType.save).toBe(1);
  });

  test('should track consecutive failures', () => {
    // Record multiple failures
    for (let i = 0; i < 3; i++) {
      healthMonitor.recordMetric({
        operationType: 'fetch' as const,
        duration: 1000,
        success: false,
        timestamp: new Date().toISOString(),
        analysisId: 1,
        errorMessage: 'Test error',
      });
    }

    const stats = healthMonitor.getPerformanceStats();
    expect(stats.successRate).toBe(0);
    expect(stats.recentFailures.length).toBe(3);
  });

  test('should calculate performance statistics correctly', () => {
    // Record mixed success/failure metrics
    healthMonitor.recordMetric({
      operationType: 'save' as const,
      duration: 50,
      success: true,
      timestamp: new Date().toISOString(),
    });

    healthMonitor.recordMetric({
      operationType: 'fetch' as const,
      duration: 150,
      success: false,
      timestamp: new Date().toISOString(),
      errorMessage: 'Test error',
    });

    const stats = healthMonitor.getPerformanceStats();
    expect(stats.totalOperations).toBe(2);
    expect(stats.successRate).toBe(0.5);
    expect(stats.averageResponseTime).toBe(100);
    expect(stats.operationsByType.save).toBe(1);
    expect(stats.operationsByType.fetch).toBe(1);
  });

  test('should reset metrics and state', () => {
    healthMonitor.recordMetric({
      operationType: 'save' as const,
      duration: 100,
      success: true,
      timestamp: new Date().toISOString(),
    });

    expect(healthMonitor.getPerformanceStats().totalOperations).toBe(1);

    healthMonitor.reset();

    expect(healthMonitor.getPerformanceStats().totalOperations).toBe(0);
    expect(healthMonitor.getCurrentHealthStatus()).toBeNull();
  });
});
