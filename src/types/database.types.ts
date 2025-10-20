/**
 * Database Type Definitions
 * Core types for database operations and schemas
 */

import type { Database } from 'sql.js';
import type { Recommendation, KeywordDensity } from './seo.types';

// ============================================================
// Database Configuration
// ============================================================

export interface DatabaseConfig {
  dbPath: string;
  maxRetries?: number;
  retryDelay?: number;
}

export interface DatabaseConnection {
  db: Database; // sql.js Database type from initSqlJs
  isConnected: boolean;
}

// ============================================================
// Analysis Results (Database Schema)
// ============================================================

export interface DBAnalysisResult {
  id?: number;
  project_id?: number;
  content: string;
  language?: string;
  overall_score?: number;
  max_score?: number;
  percentage?: number;
  grade?: string;
  passed_rules?: number;
  failed_rules?: number;
  warnings?: number;
  category_scores?: string;
  title?: string;
  meta_description?: string;
  keywords?: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
  analysis_date?: string;
  recommendations?: string; // JSON stringified
  keyword_densities?: string; // JSON stringified
}

export interface AnalysisResultRow extends DBAnalysisResult {
  id: number;
  project_id: number;
  content: string;
  title: string;
  keywords: string;
  analysis_date: string;
  overall_score: number;
  grade: string;
  meta_score: number;
  content_score: number;
  technical_score: number;
  keyword_score: number;
  recommendations: string;
  keyword_densities: string;
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
  is_active?: boolean;
}

export interface ProjectRow extends ProjectData {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
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

export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
}

export interface TransactionCallback<T> {
  (db: Database): Promise<T>;
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
  recommendations: Recommendation[];
  keywordDensities: KeywordDensity[];
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
