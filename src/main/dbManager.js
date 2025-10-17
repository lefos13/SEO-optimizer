const initSqlJs = require('sql.js');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

/**
 * Database Manager using sql.js
 * Handles SQLite database initialization, schema creation, and connection management
 * Uses pure JavaScript SQLite (no compilation needed)
 */
class DatabaseManager {
  constructor() {
    this.db = null;
    this.SQL = null;
    this.isInitialized = false;
    this.dbPath = this.getDbPath();
  }

  /**
   * Get the database file path
   * Uses app data directory on production, temp directory on development
   * @returns {string} Path to database file
   */
  getDbPath() {
    const dbDir =
      process.env.NODE_ENV === 'production'
        ? path.join(os.homedir(), '.seo-optimizer', 'data')
        : path.join(os.tmpdir(), 'seo-optimizer');

    // Ensure directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    return path.join(dbDir, 'seo-optimizer.db');
  }

  /**
   * Initialize database connection
   * @returns {boolean} Success status
   */
  async initialize() {
    try {
       
      console.log('[DB] Initializing database at:', this.dbPath);

      // Initialize sql.js
      this.SQL = await initSqlJs();

      // Load existing database or create new one
      let buffer;
      if (fs.existsSync(this.dbPath)) {
        buffer = fs.readFileSync(this.dbPath);
        this.db = new this.SQL.Database(buffer);
         
        console.log('[DB] Loaded existing database');
      } else {
        this.db = new this.SQL.Database();
         
        console.log('[DB] Created new database');
      }

      // Enable foreign keys
      this.db.run('PRAGMA foreign_keys = ON');

      this.createSchema();
      this.runMigrations();
      this.saveDatabase();

      this.isInitialized = true;
       
      console.log('[DB] Database initialized successfully');

      return true;
    } catch (error) {
       
      console.error('[DB] Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Save database to file
   */
  saveDatabase() {
    try {
      if (!this.db) return;
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch (error) {
       
      console.error('[DB] Error saving database:', error);
    }
  }

  /**
   * Create database schema if it doesn't exist
   */
  createSchema() {
    try {
      // Check if schema already exists using exec (returns array of results)
      const result = this.db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
      );

      if (result.length > 0 && result[0].values.length > 0) {
         
        console.log('[DB] Schema already exists');
        return;
      }

       
      console.log('[DB] Creating database schema...');

      // Schema version table
      this.db.run(`
        CREATE TABLE schema_version (
          id INTEGER PRIMARY KEY,
          version INTEGER NOT NULL,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Projects table
      this.db.run(`
        CREATE TABLE projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1
        );
      `);

      this.db.run(
        'CREATE INDEX idx_projects_created_at ON projects(created_at);'
      );
      this.db.run(
        'CREATE INDEX idx_projects_is_active ON projects(is_active);'
      );

      // Analyses table
      this.db.run(`
        CREATE TABLE analyses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          language TEXT DEFAULT 'en',
          overall_score REAL DEFAULT 0,
          max_score REAL DEFAULT 0,
          percentage INTEGER DEFAULT 0,
          grade TEXT DEFAULT 'F',
          passed_rules INTEGER DEFAULT 0,
          failed_rules INTEGER DEFAULT 0,
          warnings INTEGER DEFAULT 0,
          category_scores TEXT,
          title TEXT,
          meta_description TEXT,
          keywords TEXT,
          url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
      `);

      this.db.run(
        'CREATE INDEX idx_analyses_project_id ON analyses(project_id);'
      );
      this.db.run(
        'CREATE INDEX idx_analyses_created_at ON analyses(created_at);'
      );

      // SEO Rules table (for scoring rules and recommendations)
      this.db.run(`
        CREATE TABLE seo_rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          weight REAL DEFAULT 1.0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      this.db.run(
        'CREATE INDEX idx_seo_rules_category ON seo_rules(category);'
      );
      this.db.run(
        'CREATE INDEX idx_seo_rules_is_active ON seo_rules(is_active);'
      );

      // Mini Service Results table (individual analysis results)
      this.db.run(`
        CREATE TABLE mini_service_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          analysis_id INTEGER NOT NULL,
          rule_id INTEGER NOT NULL,
          score REAL DEFAULT 0,
          status TEXT DEFAULT 'pending',
          message TEXT,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE,
          FOREIGN KEY (rule_id) REFERENCES seo_rules(id) ON DELETE CASCADE
        );
      `);

      this.db.run(
        'CREATE INDEX idx_mini_service_results_analysis_id ON mini_service_results(analysis_id);'
      );
      this.db.run(
        'CREATE INDEX idx_mini_service_results_rule_id ON mini_service_results(rule_id);'
      );
      this.db.run(
        'CREATE INDEX idx_mini_service_results_status ON mini_service_results(status);'
      );

      // Recommendations table (for enhanced recommendations from recommendation engine)
      this.db.run(`
        CREATE TABLE recommendations (
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
          FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
        );
      `);

      this.db.run(
        'CREATE INDEX idx_recommendations_analysis_id ON recommendations(analysis_id);'
      );
      this.db.run(
        'CREATE INDEX idx_recommendations_priority ON recommendations(priority);'
      );
      this.db.run(
        'CREATE INDEX idx_recommendations_status ON recommendations(status);'
      );

      // Recommendation actions table
      this.db.run(`
        CREATE TABLE recommendation_actions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recommendation_id INTEGER NOT NULL,
          step INTEGER NOT NULL,
          action_text TEXT NOT NULL,
          action_type TEXT NOT NULL,
          is_specific BOOLEAN DEFAULT 0,
          completed BOOLEAN DEFAULT 0,
          completed_at DATETIME,
          FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
        );
      `);

      this.db.run(
        'CREATE INDEX idx_recommendation_actions_rec_id ON recommendation_actions(recommendation_id);'
      );

      // Recommendation examples table
      this.db.run(`
        CREATE TABLE recommendation_examples (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recommendation_id INTEGER NOT NULL,
          before_example TEXT,
          after_example TEXT,
          FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
        );
      `);

      // Recommendation resources table
      this.db.run(`
        CREATE TABLE recommendation_resources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recommendation_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
        );
      `);

      // Recommendation status history table
      this.db.run(`
        CREATE TABLE recommendation_status_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recommendation_id INTEGER NOT NULL,
          old_status TEXT NOT NULL,
          new_status TEXT NOT NULL,
          notes TEXT,
          changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
        );
      `);

      // Insert initial schema version
      this.db.run('INSERT INTO schema_version (version) VALUES (1)');

       
      console.log('[DB] Schema created successfully');
    } catch (error) {
       
      console.error('[DB] Error creating schema:', error);
      throw error;
    }
  }

  /**
   * Run database migrations
   */
  runMigrations() {
    try {
      const result = this.db.exec(
        'SELECT MAX(version) as version FROM schema_version'
      );
      const currentVersion =
        result.length > 0 && result[0].values.length > 0
          ? result[0].values[0][0]
          : 0;

       
      console.log('[DB] Current schema version:', currentVersion);

      // Migration 1: Create default "Direct Input" project
      if (currentVersion < 1) {
        try {
          const existingProject = this.db.exec(
            `SELECT id FROM projects WHERE name = 'Direct Input' LIMIT 1`
          );
          if (!existingProject || existingProject.length === 0) {
            this.db.run(
              `INSERT INTO projects (name, description, url) VALUES (?, ?, ?)`,
              [
                'Direct Input',
                'Analyses performed on directly submitted content',
                'N/A',
              ]
            );
             
            console.log('[DB] Created default "Direct Input" project');
          }
        } catch (e) {
           
          console.error('[DB] Error creating default project:', e);
        }
      }

      // Future migrations can be added here
      // Each migration should increment the version

      // Example of future migration:
      // if (currentVersion < 2) {
      //   this.db.run(`ALTER TABLE analyses ADD COLUMN new_column TEXT;`);
      //   this.db.run('INSERT INTO schema_version (version) VALUES (2)');
      //   this.saveDatabase();
      // }
    } catch (error) {
       
      console.error('[DB] Error running migrations:', error);
      throw error;
    }
  }

  /**
   * Get database instance
   * @returns {Database} sql.js database instance
   */
  getDb() {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Close database connection
   */
  close() {
    try {
      if (this.db) {
        this.saveDatabase();
        this.db.close();
        this.isInitialized = false;
         
        console.log('[DB] Database connection closed');
      }
    } catch (error) {
       
      console.error('[DB] Error closing database:', error);
    }
  }

  /**
   * Execute a query and run it (for INSERT, UPDATE, DELETE)
   * @param {string} sql SQL query
   * @param {Array} params Query parameters
   * @returns {Object} Query result with changes and lastID
   */
  run(sql, params = []) {
    try {
       
      console.log('[DB] Executing query:', {
        queryType: sql.trim().split(/\s+/)[0].toUpperCase(),
        paramCount: params.length,
      });

      this.db.run(sql, params);

      // For INSERT queries, get the last insert rowid
      let lastID = null;
      if (sql.trim().toUpperCase().startsWith('INSERT')) {
        const lastIdResult = this.db.exec('SELECT last_insert_rowid() as id');
        if (lastIdResult.length > 0 && lastIdResult[0].values.length > 0) {
          lastID = lastIdResult[0].values[0][0];
        }
         
        console.log('[DB] ✅ INSERT query executed, lastID:', lastID);
      }

      const changes = this.db.getRowsModified();
       
      console.log('[DB] ✅ Query executed successfully, changes:', changes);

      return {
        changes: changes,
        lastID: lastID,
      };
    } catch (error) {
       
      console.error('[DB] ❌ Error executing run query:', error, {
        sql,
        params,
      });
      throw error;
    }
  }

  /**
   * Execute a query and get single result
   * @param {string} sql SQL query
   * @param {Array} params Query parameters
   * @returns {Object|undefined} Single row
   */
  get(sql, params = []) {
    try {
      const result = this.db.exec(sql, params);
      if (result.length === 0 || result[0].values.length === 0) {
        return undefined;
      }

      // Convert sql.js format (columns + values) to object format
      const columns = result[0].columns;
      const row = result[0].values[0];
      const obj = {};

      for (let i = 0; i < columns.length; i++) {
        obj[columns[i]] = row[i];
      }

      return obj;
    } catch (error) {
       
      console.error('[DB] Error executing get query:', error, { sql, params });
      throw error;
    }
  }

  /**
   * Execute a query and get all results
   * @param {string} sql SQL query
   * @param {Array} params Query parameters
   * @returns {Array} All matching rows
   */
  all(sql, params = []) {
    try {
      const result = this.db.exec(sql, params);
      if (result.length === 0 || result[0].values.length === 0) {
        return [];
      }

      // Convert sql.js format (columns + values) to array of objects
      const columns = result[0].columns;
      const rows = result[0].values;

      return rows.map(row => {
        const obj = {};
        for (let i = 0; i < columns.length; i++) {
          obj[columns[i]] = row[i];
        }
        return obj;
      });
    } catch (error) {
       
      console.error('[DB] Error executing all query:', error, { sql, params });
      throw error;
    }
  }

  /**
   * Begin a transaction
   * @returns {Function} Rollback function
   */
  beginTransaction() {
    try {
      this.db.run('BEGIN TRANSACTION');
      return () => {
        try {
          this.db.run('ROLLBACK');
        } catch (err) {
           
          console.error('[DB] Error rolling back transaction:', err);
        }
      };
    } catch (error) {
       
      console.error('[DB] Error beginning transaction:', error);
      throw error;
    }
  }

  /**
   * Commit a transaction
   */
  commitTransaction() {
    try {
      this.db.run('COMMIT');
      this.saveDatabase();
    } catch (error) {
       
      console.error('[DB] Error committing transaction:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   * @returns {Object} Database info
   */
  getStats() {
    try {
      const projectCount =
        this.all('SELECT COUNT(*) as count FROM projects')[0]?.count || 0;
      const analysisCount =
        this.all('SELECT COUNT(*) as count FROM analyses')[0]?.count || 0;
      const rulesCount =
        this.all('SELECT COUNT(*) as count FROM seo_rules')[0]?.count || 0;

      return {
        path: this.dbPath,
        isInitialized: this.isInitialized,
        projectCount,
        analysisCount,
        rulesCount,
      };
    } catch (error) {
       
      console.error('[DB] Error getting stats:', error);
      return null;
    }
  }
}

// Export singleton instance
module.exports = new DatabaseManager();
