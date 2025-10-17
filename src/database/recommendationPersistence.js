/**
 * Recommendation Persistence Module
 * Handles saving and retrieving recommendations from SQLite database
 * Updated to work with sql.js API via dbManager
 */

/**
 * Save recommendations to database
 * @param {Object} db - Database instance (sql.js)
 * @param {number} analysisId - Analysis ID
 * @param {Object} enhancedRecommendations - Enhanced recommendations object
 * @returns {number} Number of recommendations saved
 */
function saveRecommendations(db, analysisId, enhancedRecommendations) {
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
        result.length > 0 && result[0].values.length > 0
          ? result[0].values[0][0]
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
        error.message
      );
    }
  });

   
  console.log(`[PERSISTENCE] ✅ Saved ${savedCount} recommendations`);
  return savedCount;
}

/**
 * Get recommendations for an analysis
 * @param {Object} db - Database instance
 * @param {number} analysisId - Analysis ID
 * @returns {Array} Array of recommendations with related data
 */
function getRecommendations(db, analysisId) {
  try {
    // Get all recommendations
    const recResult = db.exec(
      `SELECT * FROM recommendations WHERE analysis_id = ? ORDER BY priority DESC, score_increase DESC`,
      [analysisId]
    );

    if (recResult.length === 0 || recResult[0].values.length === 0) {
      return [];
    }

    const columns = recResult[0].columns;
    const rows = recResult[0].values;

    // Convert to objects
    const recommendations = rows.map(row => {
      const obj = {};
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
        actionsResult.length > 0
          ? actionsResult[0].values.map(row => {
              const action = {};
              actionsResult[0].columns.forEach((col, idx) => {
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
        exampleResult.length > 0 && exampleResult[0].values.length > 0
          ? (() => {
              const example = {};
              exampleResult[0].columns.forEach((col, idx) => {
                example[col] = exampleResult[0].values[0][idx];
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
        resourcesResult.length > 0
          ? resourcesResult[0].values.map(row => {
              const resource = {};
              resourcesResult[0].columns.forEach((col, idx) => {
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
 * @param {Object} db - Database connection
 * @param {number} recommendationId - Recommendation ID
 * @param {string} status - New status (pending, in-progress, completed, dismissed)
 * @param {string} notes - Optional notes
 */
function updateRecommendationStatus(
  db,
  recommendationId,
  status,
  notes = null
) {
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
 * @param {Object} db - Database connection
 * @param {number} analysisId - Analysis ID
 * @param {number} limit - Maximum number of results
 * @returns {Array} Array of quick win recommendations
 */
function getQuickWins(db, analysisId, limit = 5) {
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

    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }

    const columns = result[0].columns;
    return result[0].values.map(row => {
      const obj = {};
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
 * @param {Object} db - Database connection
 * @param {number} analysisId - Analysis ID
 */
function deleteRecommendations(db, analysisId) {
  try {
    db.run(`DELETE FROM recommendations WHERE analysis_id = ?`, [analysisId]);
    return true;
  } catch (error) {
     
    console.error('[PERSISTENCE] Error deleting recommendations:', error);
    return false;
  }
}

module.exports = {
  saveRecommendations,
  getRecommendations,
  updateRecommendationStatus,
  getQuickWins,
  deleteRecommendations,
};
