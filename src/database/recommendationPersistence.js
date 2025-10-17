/**
 * Recommendation Persistence Module
 * Handles saving and retrieving recommendations from SQLite database
 */

/**
 * Initialize recommendation tables in database
 * @param {Object} db - Database connection
 */
function initializeRecommendationTables(db) {
  // Recommendations table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      analysis_id INTEGER NOT NULL,
      rec_id TEXT NOT NULL,
      rule_id TEXT NOT NULL,
      title TEXT NOT NULL,
      priority TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      effort TEXT NOT NULL,
      estimated_time TEXT,
      score_increase INTEGER,
      percentage_increase INTEGER,
      why_explanation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (analysis_id) REFERENCES seo_analysis(id) ON DELETE CASCADE
    )
  `
  ).run();

  // Recommendation actions table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS recommendation_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recommendation_id INTEGER NOT NULL,
      step INTEGER NOT NULL,
      action_text TEXT NOT NULL,
      action_type TEXT NOT NULL,
      is_specific BOOLEAN DEFAULT 0,
      completed BOOLEAN DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
    )
  `
  ).run();

  // Recommendation examples table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS recommendation_examples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recommendation_id INTEGER NOT NULL,
      before_example TEXT,
      after_example TEXT,
      FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
    )
  `
  ).run();

  // Recommendation resources table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS recommendation_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recommendation_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
    )
  `
  ).run();

  // Recommendation status history table
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS recommendation_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recommendation_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
    )
  `
  ).run();

  console.log('Recommendation tables initialized successfully');
}

/**
 * Save recommendations to database
 * @param {Object} db - Database connection
 * @param {number} analysisId - Analysis ID
 * @param {Object} enhancedRecommendations - Enhanced recommendations object
 * @returns {number} Number of recommendations saved
 */
function saveRecommendations(db, analysisId, enhancedRecommendations) {
  const insertRec = db.prepare(`
    INSERT INTO recommendations (
      analysis_id, rec_id, rule_id, title, priority, category,
      description, effort, estimated_time, score_increase,
      percentage_increase, why_explanation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAction = db.prepare(`
    INSERT INTO recommendation_actions (
      recommendation_id, step, action_text, action_type, is_specific
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const insertExample = db.prepare(`
    INSERT INTO recommendation_examples (
      recommendation_id, before_example, after_example
    ) VALUES (?, ?, ?)
  `);

  const insertResource = db.prepare(`
    INSERT INTO recommendation_resources (
      recommendation_id, title, url
    ) VALUES (?, ?, ?)
  `);

  let savedCount = 0;

  // Start transaction for better performance
  const saveAll = db.transaction(recommendations => {
    recommendations.forEach(rec => {
      // Insert main recommendation
      const result = insertRec.run(
        analysisId,
        rec.id,
        rec.ruleId,
        rec.title,
        rec.priority,
        rec.category,
        rec.description,
        rec.effort,
        rec.estimatedTime,
        rec.impactEstimate.scoreIncrease,
        rec.impactEstimate.percentageIncrease,
        rec.why
      );

      const recommendationId = result.lastInsertRowid;

      // Insert actions
      if (rec.actions && rec.actions.length > 0) {
        rec.actions.forEach(action => {
          insertAction.run(
            recommendationId,
            action.step,
            action.action,
            action.type,
            action.specific ? 1 : 0
          );
        });
      }

      // Insert example
      if (rec.example) {
        insertExample.run(
          recommendationId,
          rec.example.before || null,
          rec.example.after || null
        );
      }

      // Insert resources
      if (rec.resources && rec.resources.length > 0) {
        rec.resources.forEach(resource => {
          insertResource.run(recommendationId, resource.title, resource.url);
        });
      }

      savedCount++;
    });
  });

  saveAll(enhancedRecommendations.recommendations);

  return savedCount;
}

/**
 * Get recommendations for an analysis
 * @param {Object} db - Database connection
 * @param {number} analysisId - Analysis ID
 * @returns {Array} Array of recommendations with actions
 */
function getRecommendations(db, analysisId) {
  const recommendations = db
    .prepare(
      `
    SELECT * FROM recommendations
    WHERE analysis_id = ?
    ORDER BY 
      CASE priority
        WHEN 'critical' THEN 0
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
      END,
      score_increase DESC
  `
    )
    .all(analysisId);

  // Get actions for each recommendation
  recommendations.forEach(rec => {
    rec.actions = db
      .prepare(
        `
      SELECT * FROM recommendation_actions
      WHERE recommendation_id = ?
      ORDER BY step
    `
      )
      .all(rec.id);

    rec.example = db
      .prepare(
        `
      SELECT * FROM recommendation_examples
      WHERE recommendation_id = ?
      LIMIT 1
    `
      )
      .get(rec.id);

    rec.resources = db
      .prepare(
        `
      SELECT * FROM recommendation_resources
      WHERE recommendation_id = ?
    `
      )
      .all(rec.id);
  });

  return recommendations;
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
  // Update main status
  db.prepare(
    `
    UPDATE recommendations
    SET status = ?
    WHERE id = ?
  `
  ).run(status, recommendationId);

  // Insert into history
  db.prepare(
    `
    INSERT INTO recommendation_status_history (
      recommendation_id, status, notes
    ) VALUES (?, ?, ?)
  `
  ).run(recommendationId, status, notes);
}

/**
 * Mark action as completed
 * @param {Object} db - Database connection
 * @param {number} actionId - Action ID
 */
function markActionCompleted(db, actionId) {
  db.prepare(
    `
    UPDATE recommendation_actions
    SET completed = 1, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `
  ).run(actionId);
}

/**
 * Get recommendation statistics
 * @param {Object} db - Database connection
 * @param {number} analysisId - Analysis ID (optional)
 * @returns {Object} Statistics
 */
function getRecommendationStats(db, analysisId = null) {
  let query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) as dismissed,
      SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low,
      SUM(score_increase) as total_potential_increase
    FROM recommendations
  `;

  if (analysisId) {
    query += ` WHERE analysis_id = ?`;
    return db.prepare(query).get(analysisId);
  }

  return db.prepare(query).get();
}

/**
 * Get quick wins (high impact, low effort, pending)
 * @param {Object} db - Database connection
 * @param {number} analysisId - Analysis ID
 * @param {number} limit - Maximum number of results
 * @returns {Array} Array of quick win recommendations
 */
function getQuickWins(db, analysisId, limit = 5) {
  return db
    .prepare(
      `
    SELECT * FROM recommendations
    WHERE analysis_id = ?
      AND effort = 'quick'
      AND (priority = 'critical' OR priority = 'high')
      AND status = 'pending'
    ORDER BY score_increase DESC
    LIMIT ?
  `
    )
    .all(analysisId, limit);
}

/**
 * Delete recommendations for an analysis
 * @param {Object} db - Database connection
 * @param {number} analysisId - Analysis ID
 */
function deleteRecommendations(db, analysisId) {
  db.prepare(`DELETE FROM recommendations WHERE analysis_id = ?`).run(
    analysisId
  );
}

module.exports = {
  initializeRecommendationTables,
  saveRecommendations,
  getRecommendations,
  updateRecommendationStatus,
  markActionCompleted,
  getRecommendationStats,
  getQuickWins,
  deleteRecommendations,
};
