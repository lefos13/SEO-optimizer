/**
 * Shared constants for the SEO Optimizer application
 */

/**
 * Application information
 */
export const APP_INFO = {
  name: 'SEO Optimizer',
  version: '1.0.0',
  description: 'Standalone desktop SEO analysis and optimization tool',
};

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = ['en', 'el'] as const;

/**
 * SEO score thresholds
 */
export const SCORE_THRESHOLDS = {
  excellent: 90,
  good: 75,
  fair: 60,
  poor: 0,
};

/**
 * SEO categories
 */
export const SEO_CATEGORIES = {
  technical: 'Technical SEO',
  content: 'Content Quality',
  userExperience: 'User Experience',
  metadata: 'Meta Tags & Structure',
} as const;

/**
 * Priority levels
 */
export const PRIORITY_LEVELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
} as const;

/**
 * Content analysis defaults
 */
export const CONTENT_DEFAULTS = {
  minContentLength: 300,
  optimalContentLength: 1000,
  minHeadings: 2,
  maxHeadingLength: 60,
  keywordDensityMin: 0.01,
  keywordDensityMax: 0.03,
  titleLengthMin: 50,
  titleLengthMax: 60,
  descriptionLengthMin: 150,
  descriptionLengthMax: 160,
};

/**
 * Database file name
 */
export const DATABASE_FILE = 'seo_optimizer.db';

/**
 * IPC channels
 */
export const IPC_CHANNELS = {
  // Database operations
  DB_INIT: 'db:init',
  DB_QUERY: 'db:query',
  DB_EXECUTE: 'db:execute',

  // SEO analysis
  ANALYZE_CONTENT: 'seo:analyze',
  GET_ANALYSIS: 'seo:getAnalysis',
  DELETE_ANALYSIS: 'seo:deleteAnalysis',

  // Projects
  CREATE_PROJECT: 'project:create',
  GET_PROJECTS: 'project:getAll',
  UPDATE_PROJECT: 'project:update',
  DELETE_PROJECT: 'project:delete',

  // Settings
  GET_SETTINGS: 'settings:get',
  UPDATE_SETTINGS: 'settings:update',

  // File operations
  EXPORT_DATA: 'file:export',
  IMPORT_DATA: 'file:import',
};
