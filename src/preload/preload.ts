import { contextBridge, ipcRenderer } from 'electron';
import type { DatabaseStats } from '../types';

/**
 * Preload script for secure IPC communication
 * Exposes specific APIs to the renderer process through contextBridge
 */

// Define the ElectronAPI interface
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
    getStats: () => Promise<DatabaseStats>;
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
}

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Projects
  projects: {
    create: (projectData: unknown) =>
      ipcRenderer.invoke('db:project:create', projectData),
    get: (projectId: number) => ipcRenderer.invoke('db:project:get', projectId),
    getAll: (options?: unknown) =>
      ipcRenderer.invoke('db:project:getAll', options),
    update: (projectId: number, updates: unknown) =>
      ipcRenderer.invoke('db:project:update', projectId, updates),
    delete: (projectId: number) =>
      ipcRenderer.invoke('db:project:delete', projectId),
  },

  // Analyses
  analyses: {
    create: (analysisData: unknown) =>
      ipcRenderer.invoke('db:analysis:create', analysisData),
    get: (analysisId: number) =>
      ipcRenderer.invoke('db:analysis:get', analysisId),
    getByProject: (projectId: number, options?: unknown) =>
      ipcRenderer.invoke('db:analysis:getByProject', projectId, options),
    update: (analysisId: number, updates: unknown) =>
      ipcRenderer.invoke('db:analysis:update', analysisId, updates),
    delete: (analysisId: number) =>
      ipcRenderer.invoke('db:analysis:delete', analysisId),
  },

  // SEO Rules
  rules: {
    create: (ruleData: unknown) =>
      ipcRenderer.invoke('db:rule:create', ruleData),
    get: (ruleId: number) => ipcRenderer.invoke('db:rule:get', ruleId),
    getAll: (options?: unknown) =>
      ipcRenderer.invoke('db:rule:getAll', options),
    getByCategory: (category: string) =>
      ipcRenderer.invoke('db:rule:getByCategory', category),
    update: (ruleId: number, updates: unknown) =>
      ipcRenderer.invoke('db:rule:update', ruleId, updates),
    delete: (ruleId: number) => ipcRenderer.invoke('db:rule:delete', ruleId),
  },

  // Analysis Results
  results: {
    create: (resultData: unknown) =>
      ipcRenderer.invoke('db:result:create', resultData),
    get: (resultId: number) => ipcRenderer.invoke('db:result:get', resultId),
    getByAnalysis: (analysisId: number) =>
      ipcRenderer.invoke('db:result:getByAnalysis', analysisId),
    update: (resultId: number, updates: unknown) =>
      ipcRenderer.invoke('db:result:update', resultId, updates),
    delete: (resultId: number) =>
      ipcRenderer.invoke('db:result:delete', resultId),
    deleteByAnalysis: (analysisId: number) =>
      ipcRenderer.invoke('db:result:deleteByAnalysis', analysisId),
  },

  // Database stats
  database: {
    getStats: () => ipcRenderer.invoke('db:stats'),
  },

  // SEO Analyzer
  seo: {
    analyze: (content: unknown) => ipcRenderer.invoke('seo:analyze', content),
    getRecommendations: (analysisId: number) =>
      ipcRenderer.invoke('seo:recommendations:get', analysisId),
    updateRecommendationStatus: (
      recId: number,
      status: string,
      notes?: string
    ) =>
      ipcRenderer.invoke(
        'seo:recommendations:updateStatus',
        recId,
        status,
        notes
      ),
    getQuickWins: (analysisId: number) =>
      ipcRenderer.invoke('seo:recommendations:quickWins', analysisId),
    calculateDensity: (text: string, keyword: string) =>
      ipcRenderer.invoke('seo:calculateDensity', text, keyword),
    calculateDensities: (text: string, keywords: string[]) =>
      ipcRenderer.invoke('seo:calculateDensities', text, keywords),
    suggestKeywords: (html: string, maxSuggestions = 10) =>
      ipcRenderer.invoke('seo:suggestKeywords', html, maxSuggestions),
    saveRecommendations: (
      analysisId: number,
      enhancedRecommendations: unknown[]
    ) =>
      ipcRenderer.invoke(
        'seo:saveRecommendations',
        analysisId,
        enhancedRecommendations
      ),
    fetchUrl: (url: string, options?: unknown) =>
      ipcRenderer.invoke('seo:fetchUrl', url, options),
  },

  // Keyword Services
  keyword: {
    analyzeDensity: (content: string, keywords: string[]) =>
      ipcRenderer.invoke('keyword:analyzeDensity', content, keywords),
    generateLongTail: (
      content: string,
      seedKeywords: string[],
      maxSuggestions?: number
    ) =>
      ipcRenderer.invoke(
        'keyword:generateLongTail',
        content,
        seedKeywords,
        maxSuggestions
      ),
    estimateDifficulty: (keywords: string[], content: string) =>
      ipcRenderer.invoke('keyword:estimateDifficulty', keywords, content),
    cluster: (keywords: string[], content: string) =>
      ipcRenderer.invoke('keyword:cluster', keywords, content),
    generateLSI: (
      content: string,
      mainKeywords: string[],
      maxSuggestions?: number
    ) =>
      ipcRenderer.invoke(
        'keyword:generateLSI',
        content,
        mainKeywords,
        maxSuggestions
      ),
  },

  // Readability Services
  readability: {
    analyze: (content: string, options?: { language?: string }) =>
      ipcRenderer.invoke('readability:analyze', content, options),
    analyzeOverview: (content: string, options?: { language?: string }) =>
      ipcRenderer.invoke('readability:analyzeOverview', content, options),
    analyzeStructure: (content: string, options?: { language?: string }) =>
      ipcRenderer.invoke('readability:analyzeStructure', content, options),
    analyzeReadingLevels: (content: string, options?: { language?: string }) =>
      ipcRenderer.invoke('readability:analyzeReadingLevels', content, options),
    analyzeImprovements: (content: string, options?: { language?: string }) =>
      ipcRenderer.invoke('readability:analyzeImprovements', content, options),
    analyzeLanguageGuidance: (
      content: string,
      options?: { language?: string }
    ) =>
      ipcRenderer.invoke(
        'readability:analyzeLanguageGuidance',
        content,
        options
      ),
    analyzeLiveScore: (content: string, options?: { language?: string }) =>
      ipcRenderer.invoke('readability:analyzeLiveScore', content, options),
  },

  // Content Optimization Services
  content: {
    analyzeStructure: (content: string, options?: unknown) =>
      ipcRenderer.invoke('content:analyzeStructure', content, options),
    optimizeHeadings: (content: string, keywords: string[]) =>
      ipcRenderer.invoke('content:optimizeHeadings', content, keywords),
    recommendInternalLinks: (content: string, existingPages: unknown[]) =>
      ipcRenderer.invoke(
        'content:recommendInternalLinks',
        content,
        existingPages
      ),
    optimizeLength: (content: string, options?: unknown) =>
      ipcRenderer.invoke('content:optimizeLength', content, options),
    analyzeGaps: (content: string, topics: string[]) =>
      ipcRenderer.invoke('content:analyzeGaps', content, topics),
    analyzeCompetitive: (content: string, competitors: unknown[]) =>
      ipcRenderer.invoke('content:analyzeCompetitive', content, competitors),
  },
} as ElectronAPI);

// Declare global types for renderer process
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
