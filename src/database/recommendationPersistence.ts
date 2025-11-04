import type { Database as SqlJsDatabase } from 'sql.js';

/**
 * Recommendation Persistence Module
 * Handles saving and retrieving recommendations from SQLite database
 * Updated to work with sql.js API via dbManager
 */

/**
 * Recommendation Action interface
 */
interface RecommendationAction {
  step?: number;
  action?: string;
  type?: string;
  specific?: boolean;
}

/**
 * Recommendation Example interface
 */
interface RecommendationExample {
  before?: string | null;
  after?: string | null;
}

/**
 * Recommendation Resource interface
 */
interface RecommendationResource {
  title?: string;
  url?: string;
}

/**
 * Recommendation Input interface
 */
interface RecommendationInput {
  id?: string;
  ruleId?: string;
  title?: string;
  priority?: string;
  category?: string;
  description?: string;
  effort?: string;
  estimatedTime?: string;
  impactEstimate?: {
    scoreIncrease?: number;
    percentageIncrease?: number;
  };
  why?: string;
  actions?: RecommendationAction[];
  example?: RecommendationExample;
  resources?: RecommendationResource[];
  status?: string;
}

/**
 * Enhanced Recommendations object
 */
interface EnhancedRecommendations {
  recommendations: RecommendationInput[];
}

/**
 * Saved Recommendation Row
 */
interface RecommendationRow {
  id: number;
  analysis_id: number;
  rec_id: string;
  rule_id: string;
  title: string;
  priority: string;
  category: string;
  description?: string;
  effort: string;
  estimated_time?: string;
  score_increase: number;
  percentage_increase: number;
  why_explanation?: string;
  status: string;
  created_at: string;
  actions?: ActionRow[];
  example?: ExampleRow | null;
  resources?: ResourceRow[];
}

/**
 * Action Row from database
 */
interface ActionRow {
  id: number;
  recommendation_id: number;
  step: number;
  action_text: string;
  action_type: string;
  is_specific: boolean;
  completed: boolean;
  completed_at?: string;
}

/**
 * Example Row from database
 */
interface ExampleRow {
  id: number;
  recommendation_id: number;
  before_example?: string;
  after_example?: string;
}

/**
 * Resource Row from database
 */
interface ResourceRow {
  id: number;
  recommendation_id: number;
  title: string;
  url: string;
}

/**
 * Validate and sanitize a single recommendation input
 * @param rec - Recommendation input to validate
 * @param index - Index in array for error reporting
 * @returns Sanitized recommendation
 * @throws Error if validation fails
 */
function validateAndSanitizeRecommendation(
  rec: unknown,
  index: number
): RecommendationInput {
  if (!rec || typeof rec !== 'object') {
    throw new Error(`Recommendation at index ${index} is not a valid object`);
  }

  const recommendation = rec as Record<string, unknown>;

  // Validate required fields
  if (!recommendation.title && !recommendation.id) {
    throw new Error(
      `Recommendation at index ${index} missing required title or id`
    );
  }

  // Sanitize and validate string fields
  const sanitizeString = (
    value: unknown,
    fieldName: string,
    maxLength: number = 1000
  ): string => {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value !== 'string') {
      console.warn(
        `[VALIDATION] Converting ${fieldName} from ${typeof value} to string`
      );
      value = String(value);
    }

    const sanitized = (value as string).trim().substring(0, maxLength);

    // Basic XSS prevention - remove potentially dangerous characters
    return sanitized.replace(/[<>'"&]/g, '');
  };

  // Validate and sanitize priority
  const validatePriority = (priority: unknown): string => {
    const validPriorities = ['critical', 'high', 'medium', 'low'];
    const priorityStr = sanitizeString(priority, 'priority', 20).toLowerCase();

    if (!validPriorities.includes(priorityStr)) {
      console.warn(
        `[VALIDATION] Invalid priority '${priorityStr}', defaulting to 'medium'`
      );
      return 'medium';
    }

    return priorityStr;
  };

  // Validate and sanitize effort
  const validateEffort = (effort: unknown): string => {
    const validEfforts = ['quick', 'easy', 'medium', 'hard', 'complex'];
    const effortStr = sanitizeString(effort, 'effort', 20).toLowerCase();

    if (!validEfforts.includes(effortStr)) {
      console.warn(
        `[VALIDATION] Invalid effort '${effortStr}', defaulting to 'medium'`
      );
      return 'medium';
    }

    return effortStr;
  };

  // Validate and sanitize status
  const validateStatus = (status: unknown): string => {
    const validStatuses = ['pending', 'in-progress', 'completed', 'dismissed'];
    const statusStr = sanitizeString(status, 'status', 20).toLowerCase();

    if (!validStatuses.includes(statusStr)) {
      console.warn(
        `[VALIDATION] Invalid status '${statusStr}', defaulting to 'pending'`
      );
      return 'pending';
    }

    return statusStr;
  };

  // Validate impact estimate
  const validateImpactEstimate = (
    impact: unknown
  ): { scoreIncrease?: number; percentageIncrease?: number } => {
    if (!impact || typeof impact !== 'object') {
      return { scoreIncrease: 0, percentageIncrease: 0 };
    }

    const impactObj = impact as Record<string, unknown>;

    const scoreIncrease =
      typeof impactObj.scoreIncrease === 'number'
        ? Math.max(0, Math.min(100, impactObj.scoreIncrease))
        : 0;

    const percentageIncrease =
      typeof impactObj.percentageIncrease === 'number'
        ? Math.max(0, Math.min(100, impactObj.percentageIncrease))
        : 0;

    return { scoreIncrease, percentageIncrease };
  };

  // Validate actions array
  const validateActions = (actions: unknown): RecommendationAction[] => {
    if (!Array.isArray(actions)) {
      return [];
    }

    return actions
      .map((action, actionIndex) => {
        if (!action || typeof action !== 'object') {
          console.warn(
            `[VALIDATION] Invalid action at index ${actionIndex}, skipping`
          );
          return null;
        }

        const actionObj = action as Record<string, unknown>;

        return {
          step:
            typeof actionObj.step === 'number' ? actionObj.step : actionIndex,
          action: sanitizeString(actionObj.action, 'action', 500),
          type: sanitizeString(actionObj.type, 'action type', 50) || 'action',
          specific: Boolean(actionObj.specific),
        };
      })
      .filter(Boolean) as RecommendationAction[];
  };

  // Validate example
  const validateExample = (
    example: unknown
  ): RecommendationExample | undefined => {
    if (!example || typeof example !== 'object') {
      return undefined;
    }

    const exampleObj = example as Record<string, unknown>;

    return {
      before: exampleObj.before
        ? sanitizeString(exampleObj.before, 'example before', 2000)
        : null,
      after: exampleObj.after
        ? sanitizeString(exampleObj.after, 'example after', 2000)
        : null,
    };
  };

  // Validate resources array
  const validateResources = (resources: unknown): RecommendationResource[] => {
    if (!Array.isArray(resources)) {
      return [];
    }

    return resources
      .map((resource, resourceIndex) => {
        if (!resource || typeof resource !== 'object') {
          console.warn(
            `[VALIDATION] Invalid resource at index ${resourceIndex}, skipping`
          );
          return null;
        }

        const resourceObj = resource as Record<string, unknown>;

        // Basic URL validation
        const validateUrl = (url: string): string => {
          try {
            new URL(url);
            return url;
          } catch {
            console.warn(`[VALIDATION] Invalid URL '${url}', removing`);
            return '';
          }
        };

        const title = sanitizeString(resourceObj.title, 'resource title', 200);
        const url = resourceObj.url
          ? validateUrl(sanitizeString(resourceObj.url, 'resource url', 500))
          : '';

        if (!title && !url) {
          return null;
        }

        return { title, url };
      })
      .filter(Boolean) as RecommendationResource[];
  };

  // Build sanitized recommendation
  const sanitized: RecommendationInput = {
    id: sanitizeString(recommendation.id, 'id', 100) || `rec_${index}`,
    ruleId: sanitizeString(recommendation.ruleId, 'ruleId', 100),
    title:
      sanitizeString(recommendation.title, 'title', 200) ||
      `Recommendation ${index + 1}`,
    priority: validatePriority(recommendation.priority),
    category:
      sanitizeString(recommendation.category, 'category', 100) || 'general',
    description: sanitizeString(
      recommendation.description,
      'description',
      2000
    ),
    effort: validateEffort(recommendation.effort),
    estimatedTime: sanitizeString(
      recommendation.estimatedTime,
      'estimatedTime',
      100
    ),
    impactEstimate: validateImpactEstimate(recommendation.impactEstimate),
    why: sanitizeString(recommendation.why, 'why', 2000),
    actions: validateActions(recommendation.actions),
    example: validateExample(recommendation.example),
    resources: validateResources(recommendation.resources),
    status: validateStatus(recommendation.status),
  };

  return sanitized;
}

/**
 * Validate recommendations array and sanitize data
 * @param recommendations - Array of recommendation inputs
 * @returns Sanitized recommendations array
 * @throws Error if validation fails
 */
function validateAndSanitizeRecommendations(
  recommendations: unknown
): RecommendationInput[] {
  if (!Array.isArray(recommendations)) {
    throw new Error('Recommendations must be an array');
  }

  if (recommendations.length === 0) {
    return [];
  }

  if (recommendations.length > 100) {
    throw new Error(
      `Too many recommendations: ${recommendations.length}. Maximum allowed is 100.`
    );
  }

  const sanitized: RecommendationInput[] = [];
  const errors: string[] = [];

  recommendations.forEach((rec, index) => {
    try {
      const sanitizedRec = validateAndSanitizeRecommendation(rec, index);
      sanitized.push(sanitizedRec);
    } catch (error) {
      errors.push(`Recommendation ${index + 1}: ${(error as Error).message}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Validation errors:\n${errors.join('\n')}`);
  }

  console.log(
    `[VALIDATION] ✅ Successfully validated and sanitized ${sanitized.length} recommendations`
  );
  return sanitized;
}

/**
 * Validate database connection and state
 * @param db - Database instance
 * @param analysisId - Analysis ID to validate
 * @throws Error if validation fails
 */
function validateDatabaseConnection(
  db: SqlJsDatabase,
  analysisId: number
): void {
  if (!db) {
    throw new Error('Database connection is null or undefined');
  }

  // Validate analysis ID format
  if (
    !analysisId ||
    typeof analysisId !== 'number' ||
    analysisId <= 0 ||
    !Number.isInteger(analysisId)
  ) {
    throw new Error(
      `Invalid analysis ID: ${analysisId}. Must be a positive integer.`
    );
  }

  // Test database connectivity with a simple query
  try {
    db.exec('SELECT 1');
  } catch (error) {
    throw new Error(
      `Database connection test failed: ${(error as Error).message}`
    );
  }

  // Validate that the analysis exists
  try {
    const analysisResult = db.exec(
      'SELECT id, title FROM analyses WHERE id = ? LIMIT 1',
      [analysisId]
    );

    if (
      !analysisResult ||
      analysisResult.length === 0 ||
      !analysisResult[0] ||
      analysisResult[0].values.length === 0
    ) {
      throw new Error(`Analysis ID ${analysisId} does not exist in database`);
    }

    console.log(`[VALIDATION] ✅ Analysis ${analysisId} exists in database`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('does not exist')) {
      throw error;
    }
    throw new Error(
      `Failed to validate analysis ID: ${(error as Error).message}`
    );
  }
}

/**
 * Verify that recommendations were saved correctly
 * @param db - Database instance
 * @param analysisId - Analysis ID
 * @param expectedCount - Expected number of recommendations
 * @returns Verification result
 */
function verifyRecommendationsSaved(
  db: SqlJsDatabase,
  analysisId: number,
  expectedCount: number
): { verified: boolean; actualCount: number; details: string } {
  try {
    // Count recommendations for this analysis
    const countResult = db.exec(
      'SELECT COUNT(*) as count FROM recommendations WHERE analysis_id = ?',
      [analysisId]
    );

    const actualCount =
      countResult.length > 0 && countResult[0]?.values?.[0]?.[0]
        ? (countResult[0].values[0][0] as number)
        : 0;

    const verified = actualCount === expectedCount;

    let details = `Expected: ${expectedCount}, Actual: ${actualCount}`;
    if (!verified) {
      details += ` - MISMATCH DETECTED`;
    }

    console.log(`[PERSISTENCE] 🔍 Post-save verification: ${details}`);

    return { verified, actualCount, details };
  } catch (error) {
    const errorMsg = `Verification failed: ${(error as Error).message}`;
    console.error(`[PERSISTENCE] ❌ ${errorMsg}`);
    return { verified: false, actualCount: 0, details: errorMsg };
  }
}

/**
 * Save recommendations to database with transaction management
 * @param db - Database instance (sql.js)
 * @param analysisId - Analysis ID
 * @param enhancedRecommendations - Enhanced recommendations object
 * @param dbManager - Optional database manager for transaction management
 * @returns Number of recommendations saved
 */
export function saveRecommendations(
  db: SqlJsDatabase,
  analysisId: number,
  enhancedRecommendations: EnhancedRecommendations,
  dbManager?: { beginTransaction(): () => void; commitTransaction(): void }
): number {
  const correlationId = `save-${analysisId}-${Date.now()}`;

  console.log(
    `[PERSISTENCE:${correlationId}] 🚀 Starting save process for analysis ${analysisId}...`
  );

  // Input validation and sanitization
  if (!enhancedRecommendations || !enhancedRecommendations.recommendations) {
    console.log(
      `[PERSISTENCE:${correlationId}] ℹ️ No recommendations object provided`
    );
    return 0;
  }

  // Validate and sanitize recommendations array
  let sanitizedRecommendations: RecommendationInput[];
  try {
    sanitizedRecommendations = validateAndSanitizeRecommendations(
      enhancedRecommendations.recommendations
    );

    if (sanitizedRecommendations.length === 0) {
      console.log(
        `[PERSISTENCE:${correlationId}] ℹ️ No valid recommendations to save after validation`
      );
      return 0;
    }

    console.log(
      `[PERSISTENCE:${correlationId}] ✅ Validated and sanitized ${sanitizedRecommendations.length} recommendations`
    );
  } catch (validationError) {
    console.error(
      `[PERSISTENCE:${correlationId}] ❌ Validation failed:`,
      (validationError as Error).message
    );
    throw new Error(
      `Recommendation validation failed: ${(validationError as Error).message}`
    );
  }

  // Validate database connection and analysis ID
  try {
    validateDatabaseConnection(db, analysisId);
    console.log(
      `[PERSISTENCE:${correlationId}] ✅ Database and analysis validation passed`
    );
  } catch (error) {
    console.error(
      `[PERSISTENCE:${correlationId}] ❌ Database validation failed:`,
      (error as Error).message
    );
    throw error;
  }

  // Debug: print summary of sanitized recommendations
  try {
    console.log(
      `[PERSISTENCE:${correlationId}] 📋 Sample sanitized recommendations:`,
      sanitizedRecommendations.slice(0, 3).map(r => ({
        id: r.id,
        title: r.title,
        priority: r.priority,
        effort: r.effort,
        status: r.status,
      }))
    );
  } catch (_e) {
    // ignore logging errors
  }

  let savedCount = 0;
  let rollback: (() => void) | null = null;

  try {
    // Begin transaction using database manager if available, otherwise use local method
    console.log(
      `[PERSISTENCE:${correlationId}] 📝 Beginning database transaction...`
    );
    rollback = dbManager ? dbManager.beginTransaction() : beginTransaction(db);

    // Clear existing recommendations for this analysis to prevent duplicates
    console.log(
      `[PERSISTENCE:${correlationId}] 🧹 Clearing existing recommendations for analysis...`
    );
    db.run('DELETE FROM recommendations WHERE analysis_id = ?', [analysisId]);

    // Process each sanitized recommendation
    for (let index = 0; index < sanitizedRecommendations.length; index++) {
      const rec = sanitizedRecommendations[index];

      if (!rec) {
        console.warn(
          `[PERSISTENCE] ⚠️ Skipping undefined recommendation at index ${index}`
        );
        continue;
      }

      try {
        console.log(
          `[PERSISTENCE:${correlationId}] 📝 Processing recommendation ${index + 1}/${sanitizedRecommendations.length}: ${rec.title || 'Untitled'}`
        );

        // Insert main recommendation with comprehensive error handling
        db.run(
          `INSERT INTO recommendations (
            analysis_id, rec_id, rule_id, title, priority, category,
            description, effort, estimated_time, score_increase,
            percentage_increase, why_explanation, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            analysisId,
            rec.id || `rec_${index}`,
            rec.ruleId || '',
            rec.title || '',
            rec.priority || 'medium',
            rec.category || 'general',
            rec.description || '',
            rec.effort || 'medium',
            rec.estimatedTime || '',
            rec.impactEstimate?.scoreIncrease || 0,
            rec.impactEstimate?.percentageIncrease || 0,
            rec.why || '',
            rec.status || 'pending',
          ]
        );

        // Get the last inserted ID
        const result = db.exec('SELECT last_insert_rowid() as id');
        const recommendationId =
          result.length > 0 && result[0]?.values && result[0].values.length > 0
            ? (result[0].values[0]?.[0] as number)
            : null;

        if (!recommendationId) {
          throw new Error(
            `Failed to get recommendation ID after insert for recommendation ${index + 1}`
          );
        }

        console.log(
          `[PERSISTENCE:${correlationId}] ✅ Inserted recommendation with ID: ${recommendationId}`
        );

        // Insert actions with error handling
        if (
          rec.actions &&
          Array.isArray(rec.actions) &&
          rec.actions.length > 0
        ) {
          console.log(
            `[PERSISTENCE:${correlationId}] 📋 Inserting ${rec.actions.length} actions...`
          );
          rec.actions.forEach((action, actionIndex) => {
            try {
              db.run(
                `INSERT INTO recommendation_actions (
                  recommendation_id, step, action_text, action_type, is_specific
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                  recommendationId,
                  action.step || actionIndex,
                  action.action || '',
                  action.type || 'action',
                  action.specific ? 1 : 0,
                ]
              );
            } catch (actionError) {
              throw new Error(
                `Failed to insert action ${actionIndex + 1} for recommendation ${recommendationId}: ${(actionError as Error).message}`
              );
            }
          });
        }

        // Insert example with error handling
        if (rec.example) {
          console.log(`[PERSISTENCE:${correlationId}] 📝 Inserting example...`);
          try {
            db.run(
              `INSERT INTO recommendation_examples (
                recommendation_id, before_example, after_example
              ) VALUES (?, ?, ?)`,
              [
                recommendationId,
                rec.example.before || null,
                rec.example.after || null,
              ]
            );
          } catch (exampleError) {
            throw new Error(
              `Failed to insert example for recommendation ${recommendationId}: ${(exampleError as Error).message}`
            );
          }
        }

        // Insert resources with error handling
        if (
          rec.resources &&
          Array.isArray(rec.resources) &&
          rec.resources.length > 0
        ) {
          console.log(
            `[PERSISTENCE:${correlationId}] 🔗 Inserting ${rec.resources.length} resources...`
          );
          rec.resources.forEach((resource, resourceIndex) => {
            try {
              db.run(
                `INSERT INTO recommendation_resources (
                  recommendation_id, title, url
                ) VALUES (?, ?, ?)`,
                [recommendationId, resource.title || '', resource.url || '']
              );
            } catch (resourceError) {
              throw new Error(
                `Failed to insert resource ${resourceIndex + 1} for recommendation ${recommendationId}: ${(resourceError as Error).message}`
              );
            }
          });
        }

        savedCount++;
        console.log(
          `[PERSISTENCE:${correlationId}] ✅ Successfully saved recommendation ${index + 1}/${sanitizedRecommendations.length}`
        );
      } catch (error) {
        console.error(
          `[PERSISTENCE:${correlationId}] ❌ Error saving recommendation ${index + 1}:`,
          (error as Error).message
        );
        throw new Error(
          `Failed to save recommendation ${index + 1}: ${(error as Error).message}`
        );
      }
    }

    // Commit transaction using database manager if available, otherwise use local method
    console.log(`[PERSISTENCE:${correlationId}] 💾 Committing transaction...`);
    if (dbManager) {
      dbManager.commitTransaction();
    } else {
      commitTransaction(db);
    }
    rollback = null; // Transaction committed successfully

    // Post-save verification
    const verification = verifyRecommendationsSaved(
      db,
      analysisId,
      sanitizedRecommendations.length
    );

    if (!verification.verified) {
      throw new Error(`Post-save verification failed: ${verification.details}`);
    }

    console.log(
      `[PERSISTENCE:${correlationId}] ✅ Transaction completed successfully. Saved ${savedCount} recommendations with verification passed.`
    );
    return savedCount;
  } catch (error) {
    console.error(
      `[PERSISTENCE:${correlationId}] ❌ Transaction failed:`,
      (error as Error).message
    );

    // Rollback transaction if it's still active
    if (rollback) {
      try {
        console.log(
          `[PERSISTENCE:${correlationId}] 🔄 Rolling back transaction...`
        );
        rollback();
        console.log(
          `[PERSISTENCE:${correlationId}] ✅ Transaction rolled back successfully`
        );
      } catch (rollbackError) {
        console.error(
          `[PERSISTENCE:${correlationId}] ❌ Rollback failed:`,
          (rollbackError as Error).message
        );
      }
    }

    // Re-throw the original error
    throw new Error(
      `Failed to save recommendations: ${(error as Error).message}`
    );
  }
}

/**
 * Begin a database transaction
 * @param db - Database instance
 * @returns Rollback function
 */
function beginTransaction(db: SqlJsDatabase): () => void {
  try {
    db.run('BEGIN TRANSACTION');
    return () => {
      try {
        db.run('ROLLBACK');
      } catch (err) {
        console.error(
          '[PERSISTENCE] Error during rollback:',
          (err as Error).message
        );
      }
    };
  } catch (error) {
    throw new Error(`Failed to begin transaction: ${(error as Error).message}`);
  }
}

/**
 * Commit a database transaction
 * @param db - Database instance
 */
function commitTransaction(db: SqlJsDatabase): void {
  try {
    db.run('COMMIT');
  } catch (error) {
    throw new Error(
      `Failed to commit transaction: ${(error as Error).message}`
    );
  }
}

/**
 * Get recommendations for an analysis with enhanced debugging and validation
 * @param db - Database instance
 * @param analysisId - Analysis ID
 * @returns Array of recommendations with related data
 */
export function getRecommendations(
  db: SqlJsDatabase,
  analysisId: number
): RecommendationRow[] {
  const correlationId = `get-${analysisId}-${Date.now()}`;

  try {
    console.log(
      `[PERSISTENCE:${correlationId}] 🔍 Starting enhanced getRecommendations for analysis ID: ${analysisId}`
    );

    // Enhanced input validation with detailed error messages
    if (!db) {
      const error = 'Database instance is null or undefined';
      console.error(`[PERSISTENCE:${correlationId}] ❌ ${error}`);
      throw new Error(error);
    }

    if (
      !analysisId ||
      typeof analysisId !== 'number' ||
      analysisId <= 0 ||
      !Number.isInteger(analysisId)
    ) {
      const error = `Invalid analysis ID: ${analysisId}. Must be a positive integer. Received type: ${typeof analysisId}`;
      console.error(`[PERSISTENCE:${correlationId}] ❌ ${error}`);
      throw new Error(error);
    }

    // Enhanced database connectivity test with detailed diagnostics
    try {
      const connectivityTest = db.exec('SELECT 1 as test_value');
      console.log(
        `[PERSISTENCE:${correlationId}] ✅ Database connectivity verified:`,
        {
          testResult:
            connectivityTest.length > 0 &&
            connectivityTest[0]?.values?.[0]?.[0] === 1,
          dbType: typeof db,
          hasExecMethod: typeof db.exec === 'function',
          hasRunMethod: typeof db.run === 'function',
        }
      );
    } catch (connError) {
      const error = `Database connectivity test failed: ${(connError as Error).message}`;
      console.error(`[PERSISTENCE:${correlationId}] ❌ ${error}`, {
        errorType: (connError as Error).constructor.name,
        stack: (connError as Error).stack,
      });
      throw new Error(error);
    }

    // Enhanced database state validation
    try {
      // Check database schema version and integrity
      const pragmaCheck = db.exec('PRAGMA integrity_check(1)');
      const integrityResult =
        pragmaCheck.length > 0 && pragmaCheck[0]?.values?.[0]?.[0];

      if (integrityResult !== 'ok') {
        console.warn(
          `[PERSISTENCE:${correlationId}] ⚠️ Database integrity check failed:`,
          integrityResult
        );
      } else {
        console.log(
          `[PERSISTENCE:${correlationId}] ✅ Database integrity check passed`
        );
      }

      // Check database user version for schema compatibility
      const versionCheck = db.exec('PRAGMA user_version');
      const dbVersion =
        versionCheck.length > 0 && versionCheck[0]?.values?.[0]?.[0];
      console.log(
        `[PERSISTENCE:${correlationId}] 📊 Database schema version:`,
        dbVersion
      );
    } catch (pragmaError) {
      console.warn(
        `[PERSISTENCE:${correlationId}] ⚠️ Database state validation failed:`,
        (pragmaError as Error).message
      );
      // Continue execution as this is not critical
    }

    // Enhanced table existence and schema validation
    try {
      // Check if recommendations table exists with detailed schema info
      const tableCheck = db.exec(
        `SELECT name, sql FROM sqlite_master WHERE type='table' AND name='recommendations' LIMIT 1`
      );

      if (
        !tableCheck ||
        tableCheck.length === 0 ||
        !tableCheck[0] ||
        tableCheck[0].values.length === 0
      ) {
        console.error(
          `[PERSISTENCE:${correlationId}] ❌ Recommendations table does not exist`
        );

        // List all available tables for debugging
        const allTables = db.exec(
          `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`
        );
        const tableNames =
          allTables.length > 0 && allTables[0]
            ? allTables[0].values.map(row => row[0])
            : [];

        console.error(
          `[PERSISTENCE:${correlationId}] 📋 Available tables:`,
          tableNames
        );

        throw new Error('Recommendations table does not exist in database');
      }

      const tableName = tableCheck[0].values[0]?.[0];
      const tableSchema = tableCheck[0].values[0]?.[1];

      console.log(
        `[PERSISTENCE:${correlationId}] ✅ Recommendations table exists:`,
        {
          name: tableName,
          hasSchema: !!tableSchema,
          schemaLength: tableSchema ? String(tableSchema).length : 0,
        }
      );

      // Validate table schema has required columns
      const columnCheck = db.exec(`PRAGMA table_info(recommendations)`);
      if (columnCheck.length > 0 && columnCheck[0]) {
        const columns = columnCheck[0].values.map(row => ({
          name: row[1],
          type: row[2],
          notNull: row[3],
          defaultValue: row[4],
          primaryKey: row[5],
        }));

        console.log(
          `[PERSISTENCE:${correlationId}] 📊 Table schema validation:`,
          {
            columnCount: columns.length,
            columns: columns.map(c => `${c.name}(${c.type})`),
            hasAnalysisId: columns.some(c => c.name === 'analysis_id'),
            hasId: columns.some(c => c.name === 'id'),
            hasTitle: columns.some(c => c.name === 'title'),
          }
        );

        // Check for required columns
        const requiredColumns = ['id', 'analysis_id', 'title', 'priority'];
        const missingColumns = requiredColumns.filter(
          reqCol => !columns.some(col => col.name === reqCol)
        );

        if (missingColumns.length > 0) {
          throw new Error(
            `Missing required columns in recommendations table: ${missingColumns.join(', ')}`
          );
        }
      }
    } catch (tableError) {
      console.error(
        `[PERSISTENCE:${correlationId}] ❌ Table validation failed:`,
        {
          error: (tableError as Error).message,
          errorType: (tableError as Error).constructor.name,
          stack: (tableError as Error).stack,
        }
      );
      throw new Error(
        `Table validation failed: ${(tableError as Error).message}`
      );
    }

    // Enhanced query execution with comprehensive debugging and validation
    const startTime = Date.now();

    // Validate analysis exists before querying recommendations
    try {
      const analysisValidation = db.exec(
        'SELECT id, title, created_at FROM analyses WHERE id = ? LIMIT 1',
        [analysisId]
      );

      if (
        !analysisValidation ||
        analysisValidation.length === 0 ||
        !analysisValidation[0] ||
        analysisValidation[0].values.length === 0
      ) {
        console.warn(
          `[PERSISTENCE:${correlationId}] ⚠️ Analysis ${analysisId} not found in database`
        );

        // Get some sample analysis IDs for debugging
        const sampleAnalyses = db.exec(
          'SELECT id, title FROM analyses ORDER BY created_at DESC LIMIT 5'
        );
        const availableIds =
          sampleAnalyses.length > 0 && sampleAnalyses[0]
            ? sampleAnalyses[0].values.map(row => ({
                id: row[0],
                title: row[1],
              }))
            : [];

        console.log(
          `[PERSISTENCE:${correlationId}] 📋 Available analysis IDs:`,
          availableIds
        );

        // Still continue with query as analysis might exist but have different structure
      } else {
        const analysis = analysisValidation[0].values[0];
        if (analysis) {
          console.log(
            `[PERSISTENCE:${correlationId}] ✅ Analysis validation passed:`,
            {
              id: analysis[0],
              title: analysis[1],
              created_at: analysis[2],
            }
          );
        }
      }
    } catch (analysisError) {
      console.warn(
        `[PERSISTENCE:${correlationId}] ⚠️ Analysis validation failed:`,
        (analysisError as Error).message
      );
      // Continue with recommendations query even if analysis validation fails
    }

    // Enhanced query with better error handling and parameter validation
    const query = `SELECT * FROM recommendations WHERE analysis_id = ? ORDER BY priority DESC, score_increase DESC`;

    console.log(`[PERSISTENCE:${correlationId}] 📋 Executing enhanced query:`, {
      query,
      parameters: [analysisId],
      parameterTypes: [typeof analysisId],
      parameterValidation: {
        analysisId: {
          value: analysisId,
          type: typeof analysisId,
          isInteger: Number.isInteger(analysisId),
          isPositive: analysisId > 0,
        },
      },
    });

    let recResult;
    try {
      recResult = db.exec(query, [analysisId]);
    } catch (queryError) {
      console.error(
        `[PERSISTENCE:${correlationId}] ❌ Query execution failed:`,
        {
          error: (queryError as Error).message,
          errorType: (queryError as Error).constructor.name,
          query,
          parameters: [analysisId],
          stack: (queryError as Error).stack,
        }
      );
      throw new Error(
        `Query execution failed: ${(queryError as Error).message}`
      );
    }

    const queryTime = Date.now() - startTime;

    // Enhanced result validation and debugging
    console.log(
      `[PERSISTENCE:${correlationId}] 📊 Enhanced query result analysis (${queryTime}ms):`,
      {
        executionTime: queryTime,
        resultStructure: {
          isArray: Array.isArray(recResult),
          length: recResult?.length || 0,
          hasFirstElement: !!(
            recResult &&
            recResult.length > 0 &&
            recResult[0]
          ),
          firstElementType:
            recResult && recResult.length > 0
              ? typeof recResult[0]
              : 'undefined',
        },
        dataValidation:
          recResult && recResult.length > 0 && recResult[0]
            ? {
                hasColumns: Array.isArray(recResult[0].columns),
                columnCount: recResult[0].columns?.length || 0,
                hasValues: Array.isArray(recResult[0].values),
                rowCount: recResult[0].values?.length || 0,
                columns: recResult[0].columns || [],
              }
            : null,
        queryMetrics: {
          queryTime,
          parametersUsed: [analysisId],
          queryComplexity: 'simple_select_with_where_and_order',
        },
      }
    );

    // Enhanced empty result handling with detailed diagnostics
    if (
      !recResult ||
      recResult.length === 0 ||
      !recResult[0] ||
      !recResult[0].values ||
      recResult[0].values.length === 0
    ) {
      console.log(
        `[PERSISTENCE:${correlationId}] ℹ️ No recommendations found - running diagnostics...`
      );

      // Diagnostic queries to understand why no results were found
      try {
        // Check total recommendations count
        const totalCount = db.exec(
          'SELECT COUNT(*) as total FROM recommendations'
        );
        const total =
          (totalCount.length > 0 && totalCount[0]?.values?.[0]?.[0]) || 0;

        // Check recommendations by analysis_id
        const byAnalysis = db.exec(
          'SELECT analysis_id, COUNT(*) as count FROM recommendations GROUP BY analysis_id ORDER BY count DESC LIMIT 10'
        );
        const analysisBreakdown =
          byAnalysis.length > 0 && byAnalysis[0]
            ? byAnalysis[0].values.map(row => ({
                analysisId: row[0],
                count: row[1],
              }))
            : [];

        // Check if there are any recommendations with similar analysis_id
        const similarIds = db.exec(
          'SELECT DISTINCT analysis_id FROM recommendations WHERE analysis_id BETWEEN ? AND ? ORDER BY analysis_id',
          [Math.max(1, analysisId - 5), analysisId + 5]
        );
        const nearbyIds =
          similarIds.length > 0 && similarIds[0]
            ? similarIds[0].values.map(row => row[0])
            : [];

        console.log(`[PERSISTENCE:${correlationId}] 🔍 Diagnostic results:`, {
          totalRecommendations: total,
          requestedAnalysisId: analysisId,
          analysisBreakdown,
          nearbyAnalysisIds: nearbyIds,
          possibleIssues: [
            total === 0 ? 'No recommendations in database' : null,
            analysisBreakdown.length === 0
              ? 'No recommendations for any analysis'
              : null,
            !analysisBreakdown.some(a => a.analysisId === analysisId)
              ? 'No recommendations for this specific analysis'
              : null,
          ].filter(Boolean),
        });
      } catch (diagnosticError) {
        console.warn(
          `[PERSISTENCE:${correlationId}] ⚠️ Diagnostic queries failed:`,
          (diagnosticError as Error).message
        );
      }

      return [];
    }

    const columns = recResult[0].columns;
    const rows = recResult[0].values;

    // Convert to objects (cast through unknown to satisfy strict typing)
    const recommendations = rows.map(row => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj as unknown as RecommendationRow;
    }) as RecommendationRow[];

    // Helper to check if a table exists in the DB
    const tableExists = (tableName: string): boolean => {
      try {
        const res = db.exec(
          `SELECT name FROM sqlite_master WHERE type='table' AND name = ? LIMIT 1`,
          [tableName]
        );
        return !!(res && res.length > 0 && res[0] && res[0].values.length > 0);
      } catch (e) {
        console.error(
          `[PERSISTENCE] Error checking table existence for ${tableName}:`,
          e
        );
        return false;
      }
    };

    // Fetch actions, examples, and resources for each recommendation (only if tables exist)
    recommendations.forEach(rec => {
      // Actions
      if (tableExists('recommendation_actions')) {
        try {
          const actionsResult = db.exec(
            `SELECT * FROM recommendation_actions WHERE recommendation_id = ? ORDER BY step`,
            [rec.id]
          );
          rec.actions =
            actionsResult.length > 0 && actionsResult[0]
              ? (actionsResult[0].values.map(row => {
                  const action: Record<string, unknown> = {};
                  const cols = actionsResult[0]?.columns ?? [];
                  cols.forEach((col, idx) => {
                    action[col] = row[idx];
                  });
                  return action;
                }) as unknown as ActionRow[])
              : [];
        } catch (_err) {
          rec.actions = [];
        }
      } else {
        rec.actions = [];
      }

      // Example
      if (tableExists('recommendation_examples')) {
        try {
          const exampleResult = db.exec(
            `SELECT * FROM recommendation_examples WHERE recommendation_id = ? LIMIT 1`,
            [rec.id]
          );
          rec.example =
            exampleResult.length > 0 &&
            exampleResult[0]?.values &&
            exampleResult[0].values.length > 0
              ? ((() => {
                  const example: Record<string, unknown> = {};
                  const cols = exampleResult[0]?.columns ?? [];
                  cols.forEach((col, idx) => {
                    example[col] = exampleResult[0]?.values[0]?.[idx];
                  });
                  return example as unknown as ExampleRow;
                })() as ExampleRow)
              : null;
        } catch (_err) {
          rec.example = null;
        }
      } else {
        rec.example = null;
      }

      // Resources
      if (tableExists('recommendation_resources')) {
        try {
          const resourcesResult = db.exec(
            `SELECT * FROM recommendation_resources WHERE recommendation_id = ?`,
            [rec.id]
          );
          rec.resources =
            resourcesResult.length > 0 && resourcesResult[0]
              ? (resourcesResult[0].values.map(row => {
                  const resource: Record<string, unknown> = {};
                  const cols = resourcesResult[0]?.columns ?? [];
                  cols.forEach((col, idx) => {
                    resource[col] = row[idx];
                  });
                  return resource;
                }) as unknown as ResourceRow[])
              : [];
        } catch (_err) {
          rec.resources = [];
        }
      } else {
        rec.resources = [];
      }
    });

    // Enhanced logging for fetched recommendations
    try {
      console.log(
        `[PERSISTENCE:${correlationId}] ✅ Successfully fetched ${recommendations.length} recommendations for analysis ${analysisId}`
      );

      if (recommendations.length > 0) {
        // Log detailed summary
        const summary = {
          totalCount: recommendations.length,
          byPriority: recommendations.reduce(
            (acc, r) => {
              acc[r.priority] = (acc[r.priority] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          ),
          byStatus: recommendations.reduce(
            (acc, r) => {
              acc[r.status] = (acc[r.status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          ),
          byCategory: recommendations.reduce(
            (acc, r) => {
              acc[r.category] = (acc[r.category] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          ),
          withActions: recommendations.filter(
            r => r.actions && r.actions.length > 0
          ).length,
          withExamples: recommendations.filter(r => r.example).length,
          withResources: recommendations.filter(
            r => r.resources && r.resources.length > 0
          ).length,
        };

        console.log(
          `[PERSISTENCE:${correlationId}] 📊 Recommendations summary:`,
          summary
        );

        // Log sample recommendations for debugging
        console.log(
          `[PERSISTENCE:${correlationId}] 📋 Sample recommendations:`,
          recommendations.slice(0, 5).map(r => ({
            id: r.id,
            rec_id: r.rec_id,
            title: r.title,
            priority: r.priority,
            status: r.status,
            category: r.category,
            effort: r.effort,
            score_increase: r.score_increase,
          }))
        );
      }
    } catch (loggingError) {
      console.warn(
        `[PERSISTENCE:${correlationId}] ⚠️ Error in result logging:`,
        (loggingError as Error).message
      );
    }

    return recommendations;
  } catch (error) {
    console.error(
      `[PERSISTENCE:${correlationId}] ❌ Error getting recommendations:`,
      {
        error: (error as Error).message,
        stack: (error as Error).stack,
        analysisId,
      }
    );

    // Return empty array instead of throwing to maintain API compatibility
    return [];
  }
}

/**
 * Update recommendation status
 * @param db - Database connection
 * @param recommendationId - Recommendation ID
 * @param status - New status (pending, in-progress, completed, dismissed)
 * @param notes - Optional notes
 * @returns Success status
 */
export function updateRecommendationStatus(
  db: SqlJsDatabase,
  recommendationId: number,
  status: string,
  notes: string | null = null
): boolean {
  try {
    // Update main status
    db.run(`UPDATE recommendations SET status = ? WHERE id = ?`, [
      status,
      recommendationId,
    ]);

    // Insert into history
    db.run(
      `INSERT INTO recommendation_status_history (
        recommendation_id, old_status, new_status, notes
      ) VALUES (?, '', ?, ?)`,
      [recommendationId, status, notes]
    );

    return true;
  } catch (error) {
    console.error('[PERSISTENCE] Error updating status:', error);
    return false;
  }
}

/**
 * Get quick wins (high impact, low effort, pending)
 * @param db - Database connection
 * @param analysisId - Analysis ID
 * @param limit - Maximum number of results
 * @returns Array of quick win recommendations
 */
export function getQuickWins(
  db: SqlJsDatabase,
  analysisId: number,
  limit: number = 5
): Partial<RecommendationRow>[] {
  try {
    const result = db.exec(
      `SELECT * FROM recommendations
       WHERE analysis_id = ?
         AND effort = 'quick'
         AND (priority = 'critical' OR priority = 'high')
         AND status = 'pending'
       ORDER BY score_increase DESC
       LIMIT ?`,
      [analysisId, limit]
    );

    if (result.length === 0 || !result[0] || result[0].values.length === 0) {
      return [];
    }

    const columns = result[0].columns;
    return result[0].values.map(row => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    }) as unknown as Partial<RecommendationRow>[];
  } catch (error) {
    console.error('[PERSISTENCE] Error getting quick wins:', error);
    return [];
  }
}

/**
 * Delete recommendations for an analysis
 * @param db - Database connection
 * @param analysisId - Analysis ID
 * @returns Success status
 */
export function deleteRecommendations(
  db: SqlJsDatabase,
  analysisId: number
): boolean {
  try {
    db.run(`DELETE FROM recommendations WHERE analysis_id = ?`, [analysisId]);
    return true;
  } catch (error) {
    console.error('[PERSISTENCE] Error deleting recommendations:', error);
    return false;
  }
}
