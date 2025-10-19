/**
 * Score Calculator Utilities
 * Helper functions for calculating category scores and SEO metrics
 */

/**
 * Severity level for analysis issues
 */
export type IssueSeverity = 'error' | 'warning' | 'info';

/**
 * Category type for SEO analysis
 */
export type IssueCategory = 'meta' | 'content' | 'technical' | 'readability';

/**
 * Individual analysis issue
 */
export interface AnalysisIssue {
  category: IssueCategory;
  severity: IssueSeverity;
  message: string;
  [key: string]: unknown; // Allow additional properties
}

/**
 * Analysis results object
 */
export interface AnalysisResults {
  issues: AnalysisIssue[];
  [key: string]: unknown; // Allow additional properties
}

/**
 * Score details for a single category
 */
export interface CategoryScore {
  score: number;
  max: number;
  passed: number;
  total: number;
  errors: number;
  warnings: number;
}

/**
 * Map of category scores by category name
 */
export interface CategoryScores {
  [category: string]: CategoryScore;
}

/**
 * Recommendation priority levels
 */
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Recommendation status
 */
export type RecommendationStatus = 'pending' | 'inProgress' | 'completed' | 'dismissed';

/**
 * Recommendation effort levels
 */
export type RecommendationEffort = 'quick' | 'moderate' | 'significant';

/**
 * Individual recommendation object
 */
export interface Recommendation {
  priority?: RecommendationPriority;
  status?: 'pending' | 'in-progress' | 'completed' | 'dismissed';
  effort?: RecommendationEffort;
  score_increase?: number;
  [key: string]: unknown; // Allow additional properties
}

/**
 * Recommendation statistics
 */
export interface RecommendationStats {
  total: number;
  byPriority: Record<RecommendationPriority, number>;
  byStatus: Record<RecommendationStatus, number>;
  byEffort: Record<RecommendationEffort, number>;
  potentialIncrease: number;
}

/**
 * Grade letter for score percentage
 */
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

/**
 * Calculate category scores from analysis results
 * @param analysis - Analysis results object
 * @returns Category scores by category name
 */
export function calculateCategoryScores(
  analysis: AnalysisResults | null | undefined
): CategoryScores {
  if (!analysis || !analysis.issues) {
    return {};
  }

  const categories: IssueCategory[] = ['meta', 'content', 'technical', 'readability'];
  const categoryScores: CategoryScores = {};

  categories.forEach(category => {
    // Get all issues for this category
    const categoryIssues = analysis.issues.filter(
      issue => issue.category === category
    );

    // Count errors vs warnings
    const errors = categoryIssues.filter(
      issue => issue.severity === 'error'
    ).length;
    const warnings = categoryIssues.filter(
      issue => issue.severity === 'warning'
    ).length;
    const total = categoryIssues.length;

    // Calculate score (errors have more weight than warnings)
    // Perfect score if no issues, deduct 10 points per error, 5 per warning
    let score = 100;
    if (total > 0) {
      score = Math.max(0, 100 - errors * 10 - warnings * 5);
    }

    categoryScores[category] = {
      score: Math.round(score),
      max: 100,
      passed: total - errors,
      total: total,
      errors: errors,
      warnings: warnings,
    };
  });

  return categoryScores;
}

/**
 * Calculate overall grade based on percentage
 * @param percentage - Score percentage (0-100)
 * @returns Letter grade (A-F)
 */
export function calculateGrade(percentage: number): Grade {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Get grade color for visual representation
 * @param grade - Letter grade
 * @returns Color code (hex string)
 */
export function getGradeColor(grade: Grade): string {
  const colors: Record<Grade, string> = {
    A: '#10b981', // green
    B: '#3b82f6', // blue
    C: '#f59e0b', // amber
    D: '#ef4444', // red
    F: '#991b1b', // dark red
  };
  return colors[grade] || '#6b7280';
}

/**
 * Calculate recommendation statistics
 * @param recommendations - Array of recommendation objects
 * @returns Statistics about recommendations
 */
export function calculateRecommendationStats(
  recommendations: Recommendation[] | null | undefined
): RecommendationStats {
  if (!recommendations || recommendations.length === 0) {
    return {
      total: 0,
      byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
      byStatus: { pending: 0, inProgress: 0, completed: 0, dismissed: 0 },
      byEffort: { quick: 0, moderate: 0, significant: 0 },
      potentialIncrease: 0,
    };
  }

  const stats: RecommendationStats = {
    total: recommendations.length,
    byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
    byStatus: { pending: 0, inProgress: 0, completed: 0, dismissed: 0 },
    byEffort: { quick: 0, moderate: 0, significant: 0 },
    potentialIncrease: 0,
  };

  recommendations.forEach(rec => {
    // Count by priority
    if (rec.priority) {
      stats.byPriority[rec.priority] =
        (stats.byPriority[rec.priority] || 0) + 1;
    }

    // Count by status - normalize 'in-progress' to 'inProgress'
    const status: RecommendationStatus =
      rec.status === 'in-progress' ? 'inProgress' : (rec.status as RecommendationStatus) || 'pending';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

    // Count by effort
    if (rec.effort) {
      stats.byEffort[rec.effort] = (stats.byEffort[rec.effort] || 0) + 1;
    }

    // Sum potential score increase
    if (rec.score_increase) {
      stats.potentialIncrease += rec.score_increase;
    }
  });

  return stats;
}

/**
 * Format score for display
 * @param score - Numeric score
 * @param maxScore - Maximum possible score
 * @returns Formatted score string (e.g., "85/100")
 */
export function formatScore(score: number, maxScore: number = 100): string {
  return `${Math.round(score)}/${maxScore}`;
}

/**
 * Format percentage for display
 * @param percentage - Percentage value
 * @returns Formatted percentage string (e.g., "85%")
 */
export function formatPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}
