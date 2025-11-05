/**
 * IPC Communication Type Definitions
 * Type-safe IPC channels and message types for Electron
 */

import type { IpcMainInvokeEvent } from 'electron';
import type { AnalysisResult } from './seo.types';
import type {
  AnalysisResultRow,
  ProjectRow,
  SaveAnalysisParams,
} from './database.types';
import type { ReadabilityAnalysisResult } from '../analyzers/readability/readabilityTypes';
import type { KeywordSuggestion } from './analyzer.types';

// ============================================================
// IPC Channel Names
// ============================================================

export const IPC_CHANNELS = {
  // SEO Analysis
  SEO_ANALYZE: 'seo:analyze',
  SEO_ANALYZE_URL: 'seo:analyzeUrl',
  SEO_VALIDATE_CONTENT: 'seo:validateContent',

  // Database - Analysis
  DB_SAVE_ANALYSIS: 'db:saveAnalysis',
  DB_GET_ANALYSIS: 'db:getAnalysis',
  DB_GET_ALL_ANALYSES: 'db:getAllAnalyses',
  DB_DELETE_ANALYSIS: 'db:deleteAnalysis',
  DB_GET_RECENT_ANALYSES: 'db:getRecentAnalyses',

  // Database - Projects
  DB_CREATE_PROJECT: 'db:createProject',
  DB_GET_PROJECT: 'db:getProject',
  DB_GET_ALL_PROJECTS: 'db:getAllProjects',
  DB_UPDATE_PROJECT: 'db:updateProject',
  DB_DELETE_PROJECT: 'db:deleteProject',

  // Database - Utility
  DB_RESET: 'db:reset',
  DB_GET_STATS: 'db:getStats',

  // Keyword Services
  KEYWORD_SUGGEST: 'keyword:suggest',
  KEYWORD_EXTRACT: 'keyword:extract',
  KEYWORD_ANALYZE: 'keyword:analyze',

  // Readability Services
  READABILITY_ANALYZE: 'readability:analyze',
  READABILITY_GET_METRICS: 'readability:getMetrics',

  // Content Services
  CONTENT_OPTIMIZE: 'content:optimize',
  CONTENT_CHECK_QUALITY: 'content:checkQuality',

  // URL Fetcher
  URL_FETCH: 'url:fetch',
  URL_PARSE: 'url:parse',

  // Rules
  RULES_GET_ALL: 'rules:getAll',
  RULES_GET_BY_CATEGORY: 'rules:getByCategory',
} as const;

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

// ============================================================
// IPC Request/Response Types
// ============================================================

// SEO Analysis
export interface SEOAnalyzeRequest {
  content: string;
  keywords: string;
  url?: string;
  language?: 'en' | 'el';
}

export interface SEOAnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

export interface SEOAnalyzeUrlRequest {
  url: string;
  keywords: string;
  language?: 'en' | 'el';
}

export interface SEOAnalyzeUrlResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

// Database - Analysis
export type DBSaveAnalysisRequest = SaveAnalysisParams;

export interface DBSaveAnalysisResponse {
  success: boolean;
  data?: { id: number };
  error?: string;
}

export interface DBGetAnalysisRequest {
  id: number;
}

export interface DBGetAnalysisResponse {
  success: boolean;
  data?: AnalysisResultRow;
  error?: string;
}

export interface DBGetAllAnalysesRequest {
  limit?: number;
  offset?: number;
  projectId?: number;
}

export interface DBGetAllAnalysesResponse {
  success: boolean;
  data?: AnalysisResultRow[];
  error?: string;
}

export interface DBDeleteAnalysisRequest {
  id: number;
}

export interface DBDeleteAnalysisResponse {
  success: boolean;
  error?: string;
}

// Database - Projects
export interface DBCreateProjectRequest {
  name: string;
  description?: string;
  url?: string;
}

export interface DBCreateProjectResponse {
  success: boolean;
  data?: { id: number };
  error?: string;
}

export interface DBGetProjectRequest {
  id: number;
}

export interface DBGetProjectResponse {
  success: boolean;
  data?: ProjectRow;
  error?: string;
}

export interface DBGetAllProjectsResponse {
  success: boolean;
  data?: ProjectRow[];
  error?: string;
}

export interface DBUpdateProjectRequest {
  id: number;
  name?: string;
  description?: string;
  url?: string;
}

export interface DBUpdateProjectResponse {
  success: boolean;
  error?: string;
}

export interface DBDeleteProjectRequest {
  id: number;
}

export interface DBDeleteProjectResponse {
  success: boolean;
  error?: string;
}

// Database - Utility
export interface DBResetResponse {
  success: boolean;
  error?: string;
}

export interface DBGetStatsResponse {
  success: boolean;
  data?: {
    totalAnalyses: number;
    totalProjects: number;
    databaseSize: number;
  };
  error?: string;
}

// Keyword Services
export interface KeywordSuggestRequest {
  text: string;
  count?: number;
  language?: 'en' | 'el';
}

export interface KeywordSuggestResponse {
  success: boolean;
  data?: KeywordSuggestion[];
  error?: string;
}

export interface KeywordExtractRequest {
  text: string;
  maxKeywords?: number;
  language?: 'en' | 'el';
}

export interface KeywordExtractResponse {
  success: boolean;
  data?: Array<{ keyword: string; score: number }>;
  error?: string;
}

// Readability Services
export interface ReadabilityAnalyzeRequest {
  text: string;
  language?: 'en' | 'el';
}

export interface ReadabilityAnalyzeResponse {
  success: boolean;
  data?: ReadabilityAnalysisResult;
  error?: string;
}

// Content Services
export interface ContentOptimizeRequest {
  text: string;
  keywords?: string[];
  language?: 'en' | 'el';
}

export interface ContentOptimizeResponse {
  success: boolean;
  data?: {
    suggestions: Array<{
      type: string;
      priority: string;
      description: string;
    }>;
  };
  error?: string;
}

// URL Fetcher
export interface URLFetchRequest {
  url: string;
  timeout?: number;
}

export interface URLFetchResponse {
  success: boolean;
  data?: {
    html: string;
    statusCode: number;
    url: string;
  };
  error?: string;
}

// ============================================================
// IPC Handler Types
// ============================================================

export type IPCHandler<TRequest = unknown, TResponse = unknown> = (
  event: IpcMainInvokeEvent,
  request: TRequest
) => Promise<TResponse>;

export interface IPCHandlerMap {
  [IPC_CHANNELS.SEO_ANALYZE]: IPCHandler<SEOAnalyzeRequest, SEOAnalyzeResponse>;
  [IPC_CHANNELS.SEO_ANALYZE_URL]: IPCHandler<
    SEOAnalyzeUrlRequest,
    SEOAnalyzeUrlResponse
  >;
  [IPC_CHANNELS.DB_SAVE_ANALYSIS]: IPCHandler<
    DBSaveAnalysisRequest,
    DBSaveAnalysisResponse
  >;
  [IPC_CHANNELS.DB_GET_ANALYSIS]: IPCHandler<
    DBGetAnalysisRequest,
    DBGetAnalysisResponse
  >;
  [IPC_CHANNELS.DB_GET_ALL_ANALYSES]: IPCHandler<
    DBGetAllAnalysesRequest,
    DBGetAllAnalysesResponse
  >;
  [IPC_CHANNELS.DB_DELETE_ANALYSIS]: IPCHandler<
    DBDeleteAnalysisRequest,
    DBDeleteAnalysisResponse
  >;
  [IPC_CHANNELS.DB_CREATE_PROJECT]: IPCHandler<
    DBCreateProjectRequest,
    DBCreateProjectResponse
  >;
  [IPC_CHANNELS.DB_GET_PROJECT]: IPCHandler<
    DBGetProjectRequest,
    DBGetProjectResponse
  >;
  [IPC_CHANNELS.DB_GET_ALL_PROJECTS]: IPCHandler<
    void,
    DBGetAllProjectsResponse
  >;
  [IPC_CHANNELS.DB_UPDATE_PROJECT]: IPCHandler<
    DBUpdateProjectRequest,
    DBUpdateProjectResponse
  >;
  [IPC_CHANNELS.DB_DELETE_PROJECT]: IPCHandler<
    DBDeleteProjectRequest,
    DBDeleteProjectResponse
  >;
  [IPC_CHANNELS.DB_RESET]: IPCHandler<void, DBResetResponse>;
  [IPC_CHANNELS.DB_GET_STATS]: IPCHandler<void, DBGetStatsResponse>;
  [IPC_CHANNELS.KEYWORD_SUGGEST]: IPCHandler<
    KeywordSuggestRequest,
    KeywordSuggestResponse
  >;
  [IPC_CHANNELS.KEYWORD_EXTRACT]: IPCHandler<
    KeywordExtractRequest,
    KeywordExtractResponse
  >;
  [IPC_CHANNELS.READABILITY_ANALYZE]: IPCHandler<
    ReadabilityAnalyzeRequest,
    ReadabilityAnalyzeResponse
  >;
  [IPC_CHANNELS.CONTENT_OPTIMIZE]: IPCHandler<
    ContentOptimizeRequest,
    ContentOptimizeResponse
  >;
  [IPC_CHANNELS.URL_FETCH]: IPCHandler<URLFetchRequest, URLFetchResponse>;
}

// ============================================================
// Window API Types (Preload)
// ============================================================

export interface ElectronAPI {
  projects: {
    create: (projectData: unknown) => Promise<unknown>;
    get: (projectId: number) => Promise<unknown>;
    getAll: (options?: unknown) => Promise<unknown[]>;
    update: (projectId: number, updates: unknown) => Promise<void>;
    delete: (projectId: number) => Promise<void>;
  };
  analyses: {
    create: (analysisData: unknown) => Promise<unknown>;
    get: (analysisId: number) => Promise<unknown>;
    getByProject: (projectId: number, options?: unknown) => Promise<unknown[]>;
    update: (analysisId: number, updates: unknown) => Promise<void>;
    delete: (analysisId: number) => Promise<void>;
  };
  rules: {
    create: (ruleData: unknown) => Promise<unknown>;
    get: (ruleId: number) => Promise<unknown>;
    getAll: (options?: unknown) => Promise<unknown[]>;
    getByCategory: (category: string) => Promise<unknown[]>;
    update: (ruleId: number, updates: unknown) => Promise<void>;
    delete: (ruleId: number) => Promise<void>;
  };
  results: {
    create: (resultData: unknown) => Promise<unknown>;
    get: (resultId: number) => Promise<unknown>;
    getByAnalysis: (analysisId: number) => Promise<unknown[]>;
    update: (resultId: number, updates: unknown) => Promise<void>;
    delete: (resultId: number) => Promise<void>;
    deleteByAnalysis: (analysisId: number) => Promise<void>;
  };
  database: {
    getStats: () => Promise<unknown>;
  };
  seo: {
    analyze: (content: unknown) => Promise<unknown>;
    getRecommendations: (analysisId: number) => Promise<unknown>;
    updateRecommendationStatus: (
      recId: number,
      status: string,
      notes?: string
    ) => Promise<void>;
    getQuickWins: (analysisId: number) => Promise<unknown[]>;
    calculateDensity: (text: string, keyword: string) => Promise<number>;
    calculateDensities: (
      text: string,
      keywords: string[]
    ) => Promise<Record<string, number>>;
    suggestKeywords: (
      html: string,
      maxSuggestions?: number
    ) => Promise<unknown[]>;
    saveRecommendations: (
      analysisId: number,
      enhancedRecommendations: unknown[]
    ) => Promise<void>;
    fetchUrl: (url: string, options?: unknown) => Promise<unknown>;
  };
  keyword: {
    analyzeDensity: (content: string, keywords: string[]) => Promise<unknown>;
    generateLongTail: (
      content: string,
      seedKeywords: string[],
      maxSuggestions?: number
    ) => Promise<unknown[]>;
    estimateDifficulty: (
      keywords: string[],
      content: string
    ) => Promise<unknown>;
    cluster: (keywords: string[], content: string) => Promise<unknown>;
    generateLSI: (
      content: string,
      mainKeywords: string[],
      maxSuggestions?: number
    ) => Promise<unknown[]>;
  };
  readability: {
    analyze: (
      content: string,
      options?: { language?: string }
    ) => Promise<unknown>;
    analyzeOverview: (
      content: string,
      options?: { language?: string }
    ) => Promise<unknown>;
    analyzeStructure: (
      content: string,
      options?: { language?: string }
    ) => Promise<unknown>;
    analyzeReadingLevels: (
      content: string,
      options?: { language?: string }
    ) => Promise<unknown>;
    analyzeImprovements: (
      content: string,
      options?: { language?: string }
    ) => Promise<unknown>;
    analyzeLanguageGuidance: (
      content: string,
      options?: { language?: string }
    ) => Promise<unknown>;
    analyzeLiveScore: (
      content: string,
      options?: { language?: string }
    ) => Promise<unknown>;
  };
  content: {
    analyzeStructure: (content: string, options?: unknown) => Promise<unknown>;
    optimizeHeadings: (content: string, keywords: string[]) => Promise<unknown>;
    recommendInternalLinks: (
      content: string,
      existingPages: unknown[]
    ) => Promise<unknown>;
    optimizeLength: (content: string, options?: unknown) => Promise<unknown>;
    analyzeGaps: (content: string, topics: string[]) => Promise<unknown>;
    analyzeCompetitive: (
      content: string,
      competitors: unknown[]
    ) => Promise<unknown>;
  };
  health: {
    check: () => Promise<unknown>;
    status: () => Promise<unknown>;
    metrics: () => Promise<unknown>;
    reset: () => Promise<{ success: boolean; message: string }>;
  };
  settings: {
    clearDatabase: () => Promise<{ success: boolean; message: string }>;
    exportData: () => Promise<unknown>;
    importData: (data: unknown) => Promise<unknown>;
    getAppInfo: () => Promise<unknown>;
  };
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  };
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
