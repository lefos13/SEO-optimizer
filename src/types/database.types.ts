/**
 * Database Type Definitions
 * Core types for database operations and schemas
 */

// ============================================================
// Database Configuration
// ============================================================

export interface DatabaseConfig {
  dbPath: string;
  maxRetries?: number;
  retryDelay?: number;
}

export interface DatabaseConnection {
  db: any; // sql.js Database type
  isConnected: boolean;
}

// ============================================================
// Analysis Results (Database Schema)
// ============================================================

export interface DBAnalysisResult {
  id?: number;
  project_id?: number;
  url?: string;
  title: string;
  content: string;
  keywords: string;
  analysis_date: string;
  overall_score: number;
  grade: string;
  meta_score: number;
  content_score: number;
  technical_score: number;
  keyword_score: number;
  recommendations: string; // JSON stringified
  keyword_densities: string; // JSON stringified
  created_at?: string;
}

export interface AnalysisResultRow extends DBAnalysisResult {
  id: number;
  created_at: string;
}

// ============================================================
// Project Data
// ============================================================

export interface ProjectData {
  id?: number;
  name: string;
  description?: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectRow extends ProjectData {
  id: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Recommendation Data
// ============================================================

export interface RecommendationData {
  id?: number;
  analysis_id: number;
  rule_id: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  recommendations: string; // JSON stringified array
  created_at?: string;
}

export interface RecommendationRow extends RecommendationData {
  id: number;
  created_at: string;
}

// ============================================================
// Database Query Types
// ============================================================

export interface QueryParams {
  [key: string]: string | number | boolean | null;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface TransactionCallback<T> {
  (db: any): Promise<T>;
}

// ============================================================
// Database Operations Result Types
// ============================================================

export interface SaveAnalysisParams {
  projectId?: number;
  url?: string;
  title: string;
  content: string;
  keywords: string;
  overallScore: number;
  grade: string;
  metaScore: number;
  contentScore: number;
  technicalScore: number;
  keywordScore: number;
  recommendations: any[];
  keywordDensities: any[];
}

export interface UpdateProjectParams {
  id: number;
  name?: string;
  description?: string;
  url?: string;
}

export interface DatabaseStats {
  totalAnalyses: number;
  totalProjects: number;
  totalRecommendations: number;
  databaseSize: number;
}

export interface FilterParams {
  [key: string]: string | number | boolean;
}

// ============================================================
// Error Types
// ============================================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class DatabaseConnectionError extends DatabaseError {
  constructor(message: string, originalError?: Error) {
    super(message, 'DB_CONNECTION_ERROR', originalError);
    this.name = 'DatabaseConnectionError';
  }
}

export class DatabaseQueryError extends DatabaseError {
  constructor(message: string, originalError?: Error) {
    super(message, 'DB_QUERY_ERROR', originalError);
    this.name = 'DatabaseQueryError';
  }
}
