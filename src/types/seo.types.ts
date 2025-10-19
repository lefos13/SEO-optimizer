/**
 * SEO Analysis Type Definitions
 * Core types for SEO analysis rules, results, and scoring
 */

// ============================================================
// Content Types
// ============================================================

export interface ContentData {
  title: string;
  metaDescription?: string;
  headings: HeadingData;
  content: string;
  images: ImageData[];
  links: LinkData;
  wordCount: number;
  url?: string;
  html?: string;
}

export interface HeadingData {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
}

export interface ImageData {
  src: string;
  alt?: string;
  title?: string;
}

export interface LinkData {
  internal: string[];
  external: string[];
  total: number;
}

// ============================================================
// Parsed Content
// ============================================================

export interface ParsedContent {
  title: string;
  metaDescription: string;
  headings: HeadingData;
  content: string;
  images: ImageData[];
  links: LinkData;
  wordCount: number;
}

// ============================================================
// SEO Rules
// ============================================================

export type RuleCategory = 'meta' | 'content' | 'technical' | 'keywords';
export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface SEORule {
  id: string;
  category: RuleCategory;
  severity: RuleSeverity;
  weight: number;
  title: string;
  description: string;
  check: (content: ContentData, keywords?: ParsedKeyword[]) => Promise<RuleCheckResult>;
  recommendations: string[];
}

export interface RuleCheckResult {
  passed: boolean;
  message: string;
  details?: any;
}

// ============================================================
// Analysis Results
// ============================================================

export interface AnalysisInput {
  content: string;
  keywords: string;
  url?: string;
  language?: SupportedLanguage;
}

export interface AnalysisResult {
  overallScore: number;
  grade: string;
  scores: CategoryScores;
  recommendations: GroupedRecommendations;
  keywordDensities: KeywordDensity[];
  metadata: AnalysisMetadata;
}

export interface CategoryScores {
  meta: number;
  content: number;
  technical: number;
  keywords: number;
}

export interface AnalysisMetadata {
  analyzedAt: string;
  wordCount: number;
  keywordCount: number;
  rulesChecked: number;
  rulesPassed: number;
  rulesFailed: number;
}

// ============================================================
// Recommendations
// ============================================================

export interface Recommendation {
  ruleId: string;
  category: RuleCategory;
  severity: RuleSeverity;
  title: string;
  message: string;
  recommendations: string[];
  passed: boolean;
}

export interface GroupedRecommendations {
  critical: Recommendation[];
  high: Recommendation[];
  medium: Recommendation[];
  low: Recommendation[];
  passed: Recommendation[];
}

// ============================================================
// Keywords
// ============================================================

export interface ParsedKeyword {
  keyword: string;
  isLongTail: boolean;
}

export interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
  positions: number[];
  inTitle: boolean;
  inMetaDescription: boolean;
  inHeadings: number;
  prominence: number;
}

export interface KeywordAnalysis {
  keyword: string;
  density: number;
  frequency: number;
  prominence: number;
  recommendations: string[];
}

// ============================================================
// Scoring
// ============================================================

export interface ScoreCalculation {
  totalWeight: number;
  achievedWeight: number;
  score: number;
}

export interface GradeResult {
  grade: string;
  color: string;
  description: string;
}

export type ScoreGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

// ============================================================
// Language Support
// ============================================================

export type SupportedLanguage = 'en' | 'el';

export interface LanguageConfig {
  name: string;
  code: SupportedLanguage;
  stopWords?: string[];
  readabilityFormula?: string;
}

// ============================================================
// Rule Execution
// ============================================================

export interface RuleExecutionContext {
  content: ContentData;
  keywords: ParsedKeyword[];
  language: SupportedLanguage;
}

export interface RuleExecutionResult {
  rule: SEORule;
  result: RuleCheckResult;
  executionTime: number;
}

// ============================================================
// Analysis Configuration
// ============================================================

export interface AnalysisConfig {
  enabledCategories?: RuleCategory[];
  enabledRules?: string[];
  disabledRules?: string[];
  customWeights?: Record<string, number>;
  language?: SupportedLanguage;
  strictMode?: boolean;
}

// ============================================================
// Progress Tracking
// ============================================================

export interface AnalysisProgress {
  total: number;
  completed: number;
  current: string;
  percentage: number;
}

export interface ProgressCallback {
  (progress: AnalysisProgress): void;
}
