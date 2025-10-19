/**
 * Component Type Definitions
 * Type definitions for React components in the SEO Optimizer application
 */

import type { ReactNode, CSSProperties } from 'react';

// ============ COMMON COMPONENT PROPS ============

/**
 * Base props that most components accept
 */
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

// ============ UI COMPONENTS ============

/**
 * Button component props
 */
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  fullWidth?: boolean;
}

/**
 * Card component props
 */
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  hoverable?: boolean;
  bordered?: boolean;
  loading?: boolean;
}

/**
 * Input component props
 */
export interface InputProps extends BaseComponentProps {
  value?: string | number;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'url' | 'tel';
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  maxLength?: number;
  autoFocus?: boolean;
}

/**
 * Modal component props
 */
export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  footer?: ReactNode;
  width?: number | string;
  closable?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
  destroyOnClose?: boolean;
}

/**
 * Badge component props
 */
export interface BadgeProps extends BaseComponentProps {
  count?: number;
  dot?: boolean;
  status?: 'success' | 'processing' | 'error' | 'warning' | 'default';
  text?: string;
  color?: string;
  showZero?: boolean;
}

/**
 * Spinner/Loading component props
 */
export interface SpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  spinning?: boolean;
}

/**
 * Alert component props
 */
export interface AlertProps extends BaseComponentProps {
  type?: 'success' | 'info' | 'warning' | 'error';
  message: string;
  description?: string;
  closable?: boolean;
  onClose?: () => void;
  showIcon?: boolean;
  banner?: boolean;
}

// ============ LAYOUT COMPONENTS ============

/**
 * Navigation component props
 */
export interface NavigationProps extends BaseComponentProps {
  activeKey?: string;
  onNavigate?: (key: string) => void;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

/**
 * Layout component props
 */
export interface LayoutProps extends BaseComponentProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

// ============ ANALYSIS COMPONENTS ============

/**
 * Analysis configuration props
 */
export interface AnalysisConfigProps extends BaseComponentProps {
  onAnalyze: (config: AnalysisConfiguration) => void;
  loading?: boolean;
  initialConfig?: Partial<AnalysisConfiguration>;
}

/**
 * Analysis configuration data
 */
export interface AnalysisConfiguration {
  content: string;
  keywords: string[];
  language: 'en' | 'el';
  url?: string;
  title?: string;
  metaDescription?: string;
  projectId?: number;
}

/**
 * Analysis progress props
 */
export interface AnalysisProgressProps extends BaseComponentProps {
  progress: number;
  status: 'analyzing' | 'complete' | 'error';
  currentStep?: string;
  steps?: AnalysisStep[];
  onCancel?: () => void;
}

/**
 * Analysis step information
 */
export interface AnalysisStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  progress?: number;
}

/**
 * Content input component props
 */
export interface ContentInputProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  showWordCount?: boolean;
  showCharCount?: boolean;
  error?: string;
  label?: string;
}

/**
 * Keywords input component props
 */
export interface KeywordsInputProps extends BaseComponentProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  maxKeywords?: number;
  suggestions?: string[];
  onLoadSuggestions?: (content: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
}

// ============ RESULTS COMPONENTS ============

/**
 * Results display props
 */
export interface ResultsProps extends BaseComponentProps {
  analysisId: number;
  onReanalyze?: () => void;
  onExport?: (format: 'pdf' | 'json' | 'html') => void;
}

/**
 * Score card props
 */
export interface ScoreCardProps extends BaseComponentProps {
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  label?: string;
  showProgress?: boolean;
}

/**
 * Recommendations list props
 */
export interface RecommendationsListProps extends BaseComponentProps {
  recommendations: RecommendationItem[];
  onStatusChange?: (id: number, status: string) => void;
  groupBy?: 'priority' | 'category' | 'effort';
  filter?: RecommendationFilter;
}

/**
 * Recommendation item (for display in lists)
 */
export interface RecommendationItem {
  id: number;
  rec_id: string;
  rule_id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description?: string;
  effort: 'quick' | 'medium' | 'complex';
  estimated_time?: string;
  score_increase?: number;
  percentage_increase?: number;
  why_explanation?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'dismissed';
  created_at: string;
}

/**
 * Recommendation filter
 */
export interface RecommendationFilter {
  priority?: string[];
  category?: string[];
  effort?: string[];
  status?: string[];
}

// ============ MINI-SERVICES COMPONENTS ============

/**
 * Mini-service card props
 */
export interface MiniServiceCardProps extends BaseComponentProps {
  title: string;
  description: string;
  icon?: ReactNode;
  status?: 'idle' | 'running' | 'complete' | 'error';
  score?: number;
  onRun?: () => void;
  onViewResults?: () => void;
}

/**
 * Mini-service result props
 */
export interface MiniServiceResultProps extends BaseComponentProps {
  serviceName: string;
  result: MiniServiceResultData;
}

/**
 * Mini-service analysis result (for display)
 */
export interface MiniServiceResultData {
  score: number;
  status: 'passed' | 'warning' | 'failed';
  message?: string;
  details?: unknown;
  recommendations?: string[];
}

// ============ VIEW COMPONENTS ============

/**
 * Dashboard view props
 */
export interface DashboardViewProps extends BaseComponentProps {
  onNewAnalysis?: () => void;
}

/**
 * History view props
 */
export interface HistoryViewProps extends BaseComponentProps {
  projectId?: number;
  onAnalysisSelect?: (analysisId: number) => void;
  onDeleteAnalysis?: (analysisId: number) => void;
}

/**
 * Project selector props
 */
export interface ProjectSelectorProps extends BaseComponentProps {
  value?: number;
  onChange: (projectId: number) => void;
  allowCreate?: boolean;
  onCreateProject?: (name: string, description?: string) => void;
}
