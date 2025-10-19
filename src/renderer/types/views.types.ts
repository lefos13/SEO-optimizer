/**
 * View Type Definitions
 * Type definitions for view components and their state management
 */

import type { Recommendation } from './components.types';

// ============ VIEW STATE TYPES ============

/**
 * Common view state
 */
export interface ViewState {
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

/**
 * Dashboard view state
 */
export interface DashboardState extends ViewState {
  stats: DashboardStats | null;
  recentAnalyses: AnalysisItem[];
  quickActions: QuickAction[];
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  projects: {
    total: number;
    active: number;
  };
  analyses: {
    total: number;
    thisWeek: number;
    thisMonth: number;
  };
  scores: {
    average: number;
    highest: number;
    lowest: number;
  };
  recommendations: {
    total: number;
    pending: number;
    completed: number;
    quickWins: number;
  };
}

/**
 * Quick action item
 */
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
}

/**
 * Analysis view state
 */
export interface AnalysisViewState extends ViewState {
  step: 'config' | 'analyzing' | 'results';
  config: AnalysisConfig | null;
  progress: AnalysisProgress;
  results: AnalysisResults | null;
  currentAnalysisId: number | null;
}

/**
 * Analysis configuration
 */
export interface AnalysisConfig {
  projectId: number;
  content: string;
  keywords: string[];
  language: 'en' | 'el';
  url?: string;
  title?: string;
  metaDescription?: string;
}

/**
 * Analysis progress
 */
export interface AnalysisProgress {
  step: string;
  percentage: number;
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  message?: string;
}

/**
 * Analysis results
 */
export interface AnalysisResults {
  id: number;
  overallScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  passedRules: number;
  failedRules: number;
  warnings: number;
  categoryScores: CategoryScores;
  recommendations: Recommendation[];
  miniServiceResults: MiniServiceResult[];
  metadata: AnalysisMetadata;
}

/**
 * Category scores
 */
export interface CategoryScores {
  [category: string]: CategoryScore;
}

/**
 * Individual category score
 */
export interface CategoryScore {
  score: number;
  maxScore: number;
  percentage: number;
  passed: number;
  failed: number;
  warnings: number;
}

/**
 * Analysis metadata
 */
export interface AnalysisMetadata {
  analyzedAt: string;
  duration: number;
  contentLength: number;
  keywordCount: number;
  language: string;
  url?: string;
  title?: string;
}

/**
 * History view state
 */
export interface HistoryViewState extends ViewState {
  analyses: AnalysisItem[];
  filteredAnalyses: AnalysisItem[];
  selectedProjectId: number | null;
  sortBy: 'date' | 'score' | 'title';
  sortOrder: 'asc' | 'desc';
  filters: HistoryFilters;
  pagination: Pagination;
}

/**
 * Analysis list item
 */
export interface AnalysisItem {
  id: number;
  projectId: number;
  projectName: string;
  title?: string;
  url?: string;
  overallScore: number;
  percentage: number;
  grade: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * History filters
 */
export interface HistoryFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  scoreRange?: {
    min: number;
    max: number;
  };
  grades?: string[];
  languages?: string[];
  searchQuery?: string;
}

/**
 * Pagination state
 */
export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Mini-services view state
 */
export interface MiniServicesViewState extends ViewState {
  services: MiniService[];
  activeService: string | null;
  content: string;
  results: MiniServiceResultMap;
}

/**
 * Mini-service definition
 */
export interface MiniService {
  id: string;
  name: string;
  category: 'readability' | 'keyword' | 'content' | 'seo';
  description: string;
  icon: string;
  enabled: boolean;
  requiresContent: boolean;
  requiresKeywords: boolean;
}

/**
 * Mini-service results map
 */
export interface MiniServiceResultMap {
  [serviceId: string]: MiniServiceResult;
}

/**
 * Mini-service result
 */
export interface MiniServiceResult {
  status: 'idle' | 'running' | 'success' | 'error';
  score?: number;
  data?: unknown;
  error?: string;
  timestamp?: string;
}

/**
 * Projects view state
 */
export interface ProjectsViewState extends ViewState {
  projects: Project[];
  selectedProject: Project | null;
  editing: boolean;
  creating: boolean;
  form: ProjectForm;
}

/**
 * Project data
 */
export interface Project {
  id: number;
  name: string;
  description?: string;
  url?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  analysisCount: number;
  averageScore?: number;
  lastAnalyzedAt?: string;
}

/**
 * Project form data
 */
export interface ProjectForm {
  name: string;
  description: string;
  url: string;
  isActive: boolean;
  errors: {
    name?: string;
    description?: string;
    url?: string;
  };
}

/**
 * Settings view state
 */
export interface SettingsViewState extends ViewState {
  general: GeneralSettings;
  analysis: AnalysisSettings;
  appearance: AppearanceSettings;
  advanced: AdvancedSettings;
  hasUnsavedChanges: boolean;
}

/**
 * General settings
 */
export interface GeneralSettings {
  defaultLanguage: 'en' | 'el';
  autoSave: boolean;
  notifications: boolean;
}

/**
 * Analysis settings
 */
export interface AnalysisSettings {
  defaultKeywordCount: number;
  includeMetaDescription: boolean;
  includeReadability: boolean;
  strictMode: boolean;
  customRules: CustomRule[];
}

/**
 * Custom SEO rule
 */
export interface CustomRule {
  id: string;
  name: string;
  category: string;
  weight: number;
  enabled: boolean;
}

/**
 * Appearance settings
 */
export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  showAnimations: boolean;
}

/**
 * Advanced settings
 */
export interface AdvancedSettings {
  debugMode: boolean;
  cacheSize: number;
  exportFormat: 'json' | 'pdf' | 'html';
  databasePath: string;
}

// ============ NAVIGATION TYPES ============

/**
 * Navigation item
 */
export interface NavigationItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  disabled?: boolean;
  children?: NavigationItem[];
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  path?: string;
}

// ============ FORM TYPES ============

/**
 * Form validation errors
 */
export interface FormErrors {
  [fieldName: string]: string | undefined;
}

/**
 * Form submit handler
 */
export type FormSubmitHandler<T> = (data: T) => void | Promise<void>;

/**
 * Form field change handler
 */
export type FormFieldChangeHandler<T = string> = (value: T) => void;

// ============ EXPORT/IMPORT TYPES ============

/**
 * Export options
 */
export interface ExportOptions {
  format: 'json' | 'pdf' | 'html' | 'csv';
  includeRecommendations: boolean;
  includeDetails: boolean;
  fileName?: string;
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: string[];
}
