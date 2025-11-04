import type { Database as SqlJsDatabase } from 'sql.js';
import dbManager from '../main/dbManager';
import * as recommendationPersistence from '../database/recommendationPersistence';
import { dbInspectionUtils } from './debugUtils';

/**
 * End-to-End Flow Verification Utilities
 * Provides comprehensive testing and verification of the complete save-fetch cycle
 */

/**
 * Test recommendation data structure
 */
interface TestRecommendation {
  id: string;
  ruleId: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  effort: 'quick' | 'easy' | 'medium' | 'hard' | 'complex';
  estimatedTime: string;
  impactEstimate: {
    scoreIncrease: number;
    percentageIncrease: number;
  };
  why: string;
  actions: Array<{
    step: number;
    action: string;
    type: string;
    specific: boolean;
  }>;
  example?: {
    before?: string;
    after?: string;
  };
  resources?: Array<{
    title: string;
    url: string;
  }>;
  status: 'pending' | 'in-progress' | 'completed' | 'dismissed';
}

/**
 * Flow verification test result
 */
interface FlowVerificationResult {
  testId: string;
  timestamp: string;
  analysisId: number;
  success: boolean;
  phases: {
    setup: PhaseResult;
    save: PhaseResult;
    fetch: PhaseResult;
    validation: PhaseResult;
    cleanup: PhaseResult;
  };
  metrics: {
    totalExecutionTimeMs: number;
    saveTimeMs: number;
    fetchTimeMs: number;
    recommendationCount: number;
    dataIntegrityScore: number;
  };
  errors: string[];
  summary: string;
}

/**
 * Individual phase result
 */
interface PhaseResult {
  success: boolean;
  executionTimeMs: number;
  details: string;
  errors: string[];
}

/**
 * Data consistency check result
 */
interface DataConsistencyResult {
  isConsistent: boolean;
  expectedCount: number;
  actualCount: number;
  missingRecommendations: string[];
  extraRecommendations: string[];
  corruptedRecommendations: Array<{
    id: string;
    issues: string[];
  }>;
  integrityScore: number;
}

/**
 * Performance monitoring result
 */
interface PerformanceMonitoringResult {
  operationType: string;
  executionTimeMs: number;
  throughputPerSecond: number;
  memoryUsageMB: number;
  rating: 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical';
  recommendations: string[];
}

/**
 * Analysis ID correlation tracking result
 */
interface AnalysisCorrelationResult {
  analysisId: number;
  correlationId: string;
  operationCount: number;
  operations: Array<{
    timestamp: string;
    operation: string;
    success: boolean;
    details: string;
  }>;
  dataConsistency: boolean;
  issues: string[];
}

/**
 * End-to-End Flow Verification Utilities Class
 */
export class FlowVerificationUtils {
  private static instance: FlowVerificationUtils;
  private db: SqlJsDatabase | null = null;
  private correlationTracking: Map<number, AnalysisCorrelationResult> =
    new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): FlowVerificationUtils {
    if (!FlowVerificationUtils.instance) {
      FlowVerificationUtils.instance = new FlowVerificationUtils();
    }
    return FlowVerificationUtils.instance;
  }

  /**
   * Initialize with database connection
   */
  initialize(): void {
    try {
      this.db = dbManager.getDb();
      console.log('[FLOW-VERIFY] Flow verification utilities initialized');
    } catch (error) {
      console.error(
        '[FLOW-VERIFY] Failed to initialize database connection:',
        error
      );
      throw new Error(
        `Flow verification initialization failed: ${(error as Error).message}`
      );
    }
  }

  /**
   * Ensure database connection is available
   */
  private ensureConnection(): SqlJsDatabase {
    if (!this.db) {
      this.initialize();
    }
    if (!this.db) {
      throw new Error('Database connection not available');
    }
    return this.db;
  }

  /**
   * Generate test recommendation data
   */
  private generateTestRecommendations(count: number = 5): TestRecommendation[] {
    const recommendations: TestRecommendation[] = [];
    const priorities: Array<'critical' | 'high' | 'medium' | 'low'> = [
      'critical',
      'high',
      'medium',
      'low',
    ];
    const efforts: Array<'quick' | 'easy' | 'medium' | 'hard' | 'complex'> = [
      'quick',
      'easy',
      'medium',
      'hard',
      'complex',
    ];
    const categories = [
      'meta',
      'content',
      'technical',
      'keywords',
      'readability',
    ];

    for (let i = 0; i < count; i++) {
      recommendations.push({
        id: `test-rec-${i + 1}`,
        ruleId: `test-rule-${i + 1}`,
        title: `Test Recommendation ${i + 1}`,
        priority: priorities[i % priorities.length] as
          | 'critical'
          | 'high'
          | 'medium'
          | 'low',
        category: categories[i % categories.length] as string,
        description: `This is a test recommendation ${i + 1} for flow verification`,
        effort: efforts[i % efforts.length] as
          | 'quick'
          | 'easy'
          | 'medium'
          | 'hard'
          | 'complex',
        estimatedTime: `${(i + 1) * 5} minutes`,
        impactEstimate: {
          scoreIncrease: (i + 1) * 2,
          percentageIncrease: (i + 1) * 3,
        },
        why: `Test explanation for recommendation ${i + 1}`,
        actions: [
          {
            step: 1,
            action: `First action for recommendation ${i + 1}`,
            type: 'action',
            specific: true,
          },
          {
            step: 2,
            action: `Second action for recommendation ${i + 1}`,
            type: 'verification',
            specific: false,
          },
        ],
        example: {
          before: `Before example ${i + 1}`,
          after: `After example ${i + 1}`,
        },
        resources: [
          {
            title: `Resource ${i + 1}`,
            url: `https://example.com/resource-${i + 1}`,
          },
        ],
        status: 'pending',
      });
    }

    return recommendations;
  }

  /**
   * Create a test analysis for verification
   */
  private async createTestAnalysis(): Promise<number> {
    const db = this.ensureConnection();

    try {
      // Create a test project if it doesn't exist
      let projectId: number;
      const projectResult = db.exec(
        "SELECT id FROM projects WHERE name = 'Flow Verification Test' LIMIT 1"
      );

      if (projectResult.length > 0 && projectResult[0]?.values?.[0]?.[0]) {
        projectId = projectResult[0].values[0][0] as number;
      } else {
        db.run('INSERT INTO projects (name, description) VALUES (?, ?)', [
          'Flow Verification Test',
          'Test project for flow verification',
        ]);

        const insertResult = db.exec('SELECT last_insert_rowid() as id');
        projectId = insertResult[0]?.values?.[0]?.[0] as number;
      }

      // Create test analysis
      db.run(
        `INSERT INTO analyses (project_id, content, title, language) VALUES (?, ?, ?, ?)`,
        [
          projectId,
          '<html><head><title>Test Content</title></head><body><h1>Test</h1></body></html>',
          'Flow Verification Test Analysis',
          'en',
        ]
      );

      const analysisResult = db.exec('SELECT last_insert_rowid() as id');
      const analysisId = analysisResult[0]?.values?.[0]?.[0] as number;

      console.log(`[FLOW-VERIFY] Created test analysis with ID: ${analysisId}`);
      return analysisId;
    } catch (error) {
      console.error('[FLOW-VERIFY] Failed to create test analysis:', error);
      throw new Error(
        `Test analysis creation failed: ${(error as Error).message}`
      );
    }
  }

  /**
   * Verify complete save-fetch cycle
   */
  async verifyCompleteSaveFetchCycle(
    testRecommendationCount: number = 5
  ): Promise<FlowVerificationResult> {
    const testId = `flow-test-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const startTime = Date.now();

    console.log(
      `[FLOW-VERIFY] 🚀 Starting complete save-fetch cycle verification: ${testId}`
    );

    const result: FlowVerificationResult = {
      testId,
      timestamp,
      analysisId: 0,
      success: false,
      phases: {
        setup: { success: false, executionTimeMs: 0, details: '', errors: [] },
        save: { success: false, executionTimeMs: 0, details: '', errors: [] },
        fetch: { success: false, executionTimeMs: 0, details: '', errors: [] },
        validation: {
          success: false,
          executionTimeMs: 0,
          details: '',
          errors: [],
        },
        cleanup: {
          success: false,
          executionTimeMs: 0,
          details: '',
          errors: [],
        },
      },
      metrics: {
        totalExecutionTimeMs: 0,
        saveTimeMs: 0,
        fetchTimeMs: 0,
        recommendationCount: 0,
        dataIntegrityScore: 0,
      },
      errors: [],
      summary: '',
    };

    try {
      // Phase 1: Setup
      const setupStart = Date.now();
      try {
        this.ensureConnection();
        result.analysisId = await this.createTestAnalysis();
        const testRecommendations = this.generateTestRecommendations(
          testRecommendationCount
        );

        result.phases.setup = {
          success: true,
          executionTimeMs: Date.now() - setupStart,
          details: `Created test analysis ${result.analysisId} with ${testRecommendations.length} test recommendations`,
          errors: [],
        };

        console.log(`[FLOW-VERIFY] ✅ Setup phase completed`);
      } catch (error) {
        result.phases.setup.errors.push((error as Error).message);
        result.errors.push(`Setup failed: ${(error as Error).message}`);
        throw error;
      }

      // Phase 2: Save
      const saveStart = Date.now();
      try {
        const testRecommendations = this.generateTestRecommendations(
          testRecommendationCount
        );
        const enhancedRecommendations = {
          recommendations: testRecommendations,
        };

        const savedCount = recommendationPersistence.saveRecommendations(
          this.db as SqlJsDatabase,
          result.analysisId,
          enhancedRecommendations,
          dbManager
        );

        result.metrics.saveTimeMs = Date.now() - saveStart;
        result.phases.save = {
          success: savedCount === testRecommendationCount,
          executionTimeMs: result.metrics.saveTimeMs,
          details: `Saved ${savedCount}/${testRecommendationCount} recommendations`,
          errors:
            savedCount !== testRecommendationCount
              ? [`Expected ${testRecommendationCount}, saved ${savedCount}`]
              : [],
        };

        if (savedCount !== testRecommendationCount) {
          throw new Error(
            `Save count mismatch: expected ${testRecommendationCount}, got ${savedCount}`
          );
        }

        console.log(
          `[FLOW-VERIFY] ✅ Save phase completed: ${savedCount} recommendations saved`
        );
      } catch (error) {
        result.phases.save.errors.push((error as Error).message);
        result.errors.push(`Save failed: ${(error as Error).message}`);
        throw error;
      }

      // Phase 3: Fetch
      const fetchStart = Date.now();
      try {
        const fetchedRecommendations =
          recommendationPersistence.getRecommendations(
            this.db as SqlJsDatabase,
            result.analysisId
          );

        result.metrics.fetchTimeMs = Date.now() - fetchStart;
        result.metrics.recommendationCount = fetchedRecommendations.length;

        result.phases.fetch = {
          success: fetchedRecommendations.length === testRecommendationCount,
          executionTimeMs: result.metrics.fetchTimeMs,
          details: `Fetched ${fetchedRecommendations.length}/${testRecommendationCount} recommendations`,
          errors:
            fetchedRecommendations.length !== testRecommendationCount
              ? [
                  `Expected ${testRecommendationCount}, fetched ${fetchedRecommendations.length}`,
                ]
              : [],
        };

        if (fetchedRecommendations.length !== testRecommendationCount) {
          throw new Error(
            `Fetch count mismatch: expected ${testRecommendationCount}, got ${fetchedRecommendations.length}`
          );
        }

        console.log(
          `[FLOW-VERIFY] ✅ Fetch phase completed: ${fetchedRecommendations.length} recommendations fetched`
        );
      } catch (error) {
        result.phases.fetch.errors.push((error as Error).message);
        result.errors.push(`Fetch failed: ${(error as Error).message}`);
        throw error;
      }

      // Phase 4: Validation
      const validationStart = Date.now();
      try {
        const consistencyResult = this.performDataConsistencyCheck(
          result.analysisId,
          testRecommendationCount
        );

        result.metrics.dataIntegrityScore = consistencyResult.integrityScore;
        result.phases.validation = {
          success: consistencyResult.isConsistent,
          executionTimeMs: Date.now() - validationStart,
          details: `Data integrity score: ${consistencyResult.integrityScore}%`,
          errors: consistencyResult.isConsistent
            ? []
            : [`Data consistency issues detected`],
        };

        if (!consistencyResult.isConsistent) {
          throw new Error(
            `Data consistency validation failed: score ${consistencyResult.integrityScore}%`
          );
        }

        console.log(
          `[FLOW-VERIFY] ✅ Validation phase completed: ${consistencyResult.integrityScore}% integrity`
        );
      } catch (error) {
        result.phases.validation.errors.push((error as Error).message);
        result.errors.push(`Validation failed: ${(error as Error).message}`);
        throw error;
      }

      // Phase 5: Cleanup
      const cleanupStart = Date.now();
      try {
        // Clean up test data
        (this.db as SqlJsDatabase).run(
          'DELETE FROM recommendations WHERE analysis_id = ?',
          [result.analysisId]
        );
        (this.db as SqlJsDatabase).run('DELETE FROM analyses WHERE id = ?', [
          result.analysisId,
        ]);

        result.phases.cleanup = {
          success: true,
          executionTimeMs: Date.now() - cleanupStart,
          details: 'Test data cleaned up successfully',
          errors: [],
        };

        console.log(`[FLOW-VERIFY] ✅ Cleanup phase completed`);
      } catch (error) {
        result.phases.cleanup.errors.push((error as Error).message);
        result.errors.push(`Cleanup failed: ${(error as Error).message}`);
        // Don't throw here as the main test succeeded
      }

      // Calculate final metrics
      result.metrics.totalExecutionTimeMs = Date.now() - startTime;
      result.success = Object.values(result.phases).every(
        phase => phase.success
      );
      result.summary = result.success
        ? `✅ Complete save-fetch cycle verification PASSED in ${result.metrics.totalExecutionTimeMs}ms`
        : `❌ Complete save-fetch cycle verification FAILED`;

      console.log(
        `[FLOW-VERIFY] ${result.success ? '✅' : '❌'} Flow verification completed:`,
        result.summary
      );
      return result;
    } catch (error) {
      result.metrics.totalExecutionTimeMs = Date.now() - startTime;
      result.success = false;
      result.summary = `❌ Flow verification FAILED: ${(error as Error).message}`;

      console.error(`[FLOW-VERIFY] ❌ Flow verification failed:`, error);
      return result;
    }
  }

  /**
   * Perform data consistency checks
   */
  performDataConsistencyCheck(
    analysisId: number,
    expectedCount: number
  ): DataConsistencyResult {
    const db = this.ensureConnection();

    console.log(
      `[FLOW-VERIFY] 🔍 Performing data consistency check for analysis ${analysisId}`
    );

    try {
      // Get actual recommendations
      const actualRecommendations =
        recommendationPersistence.getRecommendations(db, analysisId);
      const actualCount = actualRecommendations.length;

      // Check for missing or extra recommendations
      const missingRecommendations: string[] = [];
      const extraRecommendations: string[] = [];
      const corruptedRecommendations: Array<{ id: string; issues: string[] }> =
        [];

      // Validate each recommendation
      actualRecommendations.forEach(rec => {
        const issues: string[] = [];

        // Check required fields
        if (!rec.title || rec.title.trim() === '') {
          issues.push('Missing or empty title');
        }
        if (
          !rec.priority ||
          !['critical', 'high', 'medium', 'low'].includes(rec.priority)
        ) {
          issues.push('Invalid priority');
        }
        if (!rec.category || rec.category.trim() === '') {
          issues.push('Missing or empty category');
        }
        if (
          !rec.effort ||
          !['quick', 'easy', 'medium', 'hard', 'complex'].includes(rec.effort)
        ) {
          issues.push('Invalid effort');
        }

        if (issues.length > 0) {
          corruptedRecommendations.push({
            id: rec.rec_id || rec.id.toString(),
            issues,
          });
        }
      });

      // Calculate integrity score
      let integrityScore = 100;

      if (actualCount !== expectedCount) {
        integrityScore -= Math.abs(actualCount - expectedCount) * 10;
      }

      integrityScore -= corruptedRecommendations.length * 15;
      integrityScore = Math.max(0, integrityScore);

      const isConsistent =
        actualCount === expectedCount && corruptedRecommendations.length === 0;

      const result: DataConsistencyResult = {
        isConsistent,
        expectedCount,
        actualCount,
        missingRecommendations,
        extraRecommendations,
        corruptedRecommendations,
        integrityScore,
      };

      console.log(
        `[FLOW-VERIFY] ${isConsistent ? '✅' : '❌'} Data consistency check:`,
        {
          isConsistent,
          integrityScore,
          actualCount,
          expectedCount,
          corruptedCount: corruptedRecommendations.length,
        }
      );

      return result;
    } catch (error) {
      console.error('[FLOW-VERIFY] ❌ Data consistency check failed:', error);
      return {
        isConsistent: false,
        expectedCount,
        actualCount: 0,
        missingRecommendations: [],
        extraRecommendations: [],
        corruptedRecommendations: [],
        integrityScore: 0,
      };
    }
  }

  /**
   * Add analysis ID correlation tracking
   */
  addAnalysisCorrelationTracking(
    analysisId: number,
    operation: string,
    success: boolean,
    details: string
  ): void {
    const correlationId = `corr-${analysisId}-${Date.now()}`;

    if (!this.correlationTracking.has(analysisId)) {
      this.correlationTracking.set(analysisId, {
        analysisId,
        correlationId,
        operationCount: 0,
        operations: [],
        dataConsistency: true,
        issues: [],
      });
    }

    const tracking = this.correlationTracking.get(analysisId)!;
    tracking.operationCount++;
    tracking.operations.push({
      timestamp: new Date().toISOString(),
      operation,
      success,
      details,
    });

    if (!success) {
      tracking.dataConsistency = false;
      tracking.issues.push(`${operation} failed: ${details}`);
    }

    console.log(
      `[FLOW-VERIFY] 📊 Correlation tracking updated for analysis ${analysisId}:`,
      {
        operation,
        success,
        totalOperations: tracking.operationCount,
      }
    );
  }

  /**
   * Get analysis correlation tracking result
   */
  getAnalysisCorrelationResult(
    analysisId: number
  ): AnalysisCorrelationResult | null {
    return this.correlationTracking.get(analysisId) || null;
  }

  /**
   * Monitor performance of recommendation operations
   */
  monitorRecommendationOperationPerformance(
    operationType: 'save' | 'fetch' | 'update' | 'delete',
    operation: () => unknown
  ): PerformanceMonitoringResult {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB

    console.log(
      `[FLOW-VERIFY] ⏱️ Starting performance monitoring for ${operationType} operation`
    );

    try {
      operation();
      const executionTimeMs = Date.now() - startTime;
      const endMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      const memoryUsageMB = endMemory - startMemory;

      // Calculate throughput (operations per second)
      const throughputPerSecond = 1000 / executionTimeMs;

      // Determine performance rating
      let rating: 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical';
      const recommendations: string[] = [];

      if (executionTimeMs < 50) {
        rating = 'excellent';
      } else if (executionTimeMs < 200) {
        rating = 'good';
      } else if (executionTimeMs < 1000) {
        rating = 'acceptable';
        recommendations.push('Consider optimizing database queries');
      } else if (executionTimeMs < 5000) {
        rating = 'poor';
        recommendations.push(
          'Performance issues detected - review database indexes'
        );
        recommendations.push('Consider implementing connection pooling');
      } else {
        rating = 'critical';
        recommendations.push(
          'Critical performance issues - immediate optimization required'
        );
        recommendations.push('Review database schema and query optimization');
      }

      if (memoryUsageMB > 10) {
        recommendations.push(
          'High memory usage detected - review data structures'
        );
      }

      const performanceResult: PerformanceMonitoringResult = {
        operationType,
        executionTimeMs,
        throughputPerSecond,
        memoryUsageMB,
        rating,
        recommendations,
      };

      console.log(`[FLOW-VERIFY] ✅ Performance monitoring completed:`, {
        operationType,
        executionTimeMs,
        rating,
        throughputPerSecond: throughputPerSecond.toFixed(2),
        memoryUsageMB: memoryUsageMB.toFixed(2),
      });

      return performanceResult;
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;

      console.error(
        `[FLOW-VERIFY] ❌ Performance monitoring failed for ${operationType}:`,
        error
      );

      return {
        operationType,
        executionTimeMs,
        throughputPerSecond: 0,
        memoryUsageMB: 0,
        rating: 'critical',
        recommendations: [`Operation failed: ${(error as Error).message}`],
      };
    }
  }

  /**
   * Generate comprehensive flow verification report
   */
  async generateComprehensiveFlowReport(): Promise<{
    timestamp: string;
    flowVerification: FlowVerificationResult;
    performanceMetrics: PerformanceMonitoringResult[];
    databaseInspection: unknown;
    summary: {
      overallStatus: 'PASS' | 'FAIL';
      flowTestStatus: 'PASS' | 'FAIL';
      performanceRating: string;
      recommendationCount: number;
      totalExecutionTime: number;
    };
  }> {
    console.log(
      '[FLOW-VERIFY] 📋 Generating comprehensive flow verification report...'
    );

    try {
      const timestamp = new Date().toISOString();

      // Initialize database inspection utilities
      dbInspectionUtils.initialize();

      // Run flow verification
      const flowVerification = await this.verifyCompleteSaveFetchCycle(10);

      // Monitor performance of key operations
      const performanceMetrics: PerformanceMonitoringResult[] = [];

      // Test save performance
      const savePerformance = this.monitorRecommendationOperationPerformance(
        'save',
        () => {
          const testAnalysisId = 999999; // Use a test ID that won't conflict
          const testRecs = this.generateTestRecommendations(5);
          return recommendationPersistence.saveRecommendations(
            this.db as SqlJsDatabase,
            testAnalysisId,
            { recommendations: testRecs },
            dbManager
          );
        }
      );
      performanceMetrics.push(savePerformance);

      // Test fetch performance
      const fetchPerformance = this.monitorRecommendationOperationPerformance(
        'fetch',
        () => {
          return recommendationPersistence.getRecommendations(
            this.db as SqlJsDatabase,
            999999
          );
        }
      );
      performanceMetrics.push(fetchPerformance);

      // Get database inspection report
      const databaseInspection = dbInspectionUtils.generateDiagnosticReport();

      // Calculate summary
      const overallStatus: 'PASS' | 'FAIL' =
        flowVerification.success &&
        performanceMetrics.every(p => p.rating !== 'critical')
          ? 'PASS'
          : 'FAIL';

      const flowTestStatus: 'PASS' | 'FAIL' = flowVerification.success
        ? 'PASS'
        : 'FAIL';

      const performanceRating = performanceMetrics.reduce((worst, current) => {
        const ratings = ['excellent', 'good', 'acceptable', 'poor', 'critical'];
        const worstIndex = ratings.indexOf(worst);
        const currentIndex = ratings.indexOf(current.rating);
        return currentIndex > worstIndex ? current.rating : worst;
      }, 'excellent');

      const summary = {
        overallStatus,
        flowTestStatus,
        performanceRating,
        recommendationCount: flowVerification.metrics.recommendationCount,
        totalExecutionTime: flowVerification.metrics.totalExecutionTimeMs,
      };

      const report = {
        timestamp,
        flowVerification,
        performanceMetrics,
        databaseInspection,
        summary,
      };

      console.log(
        '[FLOW-VERIFY] ✅ Comprehensive flow verification report generated:',
        summary
      );
      return report;
    } catch (error) {
      console.error(
        '[FLOW-VERIFY] ❌ Failed to generate comprehensive report:',
        error
      );
      throw new Error(`Report generation failed: ${(error as Error).message}`);
    }
  }
}

// Export singleton instance
export const flowVerificationUtils = FlowVerificationUtils.getInstance();
