/**
 * Recommendation Engine
 * Generates prioritized, actionable SEO recommendations with impact estimation
 *
 * Features:
 * - Priority-based recommendations (Critical, High, Medium, Low)
 * - Actionable, specific improvement suggestions
 * - Before/after impact estimation
 * - Multi-language support (EN/GR)
 * - Recommendation categorization
 * - Effort estimation (Quick, Moderate, Significant)
 */

import type { SEORule } from '../types/seo.types';
import type { AnalysisResults } from './seoAnalyzer';

/**
 * Recommendation priority levels
 */
export const PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type PriorityType = (typeof PRIORITY)[keyof typeof PRIORITY];

/**
 * Effort estimation levels
 */
export const EFFORT = {
  QUICK: 'quick', // < 30 minutes
  MODERATE: 'moderate', // 30 minutes - 2 hours
  SIGNIFICANT: 'significant', // > 2 hours
} as const;

export type EffortType = (typeof EFFORT)[keyof typeof EFFORT];

/**
 * Recommendation translations
 */
export const TRANSLATIONS = {
  en: {
    priorities: {
      critical: 'Critical',
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
    },
    effort: {
      quick: 'Quick Fix (< 30 min)',
      moderate: 'Moderate Effort (30 min - 2 hrs)',
      significant: 'Significant Work (> 2 hrs)',
    },
    impact: {
      score: 'Potential Score Increase',
      ranking: 'Expected Ranking Impact',
    },
    categories: {
      meta: 'Meta Tags',
      content: 'Content Quality',
      technical: 'Technical SEO',
      readability: 'Readability',
      keywords: 'Keywords',
    },
  },
  el: {
    priorities: {
      critical: 'Κρίσιμο',
      high: 'Υψηλή Προτεραιότητα',
      medium: 'Μέτρια Προτεραιότητα',
      low: 'Χαμηλή Προτεραιότητα',
    },
    effort: {
      quick: 'Γρήγορη Διόρθωση (< 30 λεπτά)',
      moderate: 'Μέτρια Προσπάθεια (30 λεπτά - 2 ώρες)',
      significant: 'Σημαντική Εργασία (> 2 ώρες)',
    },
    impact: {
      score: 'Πιθανή Αύξηση Βαθμολογίας',
      ranking: 'Αναμενόμενος Αντίκτυπος στην Κατάταξη',
    },
    categories: {
      meta: 'Ετικέτες Meta',
      content: 'Ποιότητα Περιεχομένου',
      technical: 'Τεχνικό SEO',
      readability: 'Αναγνωσιμότητα',
      keywords: 'Λέξεις-κλειδιά',
    },
  },
} as const;

export type LanguageCode = keyof typeof TRANSLATIONS;

/**
 * Action type classifications
 */
export type ActionType =
  | 'add'
  | 'remove'
  | 'update'
  | 'optimize'
  | 'verify'
  | 'general';

/**
 * Recommendation action with classification
 */
export interface RecommendationAction {
  step: number;
  action: string;
  type: ActionType;
  specific?: boolean;
}

/**
 * Impact estimate for a recommendation
 */
export interface ImpactEstimate {
  scoreIncrease: number;
  percentageIncrease: number;
  currentScore: number;
  projectedScore: number;
  currentPercentage: number;
  projectedPercentage: number;
  rankingImpact: string;
}

/**
 * Learning resource
 */
export interface Resource {
  title: string;
  url: string;
}

/**
 * Before/after example
 */
export interface Example {
  before: string;
  after: string;
}

/**
 * Enhanced recommendation for a failed rule
 */
export interface Recommendation {
  id: string;
  ruleId: string;
  title: string;
  priority: PriorityType;
  category: string;
  description: string;
  actions: RecommendationAction[];
  effort: EffortType;
  estimatedTime: string;
  impactEstimate: ImpactEstimate;
  example: Example | null;
  why: string;
  resources: Resource[];
  weight: number;
  severity: string;
  timestamp: string;
}

/**
 * Priority counts summary
 */
export interface PriorityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

/**
 * Effort counts summary
 */
export interface EffortCounts {
  quick: number;
  moderate: number;
  significant: number;
}

/**
 * Recommendations summary
 */
export interface RecommendationsSummary {
  totalRecommendations: number;
  priorityCounts: PriorityCounts;
  effortCounts: EffortCounts;
  currentScore: number;
  currentPercentage: number;
  currentGrade: string;
  potentialScore: number;
  potentialPercentage: number;
  potentialGrade: string;
  totalPotentialIncrease: number;
}

/**
 * Grouped recommendations by priority
 */
export interface RecommendationsByPriority {
  critical: Recommendation[];
  high: Recommendation[];
  medium: Recommendation[];
  low: Recommendation[];
}

/**
 * Grouped recommendations by effort
 */
export interface RecommendationsByEffort {
  quick: Recommendation[];
  moderate: Recommendation[];
  significant: Recommendation[];
}

/**
 * Full recommendations result
 */
export interface RecommendationsResult {
  recommendations: Recommendation[];
  summary: RecommendationsSummary;
  byPriority: RecommendationsByPriority;
  byCategory: Record<string, Recommendation[]>;
  byEffort: RecommendationsByEffort;
  quickWins: Recommendation[];
}

/**
 * Specific action suggestion based on rule
 */
interface SpecificAction {
  text: string;
  type: ActionType;
}

/**
 * Translation object type
 */
type TranslationObject = (typeof TRANSLATIONS)[LanguageCode];

/**
 * Recommendation Engine Class
 */
export class RecommendationEngine {
  private translations: TranslationObject;

  constructor(language: LanguageCode = 'en') {
    this.translations = TRANSLATIONS[language] || TRANSLATIONS.en;
  }

  /**
   * Generate comprehensive recommendations from analysis results
   * @param analysisResults - SEO analysis results
   * @param rules - All SEO rules
   * @returns Enhanced recommendations
   */
  generateRecommendations(
    analysisResults: AnalysisResults,
    rules: SEORule[]
  ): RecommendationsResult {
    const recommendations: Recommendation[] = [];

    // Process each failed rule
    analysisResults.issues.forEach(issue => {
      const rule = rules.find(r => r.id === issue.id);
      if (!rule) return;

      // Create enhanced recommendation
      const recommendation = this.createRecommendation(
        issue,
        rule,
        analysisResults
      );
      recommendations.push(recommendation);
    });

    // Sort by priority and impact
    recommendations.sort((a, b) => {
      const priorityOrder: Record<PriorityType, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.impactEstimate.scoreIncrease - a.impactEstimate.scoreIncrease;
    });

    return {
      recommendations,
      summary: this.generateSummary(recommendations, analysisResults),
      byPriority: this.groupByPriority(recommendations),
      byCategory: this.groupByCategory(recommendations),
      byEffort: this.groupByEffort(recommendations),
      quickWins: this.identifyQuickWins(recommendations),
    };
  }

  /**
   * Create enhanced recommendation for a failed rule
   * @param issue - Issue from analysis
   * @param rule - Rule definition
   * @param analysisResults - Full analysis results
   * @returns Enhanced recommendation
   */
  private createRecommendation(
    issue: any,
    rule: SEORule,
    analysisResults: AnalysisResults
  ): Recommendation {
    return {
      id: `rec-${issue.id}`,
      ruleId: issue.id,
      title: rule.title,
      priority: this.mapSeverityToPriority(issue.severity),
      category: issue.category,
      description: issue.description,

      // Actionable suggestions
      actions: this.generateActions(rule, analysisResults),

      // Effort estimation
      effort: this.estimateEffort(rule, issue),
      estimatedTime: this.getEstimatedTime(rule),

      // Impact estimation
      impactEstimate: this.estimateImpact(rule, analysisResults),

      // Before/After example
      example: this.generateExample(rule, analysisResults),

      // Additional context
      why: this.generateWhy(rule),
      resources: this.generateResources(rule),

      // Metadata
      weight: issue.impact,
      severity: issue.severity,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Map severity to priority
   */
  private mapSeverityToPriority(severity: string): PriorityType {
    const mapping: Record<string, PriorityType> = {
      critical: PRIORITY.CRITICAL,
      high: PRIORITY.HIGH,
      medium: PRIORITY.MEDIUM,
      low: PRIORITY.LOW,
    };
    return mapping[severity] || PRIORITY.MEDIUM;
  }

  /**
   * Generate actionable steps for a rule
   */
  private generateActions(
    rule: SEORule,
    analysisResults: AnalysisResults
  ): RecommendationAction[] {
    const actions: RecommendationAction[] = [];

    // Use rule recommendations as base
    if (rule.recommendations) {
      rule.recommendations.forEach((rec, index) => {
        actions.push({
          step: index + 1,
          action: rec,
          type: this.categorizeAction(rec),
        });
      });
    }

    // Add specific actions based on rule ID
    const specificActions = this.getSpecificActions(rule.id, analysisResults);
    specificActions.forEach(action => {
      actions.push({
        step: actions.length + 1,
        action: action.text,
        type: action.type,
        specific: true,
      });
    });

    return actions;
  }

  /**
   * Categorize action type
   */
  private categorizeAction(actionText: string): ActionType {
    const text = actionText.toLowerCase();
    if (text.includes('add') || text.includes('create')) return 'add';
    if (text.includes('remove') || text.includes('delete')) return 'remove';
    if (
      text.includes('update') ||
      text.includes('change') ||
      text.includes('modify')
    )
      return 'update';
    if (text.includes('optimize') || text.includes('improve'))
      return 'optimize';
    if (text.includes('check') || text.includes('verify')) return 'verify';
    return 'general';
  }

  /**
   * Get specific actions based on rule ID and current content
   */
  private getSpecificActions(
    ruleId: string,
    analysisResults: AnalysisResults
  ): SpecificAction[] {
    const actions: SpecificAction[] = [];
    const metadata = analysisResults.metadata;

    switch (ruleId) {
      case 'meta-title-length':
        if (metadata.title) {
          const length = metadata.title.length;
          if (length < 30) {
            actions.push({
              text: `Current title is ${length} characters. Add ${30 - length} more characters to reach minimum.`,
              type: 'update',
            });
          } else if (length > 60) {
            actions.push({
              text: `Current title is ${length} characters. Reduce by ${length - 60} characters to avoid truncation.`,
              type: 'update',
            });
          }
        }
        break;

      case 'meta-description-length':
        if (metadata.description) {
          const length = metadata.description.length;
          if (length < 120) {
            actions.push({
              text: `Current description is ${length} characters. Add ${120 - length} more to reach minimum.`,
              type: 'update',
            });
          } else if (length > 160) {
            actions.push({
              text: `Current description is ${length} characters. Reduce by ${length - 160} to avoid truncation.`,
              type: 'update',
            });
          }
        }
        break;

      case 'content-word-count':
        if (metadata.wordCount) {
          actions.push({
            text: `Current content: ${metadata.wordCount} words. Add ${Math.max(0, 300 - metadata.wordCount)} more words.`,
            type: 'add',
          });
        }
        break;

      case 'viewport-meta':
        actions.push({
          text: 'Add this tag in <head>: <meta name="viewport" content="width=device-width, initial-scale=1.0">',
          type: 'add',
        });
        break;

      case 'https-protocol':
        actions.push({
          text: 'Install SSL certificate and configure HTTPS redirects',
          type: 'update',
        });
        break;

      case 'canonical-url':
        if (metadata.url) {
          actions.push({
            text: `Add canonical tag: <link rel="canonical" href="${metadata.url}">`,
            type: 'add',
          });
        }
        break;
    }

    return actions;
  }

  /**
   * Estimate effort required for a rule fix
   */
  private estimateEffort(rule: SEORule, issue: any): EffortType {
    // Critical/High severity and high weight = more effort
    if (issue.severity === 'critical' && issue.impact >= 8) {
      return EFFORT.SIGNIFICANT;
    }

    // Quick fixes based on rule type
    const quickFixRules = [
      'meta-title-exists',
      'meta-description-exists',
      'viewport-meta',
      'canonical-url',
      'html-lang',
      'charset-declaration',
    ];

    if (quickFixRules.includes(rule.id)) {
      return EFFORT.QUICK;
    }

    // Content-heavy rules require more time
    const contentRules = [
      'content-word-count',
      'paragraph-length',
      'readability-score',
      'content-freshness',
    ];

    if (contentRules.includes(rule.id)) {
      return EFFORT.SIGNIFICANT;
    }

    // Default to moderate
    return EFFORT.MODERATE;
  }

  /**
   * Get estimated time in minutes
   */
  private getEstimatedTime(rule: SEORule): string {
    const quickFixes = [
      'viewport-meta',
      'canonical-url',
      'html-lang',
      'charset-declaration',
      'meta-title-exists',
      'meta-description-exists',
    ];

    const moderateFixes = [
      'meta-title-length',
      'meta-description-length',
      'h1-exists',
      'image-alt-text',
      'internal-links',
      'external-links',
    ];

    if (quickFixes.includes(rule.id)) return '5-15 min';
    if (moderateFixes.includes(rule.id)) return '30-60 min';
    return '1-3 hours';
  }

  /**
   * Estimate impact of fixing a rule
   */
  private estimateImpact(
    rule: SEORule,
    analysisResults: AnalysisResults
  ): ImpactEstimate {
    const currentScore = analysisResults.score;
    const maxScore = analysisResults.maxScore;
    const potentialIncrease = rule.weight;

    const newScore = currentScore + potentialIncrease;
    const newPercentage = Math.round((newScore / maxScore) * 100);
    const currentPercentage = analysisResults.percentage;

    const percentageIncrease = newPercentage - currentPercentage;

    return {
      scoreIncrease: potentialIncrease,
      percentageIncrease,
      currentScore,
      projectedScore: newScore,
      currentPercentage,
      projectedPercentage: newPercentage,
      rankingImpact: this.estimateRankingImpact(rule),
    };
  }

  /**
   * Estimate ranking impact
   */
  private estimateRankingImpact(rule: SEORule): string {
    if (rule.severity === 'critical')
      return 'High - Critical for search visibility';
    if (rule.severity === 'high')
      return 'Medium-High - Significant ranking factor';
    if (rule.severity === 'medium')
      return 'Medium - Notable improvement potential';
    return 'Low - Minor optimization';
  }

  /**
   * Generate before/after example
   */
  private generateExample(
    rule: SEORule,
    analysisResults: AnalysisResults
  ): Example | null {
    const metadata = analysisResults.metadata;

    const examples: Record<string, Example> = {
      'meta-title-length': {
        before: metadata.title || 'Short Title',
        after: 'Optimized SEO Title with Keywords | Brand Name',
      },
      'meta-description-length': {
        before: metadata.description || 'Short description.',
        after:
          'Comprehensive meta description that includes target keywords, provides clear value proposition, and stays within 120-160 character limit for optimal display.',
      },
      'viewport-meta': {
        before: '<head>\n  <title>Page</title>\n</head>',
        after:
          '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Page</title>\n</head>',
      },
      'h1-exists': {
        before: '<div class="title">Page Title</div>',
        after: '<h1>Page Title</h1>',
      },
      'canonical-url': {
        before: '<head>\n  <title>Page</title>\n</head>',
        after: `<head>\n  <link rel="canonical" href="${metadata.url || 'https://example.com/page'}">\n  <title>Page</title>\n</head>`,
      },
    };

    return examples[rule.id] || null;
  }

  /**
   * Generate "why" explanation
   */
  private generateWhy(rule: SEORule): string {
    const explanations: Record<string, string> = {
      'meta-title-exists':
        'Page titles are the first thing users see in search results and are a critical ranking factor.',
      'meta-title-length':
        'Titles between 30-60 characters display fully in search results without truncation.',
      'meta-description-exists':
        'Descriptions influence click-through rates and provide context in search results.',
      'https-protocol':
        'HTTPS is a confirmed ranking signal and essential for user trust and data security.',
      'viewport-meta':
        'Mobile-friendliness is a major ranking factor; viewport meta ensures proper mobile display.',
      'h1-exists':
        'H1 tags signal page topic to search engines and improve content structure.',
      'content-word-count':
        'Longer, comprehensive content tends to rank better and provides more value to users.',
      'readability-score':
        'Readable content improves user engagement metrics, which indirectly affects rankings.',
      'canonical-url':
        'Prevents duplicate content issues that can dilute ranking signals.',
      'image-alt-text':
        'Alt text improves accessibility and helps images rank in image search.',
    };

    return explanations[rule.id] || rule.description;
  }

  /**
   * Generate learning resources
   */
  private generateResources(rule: SEORule): Resource[] {
    const resources: Resource[] = [];

    // Add relevant resources based on category
    if (rule.category === 'meta') {
      resources.push({
        title: 'Google Search Central - Meta Tags',
        url: 'https://developers.google.com/search/docs/crawling-indexing/special-tags',
      });
    }

    if (rule.category === 'technical') {
      resources.push({
        title: 'Google Search Central - Technical SEO',
        url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide',
      });
    }

    if (rule.id.includes('readability')) {
      resources.push({
        title: 'Hemingway Editor - Readability Tool',
        url: 'https://hemingwayapp.com/',
      });
    }

    return resources;
  }

  /**
   * Generate summary of recommendations
   */
  private generateSummary(
    recommendations: Recommendation[],
    analysisResults: AnalysisResults
  ): RecommendationsSummary {
    const priorityCounts: PriorityCounts = {
      critical: recommendations.filter(r => r.priority === PRIORITY.CRITICAL)
        .length,
      high: recommendations.filter(r => r.priority === PRIORITY.HIGH).length,
      medium: recommendations.filter(r => r.priority === PRIORITY.MEDIUM)
        .length,
      low: recommendations.filter(r => r.priority === PRIORITY.LOW).length,
    };

    const effortCounts: EffortCounts = {
      quick: recommendations.filter(r => r.effort === EFFORT.QUICK).length,
      moderate: recommendations.filter(r => r.effort === EFFORT.MODERATE)
        .length,
      significant: recommendations.filter(r => r.effort === EFFORT.SIGNIFICANT)
        .length,
    };

    const totalPotentialIncrease = recommendations.reduce(
      (sum, rec) => sum + rec.impactEstimate.scoreIncrease,
      0
    );

    const maxPossibleScore = analysisResults.score + totalPotentialIncrease;
    const maxPossiblePercentage = Math.round(
      (maxPossibleScore / analysisResults.maxScore) * 100
    );

    return {
      totalRecommendations: recommendations.length,
      priorityCounts,
      effortCounts,
      currentScore: analysisResults.score,
      currentPercentage: analysisResults.percentage,
      currentGrade: analysisResults.grade || 'F',
      potentialScore: maxPossibleScore,
      potentialPercentage: maxPossiblePercentage,
      potentialGrade: this.calculateGrade(maxPossiblePercentage),
      totalPotentialIncrease,
    };
  }

  /**
   * Calculate grade from percentage
   */
  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Group recommendations by priority
   */
  private groupByPriority(
    recommendations: Recommendation[]
  ): RecommendationsByPriority {
    return {
      critical: recommendations.filter(r => r.priority === PRIORITY.CRITICAL),
      high: recommendations.filter(r => r.priority === PRIORITY.HIGH),
      medium: recommendations.filter(r => r.priority === PRIORITY.MEDIUM),
      low: recommendations.filter(r => r.priority === PRIORITY.LOW),
    };
  }

  /**
   * Group recommendations by category
   */
  private groupByCategory(
    recommendations: Recommendation[]
  ): Record<string, Recommendation[]> {
    const grouped: Record<string, Recommendation[]> = {};
    recommendations.forEach(rec => {
      if (!grouped[rec.category]) {
        grouped[rec.category] = [];
      }
      grouped[rec.category]!.push(rec);
    });
    return grouped;
  }

  /**
   * Group recommendations by effort
   */
  private groupByEffort(
    recommendations: Recommendation[]
  ): RecommendationsByEffort {
    return {
      quick: recommendations.filter(r => r.effort === EFFORT.QUICK),
      moderate: recommendations.filter(r => r.effort === EFFORT.MODERATE),
      significant: recommendations.filter(r => r.effort === EFFORT.SIGNIFICANT),
    };
  }

  /**
   * Identify quick wins (high impact, low effort)
   */
  private identifyQuickWins(
    recommendations: Recommendation[]
  ): Recommendation[] {
    return recommendations
      .filter(rec => {
        return (
          rec.effort === EFFORT.QUICK &&
          (rec.priority === PRIORITY.CRITICAL || rec.priority === PRIORITY.HIGH)
        );
      })
      .slice(0, 5); // Top 5 quick wins
  }

  /**
   * Set language for translations
   */
  public setLanguage(language: LanguageCode): void {
    this.translations = TRANSLATIONS[language] || TRANSLATIONS.en;
  }

  /**
   * Get translated text
   */
  public translate(
    key: keyof TranslationObject,
    subkey: string | null = null
  ): string {
    if (subkey) {
      return (this.translations[key] as any)?.[subkey] || subkey;
    }
    return (this.translations[key] as any) || (key as string);
  }
}
