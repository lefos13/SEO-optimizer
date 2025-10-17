import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

/**
 * Database Manager
 * Handles SQLite database initialization and operations
 */
export class DatabaseManager {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    // Set database path in user data directory
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'seo_optimizer.db');
  }

  /**
   * Initialize the database connection and create tables if needed
   */
  public initialize(): void {
    try {
      this.db = new Database(this.dbPath, { verbose: console.log });
      this.db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better performance
      this.createTables();
      console.log('Database initialized successfully at:', this.dbPath);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create database tables if they don't exist
   */
  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Analyses table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        content_type TEXT NOT NULL,
        content_source TEXT,
        content_text TEXT,
        target_keywords TEXT,
        language TEXT DEFAULT 'en',
        overall_score INTEGER,
        analysis_results TEXT,
        recommendations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      );
    `);

    // SEO Rules table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS seo_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        rule_name TEXT NOT NULL,
        rule_description TEXT,
        weight REAL DEFAULT 1.0,
        is_active BOOLEAN DEFAULT 1,
        language TEXT DEFAULT 'all'
      );
    `);

    // Mini-service Results table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS mini_service_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_type TEXT NOT NULL,
        input_data TEXT,
        output_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better query performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_analyses_project_id ON analyses(project_id);
      CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
      CREATE INDEX IF NOT EXISTS idx_seo_rules_category ON seo_rules(category);
    `);

    console.log('Database tables created successfully');
  }

  /**
   * Get the database instance
   */
  public getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Close the database connection
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Database connection closed');
    }
  }

  /**
   * Execute a query and return results
   */
  public query(sql: string, params: any[] = []): any[] {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params);
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  /**
   * Execute a command (INSERT, UPDATE, DELETE)
   */
  public execute(sql: string, params: any[] = []): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(sql);
      return stmt.run(...params);
    } catch (error) {
      console.error('Execute error:', error);
      throw error;
    }
  }

  /**
   * Begin a transaction
   */
  public beginTransaction(): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.exec('BEGIN TRANSACTION');
  }

  /**
   * Commit a transaction
   */
  public commit(): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.exec('COMMIT');
  }

  /**
   * Rollback a transaction
   */
  public rollback(): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.exec('ROLLBACK');
  }
}

// Export singleton instance
export const dbManager = new DatabaseManager();
