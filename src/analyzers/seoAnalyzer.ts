/**
 * SEO Analyzer - Core Analysis Engine
 * Implements rule-based SEO analysis with scoring algorithms
 *
 * Features:
 * - 40+ SEO rules across 5 categories (meta, content, technical, readability, keywords)
 * - Weighted scoring system (0-100%)
 * - Letter grade assessment (A-F)
 * - Keyword density calculation
 * - HTML content parsing
 * - Multi-language support (EN/GR)
 * - Detailed issue reporting with severity levels
 * - Actionable recommendations
 */

import type {
  SEORule,
  SEOContentInput,
  SupportedLanguage,
} from '../types/seo.types';
import type {
  ParsedHTML,
  HeadingsMap,
  ImageInfo,
  LinkInfo,
  MetaTags,
  StructuralElements,
} from '../types/analyzer.types';
import type { RecommendationsResult } from './recommendationEngine';
import * as htmlParser from './htmlParser';
import * as seoRules from './seoRules';
import { RecommendationEngine } from './recommendationEngine';

export interface AnalysisIssue {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  impact: number;
}

export interface AnalysisRecommendation {
  ruleId: string;
  category: string;
  recommendation: string;
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  passed: number;
  failed: number;
}

export interface AnalysisMetadata {
  title: string;
  description: string;
  keywords: string[];
  language: SupportedLanguage;
  url: string;
  wordCount: number;
  characterCount: number;
  headings?: HeadingsMap;
  images?: ImageInfo[];
  links?: LinkInfo[];
  metaTags?: MetaTags;
  structuralElements?: StructuralElements;
}

export interface AnalysisResults {
  score: number;
  maxScore: number;
  percentage: number;
  grade?: string;
  passedRules: number;
  failedRules: number;
  warnings: number;
  issues: AnalysisIssue[];
  recommendations: AnalysisRecommendation[];
  metadata: Partial<AnalysisMetadata>;
  categoryScores: Record<string, CategoryScore>;
  recommendationsByCategory?: Record<string, string[]>;
  enhancedRecommendations?: RecommendationsResult | null;
}

export interface AnalysisInput {
  html?: string;
  title?: string;
  description?: string;
  keywords?: string;
  language?: SupportedLanguage;
  url?: string;
}

export class SEOAnalyzer {
  private rules: SEORule[];
  private language: SupportedLanguage;
  private recommendationEngine: RecommendationEngine;
  private results: AnalysisResults;

  constructor(language: SupportedLanguage = 'en') {
    this.rules = seoRules.getAllRules();
    this.language = language;
    this.recommendationEngine = new RecommendationEngine(language);
    this.results = {
      score: 0,
      maxScore: 0,
      percentage: 0,
      passedRules: 0,
      failedRules: 0,
      warnings: 0,
      issues: [],
      recommendations: [],
      metadata: {},
      categoryScores: {},
    };
  }

  /**
   * Safely get or create a category score entry
   */
  private getOrCreateCategoryScore(category: string): CategoryScore {
    if (!this.results.categoryScores[category]) {
      this.results.categoryScores[category] = {
        score: 0,
        maxScore: 0,
        passed: 0,
        failed: 0,
      };
    }
    return this.results.categoryScores[category];
  }

  /**
   * Main analysis function
   * @param content - Content to analyze
   * @returns Analysis results
   */
  async analyze(content: AnalysisInput): Promise<AnalysisResults> {
    try {
      console.log('[SEO-ANALYZER] Starting analysis...');

      // Reset results
      this.resetResults();

      // Validate input
      console.log('[SEO-ANALYZER] Validating input...');
      this.validateInput(content);

      console.log('[SEO-ANALYZER] ✅ Input validation passed');

      // Parse HTML content
      console.log('[SEO-ANALYZER] Parsing HTML content...');
      const parsedContent = htmlParser.parse(content.html || '');

      console.log('[SEO-ANALYZER] ✅ HTML parsed:', {
        wordCount: parsedContent.wordCount,
        charCount: parsedContent.characterCount,
        headingCount: Object.values(parsedContent.headings).flat().length,
        imageCount: parsedContent.images?.length || 0,
        linkCount: parsedContent.links?.length || 0,
      });

      // Extract metadata
      console.log('[SEO-ANALYZER] Extracting metadata...');
      this.results.metadata = {
        title: content.title || '',
        description: content.description || '',
        keywords: this.parseKeywords(content.keywords || ''),
        language: content.language || 'en',
        url: content.url || '',
        wordCount: parsedContent.wordCount,
        characterCount: parsedContent.characterCount,
        headings: parsedContent.headings,
        images: parsedContent.images,
        links: parsedContent.links,
        metaTags: parsedContent.metaTags,
        structuralElements: parsedContent.structuralElements,
      };

      console.log('[SEO-ANALYZER] ✅ Metadata extracted:', {
        keywords: this.results.metadata.keywords,
        language: this.results.metadata.language,
      });

      // Run all analysis rules
      console.log('[SEO-ANALYZER] Running analysis rules...');
      await this.runAnalysis(parsedContent);

      console.log('[SEO-ANALYZER] ✅ Rules executed:', {
        passedRules: this.results.passedRules,
        failedRules: this.results.failedRules,
        totalIssues: this.results.issues.length,
      });

      // Calculate final scores
      console.log('[SEO-ANALYZER] Calculating scores...');
      this.calculateScores();

      console.log('[SEO-ANALYZER] ✅ Scores calculated:', {
        score: this.results.score,
        maxScore: this.results.maxScore,
        percentage: this.results.percentage,
        grade: this.results.grade,
      });

      // Generate enhanced recommendations
      console.log('[SEO-ANALYZER] Generating enhanced recommendations...');
      this.results.enhancedRecommendations =
        this.recommendationEngine.generateRecommendations(
          this.results,
          this.rules
        );

      console.log('[SEO-ANALYZER] ✅ Recommendations generated:', {
        recommendationCount:
          this.results.enhancedRecommendations?.recommendations?.length || 0,
        categories: Object.keys(
          this.results.enhancedRecommendations?.byCategory || {}
        ).length,
      });

      console.log('[SEO-ANALYZER] ✅ Analysis complete!');
      return this.results;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('[SEO-ANALYZER] ❌ Analysis failed:', error);
      throw new Error(`SEO Analysis failed: ${errorMessage}`);
    }
  }

  /**
   * Validate input content
   * @param content - Content to validate
   */
  private validateInput(content: AnalysisInput): void {
    if (!content || typeof content !== 'object') {
      throw new Error('Invalid content object provided');
    }

    if (!content.html && !content.title && !content.description) {
      throw new Error(
        'At least one content field (html, title, or description) is required'
      );
    }
  }

  /**
   * Reset results to initial state
   */
  private resetResults(): void {
    this.results = {
      score: 0,
      maxScore: 0,
      percentage: 0,
      passedRules: 0,
      failedRules: 0,
      warnings: 0,
      issues: [],
      recommendations: [],
      metadata: {},
      categoryScores: {},
    };
  }

  /**
   * Parse keywords string into array
   * @param keywordsStr - Comma-separated keywords
   * @returns Array of keywords
   */
  private parseKeywords(keywordsStr: string): string[] {
    if (!keywordsStr || typeof keywordsStr !== 'string') {
      return [];
    }
    return keywordsStr
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);
  }

  /**
   * Run all analysis rules
   * @param parsedContent - Parsed HTML content
   */
  private async runAnalysis(parsedContent: ParsedHTML): Promise<void> {
    const content: SEOContentInput = {
      ...this.results.metadata,
      ...parsedContent,
    };

    // Group rules by category for organized analysis
    const ruleCategories: Record<string, SEORule[]> = {
      meta: [],
      content: [],
      technical: [],
      readability: [],
      keywords: [],
    };

    // Categorize rules
    this.rules.forEach(rule => {
      const category = rule.category as keyof typeof ruleCategories;
      if (category && ruleCategories[category]) {
        ruleCategories[category].push(rule);
      }
    });

    // Run rules in each category
    for (const category of Object.keys(ruleCategories)) {
      const rules = ruleCategories[category as keyof typeof ruleCategories];
      if (rules) {
        for (const rule of rules) {
          await this.runRule(rule, content);
        }
      }
    }
  }

  /**
   * Run a single analysis rule
   * @param rule - Rule definition
   * @param content - Content to analyze
   */
  private async runRule(
    rule: SEORule,
    content: SEOContentInput
  ): Promise<void> {
    try {
      const result = await rule.check(content);

      // Initialize category scores if not exists
      if (!this.results.categoryScores[rule.category]) {
        this.results.categoryScores[rule.category] = {
          score: 0,
          maxScore: 0,
          passed: 0,
          failed: 0,
        };
      }

      const categoryScore = this.getOrCreateCategoryScore(rule.category);

      // Add to max score (overall and category)
      this.results.maxScore += rule.weight;
      categoryScore.maxScore += rule.weight;

      if (result.passed) {
        // Rule passed
        this.results.score += rule.weight;
        categoryScore.score += rule.weight;
        this.results.passedRules++;
        categoryScore.passed++;
      } else {
        // Rule failed
        this.results.failedRules++;
        categoryScore.failed++;

        // Add issue
        this.results.issues.push({
          id: rule.id,
          category: rule.category,
          severity: rule.severity,
          title: rule.title,
          description: result.message || rule.description,
          impact: rule.weight,
        });

        // Add recommendations
        if (rule.recommendations && rule.recommendations.length > 0) {
          rule.recommendations.forEach(rec => {
            this.results.recommendations.push({
              ruleId: rule.id,
              category: rule.category,
              recommendation: rec,
            });
          });
        }
      }

      // Track warnings
      if (result.warning) {
        this.results.warnings++;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error running rule ${rule.id}:`, errorMsg);
      // Don't fail the entire analysis if one rule fails
    }
  }

  /**
   * Calculate final scores and percentages
   */
  private calculateScores(): void {
    // Calculate percentage score
    if (this.results.maxScore > 0) {
      this.results.percentage = Math.round(
        (this.results.score / this.results.maxScore) * 100
      );
    }

    // Determine overall grade
    this.results.grade = this.calculateGrade(this.results.percentage);

    // Sort issues by severity and impact
    this.results.issues.sort((a, b) => {
      const severityOrder: Record<string, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      const severityDiff =
        (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
      if (severityDiff !== 0) return severityDiff;
      return b.impact - a.impact;
    });

    // Group recommendations by category
    this.results.recommendationsByCategory = this.groupRecommendations();
  }

  /**
   * Calculate letter grade based on percentage
   * @param percentage - Score percentage
   * @returns Letter grade
   */
  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Group recommendations by category
   * @returns Recommendations grouped by category
   */
  private groupRecommendations(): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};

    this.results.recommendations.forEach(rec => {
      const list = grouped[rec.category] ?? [];
      list.push(rec.recommendation);
      grouped[rec.category] = list;
    });

    return grouped;
  }

  /**
   * Calculate keyword density for text
   * @param text - Text to analyze
   * @param keyword - Keyword to find
   * @returns Keyword density information
   */
  calculateKeywordDensity(
    text: string,
    keyword: string
  ): {
    keyword: string;
    count: number;
    density: number;
    wordCount: number;
  } {
    if (!text || !keyword) {
      return { keyword, count: 0, density: 0, wordCount: 0 };
    }

    // Normalize text
    const normalizedText = text.toLowerCase().replace(/[-_/]+/g, ' ');
    const normalizedKeyword = keyword.toLowerCase().trim();

    // Escape special regex characters
    const escapedKeyword = normalizedKeyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    // Match with word boundaries
    const isPhrase = normalizedKeyword.includes(' ');
    const regex = isPhrase
      ? new RegExp(`\\b${escapedKeyword.replace(/\s+/g, '\\s+')}\\b`, 'gi')
      : new RegExp(`\\b${escapedKeyword}\\b`, 'gi');

    const matches = normalizedText.match(regex);
    const count = matches ? matches.length : 0;

    // Calculate word count
    const words = text
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0);
    const wordCount = words.length;

    // Calculate density
    let density = 0;
    if (wordCount > 0) {
      const keywordWordCount = normalizedKeyword.split(/\s+/).length;
      density = ((count * keywordWordCount) / wordCount) * 100;
    }

    return {
      keyword,
      count,
      density: parseFloat(density.toFixed(2)),
      wordCount,
    };
  }

  /**
   * Calculate keyword density for all target keywords
   * @param text - Text to analyze
   * @param keywords - Keywords to analyze
   * @returns Keyword density for each keyword
   */
  calculateAllKeywordDensities(
    text: string,
    keywords: string[]
  ): Array<{
    keyword: string;
    count: number;
    density: number;
    wordCount: number;
  }> {
    if (!keywords || keywords.length === 0) {
      return [];
    }

    return keywords.map(keyword => this.calculateKeywordDensity(text, keyword));
  }

  /**
   * Set analysis language
   * @param language - Language code ('en' or 'el')
   */
  setLanguage(language: SupportedLanguage): void {
    this.language = language;
    this.recommendationEngine.setLanguage(language);
  }

  /**
   * Get current language
   * @returns Current language code
   */
  getLanguage(): SupportedLanguage {
    return this.language;
  }
}

export default SEOAnalyzer;
