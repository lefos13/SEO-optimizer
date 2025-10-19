/**
 * Keyword Services - Advanced Keyword Analysis Tools
 *
 * Provides specialized keyword analysis functionality for the mini-services view:
 * - Keyword density analysis with visualization data
 * - Long-tail keyword suggestions
 * - Keyword difficulty estimation
 * - Keyword clustering
 * - LSI (Latent Semantic Indexing) keyword generation
 *
 * Note: These services run independently and do NOT save to database
 */

import * as htmlParser from './htmlParser';
import * as keywordSuggestions from './keywordSuggestions';

/**
 * Density analysis result for a single keyword
 */
export interface DensityResult {
  keyword: string;
  count: number;
  density: number;
  status: 'optimal' | 'underused' | 'overused';
  isOptimal: boolean;
  positions: Array<{ index: number; percentage: number }>;
  type: 'word' | 'phrase';
}

/**
 * Density recommendation
 */
export interface DensityRecommendation {
  type: 'warning' | 'critical' | 'success';
  keyword: string;
  message: string;
  action: 'increase' | 'decrease' | 'maintain';
}

/**
 * Keyword density analysis summary
 */
export interface DensityAnalysisSummary {
  optimal: number;
  underused: number;
  overused: number;
}

/**
 * Distribution across content sections
 */
export interface SectionDistribution {
  section: string;
  totalKeywords: number;
  keywordCounts: Array<{ keyword: string; count: number }>;
}

/**
 * Full density analysis results
 */
export interface DensityAnalysisResult {
  totalWords: number;
  totalKeywords: number;
  densityResults: DensityResult[];
  distribution: SectionDistribution[];
  recommendations: DensityRecommendation[];
  summary: DensityAnalysisSummary;
}

/**
 * Long-tail keyword suggestion
 */
export interface LongTailPhrase {
  phrase: string;
  totalScore: number;
  components: {
    frequency: number;
    relevance: number;
    length: number;
    specificity: number;
  };
  frequency: number;
}

/**
 * Long-tail by intent categories
 */
export interface LongTailByIntent {
  informational: LongTailPhrase[];
  commercial: LongTailPhrase[];
  navigational: LongTailPhrase[];
  transactional: LongTailPhrase[];
}

/**
 * Long-tail generation result
 */
export interface LongTailResult {
  totalPhrases: number;
  suggestions: LongTailPhrase[];
  byIntent: LongTailByIntent;
  seedKeywords: string[];
}

/**
 * Keyword difficulty factors
 */
export interface DifficultyFactors {
  length: number;
  generic: number;
  commercial: number;
  question: number;
  numbers: number;
  location: number;
}

/**
 * Keyword difficulty estimate
 */
export interface DifficultlyEstimate {
  keyword: string;
  score: number;
  level: 'easy' | 'medium' | 'hard' | 'very hard';
  color: string;
  factors: DifficultyFactors;
  recommendation: string;
}

/**
 * Difficulty distribution summary
 */
export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
  veryHard: number;
}

/**
 * Keyword difficulty result
 */
export interface DifficultyResult {
  totalKeywords: number;
  estimates: DifficultlyEstimate[];
  easiest: DifficultlyEstimate[];
  hardest: DifficultlyEstimate[];
  distribution: DifficultyDistribution;
}

/**
 * Keyword clustering options
 */
export interface ClusteringOptions {
  similarityThreshold?: number;
  strategy?: 'jaccard' | 'semantic';
}

/**
 * Keyword cluster
 */
export interface KeywordCluster {
  primary: string;
  related: Array<{ keyword: string; similarity: number }>;
  size: number;
  commonWords: Array<{ word: string; count: number; frequency: number }>;
  suggestedName: string;
  quality: number;
  theme: string;
}

/**
 * Cluster insights
 */
export interface ClusterInsight {
  type: 'success' | 'info' | 'warning';
  message: string;
}

/**
 * Clustering result
 */
export interface ClusteringResult {
  totalKeywords: number;
  totalClusters: number;
  clusters: KeywordCluster[];
  singleton: number;
  avgClusterSize: number;
  options: { similarityThreshold: number; strategy: string };
  insights: ClusterInsight[];
}

/**
 * LSI keyword
 */
export interface LSIKeyword {
  keyword: string;
  frequency: number;
  relevance: number;
  lsiScore: number;
  type: 'word' | 'phrase';
}

/**
 * LSI summary
 */
export interface LSISummary {
  phrases: number;
  words: number;
  avgLSIScore: number;
}

/**
 * LSI result
 */
export interface LSIResult {
  totalSuggestions: number;
  mainKeywords: string[];
  lsiKeywords: LSIKeyword[];
  summary: LSISummary;
}

/**
 * Common words found in cluster
 */
interface CommonWord {
  word: string;
  count: number;
  frequency: number;
}

/**
 * Scored phrase for long-tail analysis
 */
interface ScoredPhrase {
  phrase: string;
  frequency: number;
}

export class KeywordServices {
  /**
   * Analyze keyword density with detailed metrics and visualization data
   * @param content - HTML or text content
   * @param keywords - Keywords to analyze (array or comma-separated)
   * @returns Detailed density analysis with visualization data
   */
  static analyzeKeywordDensity(
    content: string,
    keywords: string[] | string
  ): DensityAnalysisResult {
    const startTime = Date.now();
    console.log('[KEYWORD-SERVICES] Starting keyword density analysis');

    try {
      // Parse content
      const parsed = htmlParser.parse(content);
      const text = parsed.text || content;
      console.log(
        `[KEYWORD-SERVICES] Parsed content: ${parsed.wordCount || 0} words`
      );

      // Normalize keywords
      const keywordList = Array.isArray(keywords)
        ? keywords
        : keywords
            .split(',')
            .map(k => k.trim())
            .filter(k => k);

      if (keywordList.length === 0) {
        throw new Error('No keywords provided for density analysis');
      }

      console.log(
        `[KEYWORD-SERVICES] Analyzing ${keywordList.length} keywords: ${keywordList
          .slice(0, 3)
          .join(', ')}${keywordList.length > 3 ? '...' : ''}`
      );

      const wordCount = parsed.wordCount || 0;
      if (wordCount === 0) {
        throw new Error('No content to analyze');
      }

      // Analyze each keyword
      const densityResults = keywordList.map(keyword =>
        this._calculateDensity(text, keyword, wordCount)
      );

      console.log(
        `[KEYWORD-SERVICES] Density analysis complete: ${densityResults.filter(r => r.isOptimal).length} optimal, ${densityResults.filter(r => r.status === 'underused').length} underused, ${densityResults.filter(r => r.status === 'overused').length} overused`
      );

      // Calculate distribution across content sections
      const distribution = this._calculateDistribution(text, keywordList);

      // Generate recommendations
      const recommendations =
        this._generateDensityRecommendations(densityResults);

      const result: DensityAnalysisResult = {
        totalWords: wordCount,
        totalKeywords: keywordList.length,
        densityResults,
        distribution,
        recommendations,
        summary: {
          optimal: densityResults.filter(r => r.isOptimal).length,
          underused: densityResults.filter(r => r.status === 'underused')
            .length,
          overused: densityResults.filter(r => r.status === 'overused').length,
        },
      };

      const duration = Date.now() - startTime;
      console.log(
        `[KEYWORD-SERVICES] Density analysis completed in ${duration}ms`
      );

      return result;
    } catch (error) {
      console.error('[KEYWORD-SERVICES] Density analysis error:', error);
      throw error;
    }
  }

  /**
   * Calculate density for a single keyword
   * @private
   */
  private static _calculateDensity(
    text: string,
    keyword: string,
    totalWords: number
  ): DensityResult {
    const normalizedText = text.toLowerCase();
    const normalizedKeyword = keyword.toLowerCase().trim();

    // Escape special regex characters
    const escapedKeyword = normalizedKeyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    // For phrases, use flexible spacing; for words, use word boundaries
    const isPhrase = normalizedKeyword.includes(' ');
    const regex = isPhrase
      ? new RegExp(`\\b${escapedKeyword.replace(/\s+/g, '\\s+')}\\b`, 'gi')
      : new RegExp(`\\b${escapedKeyword}\\b`, 'gi');

    const matches = normalizedText.match(regex);
    const count = matches ? matches.length : 0;

    // Calculate density
    const keywordWordCount = normalizedKeyword.split(/\s+/).length;
    const density =
      totalWords > 0 ? ((count * keywordWordCount) / totalWords) * 100 : 0;

    // Determine status (optimal: 1-3%, underused: <1%, overused: >3%)
    let status: 'optimal' | 'underused' | 'overused', isOptimal: boolean;
    if (density >= 1 && density <= 3) {
      status = 'optimal';
      isOptimal = true;
    } else if (density < 1) {
      status = 'underused';
      isOptimal = false;
    } else {
      status = 'overused';
      isOptimal = false;
    }

    // Find positions for visualization
    const positions: Array<{ index: number; percentage: number }> = [];
    let match;
    const posRegex = new RegExp(regex.source, regex.flags);
    while ((match = posRegex.exec(normalizedText)) !== null) {
      positions.push({
        index: match.index,
        percentage: (match.index / text.length) * 100,
      });
    }

    console.log(
      `[KEYWORD-SERVICES] "${keyword}": ${count} occurrences, ${density.toFixed(2)}% density (${status})`
    );

    return {
      keyword,
      count,
      density: parseFloat(density.toFixed(2)),
      status,
      isOptimal,
      positions,
      type: isPhrase ? 'phrase' : 'word',
    };
  }

  /**
   * Calculate keyword distribution across content sections
   * @private
   */
  private static _calculateDistribution(
    text: string,
    keywords: string[]
  ): SectionDistribution[] {
    const sectionSize = Math.floor(text.length / 4); // Divide into 4 sections
    const sections = [
      { name: 'Introduction', start: 0, end: sectionSize },
      { name: 'Early Content', start: sectionSize, end: sectionSize * 2 },
      { name: 'Middle Content', start: sectionSize * 2, end: sectionSize * 3 },
      { name: 'Conclusion', start: sectionSize * 3, end: text.length },
    ];

    return sections.map(section => {
      const sectionText = text
        .substring(section.start, section.end)
        .toLowerCase();
      const keywordCounts = keywords.map(keyword => {
        const normalizedKeyword = keyword.toLowerCase().trim();
        const escapedKeyword = normalizedKeyword.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );
        const isPhrase = normalizedKeyword.includes(' ');
        const regex = isPhrase
          ? new RegExp(`\\b${escapedKeyword.replace(/\s+/g, '\\s+')}\\b`, 'gi')
          : new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
        const matches = sectionText.match(regex);
        return matches ? matches.length : 0;
      });

      return {
        section: section.name,
        totalKeywords: keywordCounts.reduce((a, b) => a + b, 0),
        keywordCounts: keywords.map((keyword, idx) => ({
          keyword,
          count: keywordCounts[idx]!,
        })),
      };
    });
  }

  /**
   * Generate density recommendations
   * @private
   */
  private static _generateDensityRecommendations(
    densityResults: DensityResult[]
  ): DensityRecommendation[] {
    const recommendations: DensityRecommendation[] = [];

    densityResults.forEach(result => {
      if (result.status === 'underused') {
        recommendations.push({
          type: 'warning',
          keyword: result.keyword,
          message: `"${result.keyword}" is underused (${result.density}%). Try to use it more naturally in your content.`,
          action: 'increase',
        });
      } else if (result.status === 'overused') {
        recommendations.push({
          type: 'critical',
          keyword: result.keyword,
          message: `"${result.keyword}" is overused (${result.density}%). This may be considered keyword stuffing.`,
          action: 'decrease',
        });
      } else {
        recommendations.push({
          type: 'success',
          keyword: result.keyword,
          message: `"${result.keyword}" has optimal density (${result.density}%).`,
          action: 'maintain',
        });
      }
    });

    return recommendations;
  }

  /**
   * Generate long-tail keyword suggestions based on content
   * @param content - HTML or text content
   * @param seedKeywords - Base keywords to expand
   * @param maxSuggestions - Maximum suggestions to return
   * @returns Long-tail keyword suggestions
   */
  static generateLongTailKeywords(
    content: string,
    seedKeywords: string[] = [],
    maxSuggestions: number = 20
  ): LongTailResult {
    const startTime = Date.now();
    console.log('[KEYWORD-SERVICES] Starting long-tail keyword generation');

    try {
      // Parse content
      const parsed = htmlParser.parse(content);
      const text = parsed.text || content;

      if (!text || text.length < 100) {
        throw new Error(
          'Insufficient content for long-tail keyword generation'
        );
      }

      console.log(
        `[KEYWORD-SERVICES] Content parsed: ${text.length} characters, ${parsed.wordCount || 0} words`
      );
      console.log(
        `[KEYWORD-SERVICES] Seed keywords: ${seedKeywords.length > 0 ? seedKeywords.join(', ') : 'none'}`
      );

      // Extract all phrases (2-5 words)
      const phrases = this._extractPhrases(text, 2, 5);
      console.log(
        `[KEYWORD-SERVICES] Extracted ${phrases.length} candidate phrases`
      );

      // Filter and score phrases
      const scoredPhrases = phrases
        .map(phraseObj => {
          const score = this._scoreLongTailPhrase(
            phraseObj,
            seedKeywords,
            text
          );
          return {
            phrase: score.phrase,
            totalScore: score.totalScore,
            components: score.components as {
              frequency: number;
              relevance: number;
              length: number;
              specificity: number;
            },
            frequency: score.frequency,
          };
        })
        .filter(item => item.totalScore > 0)
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, maxSuggestions);

      console.log(
        `[KEYWORD-SERVICES] Scored and filtered to ${scoredPhrases.length} suggestions`
      );

      // Filter out invalid items before categorization
      const validPhrases = scoredPhrases.filter(item => {
        if (!item || typeof item.phrase !== 'string' || !item.phrase.trim()) {
          console.warn(
            '[KEYWORD-SERVICES] Filtering out invalid phrase item:',
            item
          );
          return false;
        }
        return true;
      }) as LongTailPhrase[];

      console.log(
        `[KEYWORD-SERVICES] After validation: ${validPhrases.length} valid phrases`
      );

      // Categorize by intent
      const categorized = this._categorizeByIntent(validPhrases);

      const result: LongTailResult = {
        totalPhrases: validPhrases.length,
        suggestions: validPhrases,
        byIntent: categorized,
        seedKeywords,
      };

      const duration = Date.now() - startTime;
      console.log(
        `[KEYWORD-SERVICES] Long-tail generation completed in ${duration}ms: ${categorized.informational.length} informational, ${categorized.commercial.length} commercial, ${categorized.transactional.length} transactional`
      );

      return result;
    } catch (error) {
      console.error('[KEYWORD-SERVICES] Long-tail generation error:', error);
      throw error;
    }
  }

  /**
   * Extract n-gram phrases from text
   * @private
   */
  private static _extractPhrases(
    text: string,
    minWords: number,
    maxWords: number
  ): ScoredPhrase[] {
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/[^\w\s]/g, '')) // Remove all punctuation
      .filter(w => w.length > 2 && !keywordSuggestions.STOPWORDS.has(w));

    console.log(
      `[KEYWORD-SERVICES] Extracting phrases: ${words.length} filtered words, ${minWords}-${maxWords} word phrases`
    );

    const phrases = new Map<string, number>();

    for (let n = minWords; n <= maxWords; n++) {
      for (let i = 0; i <= words.length - n; i++) {
        const phrase = words.slice(i, i + n).join(' ');
        if (this._isValidPhrase(phrase)) {
          phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
        }
      }
    }

    const result = Array.from(phrases.entries())
      .filter(([_phrase, count]) => count >= 2) // Must appear at least twice
      .map(([phrase, count]) => ({ phrase, frequency: count }));

    console.log(
      `[KEYWORD-SERVICES] Extracted ${result.length} valid phrases (appearing 2+ times)`
    );

    return result;
  }

  /**
   * Check if phrase is valid for long-tail keywords
   * @private
   */
  private static _isValidPhrase(phrase: string): boolean {
    // Must have good vowel ratio
    const vowels = /[aeiouoyαειουω]/gi;
    const vowelCount = (phrase.match(vowels) || []).length;
    const vowelRatio = vowelCount / phrase.length;

    if (vowelRatio < 0.2) return false;

    // Should not be all stopwords
    const words = phrase.split(' ');
    const allStopwords = words.every(w => keywordSuggestions.STOPWORDS.has(w));
    if (allStopwords) return false;

    // Should not contain code patterns
    if (words.some(w => keywordSuggestions.isCodeWord(w))) return false;

    return true;
  }

  /**
   * Score a long-tail phrase
   * @private
   */
  private static _scoreLongTailPhrase(
    phraseObj: ScoredPhrase,
    seedKeywords: string[],
    _fullText: string
  ): {
    phrase: string;
    totalScore: number;
    components: Record<string, number>;
    frequency: number;
  } {
    // Validate input
    if (
      !phraseObj ||
      !('phrase' in phraseObj) ||
      typeof phraseObj.phrase !== 'string' ||
      !phraseObj.phrase.trim()
    ) {
      console.warn(
        '[KEYWORD-SERVICES] Invalid phrase object in scoring:',
        phraseObj
      );
      return {
        phrase: '',
        totalScore: 0,
        components: { frequency: 0, relevance: 0, length: 0, specificity: 0 },
        frequency: 0,
      };
    }

    const { phrase, frequency } = phraseObj;
    const words = phrase.split(' ');
    let totalScore = 0;
    const components: Record<string, number> = {};

    // 1. Frequency score (0-30 points)
    const frequencyScore = Math.min(frequency * 5, 30);
    components.frequency = frequencyScore;
    totalScore += frequencyScore;

    // 2. Seed keyword relevance (0-40 points)
    let relevanceScore = 0;
    if (seedKeywords.length > 0) {
      const containsSeed = seedKeywords.some(seed =>
        phrase.includes(seed.toLowerCase())
      );
      if (containsSeed) {
        relevanceScore = 40;
      } else {
        // Partial match bonus
        const partialMatches = seedKeywords.filter(seed => {
          const seedWords = seed.toLowerCase().split(' ');
          return seedWords.some(sw => words.includes(sw));
        });
        relevanceScore = Math.min(partialMatches.length * 10, 20);
      }
    } else {
      // No seed keywords, give base score
      relevanceScore = 20;
    }
    components.relevance = relevanceScore;
    totalScore += relevanceScore;

    // 3. Length score - longer phrases are more specific (0-20 points)
    const lengthScore = Math.min(words.length * 5, 20);
    components.length = lengthScore;
    totalScore += lengthScore;

    // 4. Specificity score (0-10 points)
    // Contains numbers or specific terms
    const hasNumbers = /\d+/.test(phrase);
    const hasHow = /^(how|what|why|when|where|which|who)/.test(phrase);
    const specificityScore = (hasNumbers ? 5 : 0) + (hasHow ? 5 : 0);
    components.specificity = specificityScore;
    totalScore += specificityScore;

    return {
      phrase,
      totalScore,
      components,
      frequency,
    };
  }

  /**
   * Categorize phrases by search intent
   * @private
   */
  private static _categorizeByIntent(
    scoredPhrases: LongTailPhrase[]
  ): LongTailByIntent {
    const categories: LongTailByIntent = {
      informational: [],
      commercial: [],
      navigational: [],
      transactional: [],
    };

    scoredPhrases.forEach(item => {
      // Validate item has required properties
      if (!item || !item.phrase) {
        console.warn(
          '[KEYWORD-SERVICES] Invalid phrase item in categorization - missing item or phrase:',
          item
        );
        return;
      }

      const phrase = String(item.phrase).toLowerCase().trim();

      // Skip empty phrases
      if (!phrase) {
        console.warn('[KEYWORD-SERVICES] Empty phrase found in categorization');
        return;
      }

      // Informational intent
      if (
        /^(how|what|why|when|where|which|who|guide|tutorial|learn)/.test(phrase)
      ) {
        categories.informational.push(item);
      }
      // Commercial intent
      else if (/(best|top|review|compare|vs|versus|alternative)/.test(phrase)) {
        categories.commercial.push(item);
      }
      // Transactional intent
      else if (
        /(buy|price|cost|cheap|deal|discount|order|purchase)/.test(phrase)
      ) {
        categories.transactional.push(item);
      }
      // Navigational intent
      else if (/(login|sign in|register|download|app|software)/.test(phrase)) {
        categories.navigational.push(item);
      }
      // Default to informational
      else {
        categories.informational.push(item);
      }
    });

    return categories;
  }

  /**
   * Estimate keyword difficulty (basic scoring)
   * @param keywords - Keywords to analyze
   * @param content - Content context (optional)
   * @returns Difficulty estimates for each keyword
   */
  static estimateKeywordDifficulty(
    keywords: string[] | string,
    content: string = ''
  ): DifficultyResult {
    const startTime = Date.now();
    console.log('[KEYWORD-SERVICES] Starting keyword difficulty estimation');

    try {
      const keywordList = Array.isArray(keywords)
        ? keywords
        : keywords
            .split(',')
            .map(k => k.trim())
            .filter(k => k);

      console.log(
        `[KEYWORD-SERVICES] Estimating difficulty for ${keywordList.length} keywords`
      );

      const estimates = keywordList.map(keyword =>
        this._calculateDifficulty(keyword, content)
      );

      // Sort by difficulty score
      const sorted = [...estimates].sort((a, b) => a.score - b.score);

      const result: DifficultyResult = {
        totalKeywords: estimates.length,
        estimates,
        easiest: sorted.slice(0, 3),
        hardest: sorted.slice(-3).reverse(),
        distribution: {
          easy: estimates.filter(e => e.level === 'easy').length,
          medium: estimates.filter(e => e.level === 'medium').length,
          hard: estimates.filter(e => e.level === 'hard').length,
          veryHard: estimates.filter(e => e.level === 'very hard').length,
        },
      };

      const duration = Date.now() - startTime;
      console.log(
        `[KEYWORD-SERVICES] Difficulty estimation completed in ${duration}ms: ${result.distribution.easy} easy, ${result.distribution.medium} medium, ${result.distribution.hard} hard, ${result.distribution.veryHard} very hard`
      );

      return result;
    } catch (error) {
      console.error('[KEYWORD-SERVICES] Difficulty estimation error:', error);
      throw error;
    }
  }

  /**
   * Calculate difficulty score for a keyword
   * @private
   */
  private static _calculateDifficulty(
    keyword: string,
    _content: string
  ): DifficultlyEstimate {
    let score = 50; // Base score (0-100, higher = more difficult)
    const factors: DifficultyFactors = {
      length: 0,
      generic: 0,
      commercial: 0,
      question: 0,
      numbers: 0,
      location: 0,
    };

    // 1. Keyword length (shorter = more competitive)
    const words = keyword.trim().split(/\s+/);
    const wordCount = words.length;

    if (wordCount === 1) {
      factors.length = 25;
      score += 25; // Single words are harder
    } else if (wordCount === 2) {
      factors.length = 10;
      score += 10;
    } else if (wordCount >= 4) {
      factors.length = -15;
      score -= 15; // Long-tail keywords are easier
    }

    // 2. Generic vs specific terms
    const genericTerms = [
      'best',
      'top',
      'good',
      'great',
      'make',
      'get',
      'free',
    ];
    const hasGeneric = words.some(w => genericTerms.includes(w.toLowerCase()));
    if (hasGeneric) {
      factors.generic = 15;
      score += 15;
    }

    // 3. Commercial intent (usually more competitive)
    const commercialTerms = [
      'buy',
      'price',
      'cost',
      'cheap',
      'deal',
      'sale',
      'discount',
    ];
    const hasCommercial = words.some(w =>
      commercialTerms.includes(w.toLowerCase())
    );
    if (hasCommercial) {
      factors.commercial = 10;
      score += 10;
    }

    // 4. Question-based (usually easier)
    const questionWords = [
      'how',
      'what',
      'why',
      'when',
      'where',
      'which',
      'who',
    ];
    const isQuestion = questionWords.some(q =>
      keyword.toLowerCase().startsWith(q)
    );
    if (isQuestion) {
      factors.question = -10;
      score -= 10;
    }

    // 5. Contains numbers (usually more specific, easier)
    if (/\d+/.test(keyword)) {
      factors.numbers = -10;
      score -= 10;
    }

    // 6. Location-based (can be easier if local)
    const locationWords = ['near', 'in', 'at', 'local', 'city', 'town'];
    const hasLocation = words.some(w =>
      locationWords.includes(w.toLowerCase())
    );
    if (hasLocation) {
      factors.location = -5;
      score -= 5;
    }

    // Normalize score (0-100)
    score = Math.max(0, Math.min(100, score));

    // Determine difficulty level
    let level: 'easy' | 'medium' | 'hard' | 'very hard', color: string;
    if (score < 30) {
      level = 'easy';
      color = '#10b981'; // green
    } else if (score < 60) {
      level = 'medium';
      color = '#f59e0b'; // orange
    } else if (score < 80) {
      level = 'hard';
      color = '#ef4444'; // red
    } else {
      level = 'very hard';
      color = '#991b1b'; // dark red
    }

    return {
      keyword,
      score: Math.round(score),
      level,
      color,
      factors,
      recommendation: this._getDifficultyRecommendation(level, keyword),
    };
  }

  /**
   * Get recommendation based on difficulty
   * @private
   */
  private static _getDifficultyRecommendation(
    level: 'easy' | 'medium' | 'hard' | 'very hard',
    keyword: string
  ): string {
    switch (level) {
      case 'easy':
        return `"${keyword}" appears to be a good target - relatively low competition expected.`;
      case 'medium':
        return `"${keyword}" has moderate difficulty. Create quality content and build backlinks.`;
      case 'hard':
        return `"${keyword}" is competitive. Consider targeting long-tail variations.`;
      case 'very hard':
        return `"${keyword}" is highly competitive. Focus on long-tail alternatives first.`;
      default:
        return '';
    }
  }

  /**
   * Cluster related keywords together with advanced analysis
   * @param keywords - Keywords to cluster
   * @param _content - Content for context (optional, reserved for future use)
   * @param options - Clustering options
   * @returns Enhanced clustered keywords with analysis
   */
  static clusterKeywords(
    keywords: string[] | string,
    _content: string = '',
    options: ClusteringOptions = {}
  ): ClusteringResult {
    const startTime = Date.now();
    console.log('[KEYWORD-SERVICES] Starting enhanced keyword clustering');

    try {
      const keywordList = Array.isArray(keywords)
        ? keywords
        : keywords
            .split(',')
            .map(k => k.trim())
            .filter(k => k);

      if (keywordList.length < 2) {
        throw new Error('Need at least 2 keywords for clustering');
      }

      const { similarityThreshold = 0.3, strategy = 'jaccard' } = options;

      console.log(
        `[KEYWORD-SERVICES] Clustering ${keywordList.length} keywords using ${strategy} strategy (threshold: ${similarityThreshold})`
      );

      // Calculate similarity matrix
      const clusters: KeywordCluster[] = [];
      const processed = new Set<string>();

      keywordList.forEach((keyword1, idx1) => {
        if (processed.has(keyword1)) return;

        const cluster: KeywordCluster = {
          primary: keyword1,
          related: [],
          size: 1,
          commonWords: [],
          suggestedName: '',
          quality: 0,
          theme: '',
        };

        keywordList.forEach((keyword2, idx2) => {
          if (idx1 === idx2 || processed.has(keyword2)) return;

          const similarity = this._calculateSimilarity(
            keyword1,
            keyword2,
            strategy as 'jaccard' | 'semantic'
          );

          if (similarity > similarityThreshold) {
            cluster.related.push({
              keyword: keyword2,
              similarity: Math.round(similarity * 100),
            });
            cluster.size++;
            processed.add(keyword2);
          }
        });

        // Enhanced cluster analysis
        const allKeywords = [
          keyword1,
          ...(cluster.related || []).map(r => r.keyword),
        ].filter(k => k && k.trim());
        cluster.commonWords = this._findCommonWords(allKeywords);
        cluster.suggestedName = this._generateClusterName(allKeywords);
        cluster.quality = this._calculateClusterQuality(cluster);
        cluster.theme = this._identifyClusterTheme(allKeywords);

        // Sort related keywords by similarity
        cluster.related.sort((a, b) => b.similarity - a.similarity);

        processed.add(keyword1);
        clusters.push(cluster);
      });

      // Sort clusters by quality and size
      clusters.sort((a, b) => {
        if (b.quality !== a.quality) return b.quality - a.quality;
        return b.size - a.size;
      });

      const result: ClusteringResult = {
        totalKeywords: keywordList.length,
        totalClusters: clusters.length,
        clusters,
        singleton: clusters.filter(c => c.size === 1).length,
        avgClusterSize:
          clusters.reduce((sum, c) => sum + c.size, 0) / clusters.length,
        options: { similarityThreshold, strategy: strategy || 'jaccard' },
        insights: this._generateClusteringInsights(
          clusters,
          keywordList.length
        ),
      };

      const duration = Date.now() - startTime;
      console.log(
        `[KEYWORD-SERVICES] Enhanced clustering completed in ${duration}ms: ${result.totalClusters} clusters created, ${result.singleton} singletons, avg cluster size: ${result.avgClusterSize.toFixed(1)}`
      );

      return result;
    } catch (error) {
      console.error('[KEYWORD-SERVICES] Clustering error:', error);
      throw error;
    }
  }

  /**
   * Calculate similarity between two keywords with multiple strategies
   * @private
   */
  private static _calculateSimilarity(
    keyword1: string,
    keyword2: string,
    strategy: 'jaccard' | 'semantic' = 'jaccard'
  ): number {
    const words1 = new Set(keyword1.toLowerCase().split(/\s+/));
    const words2 = new Set(keyword2.toLowerCase().split(/\s+/));

    switch (strategy) {
      case 'semantic':
        // Enhanced semantic similarity considering word order and partial matches
        return this._calculateSemanticSimilarity(keyword1, keyword2);

      case 'jaccard':
      default: {
        // Jaccard similarity (intersection over union)
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
      }
    }
  }

  /**
   * Calculate semantic similarity with enhanced word matching
   * @private
   */
  private static _calculateSemanticSimilarity(
    keyword1: string,
    keyword2: string
  ): number {
    const words1 = keyword1.toLowerCase().split(/\s+/);
    const words2 = keyword2.toLowerCase().split(/\s+/);

    let totalSimilarity = 0;
    let comparisons = 0;

    // Compare each word from keyword1 with each word from keyword2
    words1.forEach(word1 => {
      words2.forEach(word2 => {
        const similarity = this._wordSimilarity(word1, word2);
        totalSimilarity += similarity;
        comparisons++;
      });
    });

    // Also consider exact phrase matches for multi-word keywords
    if (words1.length > 1 && words2.length > 1) {
      const phrase1 = words1.join(' ');
      const phrase2 = words2.join(' ');
      if (phrase1.includes(phrase2) || phrase2.includes(phrase1)) {
        totalSimilarity += 0.5; // Bonus for partial phrase matches
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  /**
   * Calculate similarity between two individual words
   * @private
   */
  private static _wordSimilarity(word1: string, word2: string): number {
    if (word1 === word2) return 1.0;

    // Check for common prefixes/suffixes
    const minLength = Math.min(word1.length, word2.length);
    if (minLength < 3) return 0;

    // Prefix match (first 3+ characters)
    if (
      word1.startsWith(word2.substring(0, 3)) ||
      word2.startsWith(word1.substring(0, 3))
    ) {
      return 0.7;
    }

    // Suffix match (last 3+ characters)
    if (word1.endsWith(word2.slice(-3)) || word2.endsWith(word1.slice(-3))) {
      return 0.6;
    }

    // Contains match
    if (word1.includes(word2) || word2.includes(word1)) {
      return 0.5;
    }

    return 0;
  }

  /**
   * Find common words across keywords
   * @private
   */
  private static _findCommonWords(keywords: string[]): CommonWord[] {
    if (!Array.isArray(keywords) || keywords.length === 0) return [];

    const wordCounts = new Map<string, number>();

    keywords.forEach(keyword => {
      if (!keyword || typeof keyword !== 'string') return;
      const words = keyword
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w && w.length > 2);
      words.forEach(word => {
        if (!keywordSuggestions.STOPWORDS.has(word)) {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      });
    });

    // Return words that appear in at least 2 keywords, sorted by frequency
    return Array.from(wordCounts.entries())
      .filter(([_word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({
        word,
        count,
        frequency: keywords.length > 0 ? count / keywords.length : 0,
      }));
  }

  /**
   * Generate a suggested name for the cluster
   * @private
   */
  private static _generateClusterName(keywords: string[]): string {
    if (keywords.length === 0) return '';

    // Find the most common words across all keywords
    const commonWords = this._findCommonWords(keywords);

    if (commonWords.length === 0) {
      // If no common words, use the first keyword as base
      return keywords[0] || '';
    }

    // Create a name from the top common words
    const topWords = commonWords.slice(0, 3).map(cw => cw.word);

    // Try to find a keyword that contains most of these words
    const bestMatch = keywords.find(keyword => {
      const keywordWords = new Set(keyword.toLowerCase().split(/\s+/));
      const matchCount = topWords.filter(word => keywordWords.has(word)).length;
      return matchCount >= Math.min(2, topWords.length);
    });

    return bestMatch || `${topWords[0]} ${topWords[1] || 'related'}`;
  }

  /**
   * Calculate cluster quality score (0-100)
   * @private
   */
  private static _calculateClusterQuality(cluster: KeywordCluster): number {
    let score = 0;

    // Size bonus (larger clusters are better)
    if (cluster.size >= 5) score += 30;
    else if (cluster.size >= 3) score += 20;
    else if (cluster.size >= 2) score += 10;

    // Similarity bonus (higher average similarity is better)
    if (cluster.related.length > 0) {
      const avgSimilarity =
        cluster.related.reduce((sum, r) => sum + r.similarity, 0) /
        cluster.related.length;
      if (avgSimilarity >= 70) score += 25;
      else if (avgSimilarity >= 50) score += 15;
      else if (avgSimilarity >= 30) score += 5;
    }

    // Common words bonus (more shared terms indicate better clustering)
    if (cluster.commonWords.length >= 3) score += 20;
    else if (cluster.commonWords.length >= 2) score += 10;
    else if (cluster.commonWords.length >= 1) score += 5;

    // Diversity penalty (too many very similar keywords might indicate over-clustering)
    const highSimilarityCount = cluster.related.filter(
      r => r.similarity >= 80
    ).length;
    if (highSimilarityCount > cluster.size * 0.7) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Identify the main theme/topic of the cluster
   * @private
   */
  private static _identifyClusterTheme(keywords: string[]): string {
    const themes: Record<string, string[]> = {
      'SEO Tools': ['seo', 'tool', 'software', 'analyzer', 'optimizer'],
      'Content Marketing': [
        'content',
        'blog',
        'article',
        'writing',
        'marketing',
      ],
      'Keyword Research': [
        'keyword',
        'research',
        'search',
        'volume',
        'competition',
      ],
      'Technical SEO': ['technical', 'crawl', 'index', 'site', 'speed'],
      'Local SEO': ['local', 'location', 'google', 'business', 'map'],
      'E-commerce': ['product', 'price', 'buy', 'sale', 'shop'],
      Analytics: ['analytics', 'data', 'tracking', 'metrics', 'report'],
    };

    const allWords = keywords.join(' ').toLowerCase().split(/\s+/);
    const wordCounts: Record<string, number> = {};

    allWords.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    let bestTheme = 'General';
    let bestScore = 0;

    Object.entries(themes).forEach(([theme, themeWords]) => {
      let score = 0;
      themeWords.forEach(themeWord => {
        score += wordCounts[themeWord] || 0;
      });
      if (score > bestScore) {
        bestScore = score;
        bestTheme = theme;
      }
    });

    return bestTheme;
  }

  /**
   * Generate insights about the clustering results
   * @private
   */
  private static _generateClusteringInsights(
    clusters: KeywordCluster[],
    totalKeywords: number
  ): ClusterInsight[] {
    const insights: ClusterInsight[] = [];

    const avgQuality =
      clusters.reduce((sum, c) => sum + c.quality, 0) / clusters.length;
    const highQualityClusters = clusters.filter(c => c.quality >= 70).length;
    const singletonPercentage =
      (clusters.filter(c => c.size === 1).length / totalKeywords) * 100;

    if (avgQuality >= 70) {
      insights.push({
        type: 'success',
        message:
          'Excellent clustering quality! Your keywords group well together.',
      });
    } else if (avgQuality >= 50) {
      insights.push({
        type: 'info',
        message:
          'Good clustering results. Consider refining your keyword list for better grouping.',
      });
    } else {
      insights.push({
        type: 'warning',
        message:
          'Clustering quality could be improved. Try adding more related keywords.',
      });
    }

    if (singletonPercentage > 50) {
      insights.push({
        type: 'warning',
        message: `${singletonPercentage.toFixed(0)}% of keywords are standalone. Consider expanding your keyword set.`,
      });
    }

    if (highQualityClusters > 0) {
      insights.push({
        type: 'success',
        message: `${highQualityClusters} high-quality cluster${highQualityClusters > 1 ? 's' : ''} identified for content creation.`,
      });
    }

    return insights;
  }

  /**
   * Generate LSI (Latent Semantic Indexing) keywords
   * @param content - Content to analyze
   * @param mainKeywords - Main keywords
   * @param maxSuggestions - Maximum suggestions
   * @returns LSI keyword suggestions
   */
  static generateLSIKeywords(
    content: string,
    mainKeywords: string[] = [],
    maxSuggestions: number = 15
  ): LSIResult {
    const startTime = Date.now();
    console.log('[KEYWORD-SERVICES] Starting LSI keyword generation');

    try {
      // Parse content
      const parsed = htmlParser.parse(content);
      const text = parsed.text || content;

      if (!text || text.length < 200) {
        throw new Error('Need more content for LSI keyword generation');
      }

      console.log(
        `[KEYWORD-SERVICES] Content parsed: ${text.length} characters, ${parsed.wordCount || 0} words`
      );
      console.log(
        `[KEYWORD-SERVICES] Main keywords: ${mainKeywords.length > 0 ? mainKeywords.join(', ') : 'none'}`
      );

      // Get keyword suggestions (these are semantically related)
      const suggestions = keywordSuggestions.suggestKeywords(
        content,
        maxSuggestions * 2,
        'en'
      );
      console.log(
        `[KEYWORD-SERVICES] Generated ${suggestions.length} initial keyword suggestions`
      );

      // Filter out main keywords
      const mainKeywordsLower = mainKeywords.map(k => k.toLowerCase());
      const lsiCandidates = suggestions.filter(
        (s: any) => !mainKeywordsLower.includes((s.keyword || s).toLowerCase())
      );

      console.log(
        `[KEYWORD-SERVICES] Filtered to ${lsiCandidates.length} LSI candidates after removing main keywords`
      );

      // Score LSI candidates based on co-occurrence with main keywords
      const scored = lsiCandidates.map((candidate: any) => {
        const keyword = candidate.keyword || candidate;
        const lsiScore = this._calculateLSIScore(keyword, mainKeywords, text);
        return {
          keyword,
          frequency: candidate.frequency || 0,
          relevance: candidate.relevance || 0,
          lsiScore: lsiScore,
          type: candidate.type || 'word',
        };
      });

      // Sort by LSI score and take top N
      const topLSI = scored
        .sort((a, b) => b.lsiScore - a.lsiScore)
        .slice(0, maxSuggestions);

      const result: LSIResult = {
        totalSuggestions: topLSI.length,
        mainKeywords,
        lsiKeywords: topLSI,
        summary: {
          phrases: topLSI.filter(k => k.type === 'phrase').length,
          words: topLSI.filter(k => k.type === 'word').length,
          avgLSIScore:
            topLSI.reduce((sum, k) => sum + k.lsiScore, 0) / topLSI.length,
        },
      };

      const duration = Date.now() - startTime;
      console.log(
        `[KEYWORD-SERVICES] LSI generation completed in ${duration}ms: ${result.totalSuggestions} suggestions (${result.summary.phrases} phrases, ${result.summary.words} words), avg LSI score: ${result.summary.avgLSIScore.toFixed(1)}`
      );

      return result;
    } catch (error) {
      console.error('[KEYWORD-SERVICES] LSI generation error:', error);
      throw error;
    }
  }

  /**
   * Calculate LSI score based on co-occurrence
   * @private
   */
  private static _calculateLSIScore(
    candidate: string,
    mainKeywords: string[],
    text: string
  ): number {
    if (mainKeywords.length === 0) {
      return 50; // Default score if no main keywords
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim());

    let cooccurrenceScore = 0;
    const candidateLower = candidate.toLowerCase();

    // Check how often candidate appears near main keywords
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();

      if (sentenceLower.includes(candidateLower)) {
        const hasMainKeyword = mainKeywords.some(main =>
          sentenceLower.includes(main.toLowerCase())
        );

        if (hasMainKeyword) {
          cooccurrenceScore += 10;
        }
      }
    });

    return Math.min(100, cooccurrenceScore);
  }
}
