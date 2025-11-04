import type { Database as SqlJsDatabase } from 'sql.js';
import dbManager from '../main/dbManager';

/**
 * Database Inspection and Diagnostic Utilities
 * Provides comprehensive debugging tools for the recommendations system
 */

/**
 * Database table information
 */
interface TableInfo {
  name: string;
  type: string;
  sql: string;
  rowCount: number;
}

/**
 * Column information for a table
 */
interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notNull: boolean;
  defaultValue: string | null;
  primaryKey: boolean;
}

/**
 * Database integrity check result
 */
interface IntegrityCheckResult {
  isValid: boolean;
  message: string;
  details: string[];
}

/**
 * Analysis existence check result
 */
interface AnalysisCheckResult {
  exists: boolean;
  analysisId: number;
  title?: string;
  createdAt?: string;
  recommendationCount: number;
  details: string;
}

/**
 * Recommendation table inspection result
 */
interface RecommendationTableInspection {
  tableExists: boolean;
  columnCount: number;
  columns: ColumnInfo[];
  totalRecommendations: number;
  analysisDistribution: Array<{
    analysisId: number;
    count: number;
    title?: string;
  }>;
  recentRecommendations: Array<{
    id: number;
    analysisId: number;
    title: string;
    priority: string;
    createdAt: string;
  }>;
}

/**
 * Query performance metrics
 */
interface QueryPerformanceMetrics {
  queryType: string;
  executionTimeMs: number;
  rowsAffected: number;
  rating: 'excellent' | 'good' | 'slow' | 'critical';
  details: string;
}

/**
 * Database Inspection Utilities Class
 */
export class DatabaseInspectionUtils {
  private static instance: DatabaseInspectionUtils;
  private db: SqlJsDatabase | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DatabaseInspectionUtils {
    if (!DatabaseInspectionUtils.instance) {
      DatabaseInspectionUtils.instance = new DatabaseInspectionUtils();
    }
    return DatabaseInspectionUtils.instance;
  }

  /**
   * Initialize with database connection
   */
  initialize(): void {
    try {
      this.db = dbManager.getDb();
      console.log('[DEBUG] Database inspection utilities initialized');
    } catch (error) {
      console.error('[DEBUG] Failed to initialize database connection:', error);
      throw new Error(
        `Database initialization failed: ${(error as Error).message}`
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
   * Verify recommendations table contents and structure
   */
  verifyRecommendationsTable(): RecommendationTableInspection {
    const db = this.ensureConnection();

    console.log('[DEBUG] 🔍 Starting recommendations table inspection...');

    try {
      // Check if table exists
      const tableExistsResult = db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='recommendations'"
      );

      const tableExists =
        tableExistsResult.length > 0 &&
        tableExistsResult[0] &&
        tableExistsResult[0].values.length > 0;

      if (!tableExists) {
        console.warn('[DEBUG] ⚠️ Recommendations table does not exist');
        return {
          tableExists: false,
          columnCount: 0,
          columns: [],
          totalRecommendations: 0,
          analysisDistribution: [],
          recentRecommendations: [],
        };
      }

      // Get table schema information
      const columnsResult = db.exec('PRAGMA table_info(recommendations)');
      const columns: ColumnInfo[] =
        columnsResult.length > 0 && columnsResult[0]
          ? columnsResult[0].values.map(row => ({
              cid: row[0] as number,
              name: row[1] as string,
              type: row[2] as string,
              notNull: Boolean(row[3]),
              defaultValue: row[4] as string | null,
              primaryKey: Boolean(row[5]),
            }))
          : [];

      // Get total recommendation count
      const countResult = db.exec(
        'SELECT COUNT(*) as count FROM recommendations'
      );
      const totalRecommendations =
        countResult.length > 0 && countResult[0]?.values?.[0]?.[0]
          ? (countResult[0].values[0][0] as number)
          : 0;

      // Get analysis distribution
      const distributionResult = db.exec(`
        SELECT 
          r.analysis_id,
          COUNT(*) as count,
          a.title
        FROM recommendations r
        LEFT JOIN analyses a ON r.analysis_id = a.id
        GROUP BY r.analysis_id, a.title
        ORDER BY count DESC
        LIMIT 10
      `);

      const analysisDistribution =
        distributionResult.length > 0 && distributionResult[0]
          ? distributionResult[0].values.map(row => ({
              analysisId: row[0] as number,
              count: row[1] as number,
              title: row[2] as string | undefined,
            }))
          : [];

      // Get recent recommendations
      const recentResult = db.exec(`
        SELECT 
          id,
          analysis_id,
          title,
          priority,
          created_at
        FROM recommendations
        ORDER BY created_at DESC
        LIMIT 5
      `);

      const recentRecommendations =
        recentResult.length > 0 && recentResult[0]
          ? recentResult[0].values.map(row => ({
              id: row[0] as number,
              analysisId: row[1] as number,
              title: row[2] as string,
              priority: row[3] as string,
              createdAt: row[4] as string,
            }))
          : [];

      const result: RecommendationTableInspection = {
        tableExists: true,
        columnCount: columns.length,
        columns,
        totalRecommendations,
        analysisDistribution,
        recentRecommendations,
      };

      console.log('[DEBUG] ✅ Recommendations table inspection completed:', {
        tableExists: result.tableExists,
        columnCount: result.columnCount,
        totalRecommendations: result.totalRecommendations,
        analysisCount: result.analysisDistribution.length,
      });

      return result;
    } catch (error) {
      console.error(
        '[DEBUG] ❌ Recommendations table inspection failed:',
        error
      );
      throw new Error(`Table inspection failed: ${(error as Error).message}`);
    }
  }

  /**
   * Check if analysis ID exists in database
   */
  checkAnalysisExists(analysisId: number): AnalysisCheckResult {
    const db = this.ensureConnection();

    console.log(`[DEBUG] 🔍 Checking analysis existence: ${analysisId}`);

    try {
      // Validate input
      if (!analysisId || typeof analysisId !== 'number' || analysisId <= 0) {
        throw new Error(`Invalid analysis ID: ${analysisId}`);
      }

      // Check if analysis exists
      const analysisResult = db.exec(
        `
        SELECT 
          id,
          title,
          created_at
        FROM analyses 
        WHERE id = ? 
        LIMIT 1
      `,
        [analysisId]
      );

      const exists = Boolean(
        analysisResult.length > 0 &&
          analysisResult[0] &&
          analysisResult[0].values.length > 0
      );

      let title: string | undefined;
      let createdAt: string | undefined;

      if (exists && analysisResult[0]?.values[0]) {
        const row = analysisResult[0].values[0];
        title = row[1] as string;
        createdAt = row[2] as string;
      }

      // Count recommendations for this analysis
      const recCountResult = db.exec(
        'SELECT COUNT(*) as count FROM recommendations WHERE analysis_id = ?',
        [analysisId]
      );

      const recommendationCount =
        recCountResult.length > 0 && recCountResult[0]?.values?.[0]?.[0]
          ? (recCountResult[0].values[0][0] as number)
          : 0;

      const details = exists
        ? `Analysis found: "${title}" (created: ${createdAt}) with ${recommendationCount} recommendations`
        : `Analysis ID ${analysisId} not found in database`;

      const result: AnalysisCheckResult = {
        exists,
        analysisId,
        title,
        createdAt,
        recommendationCount,
        details,
      };

      console.log(
        `[DEBUG] ${exists ? '✅' : '❌'} Analysis check result:`,
        result
      );
      return result;
    } catch (error) {
      console.error('[DEBUG] ❌ Analysis existence check failed:', error);
      throw new Error(`Analysis check failed: ${(error as Error).message}`);
    }
  }

  /**
   * Perform comprehensive database integrity checks
   */
  performIntegrityCheck(): IntegrityCheckResult {
    const db = this.ensureConnection();

    console.log('[DEBUG] 🔍 Starting database integrity check...');

    try {
      const details: string[] = [];
      let isValid = true;

      // SQLite integrity check
      const integrityResult = db.exec('PRAGMA integrity_check');
      const integrityMessage =
        integrityResult.length > 0 && integrityResult[0]?.values?.[0]?.[0]
          ? (integrityResult[0].values[0][0] as string)
          : 'unknown';

      if (integrityMessage !== 'ok') {
        isValid = false;
        details.push(`SQLite integrity check failed: ${integrityMessage}`);
      } else {
        details.push('SQLite integrity check: OK');
      }

      // Foreign key check
      const foreignKeyResult = db.exec('PRAGMA foreign_key_check');
      if (
        foreignKeyResult.length > 0 &&
        foreignKeyResult[0] &&
        foreignKeyResult[0].values.length > 0
      ) {
        isValid = false;
        details.push(
          `Foreign key violations found: ${foreignKeyResult[0].values.length} issues`
        );
      } else {
        details.push('Foreign key constraints: OK');
      }

      // Check for orphaned recommendations
      const orphanedResult = db.exec(`
        SELECT COUNT(*) as count 
        FROM recommendations r 
        LEFT JOIN analyses a ON r.analysis_id = a.id 
        WHERE a.id IS NULL
      `);

      const orphanedCount =
        orphanedResult.length > 0 && orphanedResult[0]?.values?.[0]?.[0]
          ? (orphanedResult[0].values[0][0] as number)
          : 0;

      if (orphanedCount > 0) {
        isValid = false;
        details.push(`Found ${orphanedCount} orphaned recommendations`);
      } else {
        details.push('No orphaned recommendations found');
      }

      // Check for duplicate recommendations
      const duplicateResult = db.exec(`
        SELECT analysis_id, rec_id, COUNT(*) as count
        FROM recommendations 
        GROUP BY analysis_id, rec_id 
        HAVING COUNT(*) > 1
      `);

      const duplicateCount =
        duplicateResult.length > 0 && duplicateResult[0]
          ? duplicateResult[0].values.length
          : 0;

      if (duplicateCount > 0) {
        isValid = false;
        details.push(
          `Found ${duplicateCount} duplicate recommendation entries`
        );
      } else {
        details.push('No duplicate recommendations found');
      }

      // Check table statistics
      const tableStats = this.getTableStatistics();
      details.push(`Database contains ${tableStats.length} tables`);

      tableStats.forEach(table => {
        details.push(`Table ${table.name}: ${table.rowCount} rows`);
      });

      const message = isValid
        ? 'Database integrity check passed'
        : 'Database integrity issues detected';

      const result: IntegrityCheckResult = {
        isValid,
        message,
        details,
      };

      console.log(
        `[DEBUG] ${isValid ? '✅' : '❌'} Integrity check completed:`,
        result
      );
      return result;
    } catch (error) {
      console.error('[DEBUG] ❌ Integrity check failed:', error);
      return {
        isValid: false,
        message: `Integrity check failed: ${(error as Error).message}`,
        details: [`Error: ${(error as Error).message}`],
      };
    }
  }

  /**
   * Monitor query performance
   */
  monitorQueryPerformance(
    queryType: string,
    query: string,
    params: any[] = []
  ): QueryPerformanceMetrics {
    const db = this.ensureConnection();

    console.log(`[DEBUG] ⏱️ Monitoring query performance: ${queryType}`);

    const startTime = Date.now();
    let rowsAffected = 0;
    let error: Error | null = null;

    try {
      if (queryType.toLowerCase().includes('select')) {
        const result = db.exec(query, params);
        rowsAffected =
          result.length > 0 && result[0] ? result[0].values.length : 0;
      } else {
        db.run(query, params);
        rowsAffected = db.getRowsModified();
      }
    } catch (err) {
      error = err as Error;
    }

    const executionTimeMs = Date.now() - startTime;

    // Determine performance rating
    let rating: 'excellent' | 'good' | 'slow' | 'critical';
    if (error) {
      rating = 'critical';
    } else if (executionTimeMs < 10) {
      rating = 'excellent';
    } else if (executionTimeMs < 100) {
      rating = 'good';
    } else if (executionTimeMs < 1000) {
      rating = 'slow';
    } else {
      rating = 'critical';
    }

    const details = error
      ? `Query failed: ${error.message}`
      : `Query executed successfully in ${executionTimeMs}ms, affected ${rowsAffected} rows`;

    const result: QueryPerformanceMetrics = {
      queryType,
      executionTimeMs,
      rowsAffected,
      rating,
      details,
    };

    console.log(`[DEBUG] ${error ? '❌' : '✅'} Query performance:`, result);
    return result;
  }

  /**
   * Get statistics for all database tables
   */
  getTableStatistics(): TableInfo[] {
    const db = this.ensureConnection();

    console.log('[DEBUG] 📊 Gathering table statistics...');

    try {
      // Get all tables
      const tablesResult = db.exec(`
        SELECT name, type, sql 
        FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `);

      if (!tablesResult.length || !tablesResult[0]) {
        return [];
      }

      const tables: TableInfo[] = [];

      for (const row of tablesResult[0].values) {
        const tableName = row[0] as string;
        const tableType = row[1] as string;
        const tableSql = row[2] as string;

        // Get row count for each table
        let rowCount = 0;
        try {
          const countResult = db.exec(
            `SELECT COUNT(*) as count FROM "${tableName}"`
          );
          rowCount =
            countResult.length > 0 && countResult[0]?.values?.[0]?.[0]
              ? (countResult[0].values[0][0] as number)
              : 0;
        } catch (err) {
          console.warn(
            `[DEBUG] Could not get row count for table ${tableName}:`,
            err
          );
        }

        tables.push({
          name: tableName,
          type: tableType,
          sql: tableSql,
          rowCount,
        });
      }

      console.log(
        `[DEBUG] ✅ Table statistics gathered for ${tables.length} tables`
      );
      return tables;
    } catch (error) {
      console.error('[DEBUG] ❌ Failed to gather table statistics:', error);
      throw new Error(`Table statistics failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate comprehensive database diagnostic report
   */
  generateDiagnosticReport(): {
    timestamp: string;
    databaseStats: TableInfo[];
    integrityCheck: IntegrityCheckResult;
    recommendationsInspection: RecommendationTableInspection;
    summary: {
      totalTables: number;
      totalRecommendations: number;
      integrityStatus: string;
      recommendationsTableStatus: string;
    };
  } {
    console.log('[DEBUG] 📋 Generating comprehensive diagnostic report...');

    try {
      const timestamp = new Date().toISOString();
      const databaseStats = this.getTableStatistics();
      const integrityCheck = this.performIntegrityCheck();
      const recommendationsInspection = this.verifyRecommendationsTable();

      const summary = {
        totalTables: databaseStats.length,
        totalRecommendations: recommendationsInspection.totalRecommendations,
        integrityStatus: integrityCheck.isValid ? 'PASS' : 'FAIL',
        recommendationsTableStatus: recommendationsInspection.tableExists
          ? 'EXISTS'
          : 'MISSING',
      };

      const report = {
        timestamp,
        databaseStats,
        integrityCheck,
        recommendationsInspection,
        summary,
      };

      console.log('[DEBUG] ✅ Diagnostic report generated:', summary);
      return report;
    } catch (error) {
      console.error('[DEBUG] ❌ Failed to generate diagnostic report:', error);
      throw new Error(
        `Diagnostic report generation failed: ${(error as Error).message}`
      );
    }
  }
}

// Export singleton instance
export const dbInspectionUtils = DatabaseInspectionUtils.getInstance();
