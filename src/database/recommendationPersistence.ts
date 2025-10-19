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
 * Save recommendations to database
 * @param db - Database instance (sql.js)
 * @param analysisId - Analysis ID
 * @param enhancedRecommendations - Enhanced recommendations object
 * @returns Number of recommendations saved
 */
export function saveRecommendations(
  db: SqlJsDatabase,
  analysisId: number,
  enhancedRecommendations: EnhancedRecommendations
): number {
  if (
    !enhancedRecommendations ||
    !enhancedRecommendations.recommendations ||
    !Array.isArray(enhancedRecommendations.recommendations)
  ) {
    console.log('[PERSISTENCE] No recommendations to save');
    return 0;
  }

  const recommendations = enhancedRecommendations.recommendations;
  let savedCount = 0;

  console.log(
    `[PERSISTENCE] Saving ${recommendations.length} recommendations...`
  );

  recommendations.forEach((rec, index) => {
    try {
      // Insert main recommendation
      console.log(
        `[PERSISTENCE] Inserting recommendation ${index + 1}/${recommendations.length}`
      );

      db.run(
        `INSERT INTO recommendations (
          analysis_id, rec_id, rule_id, title, priority, category,
          description, effort, estimated_time, score_increase,
          percentage_increase, why_explanation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        ]
      );

      // Get the last inserted ID
      const result = db.exec('SELECT last_insert_rowid() as id');
      const recommendationId =
        result.length > 0 && result[0]?.values && result[0].values.length > 0
          ? (result[0].values[0]?.[0] as number)
          : null;

      if (recommendationId) {
        // Insert actions
        if (
          rec.actions &&
          Array.isArray(rec.actions) &&
          rec.actions.length > 0
        ) {
          rec.actions.forEach(action => {
            db.run(
              `INSERT INTO recommendation_actions (
                recommendation_id, step, action_text, action_type, is_specific
              ) VALUES (?, ?, ?, ?, ?)`,
              [
                recommendationId,
                action.step || 0,
                action.action || '',
                action.type || 'action',
                action.specific ? 1 : 0,
              ]
            );
          });
        }

        // Insert example
        if (rec.example) {
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
        }

        // Insert resources
        if (
          rec.resources &&
          Array.isArray(rec.resources) &&
          rec.resources.length > 0
        ) {
          rec.resources.forEach(resource => {
            db.run(
              `INSERT INTO recommendation_resources (
                recommendation_id, title, url
              ) VALUES (?, ?, ?)`,
              [recommendationId, resource.title || '', resource.url || '']
            );
          });
        }

        savedCount++;
      }
    } catch (error) {
      console.error(
        `[PERSISTENCE] Error saving recommendation ${index}:`,
        (error as Error).message
      );
    }
  });

  console.log(`[PERSISTENCE] ✅ Saved ${savedCount} recommendations`);
  return savedCount;
}

/**
 * Get recommendations for an analysis
 * @param db - Database instance
 * @param analysisId - Analysis ID
 * @returns Array of recommendations with related data
 */
export function getRecommendations(
  db: SqlJsDatabase,
  analysisId: number
): RecommendationRow[] {
  try {
    // Get all recommendations
    const recResult = db.exec(
      `SELECT * FROM recommendations WHERE analysis_id = ? ORDER BY priority DESC, score_increase DESC`,
      [analysisId]
    );

    if (
      recResult.length === 0 ||
      !recResult[0] ||
      recResult[0].values.length === 0
    ) {
      return [];
    }

    const columns = recResult[0].columns;
    const rows = recResult[0].values;

    // Convert to objects
    const recommendations: RecommendationRow[] = rows.map(row => {
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    // Fetch actions, examples, and resources for each recommendation
    recommendations.forEach(rec => {
      // Get actions
      const actionsResult = db.exec(
        `SELECT * FROM recommendation_actions WHERE recommendation_id = ? ORDER BY step`,
        [rec.id]
      );
      rec.actions =
        actionsResult.length > 0 && actionsResult[0]
          ? actionsResult[0].values.map(row => {
              const action: any = {};
              actionsResult[0]!.columns.forEach((col, idx) => {
                action[col] = row[idx];
              });
              return action;
            })
          : [];

      // Get example
      const exampleResult = db.exec(
        `SELECT * FROM recommendation_examples WHERE recommendation_id = ? LIMIT 1`,
        [rec.id]
      );
      rec.example =
        exampleResult.length > 0 &&
        exampleResult[0]?.values &&
        exampleResult[0].values.length > 0
          ? (() => {
              const example: any = {};
              exampleResult[0]!.columns.forEach((col, idx) => {
                example[col] = exampleResult[0]!.values[0]?.[idx];
              });
              return example;
            })()
          : null;

      // Get resources
      const resourcesResult = db.exec(
        `SELECT * FROM recommendation_resources WHERE recommendation_id = ?`,
        [rec.id]
      );
      rec.resources =
        resourcesResult.length > 0 && resourcesResult[0]
          ? resourcesResult[0].values.map(row => {
              const resource: any = {};
              resourcesResult[0]!.columns.forEach((col, idx) => {
                resource[col] = row[idx];
              });
              return resource;
            })
          : [];
    });

    return recommendations;
  } catch (error) {
    console.error('[PERSISTENCE] Error getting recommendations:', error);
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
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
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
