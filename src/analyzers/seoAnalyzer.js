/**
 * SEO Analyzer - Core Analysis Engine
 * Implements rule-based SEO analysis with scoring algorithms
 *
 * Features:
 * - 13+ SEO rules across 4 categories (meta, content, technical, readability)
 * - Weighted scoring system (0-100%)
 * - Letter grade assessment (A-F)
 * - Keyword density calculation
 * - HTML content parsing
 * - Multi-language support (EN/GR)
 * - Detailed issue reporting with severity levels
 * - Actionable recommendations
 *
 * @example
 * const analyzer = new SEOAnalyzer();
 * const results = await analyzer.analyze({
 *   title: 'Page Title',
 *   description: 'Meta description',
 *   keywords: 'keyword1, keyword2',
 *   html: '<h1>Content</h1><p>Text</p>',
 *   language: 'en'
 * });
 */

const htmlParser = require('./htmlParser');
const seoRules = require('./seoRules');
const { RecommendationEngine } = require('./recommendationEngine');

class SEOAnalyzer {
  constructor(language = 'en') {
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
    };
  }

  /**
   * Main analysis function
   * @param {Object} content - Content to analyze
   * @param {string} content.html - HTML content
   * @param {string} content.title - Page title
   * @param {string} content.description - Meta description
   * @param {string} content.keywords - Target keywords (comma-separated)
   * @param {string} content.language - Content language ('en' or 'el')
   * @param {string} content.url - Page URL (optional)
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(content) {
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
        headingCount: parsedContent.headings?.length || 0,
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
        categoryScores:
          Object.keys(
            this.results.enhancedRecommendations?.categoryScores || {}
          ).length || 0,
      });

      console.log('[SEO-ANALYZER] ✅ Analysis complete!');
      return this.results;
    } catch (error) {
      console.error('[SEO-ANALYZER] ❌ Analysis failed:', error);
      throw new Error(`SEO Analysis failed: ${error.message}`);
    }
  }

  /**
   * Validate input content
   * @param {Object} content - Content to validate
   */
  validateInput(content) {
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
  resetResults() {
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
   * @param {string} keywordsStr - Comma-separated keywords
   * @returns {Array<string>} Array of keywords
   */
  parseKeywords(keywordsStr) {
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
   * @param {Object} parsedContent - Parsed HTML content
   */
  async runAnalysis(parsedContent) {
    const content = {
      ...this.results.metadata,
      ...parsedContent,
    };

    // Group rules by category for organized analysis
    const ruleCategories = {
      meta: [],
      content: [],
      technical: [],
      readability: [],
    };

    // Categorize rules
    this.rules.forEach(rule => {
      if (rule.category && ruleCategories[rule.category]) {
        ruleCategories[rule.category].push(rule);
      }
    });

    // Run rules in each category
    for (const category of Object.keys(ruleCategories)) {
      for (const rule of ruleCategories[category]) {
        await this.runRule(rule, content);
      }
    }
  }

  /**
   * Run a single analysis rule
   * @param {Object} rule - Rule definition
   * @param {Object} content - Content to analyze
   */
  async runRule(rule, content) {
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

      // Add to max score (overall and category)
      this.results.maxScore += rule.weight;
      this.results.categoryScores[rule.category].maxScore += rule.weight;

      if (result.passed) {
        // Rule passed
        this.results.score += rule.weight;
        this.results.categoryScores[rule.category].score += rule.weight;
        this.results.passedRules++;
        this.results.categoryScores[rule.category].passed++;
      } else {
        // Rule failed
        this.results.failedRules++;
        this.results.categoryScores[rule.category].failed++;

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
      console.error(`Error running rule ${rule.id}:`, error);
      // Don't fail the entire analysis if one rule fails
    }
  }

  /**
   * Calculate final scores and percentages
   */
  calculateScores() {
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
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff =
        severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.impact - a.impact;
    });

    // Group recommendations by category
    this.results.recommendationsByCategory = this.groupRecommendations();
  }

  /**
   * Calculate letter grade based on percentage
   * @param {number} percentage - Score percentage
   * @returns {string} Letter grade
   */
  calculateGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Group recommendations by category
   * @returns {Object} Recommendations grouped by category
   */
  groupRecommendations() {
    const grouped = {};

    this.results.recommendations.forEach(rec => {
      if (!grouped[rec.category]) {
        grouped[rec.category] = [];
      }
      grouped[rec.category].push(rec.recommendation);
    });

    return grouped;
  }

  /**
   * Calculate keyword density for text
   * @param {string} text - Text to analyze
   * @param {string} keyword - Keyword to find
   * @returns {Object} Keyword density information
   */
  calculateKeywordDensity(text, keyword) {
    if (!text || !keyword) {
      return { keyword, count: 0, density: 0, wordCount: 0 };
    }

    // Normalize text: convert hyphens, underscores, slashes to spaces
    // This matches how the keyword suggestion engine processes text
    const normalizedText = text.toLowerCase().replace(/[-_/]+/g, ' ');
    const normalizedKeyword = keyword.toLowerCase().trim();

    // Escape special regex characters in the keyword
    const escapedKeyword = normalizedKeyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    // For single words, use word boundaries; for phrases, use looser matching
    const isPhrase = normalizedKeyword.includes(' ');
    const regex = isPhrase
      ? new RegExp(`\\b${escapedKeyword.replace(/\s+/g, '\\s+')}\\b`, 'gi') // Phrase: match with flexible spacing
      : new RegExp(`\\b${escapedKeyword}\\b`, 'gi'); // Single word: use word boundaries

    const matches = normalizedText.match(regex);
    const count = matches ? matches.length : 0;

    // Calculate word count
    const words = text
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0);
    const wordCount = words.length;

    // Calculate density as percentage
    // For phrases, divide by the number of words in the phrase
    let density = 0;
    if (wordCount > 0) {
      const keywordWordCount = normalizedKeyword.split(/\s+/).length;
      // Density = (count * keyword word count / total word count) * 100
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
   * @param {string} text - Text to analyze
   * @param {Array<string>} keywords - Keywords to analyze
   * @returns {Array<Object>} Keyword density for each keyword
   */
  calculateAllKeywordDensities(text, keywords) {
    if (!keywords || keywords.length === 0) {
      return [];
    }

    return keywords.map(keyword => this.calculateKeywordDensity(text, keyword));
  }

  /**
   * Set analysis language
   * @param {string} language - Language code ('en' or 'el')
   */
  setLanguage(language) {
    this.language = language;
    this.recommendationEngine.setLanguage(language);
  }

  /**
   * Get current language
   * @returns {string} Current language code
   */
  getLanguage() {
    return this.language;
  }
}

module.exports = SEOAnalyzer;
