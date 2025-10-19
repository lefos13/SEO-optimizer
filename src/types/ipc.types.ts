/**
 * IPC Communication Type Definitions
 * Type-safe IPC channels and message types for Electron
 */

import type { AnalysisResult } from './seo.types';
import type {
  AnalysisResultRow,
  ProjectRow,
  SaveAnalysisParams,
} from './database.types';
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
export interface DBSaveAnalysisRequest extends SaveAnalysisParams {}

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
  data?: {
    score: number;
    grade: string;
    level: string;
    metrics: any;
  };
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

export type IPCHandler<TRequest = any, TResponse = any> = (
  event: Electron.IpcMainInvokeEvent,
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
  seo: {
    analyze: (data: SEOAnalyzeRequest) => Promise<SEOAnalyzeResponse>;
    analyzeUrl: (data: SEOAnalyzeUrlRequest) => Promise<SEOAnalyzeUrlResponse>;
  };
  database: {
    saveAnalysis: (
      data: DBSaveAnalysisRequest
    ) => Promise<DBSaveAnalysisResponse>;
    getAnalysis: (id: number) => Promise<DBGetAnalysisResponse>;
    getAllAnalyses: (
      params?: DBGetAllAnalysesRequest
    ) => Promise<DBGetAllAnalysesResponse>;
    deleteAnalysis: (id: number) => Promise<DBDeleteAnalysisResponse>;
    createProject: (
      data: DBCreateProjectRequest
    ) => Promise<DBCreateProjectResponse>;
    getProject: (id: number) => Promise<DBGetProjectResponse>;
    getAllProjects: () => Promise<DBGetAllProjectsResponse>;
    updateProject: (
      data: DBUpdateProjectRequest
    ) => Promise<DBUpdateProjectResponse>;
    deleteProject: (id: number) => Promise<DBDeleteProjectResponse>;
    reset: () => Promise<DBResetResponse>;
    getStats: () => Promise<DBGetStatsResponse>;
  };
  keyword: {
    suggest: (data: KeywordSuggestRequest) => Promise<KeywordSuggestResponse>;
    extract: (data: KeywordExtractRequest) => Promise<KeywordExtractResponse>;
  };
  readability: {
    analyze: (
      data: ReadabilityAnalyzeRequest
    ) => Promise<ReadabilityAnalyzeResponse>;
  };
  content: {
    optimize: (
      data: ContentOptimizeRequest
    ) => Promise<ContentOptimizeResponse>;
  };
  url: {
    fetch: (data: URLFetchRequest) => Promise<URLFetchResponse>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
