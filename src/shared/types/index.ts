/**
 * Shared type definitions for the SEO Optimizer application
 */

/**
 * SEO Analysis Result
 */
export interface SEOAnalysisResult {
  id: string;
  projectId?: string;
  contentType: 'url' | 'text';
  contentSource: string;
  contentText: string;
  targetKeywords: string[];
  language: 'en' | 'el';
  overallScore: number;
  categoryScores: CategoryScores;
  recommendations: Recommendation[];
  createdAt: Date;
}

/**
 * Category Scores
 */
export interface CategoryScores {
  technical: number;
  content: number;
  userExperience: number;
  metadata: number;
}

/**
 * Recommendation
 */
export interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impactScore: number;
  currentValue?: string;
  recommendedValue?: string;
}

/**
 * Project
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SEO Rule
 */
export interface SEORule {
  id: string;
  category: string;
  ruleName: string;
  ruleDescription: string;
  weight: number;
  isActive: boolean;
  language: 'all' | 'en' | 'el';
}

/**
 * Application Settings
 */
export interface AppSettings {
  language: 'en' | 'el';
  theme: 'light' | 'dark';
  autoSave: boolean;
  defaultKeywordCount: number;
}

/**
 * Mini-service Result
 */
export interface MiniServiceResult {
  id: string;
  serviceType: string;
  inputData: any;
  outputData: any;
  createdAt: Date;
}
