/**
 * Settings Type Definitions
 * TypeScript interfaces for application settings
 */

export interface AnalysisSettings {
  defaultLanguage: 'en' | 'el';
  minContentLength: number;
  targetKeywordDensity: number;
  analysisTimeout: number;
  autoSaveResults: boolean;
  includeReadability: boolean;
  checkDuplicateContent: boolean;
}

export interface DatabaseSettings {
  location: string;
  autoBackup: boolean;
  backupInterval: number; // hours
  maxBackups: number;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  autoUpdates: boolean;
  notifications: boolean;
  defaultView: 'dashboard' | 'analysis' | 'reports' | 'settings';
  language: 'en' | 'el';
}

export interface PerformanceSettings {
  cacheDuration: number; // minutes
  maxConcurrentAnalyses: number;
  memoryLimit: number; // MB
}

export interface SeoRuleSettings {
  metaWeight: number;
  contentWeight: number;
  technicalWeight: number;
  keywordWeight: number;
  readabilityWeight: number;
  customRules: CustomSeoRule[];
}

export interface CustomSeoRule {
  id: string;
  name: string;
  category: string;
  description: string;
  weight: number;
  enabled: boolean;
  pattern?: string;
  threshold?: number;
}

export interface AppInfo {
  version: string;
  name: string;
  description: string;
  author: string;
  license: string;
  database: {
    location: string;
    projects: number;
    analyses: number;
    rules: number;
    size?: string;
  };
  platform: {
    os: string;
    arch: string;
    node: string;
  };
}

export interface ExportData {
  version: string;
  exportDate: string;
  data: {
    projects: Array<Record<string, unknown>>;
    analyses: Array<Record<string, unknown>>;
    rules: Array<Record<string, unknown>>;
  };
}

export interface ImportResult {
  success: boolean;
  imported: {
    projects: number;
    analyses: number;
    rules: number;
  };
}

export interface AllSettings {
  analysis: AnalysisSettings;
  database: DatabaseSettings;
  app: AppSettings;
  performance: PerformanceSettings;
  seoRules: SeoRuleSettings;
}

export const DEFAULT_SETTINGS: AllSettings = {
  analysis: {
    defaultLanguage: 'en',
    minContentLength: 300,
    targetKeywordDensity: 2.5,
    analysisTimeout: 30000,
    autoSaveResults: true,
    includeReadability: true,
    checkDuplicateContent: true,
  },
  database: {
    location: './data/seo-optimizer.db',
    autoBackup: false,
    backupInterval: 24,
    maxBackups: 7,
  },
  app: {
    theme: 'dark',
    autoUpdates: true,
    notifications: true,
    defaultView: 'dashboard',
    language: 'en',
  },
  performance: {
    cacheDuration: 60,
    maxConcurrentAnalyses: 3,
    memoryLimit: 512,
  },
  seoRules: {
    metaWeight: 1.0,
    contentWeight: 1.0,
    technicalWeight: 1.0,
    keywordWeight: 1.0,
    readabilityWeight: 1.0,
    customRules: [],
  },
};
