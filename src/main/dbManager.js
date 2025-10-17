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
      // eslint-disable-next-line no-console
      console.log('[DB] Initializing database at:', this.dbPath);

      // Initialize sql.js
      this.SQL = await initSqlJs();

      // Load existing database or create new one
      let buffer;
      if (fs.existsSync(this.dbPath)) {
        buffer = fs.readFileSync(this.dbPath);
        this.db = new this.SQL.Database(buffer);
        // eslint-disable-next-line no-console
        console.log('[DB] Loaded existing database');
      } else {
        this.db = new this.SQL.Database();
        // eslint-disable-next-line no-console
        console.log('[DB] Created new database');
      }

      // Enable foreign keys
      this.db.run('PRAGMA foreign_keys = ON');

      this.createSchema();
      this.runMigrations();
      this.saveDatabase();

      this.isInitialized = true;
      // eslint-disable-next-line no-console
      console.log('[DB] Database initialized successfully');

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.log('[DB] Schema already exists');
        return;
      }

      // eslint-disable-next-line no-console
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
          title TEXT,
          meta_description TEXT,
          keywords TEXT,
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

      // Insert initial schema version
      this.db.run('INSERT INTO schema_version (version) VALUES (1)');

      // eslint-disable-next-line no-console
      console.log('[DB] Schema created successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
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

      // eslint-disable-next-line no-console
      console.log('[DB] Current schema version:', currentVersion);

      // Future migrations can be added here
      // Each migration should increment the version

      // Example of future migration:
      // if (currentVersion < 2) {
      //   this.db.run(`ALTER TABLE analyses ADD COLUMN new_column TEXT;`);
      //   this.db.run('INSERT INTO schema_version (version) VALUES (2)');
      //   this.saveDatabase();
      // }
    } catch (error) {
      // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.log('[DB] Database connection closed');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[DB] Error closing database:', error);
    }
  }

  /**
   * Execute a query and run it (for INSERT, UPDATE, DELETE)
   * @param {string} sql SQL query
   * @param {Array} params Query parameters
   * @returns {Object} Query result
   */
  run(sql, params = []) {
    try {
      this.db.run(sql, params);
      return { changes: this.db.getRowsModified() };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[DB] Error executing run query:', error, { sql, params });
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
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
          console.error('[DB] Error rolling back transaction:', err);
        }
      };
    } catch (error) {
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.error('[DB] Error getting stats:', error);
      return null;
    }
  }
}

// Export singleton instance
module.exports = new DatabaseManager();
