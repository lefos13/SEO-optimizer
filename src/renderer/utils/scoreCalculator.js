/**
 * Score Calculator Utilities
 * Helper functions for calculating category scores and SEO metrics
 */

/**
 * Calculate category scores from analysis results
 * @param {Object} analysis - Analysis results object
 * @returns {Object} Category scores by category name
 */
export function calculateCategoryScores(analysis) {
  if (!analysis || !analysis.issues) {
    return {};
  }

  const categories = ['meta', 'content', 'technical', 'readability'];
  const categoryScores = {};

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
 * @param {number} percentage - Score percentage (0-100)
 * @returns {string} Letter grade (A-F)
 */
export function calculateGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Get grade color for visual representation
 * @param {string} grade - Letter grade
 * @returns {string} Color code
 */
export function getGradeColor(grade) {
  const colors = {
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
 * @param {Array} recommendations - Array of recommendation objects
 * @returns {Object} Statistics about recommendations
 */
export function calculateRecommendationStats(recommendations) {
  if (!recommendations || recommendations.length === 0) {
    return {
      total: 0,
      byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
      byStatus: { pending: 0, inProgress: 0, completed: 0, dismissed: 0 },
      byEffort: { quick: 0, moderate: 0, significant: 0 },
      potentialIncrease: 0,
    };
  }

  const stats = {
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

    // Count by status
    const status =
      rec.status === 'in-progress' ? 'inProgress' : rec.status || 'pending';
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
 * @param {number} score - Numeric score
 * @param {number} maxScore - Maximum possible score
 * @returns {string} Formatted score string
 */
export function formatScore(score, maxScore = 100) {
  return `${Math.round(score)}/${maxScore}`;
}

/**
 * Format percentage for display
 * @param {number} percentage - Percentage value
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(percentage) {
  return `${Math.round(percentage)}%`;
}
