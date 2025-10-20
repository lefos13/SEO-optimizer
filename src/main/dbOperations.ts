import dbManager from './dbManager';
import type { ProjectRow, AnalysisResultRow } from '../types/database.types';

/**
 * Project creation input
 */
interface CreateProjectInput {
  name: string;
  description?: string;
  url?: string;
}

/**
 * Project update input
 */
interface UpdateProjectInput {
  name?: string;
  description?: string;
  url?: string;
  is_active?: boolean;
}

/**
 * Analysis creation input
 */
interface CreateAnalysisInput {
  project_id: number;
  content: string;
  language?: string;
  title?: string;
  meta_description?: string;
  keywords?: string;
  url?: string;
}

/**
 * Analysis update input
 */
interface UpdateAnalysisInput {
  title?: string;
  meta_description?: string;
  keywords?: string;
  overall_score?: number;
  max_score?: number;
  percentage?: number;
  grade?: string;
  passed_rules?: number;
  failed_rules?: number;
  warnings?: number;
  category_scores?: string;
  language?: string;
  url?: string;
}

/**
 * SEO Rule creation input
 */
interface CreateSeoRuleInput {
  category: string;
  name: string;
  description?: string;
  weight?: number;
}

/**
 * SEO Rule data
 */
interface SeoRuleRow {
  id: number;
  category: string;
  name: string;
  description?: string;
  weight: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Mini Service Result creation input
 */
interface CreateMiniServiceResultInput {
  analysis_id: number;
  rule_id: number;
  score?: number;
  status?: string;
  message?: string;
  details?: string;
}

/**
 * Mini Service Result data
 */
interface MiniServiceResultRow {
  id: number;
  analysis_id: number;
  rule_id: number;
  score: number;
  status: string;
  message?: string;
  details?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Mini Service Result with rule info
 */
interface MiniServiceResultWithRule extends MiniServiceResultRow {
  rule_name: string;
  category: string;
}

/**
 * Query options for filtering and pagination
 */
interface QueryOptions {
  isActive?: boolean | null;
  limit?: number;
  offset?: number;
}

/**
 * Database Operations Module
 * Provides CRUD operations for all database tables
 */
class DatabaseOperations {
  // ============ PROJECTS ============

  /**
   * Create a new project
   * @param projectData Project information
   * @returns Created project with id
   */
  static createProject(projectData: CreateProjectInput): ProjectRow {
    const { name, description, url } = projectData;

    try {
      const result = dbManager.run(
        `INSERT INTO projects (name, description, url)
         VALUES (?, ?, ?)`,
        [name, description ?? null, url ?? null]
      );

      const insertedId = result.lastID;
      if (insertedId == null) {
        throw new Error('Failed to retrieve inserted project id');
      }

      return {
        id: insertedId,
        name,
        description: description || undefined,
        url: url || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };
    } catch (error) {
      throw new Error(`Failed to create project: ${(error as Error).message}`);
    }
  }

  /**
   * Get project by ID
   * @param projectId Project ID
   * @returns Project data or undefined
   */
  static getProject(projectId: number): ProjectRow | undefined {
    try {
      return dbManager.get<ProjectRow>('SELECT * FROM projects WHERE id = ?', [
        projectId,
      ]);
    } catch (error) {
      throw new Error(`Failed to get project: ${(error as Error).message}`);
    }
  }

  /**
   * Get all projects
   * @param options Filter and pagination options
   * @returns Array of projects
   */
  static getAllProjects(options: QueryOptions = {}): ProjectRow[] {
    const { isActive = true, limit = 100, offset = 0 } = options;

    try {
      let query = 'SELECT * FROM projects';
      const params: import('sql.js').SqlValue[] = [];

      if (isActive !== null) {
        query += ' WHERE is_active = ?';
        params.push(isActive ? 1 : 0);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      return dbManager.all<ProjectRow>(query, params);
    } catch (error) {
      throw new Error(`Failed to get projects: ${(error as Error).message}`);
    }
  }

  /**
   * Update project
   * @param projectId Project ID
   * @param updates Updated fields
   * @returns Updated project
   */
  static updateProject(
    projectId: number,
    updates: UpdateProjectInput
  ): ProjectRow {
    try {
      const allowedFields: (keyof UpdateProjectInput)[] = [
        'name',
        'description',
        'url',
        'is_active',
      ];
      const updateFields: string[] = [];
      const params: import('sql.js').SqlValue[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (allowedFields.includes(key as keyof UpdateProjectInput)) {
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

      const project = this.getProject(projectId);
      if (!project) {
        throw new Error('Project not found after update');
      }
      return project;
    } catch (error) {
      throw new Error(`Failed to update project: ${(error as Error).message}`);
    }
  }

  /**
   * Delete project
   * @param projectId Project ID
   * @returns Success status
   */
  static deleteProject(projectId: number): boolean {
    try {
      const result = dbManager.run('DELETE FROM projects WHERE id = ?', [
        projectId,
      ]);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete project: ${(error as Error).message}`);
    }
  }

  // ============ ANALYSES ============

  /**
   * Create a new analysis
   * @param analysisData Analysis information
   * @returns Created analysis with id
   */
  static createAnalysis(analysisData: CreateAnalysisInput): AnalysisResultRow {
    const {
      project_id,
      content,
      language,
      title,
      meta_description,
      keywords,
      url,
    } = analysisData;

    try {
      const result = dbManager.run(
        `INSERT INTO analyses
         (project_id, content, language, title, meta_description, keywords, url, overall_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          project_id,
          content,
          language || 'en',
          title ?? null,
          meta_description ?? null,
          keywords ?? null,
          url ?? null,
        ]
      );

      const insertedId = result.lastID;
      if (insertedId == null) {
        throw new Error('Failed to retrieve inserted analysis id');
      }

      return {
        id: insertedId,
        project_id,
        content,
        title: title || '',
        meta_description: meta_description || '',
        keywords: keywords || '',
        url: url || '',
        overall_score: 0,
        max_score: 0,
        percentage: 0,
        grade: 'F',
        passed_rules: 0,
        failed_rules: 0,
        warnings: 0,
        category_scores: '',
        analysis_date: new Date().toISOString(),
        meta_score: 0,
        content_score: 0,
        technical_score: 0,
        keyword_score: 0,
        recommendations: '',
        keyword_densities: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to create analysis: ${(error as Error).message}`);
    }
  }

  /**
   * Get analysis by ID
   * @param analysisId Analysis ID
   * @returns Analysis data or undefined
   */
  static getAnalysis(analysisId: number): AnalysisResultRow | undefined {
    try {
      return dbManager.get<AnalysisResultRow>(
        'SELECT * FROM analyses WHERE id = ?',
        [analysisId]
      );
    } catch (error) {
      throw new Error(`Failed to get analysis: ${(error as Error).message}`);
    }
  }

  /**
   * Get all analyses for a project
   * @param projectId Project ID
   * @param options Filter and pagination options
   * @returns Array of analyses
   */
  static getProjectAnalyses(
    projectId: number,
    options: Pick<QueryOptions, 'limit' | 'offset'> = {}
  ): AnalysisResultRow[] {
    const { limit = 100, offset = 0 } = options;

    try {
      return dbManager.all<AnalysisResultRow>(
        `SELECT * FROM analyses
         WHERE project_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [projectId, limit, offset]
      );
    } catch (error) {
      throw new Error(
        `Failed to get project analyses: ${(error as Error).message}`
      );
    }
  }

  /**
   * Update analysis
   * @param analysisId Analysis ID
   * @param updates Updated fields
   * @returns Updated analysis
   */
  static updateAnalysis(
    analysisId: number,
    updates: UpdateAnalysisInput
  ): AnalysisResultRow {
    try {
      const allowedFields: (keyof UpdateAnalysisInput)[] = [
        'title',
        'meta_description',
        'keywords',
        'overall_score',
        'max_score',
        'percentage',
        'grade',
        'passed_rules',
        'failed_rules',
        'warnings',
        'category_scores',
        'language',
        'url',
      ];
      const updateFields: string[] = [];
      const params: import('sql.js').SqlValue[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (allowedFields.includes(key as keyof UpdateAnalysisInput)) {
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

      const analysis = this.getAnalysis(analysisId);
      if (!analysis) {
        throw new Error('Analysis not found after update');
      }
      return analysis;
    } catch (error) {
      throw new Error(`Failed to update analysis: ${(error as Error).message}`);
    }
  }

  /**
   * Delete analysis
   * @param analysisId Analysis ID
   * @returns Success status
   */
  static deleteAnalysis(analysisId: number): boolean {
    try {
      const result = dbManager.run('DELETE FROM analyses WHERE id = ?', [
        analysisId,
      ]);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete analysis: ${(error as Error).message}`);
    }
  }

  // ============ SEO RULES ============

  /**
   * Create a new SEO rule
   * @param ruleData Rule information
   * @returns Created rule with id
   */
  static createSeoRule(ruleData: CreateSeoRuleInput): SeoRuleRow {
    const { category, name, description, weight } = ruleData;

    try {
      const result = dbManager.run(
        `INSERT INTO seo_rules (category, name, description, weight)
         VALUES (?, ?, ?, ?)`,
        [category, name, description ?? null, weight || 1.0]
      );

      const insertedId = result.lastID;
      if (insertedId == null) {
        throw new Error('Failed to retrieve inserted seo rule id');
      }

      return {
        id: insertedId,
        category,
        name,
        description: description || '',
        weight: weight || 1.0,
        is_active: true,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to create SEO rule: ${(error as Error).message}`);
    }
  }

  /**
   * Get SEO rule by ID
   * @param ruleId Rule ID
   * @returns Rule data or undefined
   */
  static getSeoRule(ruleId: number): SeoRuleRow | undefined {
    try {
      return dbManager.get<SeoRuleRow>('SELECT * FROM seo_rules WHERE id = ?', [
        ruleId,
      ]);
    } catch (error) {
      throw new Error(`Failed to get SEO rule: ${(error as Error).message}`);
    }
  }

  /**
   * Get all SEO rules
   * @param options Filter options
   * @returns Array of rules
   */
  static getAllSeoRules(
    options: { category?: string | null; isActive?: boolean | null } = {}
  ): SeoRuleRow[] {
    const { category = null, isActive = true } = options;

    try {
      let query = 'SELECT * FROM seo_rules';
      const params: import('sql.js').SqlValue[] = [];
      const conditions: string[] = [];

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

      return dbManager.all<SeoRuleRow>(query, params);
    } catch (error) {
      throw new Error(`Failed to get SEO rules: ${(error as Error).message}`);
    }
  }

  /**
   * Get rules by category
   * @param category Category name
   * @returns Array of rules
   */
  static getRulesByCategory(category: string): SeoRuleRow[] {
    try {
      return dbManager.all<SeoRuleRow>(
        `SELECT * FROM seo_rules
         WHERE category = ? AND is_active = 1
         ORDER BY name`,
        [category]
      );
    } catch (error) {
      throw new Error(
        `Failed to get rules by category: ${(error as Error).message}`
      );
    }
  }

  /**
   * Update SEO rule
   * @param ruleId Rule ID
   * @param updates Updated fields
   * @returns Updated rule
   */
  static updateSeoRule(
    ruleId: number,
    updates: Partial<CreateSeoRuleInput & { is_active: boolean }>
  ): SeoRuleRow {
    try {
      const allowedFields = [
        'category',
        'name',
        'description',
        'weight',
        'is_active',
      ];
      const updateFields: string[] = [];
      const params: import('sql.js').SqlValue[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          params.push(value as import('sql.js').SqlValue);
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

      const rule = this.getSeoRule(ruleId);
      if (!rule) {
        throw new Error('Rule not found after update');
      }
      return rule;
    } catch (error) {
      throw new Error(`Failed to update SEO rule: ${(error as Error).message}`);
    }
  }

  /**
   * Delete SEO rule
   * @param ruleId Rule ID
   * @returns Success status
   */
  static deleteSeoRule(ruleId: number): boolean {
    try {
      const result = dbManager.run('DELETE FROM seo_rules WHERE id = ?', [
        ruleId,
      ]);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete SEO rule: ${(error as Error).message}`);
    }
  }

  // ============ MINI SERVICE RESULTS ============

  /**
   * Create a mini service result
   * @param resultData Result information
   * @returns Created result with id
   */
  static createMiniServiceResult(
    resultData: CreateMiniServiceResultInput
  ): MiniServiceResultRow {
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
          message ?? null,
          details ?? null,
        ]
      );

      const insertedId = result.lastID;
      if (insertedId == null) {
        throw new Error('Failed to retrieve inserted mini service result id');
      }

      return {
        id: insertedId,
        analysis_id,
        rule_id,
        score: score || 0,
        status: status || 'pending',
        message: message || undefined,
        details: details || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Failed to create mini service result: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get mini service result by ID
   * @param resultId Result ID
   * @returns Result data or undefined
   */
  static getMiniServiceResult(
    resultId: number
  ): MiniServiceResultRow | undefined {
    try {
      return dbManager.get<MiniServiceResultRow>(
        'SELECT * FROM mini_service_results WHERE id = ?',
        [resultId]
      );
    } catch (error) {
      throw new Error(
        `Failed to get mini service result: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get all results for an analysis
   * @param analysisId Analysis ID
   * @returns Array of results
   */
  static getAnalysisResults(analysisId: number): MiniServiceResultWithRule[] {
    try {
      return dbManager.all<MiniServiceResultWithRule>(
        `SELECT msr.*, sr.name as rule_name, sr.category
         FROM mini_service_results msr
         JOIN seo_rules sr ON msr.rule_id = sr.id
         WHERE msr.analysis_id = ?
         ORDER BY sr.category, sr.name`,
        [analysisId]
      );
    } catch (error) {
      throw new Error(
        `Failed to get analysis results: ${(error as Error).message}`
      );
    }
  }

  /**
   * Update mini service result
   * @param resultId Result ID
   * @param updates Updated fields
   * @returns Updated result
   */
  static updateMiniServiceResult(
    resultId: number,
    updates: Partial<
      Pick<MiniServiceResultRow, 'score' | 'status' | 'message' | 'details'>
    >
  ): MiniServiceResultRow {
    try {
      const allowedFields = ['score', 'status', 'message', 'details'];
      const updateFields: string[] = [];
      const params: import('sql.js').SqlValue[] = [];

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

      const result = this.getMiniServiceResult(resultId);
      if (!result) {
        throw new Error('Result not found after update');
      }
      return result;
    } catch (error) {
      throw new Error(
        `Failed to update mini service result: ${(error as Error).message}`
      );
    }
  }

  /**
   * Delete mini service result
   * @param resultId Result ID
   * @returns Success status
   */
  static deleteMiniServiceResult(resultId: number): boolean {
    try {
      const result = dbManager.run(
        'DELETE FROM mini_service_results WHERE id = ?',
        [resultId]
      );
      return result.changes > 0;
    } catch (error) {
      throw new Error(
        `Failed to delete mini service result: ${(error as Error).message}`
      );
    }
  }

  /**
   * Delete all results for an analysis
   * @param analysisId Analysis ID
   * @returns Number of deleted results
   */
  static deleteAnalysisResults(analysisId: number): number {
    try {
      const result = dbManager.run(
        'DELETE FROM mini_service_results WHERE analysis_id = ?',
        [analysisId]
      );
      return result.changes;
    } catch (error) {
      throw new Error(
        `Failed to delete analysis results: ${(error as Error).message}`
      );
    }
  }
}

export default DatabaseOperations;
