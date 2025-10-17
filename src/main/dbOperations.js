const dbManager = require('./dbManager');

/**
 * Database Operations Module
 * Provides CRUD operations for all database tables
 */
class DatabaseOperations {
  // ============ PROJECTS ============

  /**
   * Create a new project
   * @param {Object} projectData Project information
   * @returns {Object} Created project with id
   */
  static createProject(projectData) {
    const { name, description, url } = projectData;

    try {
      const result = dbManager.run(
        `INSERT INTO projects (name, description, url)
         VALUES (?, ?, ?)`,
        [name, description, url]
      );

      return {
        id: result.lastID,
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Get project by ID
   * @param {number} projectId Project ID
   * @returns {Object|null} Project data or null
   */
  static getProject(projectId) {
    try {
      return dbManager.get('SELECT * FROM projects WHERE id = ?', [projectId]);
    } catch (error) {
      throw new Error(`Failed to get project: ${error.message}`);
    }
  }

  /**
   * Get all projects
   * @param {Object} options Filter and pagination options
   * @returns {Array} Array of projects
   */
  static getAllProjects(options = {}) {
    const { isActive = true, limit = 100, offset = 0 } = options;

    try {
      let query = 'SELECT * FROM projects';
      const params = [];

      if (isActive !== null) {
        query += ' WHERE is_active = ?';
        params.push(isActive ? 1 : 0);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      return dbManager.all(query, params);
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  /**
   * Update project
   * @param {number} projectId Project ID
   * @param {Object} updates Updated fields
   * @returns {Object} Updated project
   */
  static updateProject(projectId, updates) {
    try {
      const allowedFields = ['name', 'description', 'url', 'is_active'];
      const updateFields = [];
      const params = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateFields.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(projectId);

      dbManager.run(
        `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      return this.getProject(projectId);
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  /**
   * Delete project
   * @param {number} projectId Project ID
   * @returns {boolean} Success status
   */
  static deleteProject(projectId) {
    try {
      const result = dbManager.run('DELETE FROM projects WHERE id = ?', [
        projectId,
      ]);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  // ============ ANALYSES ============

  /**
   * Create a new analysis
   * @param {Object} analysisData Analysis information
   * @returns {Object} Created analysis with id
   */
  static createAnalysis(analysisData) {
    const { project_id, content, language, title, meta_description, keywords } =
      analysisData;

    try {
      const result = dbManager.run(
        `INSERT INTO analyses
         (project_id, content, language, title, meta_description, keywords, overall_score)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [
          project_id,
          content,
          language || 'en',
          title,
          meta_description,
          keywords,
        ]
      );

      return {
        id: result.lastID,
        ...analysisData,
        overall_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to create analysis: ${error.message}`);
    }
  }

  /**
   * Get analysis by ID
   * @param {number} analysisId Analysis ID
   * @returns {Object|null} Analysis data or null
   */
  static getAnalysis(analysisId) {
    try {
      return dbManager.get('SELECT * FROM analyses WHERE id = ?', [analysisId]);
    } catch (error) {
      throw new Error(`Failed to get analysis: ${error.message}`);
    }
  }

  /**
   * Get all analyses for a project
   * @param {number} projectId Project ID
   * @param {Object} options Filter and pagination options
   * @returns {Array} Array of analyses
   */
  static getProjectAnalyses(projectId, options = {}) {
    const { limit = 100, offset = 0 } = options;

    try {
      return dbManager.all(
        `SELECT * FROM analyses
         WHERE project_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [projectId, limit, offset]
      );
    } catch (error) {
      throw new Error(`Failed to get project analyses: ${error.message}`);
    }
  }

  /**
   * Update analysis
   * @param {number} analysisId Analysis ID
   * @param {Object} updates Updated fields
   * @returns {Object} Updated analysis
   */
  static updateAnalysis(analysisId, updates) {
    try {
      const allowedFields = [
        'title',
        'meta_description',
        'keywords',
        'overall_score',
        'language',
      ];
      const updateFields = [];
      const params = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateFields.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(analysisId);

      dbManager.run(
        `UPDATE analyses SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      return this.getAnalysis(analysisId);
    } catch (error) {
      throw new Error(`Failed to update analysis: ${error.message}`);
    }
  }

  /**
   * Delete analysis
   * @param {number} analysisId Analysis ID
   * @returns {boolean} Success status
   */
  static deleteAnalysis(analysisId) {
    try {
      const result = dbManager.run('DELETE FROM analyses WHERE id = ?', [
        analysisId,
      ]);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete analysis: ${error.message}`);
    }
  }

  // ============ SEO RULES ============

  /**
   * Create a new SEO rule
   * @param {Object} ruleData Rule information
   * @returns {Object} Created rule with id
   */
  static createSeoRule(ruleData) {
    const { category, name, description, weight } = ruleData;

    try {
      const result = dbManager.run(
        `INSERT INTO seo_rules (category, name, description, weight)
         VALUES (?, ?, ?, ?)`,
        [category, name, description, weight || 1.0]
      );

      return {
        id: result.lastID,
        ...ruleData,
        is_active: true,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to create SEO rule: ${error.message}`);
    }
  }

  /**
   * Get SEO rule by ID
   * @param {number} ruleId Rule ID
   * @returns {Object|null} Rule data or null
   */
  static getSeoRule(ruleId) {
    try {
      return dbManager.get('SELECT * FROM seo_rules WHERE id = ?', [ruleId]);
    } catch (error) {
      throw new Error(`Failed to get SEO rule: ${error.message}`);
    }
  }

  /**
   * Get all SEO rules
   * @param {Object} options Filter options
   * @returns {Array} Array of rules
   */
  static getAllSeoRules(options = {}) {
    const { category = null, isActive = true } = options;

    try {
      let query = 'SELECT * FROM seo_rules';
      const params = [];
      const conditions = [];

      if (isActive !== null) {
        conditions.push('is_active = ?');
        params.push(isActive ? 1 : 0);
      }

      if (category) {
        conditions.push('category = ?');
        params.push(category);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ' ORDER BY category, name';

      return dbManager.all(query, params);
    } catch (error) {
      throw new Error(`Failed to get SEO rules: ${error.message}`);
    }
  }

  /**
   * Get rules by category
   * @param {string} category Category name
   * @returns {Array} Array of rules
   */
  static getRulesByCategory(category) {
    try {
      return dbManager.all(
        `SELECT * FROM seo_rules
         WHERE category = ? AND is_active = 1
         ORDER BY name`,
        [category]
      );
    } catch (error) {
      throw new Error(`Failed to get rules by category: ${error.message}`);
    }
  }

  /**
   * Update SEO rule
   * @param {number} ruleId Rule ID
   * @param {Object} updates Updated fields
   * @returns {Object} Updated rule
   */
  static updateSeoRule(ruleId, updates) {
    try {
      const allowedFields = [
        'category',
        'name',
        'description',
        'weight',
        'is_active',
      ];
      const updateFields = [];
      const params = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      params.push(ruleId);

      dbManager.run(
        `UPDATE seo_rules SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      return this.getSeoRule(ruleId);
    } catch (error) {
      throw new Error(`Failed to update SEO rule: ${error.message}`);
    }
  }

  /**
   * Delete SEO rule
   * @param {number} ruleId Rule ID
   * @returns {boolean} Success status
   */
  static deleteSeoRule(ruleId) {
    try {
      const result = dbManager.run('DELETE FROM seo_rules WHERE id = ?', [
        ruleId,
      ]);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete SEO rule: ${error.message}`);
    }
  }

  // ============ MINI SERVICE RESULTS ============

  /**
   * Create a mini service result
   * @param {Object} resultData Result information
   * @returns {Object} Created result with id
   */
  static createMiniServiceResult(resultData) {
    const { analysis_id, rule_id, score, status, message, details } =
      resultData;

    try {
      const result = dbManager.run(
        `INSERT INTO mini_service_results
         (analysis_id, rule_id, score, status, message, details)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          analysis_id,
          rule_id,
          score || 0,
          status || 'pending',
          message,
          details,
        ]
      );

      return {
        id: result.lastID,
        ...resultData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to create mini service result: ${error.message}`);
    }
  }

  /**
   * Get mini service result by ID
   * @param {number} resultId Result ID
   * @returns {Object|null} Result data or null
   */
  static getMiniServiceResult(resultId) {
    try {
      return dbManager.get('SELECT * FROM mini_service_results WHERE id = ?', [
        resultId,
      ]);
    } catch (error) {
      throw new Error(`Failed to get mini service result: ${error.message}`);
    }
  }

  /**
   * Get all results for an analysis
   * @param {number} analysisId Analysis ID
   * @returns {Array} Array of results
   */
  static getAnalysisResults(analysisId) {
    try {
      return dbManager.all(
        `SELECT msr.*, sr.name as rule_name, sr.category
         FROM mini_service_results msr
         JOIN seo_rules sr ON msr.rule_id = sr.id
         WHERE msr.analysis_id = ?
         ORDER BY sr.category, sr.name`,
        [analysisId]
      );
    } catch (error) {
      throw new Error(`Failed to get analysis results: ${error.message}`);
    }
  }

  /**
   * Update mini service result
   * @param {number} resultId Result ID
   * @param {Object} updates Updated fields
   * @returns {Object} Updated result
   */
  static updateMiniServiceResult(resultId, updates) {
    try {
      const allowedFields = ['score', 'status', 'message', 'details'];
      const updateFields = [];
      const params = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateFields.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(resultId);

      dbManager.run(
        `UPDATE mini_service_results SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      return this.getMiniServiceResult(resultId);
    } catch (error) {
      throw new Error(`Failed to update mini service result: ${error.message}`);
    }
  }

  /**
   * Delete mini service result
   * @param {number} resultId Result ID
   * @returns {boolean} Success status
   */
  static deleteMiniServiceResult(resultId) {
    try {
      const result = dbManager.run(
        'DELETE FROM mini_service_results WHERE id = ?',
        [resultId]
      );
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete mini service result: ${error.message}`);
    }
  }

  /**
   * Delete all results for an analysis
   * @param {number} analysisId Analysis ID
   * @returns {number} Number of deleted results
   */
  static deleteAnalysisResults(analysisId) {
    try {
      const result = dbManager.run(
        'DELETE FROM mini_service_results WHERE analysis_id = ?',
        [analysisId]
      );
      return result.changes;
    } catch (error) {
      throw new Error(`Failed to delete analysis results: ${error.message}`);
    }
  }
}

module.exports = DatabaseOperations;
