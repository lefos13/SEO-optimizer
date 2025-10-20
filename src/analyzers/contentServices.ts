/**
 * Content Services - Advanced Content Optimization Tools
 *
 * Provides specialized content optimization functionality for the mini-services view:
 * - Content structure analysis with actionable insights
 * - Heading optimization suggestions
 * - Internal linking recommendations
 * - Content length optimization
 * - Content gap analysis
 * - Competitive content analysis
 *
 * Note: These services run independently and do NOT save to database
 */

import * as htmlParser from './htmlParser';
import { HeadingsMap } from '../types/analyzer.types';

// ============================================================
// Type Definitions
// ============================================================

interface RecommendationType {
  type: 'error' | 'warning' | 'info' | 'success';
  category: string;
  title: string;
  message: string;
}

interface ScoreResult {
  score: number;
  label: string;
}

interface HeadingAnalysis {
  total: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count: number;
  h6Count: number;
  hasH1: boolean;
  hasH2: boolean;
  hasProperHierarchy: boolean;
  hierarchyIssues: string[];
}

interface ParagraphAnalysis {
  count: number;
  avgLength: number;
  shortParagraphs: number;
  mediumParagraphs: number;
  longParagraphs: number;
  isEmpty: boolean;
}

interface ListAnalysis {
  unorderedLists: number;
  orderedLists: number;
  totalLists: number;
  totalListItems: number;
  avgItemsPerList: number;
  hasLists: boolean;
}

interface MediaAnalysis {
  images: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  videos: number;
  embeds: number;
  totalMedia: number;
  hasMedia: boolean;
}

interface StructureAnalysisResult {
  meta: {
    timestamp: string;
    wordCount: number;
  };
  score: ScoreResult;
  headings: HeadingAnalysis;
  paragraphs: ParagraphAnalysis;
  lists: ListAnalysis;
  media: MediaAnalysis;
  recommendations: RecommendationType[];
}

interface KeywordUsageInHeadings {
  keyword: string;
  count: number;
  inHeadings: boolean;
}

interface KeywordUsageAnalysis {
  usage: KeywordUsageInHeadings[];
  keywordsInHeadings: number;
  totalKeywords: number;
  percentage: number;
}

interface HeadingDetail {
  level: string;
  text: string;
  length: number;
  characters: number;
}

interface HeadingLengthAnalysis {
  total: number;
  optimal: number;
  tooLong: number;
  tooShort: number;
  details: HeadingDetail[];
}

interface HeadingOptimizationResult {
  meta: {
    timestamp: string;
    totalHeadings: number;
    keywordsProvided: number;
  };
  analysis: HeadingAnalysis;
  keywordUsage: KeywordUsageAnalysis;
  lengthAnalysis: HeadingLengthAnalysis;
  suggestions: RecommendationType[];
  score: ScoreResult;
}

interface LinkInfo {
  url: string;
  anchorText: string;
  isInternal: boolean;
  isExternal: boolean;
}

interface LinkAnalysis {
  total: number;
  internal: number;
  external: number;
  ratio: number;
  hasLinks: boolean;
}

interface LinkingOpportunity {
  page: string;
  url: string;
  reason: string;
  relevance: number;
}

interface AnchorTextAnalysis {
  total: number;
  generic: number;
  descriptive: number;
  empty: number;
  genericPercentage: number;
}

interface InternalLinkingResult {
  meta: {
    timestamp: string;
    currentLinks: number;
    existingPages: number;
  };
  linkAnalysis: LinkAnalysis;
  opportunities: LinkingOpportunity[];
  anchorAnalysis: AnchorTextAnalysis;
  recommendations: RecommendationType[];
  score: ScoreResult;
}

interface ExistingPage {
  title: string;
  url: string;
  keywords?: string[];
}

interface ContentLengthRange {
  min: number;
  max: number;
  ideal: number;
}

interface ContentLengthAnalysis {
  status: 'too_short' | 'too_long' | 'optimal';
  message: string;
  difference: number;
  percentageOfIdeal: number;
  score: number;
}

interface ContentSection {
  title: string;
  type: string;
}

interface SectionAnalysis {
  majorSections: number;
  subsections: number;
  hasProperSectioning: boolean;
  sections: ContentSection[];
}

interface ContentLengthResult {
  meta: {
    timestamp: string;
    currentWordCount: number;
    targetType: string;
  };
  currentLength: {
    words: number;
    characters: number;
    readingTime: number;
  };
  idealRange: ContentLengthRange;
  lengthAnalysis: ContentLengthAnalysis;
  sections: SectionAnalysis;
  suggestions: RecommendationType[];
  score: number;
}

type TopicDepth = 'none' | 'mentioned' | 'shallow' | 'moderate' | 'deep';

interface TopicCoverage {
  topic: string;
  covered: boolean;
  inHeadings: boolean;
  relevance: number;
  depth: TopicDepth;
}

type DepthLevel = 'comprehensive' | 'adequate' | 'shallow' | 'minimal';

interface ContentDepthAnalysis {
  wordsPerTopic: number;
  depthLevel: DepthLevel;
  deepTopics: number;
  shallowTopics: number;
}

interface ContentGapResult {
  meta: {
    timestamp: string;
    topicsProvided: number;
    topicsCovered: number;
  };
  coverage: TopicCoverage[];
  gaps: TopicCoverage[];
  depth: ContentDepthAnalysis;
  suggestions: RecommendationType[];
  score: ScoreResult;
}

interface ContentMetrics {
  wordCount: number;
  headingCount: number;
  imageCount: number;
  listCount: number;
}

interface CompetitorContent {
  title: string;
  content: string;
  url: string;
}

interface CompetitorMetrics extends ContentMetrics {
  title: string;
  url: string;
}

type ComparisonStatus = 'competitive' | 'longer' | 'shorter' | 'below';

interface MetricComparison {
  value: number;
  average: number;
  difference: number;
  status: ComparisonStatus;
  percentage?: number;
}

interface ContentComparison {
  wordCount: MetricComparison;
  headingCount: MetricComparison;
  imageCount: MetricComparison;
  listCount: MetricComparison;
}

interface CompetitiveAnalysisResult {
  meta: {
    timestamp: string;
    competitorsAnalyzed: number;
  };
  yourContent: ContentMetrics;
  competitors: CompetitorMetrics[];
  averages: ContentMetrics;
  comparison: ContentComparison;
  insights: RecommendationType[];
  score: ScoreResult;
}

// ============================================================
// Main Class
// ============================================================

class ContentServices {
  /**
   * Analyze content structure with actionable insights
   * @param content - HTML or plain text content
   * @param _options - Analysis options (reserved for future use)
   * @returns Structure analysis with recommendations
   */
  static analyzeContentStructure(
    content: string,
    _options: Record<string, unknown> = {}
  ): StructureAnalysisResult {
    const parsed = htmlParser.parse(content);
    const text = parsed.text || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Analyze headings hierarchy
    const headings = this._analyzeHeadingHierarchy(parsed.headings);

    // Analyze paragraphs
    const paragraphs = this._analyzeParagraphStructure(content);

    // Analyze lists
    const lists = this._analyzeLists(content);

    // Analyze images and media
    const media = this._analyzeMedia(content);

    // Generate structure score
    const score = this._calculateStructureScore({
      headings,
      paragraphs,
      lists,
      media,
      wordCount,
    });

    // Generate recommendations
    const recommendations = this._generateStructureRecommendations({
      headings,
      paragraphs,
      lists,
      media,
      wordCount,
    });

    return {
      meta: {
        timestamp: new Date().toISOString(),
        wordCount,
      },
      score,
      headings,
      paragraphs,
      lists,
      media,
      recommendations,
    };
  }

  /**
   * Generate heading optimization suggestions
   * @param content - HTML or plain text content
   * @param keywords - Target keywords for optimization
   * @returns Heading optimization suggestions
   */
  static optimizeHeadings(
    content: string,
    keywords: string[] = []
  ): HeadingOptimizationResult {
    const parsed = htmlParser.parse(content);
    const headings = parsed.headings || {};

    // Analyze current headings
    const analysis = this._analyzeHeadingHierarchy(headings);

    // Check keyword usage in headings
    const keywordUsage = this._analyzeHeadingKeywords(headings, keywords);

    // Analyze heading length and readability
    const lengthAnalysis = this._analyzeHeadingLength(headings);

    // Generate optimization suggestions
    const suggestions = this._generateHeadingSuggestions({
      analysis,
      keywordUsage,
      lengthAnalysis,
      headings,
      keywords,
    });

    return {
      meta: {
        timestamp: new Date().toISOString(),
        totalHeadings: analysis.total,
        keywordsProvided: keywords.length,
      },
      analysis,
      keywordUsage,
      lengthAnalysis,
      suggestions,
      score: this._calculateHeadingScore({
        analysis,
        keywordUsage,
        lengthAnalysis,
      }),
    };
  }

  /**
   * Generate internal linking recommendations
   * @param content - HTML or plain text content
   * @param existingPages - Array of existing pages {title, url, keywords}
   * @returns Internal linking recommendations
   */
  static recommendInternalLinks(
    content: string,
    existingPages: ExistingPage[] = []
  ): InternalLinkingResult {
    const parsed = htmlParser.parse(content);
    const text = parsed.text || '';
    const currentLinks = this._extractLinks(content);

    // Analyze current internal links
    const linkAnalysis = this._analyzCurrentLinks(currentLinks);

    // Find linking opportunities
    const opportunities = this._findLinkingOpportunities(
      text,
      existingPages,
      currentLinks
    );

    // Analyze anchor text
    const anchorAnalysis = this._analyzeAnchorText(currentLinks);

    // Generate recommendations
    const recommendations = this._generateLinkingRecommendations({
      linkAnalysis,
      opportunities,
      anchorAnalysis,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    });

    return {
      meta: {
        timestamp: new Date().toISOString(),
        currentLinks: currentLinks.length,
        existingPages: existingPages.length,
      },
      linkAnalysis,
      opportunities: opportunities.slice(0, 10), // Top 10 opportunities
      anchorAnalysis,
      recommendations,
      score: this._calculateLinkingScore({
        linkAnalysis,
        opportunities,
        anchorAnalysis,
      }),
    };
  }

  /**
   * Optimize content length for target topic
   * @param content - HTML or plain text content
   * @param options - Optimization options
   * @returns Content length optimization data
   */
  static optimizeContentLength(
    content: string,
    options: { targetType?: string } = {}
  ): ContentLengthResult {
    const { targetType = 'blog' } = options;
    const parsed = htmlParser.parse(content);
    const text = parsed.text || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Get ideal length for content type
    const idealRange = this._getIdealContentLength(targetType);

    // Analyze current vs ideal
    const lengthAnalysis = this._analyzeContentLength(
      wordCount,
      idealRange,
      targetType
    );

    // Analyze content sections
    const sections = this._analyzeSections(content);

    // Generate expansion/reduction suggestions
    const suggestions = this._generateLengthSuggestions({
      wordCount,
      idealRange,
      sections,
      targetType,
    });

    return {
      meta: {
        timestamp: new Date().toISOString(),
        currentWordCount: wordCount,
        targetType,
      },
      currentLength: {
        words: wordCount,
        characters: text.length,
        readingTime: Math.ceil(wordCount / 200), // minutes at 200 wpm
      },
      idealRange,
      lengthAnalysis,
      sections,
      suggestions,
      score: lengthAnalysis.score,
    };
  }

  /**
   * Analyze content gaps compared to topics
   * @param content - HTML or plain text content
   * @param topics - Array of topics/questions to cover
   * @returns Content gap analysis
   */
  static analyzeContentGaps(
    content: string,
    topics: string[] = []
  ): ContentGapResult {
    const parsed = htmlParser.parse(content);
    const text = parsed.text.toLowerCase();
    const headings = parsed.headings || {};

    // Analyze topic coverage
    const coverage = this._analyzeTopicCoverage(text, headings, topics);

    // Identify gaps
    const gaps = coverage.filter(t => !t.covered);

    // Analyze depth of covered topics
    const depth = this._analyzeContentDepth(text, coverage);

    // Generate suggestions
    const suggestions = this._generateGapSuggestions({
      gaps,
      depth,
      coverage,
    });

    return {
      meta: {
        timestamp: new Date().toISOString(),
        topicsProvided: topics.length,
        topicsCovered: coverage.filter(t => t.covered).length,
      },
      coverage,
      gaps,
      depth,
      suggestions,
      score: this._calculateCoverageScore(coverage),
    };
  }

  /**
   * Perform competitive content analysis
   * @param content - Your HTML or plain text content
   * @param competitors - Array of competitor content {title, content, url}
   * @returns Competitive analysis results
   */
  static analyzeCompetitiveContent(
    content: string,
    competitors: CompetitorContent[] = []
  ): CompetitiveAnalysisResult {
    const yourParsed = htmlParser.parse(content);
    const yourText = yourParsed.text || '';
    const yourWords = yourText.trim().split(/\s+/).filter(Boolean);

    // Analyze your content
    const yourAnalysis: ContentMetrics = {
      wordCount: yourWords.length,
      headingCount: Object.values(yourParsed.headings || {}).flat().length,
      imageCount: (content.match(/<img/gi) || []).length,
      listCount: (content.match(/<[uo]l>/gi) || []).length,
    };

    // Analyze competitors
    const competitorAnalyses: CompetitorMetrics[] = competitors.map(comp => {
      const parsed = htmlParser.parse(comp.content);
      const text = parsed.text || '';
      const words = text.trim().split(/\s+/).filter(Boolean);

      return {
        title: comp.title,
        url: comp.url,
        wordCount: words.length,
        headingCount: Object.values(parsed.headings || {}).flat().length,
        imageCount: (comp.content.match(/<img/gi) || []).length,
        listCount: (comp.content.match(/<[uo]l>/gi) || []).length,
      };
    });

    // Calculate averages
    const averages = this._calculateCompetitorAverages(competitorAnalyses);

    // Compare your content
    const comparison = this._compareToCompetitors(yourAnalysis, averages);

    // Generate competitive insights
    const insights = this._generateCompetitiveInsights({
      yourAnalysis,
      averages,
      comparison,
      competitorAnalyses,
    });

    return {
      meta: {
        timestamp: new Date().toISOString(),
        competitorsAnalyzed: competitors.length,
      },
      yourContent: yourAnalysis,
      competitors: competitorAnalyses,
      averages,
      comparison,
      insights,
      score: this._calculateCompetitiveScore(comparison),
    };
  }

  // ============================================================
  // HELPER METHODS - Content Structure
  // ============================================================

  private static _analyzeHeadingHierarchy(
    headings: HeadingsMap
  ): HeadingAnalysis {
    const h1 = headings.h1 || [];
    const h2 = headings.h2 || [];
    const h3 = headings.h3 || [];
    const h4 = headings.h4 || [];
    const h5 = headings.h5 || [];
    const h6 = headings.h6 || [];

    return {
      total:
        h1.length + h2.length + h3.length + h4.length + h5.length + h6.length,
      h1Count: h1.length,
      h2Count: h2.length,
      h3Count: h3.length,
      h4Count: h4.length,
      h5Count: h5.length,
      h6Count: h6.length,
      hasH1: h1.length === 1,
      hasH2: h2.length > 0,
      hasProperHierarchy: h1.length === 1 && h2.length > 0,
      hierarchyIssues: this._findHierarchyIssues(headings),
    };
  }

  private static _findHierarchyIssues(headings: HeadingsMap): string[] {
    const issues: string[] = [];
    const h1 = headings.h1 || [];

    if (h1.length === 0) {
      issues.push('Missing H1 heading');
    } else if (h1.length > 1) {
      issues.push(`Multiple H1 headings (${h1.length}) - should have only one`);
    }

    if ((headings.h2 || []).length === 0) {
      issues.push('No H2 headings - add subheadings to structure content');
    }

    // Check for skipped levels (e.g., H1 to H3 without H2)
    const levels = [
      headings.h1?.length || 0,
      headings.h2?.length || 0,
      headings.h3?.length || 0,
      headings.h4?.length || 0,
      headings.h5?.length || 0,
      headings.h6?.length || 0,
    ];

    for (let i = 0; i < levels.length - 1; i++) {
      if (levels[i] === 0 && levels.slice(i + 1).some(l => l > 0)) {
        issues.push(
          `Heading hierarchy skip detected - H${i + 1} missing but H${i + 2} or lower exists`
        );
        break;
      }
    }

    return issues;
  }

  private static _analyzeParagraphStructure(
    content: string
  ): ParagraphAnalysis {
    const paragraphs = content.match(/<p[^>]*>.*?<\/p>/gis) || [];
    const lengths = paragraphs.map(p => {
      const text = p.replace(/<[^>]+>/g, '').trim();
      return text.split(/\s+/).filter(Boolean).length;
    });

    const avgLength =
      lengths.length > 0
        ? lengths.reduce((a, b) => a + b, 0) / lengths.length
        : 0;

    return {
      count: paragraphs.length,
      avgLength: Math.round(avgLength),
      shortParagraphs: lengths.filter(l => l < 50).length,
      mediumParagraphs: lengths.filter(l => l >= 50 && l <= 150).length,
      longParagraphs: lengths.filter(l => l > 150).length,
      isEmpty: paragraphs.length === 0,
    };
  }

  private static _analyzeLists(content: string): ListAnalysis {
    const ulCount = (content.match(/<ul[^>]*>/gi) || []).length;
    const olCount = (content.match(/<ol[^>]*>/gi) || []).length;
    const liCount = (content.match(/<li[^>]*>/gi) || []).length;

    return {
      unorderedLists: ulCount,
      orderedLists: olCount,
      totalLists: ulCount + olCount,
      totalListItems: liCount,
      avgItemsPerList:
        ulCount + olCount > 0 ? Math.round(liCount / (ulCount + olCount)) : 0,
      hasLists: ulCount + olCount > 0,
    };
  }

  private static _analyzeMedia(content: string): MediaAnalysis {
    const images = content.match(/<img[^>]*>/gi) || [];
    const videos = content.match(/<video[^>]*>/gi) || [];
    const iframes = content.match(/<iframe[^>]*>/gi) || [];

    const imagesWithAlt = images.filter(img =>
      /alt\s*=\s*["'][^"']+["']/i.test(img)
    );

    return {
      images: images.length,
      imagesWithAlt: imagesWithAlt.length,
      imagesWithoutAlt: images.length - imagesWithAlt.length,
      videos: videos.length,
      embeds: iframes.length,
      totalMedia: images.length + videos.length + iframes.length,
      hasMedia: images.length + videos.length + iframes.length > 0,
    };
  }

  private static _calculateStructureScore(data: {
    headings: HeadingAnalysis;
    paragraphs: ParagraphAnalysis;
    lists: ListAnalysis;
    media: MediaAnalysis;
    wordCount: number;
  }): ScoreResult {
    let score = 0;
    let maxScore = 0;

    // Heading structure (30 points)
    maxScore += 30;
    if (data.headings.hasProperHierarchy) score += 30;
    else if (data.headings.hasH1) score += 15;

    // Paragraphs (25 points)
    maxScore += 25;
    if (data.paragraphs.count >= 3) {
      score += 15;
      if (data.paragraphs.longParagraphs < data.paragraphs.count * 0.3)
        score += 10;
    }

    // Lists (20 points)
    maxScore += 20;
    if (data.lists.hasLists) score += 20;

    // Media (15 points)
    maxScore += 15;
    if (data.media.hasMedia) {
      score += 10;
      if (data.media.imagesWithAlt === data.media.images) score += 5;
    }

    // Word count appropriateness (10 points)
    maxScore += 10;
    if (data.wordCount >= 300) score += 10;
    else if (data.wordCount >= 150) score += 5;

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return {
      score: percentage,
      label:
        percentage >= 80
          ? 'Excellent'
          : percentage >= 60
            ? 'Good'
            : percentage >= 40
              ? 'Fair'
              : 'Poor',
    };
  }

  private static _generateStructureRecommendations(data: {
    headings: HeadingAnalysis;
    paragraphs: ParagraphAnalysis;
    lists: ListAnalysis;
    media: MediaAnalysis;
    wordCount: number;
  }): RecommendationType[] {
    const recommendations: RecommendationType[] = [];

    // Heading recommendations
    if (!data.headings.hasProperHierarchy) {
      if (!data.headings.hasH1) {
        recommendations.push({
          type: 'error',
          category: 'headings',
          title: 'Add H1 Heading',
          message:
            'Every page needs exactly one H1 heading that clearly states the main topic.',
        });
      }
      if (!data.headings.hasH2) {
        recommendations.push({
          type: 'warning',
          category: 'headings',
          title: 'Add H2 Subheadings',
          message:
            'Break content into sections with H2 headings to improve scannability.',
        });
      }
    }

    if (data.headings.hierarchyIssues.length > 0) {
      data.headings.hierarchyIssues.forEach(issue => {
        recommendations.push({
          type: 'warning',
          category: 'headings',
          title: 'Heading Hierarchy Issue',
          message: issue,
        });
      });
    }

    // Paragraph recommendations
    if (data.paragraphs.longParagraphs > data.paragraphs.count * 0.3) {
      recommendations.push({
        type: 'warning',
        category: 'paragraphs',
        title: 'Long Paragraphs Detected',
        message: `${data.paragraphs.longParagraphs} paragraphs exceed 150 words. Consider breaking them into smaller chunks.`,
      });
    }

    if (data.paragraphs.count < 3 && data.wordCount > 200) {
      recommendations.push({
        type: 'info',
        category: 'paragraphs',
        title: 'Add More Paragraphs',
        message: 'Break content into more paragraphs for better readability.',
      });
    }

    // List recommendations
    if (!data.lists.hasLists && data.wordCount > 300) {
      recommendations.push({
        type: 'info',
        category: 'lists',
        title: 'Consider Adding Lists',
        message:
          'Use bulleted or numbered lists to present information clearly and improve scannability.',
      });
    }

    // Media recommendations
    if (!data.media.hasMedia && data.wordCount > 500) {
      recommendations.push({
        type: 'info',
        category: 'media',
        title: 'Add Visual Elements',
        message:
          'Include images, videos, or infographics to break up text and improve engagement.',
      });
    }

    if (data.media.imagesWithoutAlt > 0) {
      recommendations.push({
        type: 'warning',
        category: 'media',
        title: 'Add Alt Text to Images',
        message: `${data.media.imagesWithoutAlt} images missing alt text. Add descriptive alt text for SEO and accessibility.`,
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        category: 'general',
        title: 'Excellent Structure',
        message: 'Your content has a well-organized structure. Keep it up!',
      });
    }

    return recommendations;
  }

  // ============================================================
  // HELPER METHODS - Heading Optimization
  // ============================================================

  private static _analyzeHeadingKeywords(
    headings: HeadingsMap,
    keywords: string[]
  ): KeywordUsageAnalysis {
    const allHeadings = Object.values(headings).flat();
    const headingText = allHeadings.join(' ').toLowerCase();

    const usage = keywords.map(keyword => {
      const kw = keyword.toLowerCase();
      const count = (headingText.match(new RegExp(`\\b${kw}\\b`, 'gi')) || [])
        .length;

      return {
        keyword,
        count,
        inHeadings: count > 0,
      };
    });

    const keywordsInHeadings = usage.filter(u => u.inHeadings).length;
    const percentage =
      keywords.length > 0
        ? Math.round((keywordsInHeadings / keywords.length) * 100)
        : 0;

    return {
      usage,
      keywordsInHeadings,
      totalKeywords: keywords.length,
      percentage,
    };
  }

  private static _analyzeHeadingLength(
    headings: HeadingsMap
  ): HeadingLengthAnalysis {
    const allHeadings = Object.entries(headings).flatMap(([level, texts]) =>
      (texts as string[]).map(text => ({
        level,
        text,
        length: text.split(/\s+/).filter(Boolean).length,
        characters: text.length,
      }))
    );

    const tooLong = allHeadings.filter(h => h.length > 10);
    const tooShort = allHeadings.filter(h => h.length < 3);
    const optimal = allHeadings.filter(h => h.length >= 3 && h.length <= 10);

    return {
      total: allHeadings.length,
      optimal: optimal.length,
      tooLong: tooLong.length,
      tooShort: tooShort.length,
      details: allHeadings,
    };
  }

  private static _generateHeadingSuggestions(data: {
    analysis: HeadingAnalysis;
    keywordUsage: KeywordUsageAnalysis;
    lengthAnalysis: HeadingLengthAnalysis;
    headings: HeadingsMap;
    keywords: string[];
  }): RecommendationType[] {
    const suggestions: RecommendationType[] = [];

    // Keyword usage suggestions
    if (data.keywords.length > 0) {
      const missingKeywords = data.keywordUsage.usage.filter(
        u => !u.inHeadings
      );

      if (missingKeywords.length > 0) {
        suggestions.push({
          type: 'info',
          category: 'keywords',
          title: 'Include Keywords in Headings',
          message: `Consider using these keywords in your headings: ${missingKeywords.map(k => k.keyword).join(', ')}`,
        });
      }

      if (
        data.keywordUsage.keywordsInHeadings === 0 &&
        data.keywords.length > 0
      ) {
        suggestions.push({
          type: 'warning',
          category: 'keywords',
          title: 'No Keywords in Headings',
          message:
            'None of your target keywords appear in headings. This is a missed SEO opportunity.',
        });
      }
    }

    // Length suggestions
    if (data.lengthAnalysis.tooLong > 0) {
      suggestions.push({
        type: 'warning',
        category: 'length',
        title: 'Shorten Long Headings',
        message: `${data.lengthAnalysis.tooLong} headings are too long (>10 words). Keep headings concise and scannable.`,
      });
    }

    if (data.lengthAnalysis.tooShort > 0) {
      suggestions.push({
        type: 'info',
        category: 'length',
        title: 'Expand Short Headings',
        message: `${data.lengthAnalysis.tooShort} headings are very short (<3 words). Add more context for clarity.`,
      });
    }

    // Hierarchy suggestions
    if (data.analysis.hierarchyIssues.length > 0) {
      data.analysis.hierarchyIssues.forEach(issue => {
        suggestions.push({
          type: 'warning',
          category: 'hierarchy',
          title: 'Fix Heading Hierarchy',
          message: issue,
        });
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        category: 'general',
        title: 'Well-Optimized Headings',
        message: 'Your headings are well-structured and optimized. Great job!',
      });
    }

    return suggestions;
  }

  private static _calculateHeadingScore(data: {
    analysis: HeadingAnalysis;
    keywordUsage: KeywordUsageAnalysis;
    lengthAnalysis: HeadingLengthAnalysis;
  }): ScoreResult {
    let score = 0;
    let maxScore = 0;

    // Hierarchy (40 points)
    maxScore += 40;
    if (data.analysis.hasProperHierarchy) score += 40;
    else if (data.analysis.hasH1) score += 20;

    // Keyword usage (35 points)
    maxScore += 35;
    if (data.keywordUsage.totalKeywords > 0) {
      score += Math.round((data.keywordUsage.percentage / 100) * 35);
    } else {
      score += 35; // No keywords provided, give full score
    }

    // Length (25 points)
    maxScore += 25;
    if (data.lengthAnalysis.total > 0) {
      const optimalPercentage =
        data.lengthAnalysis.optimal / data.lengthAnalysis.total;
      score += Math.round(optimalPercentage * 25);
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return {
      score: percentage,
      label:
        percentage >= 80
          ? 'Excellent'
          : percentage >= 60
            ? 'Good'
            : percentage >= 40
              ? 'Fair'
              : 'Poor',
    };
  }

  // ============================================================
  // HELPER METHODS - Internal Linking
  // ============================================================

  private static _extractLinks(content: string): LinkInfo[] {
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    const links: LinkInfo[] = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const url = match[1];
      const anchorText = match[2]
        ? match[2].replace(/<[^>]+>/g, '').trim()
        : '';

      if (!url) continue;

      const isInternal =
        url.startsWith('/') || url.startsWith('#') || url.includes('localhost');

      links.push({
        url,
        anchorText,
        isInternal,
        isExternal: !isInternal,
      });
    }

    return links;
  }

  private static _analyzCurrentLinks(links: LinkInfo[]): LinkAnalysis {
    const internal = links.filter(l => l.isInternal);
    const external = links.filter(l => l.isExternal);

    return {
      total: links.length,
      internal: internal.length,
      external: external.length,
      ratio:
        links.length > 0
          ? Math.round((internal.length / links.length) * 100)
          : 0,
      hasLinks: links.length > 0,
    };
  }

  private static _findLinkingOpportunities(
    text: string,
    pages: ExistingPage[],
    currentLinks: LinkInfo[]
  ): LinkingOpportunity[] {
    const currentUrls = new Set(currentLinks.map(l => l.url));
    const opportunities: LinkingOpportunity[] = [];

    pages.forEach(page => {
      // Skip if already linked
      if (currentUrls.has(page.url)) return;

      // Check if page keywords or title appear in text
      const textLower = text.toLowerCase();
      const titleMatch = textLower.includes(page.title.toLowerCase());
      const keywordMatches =
        page.keywords?.filter(kw => textLower.includes(kw.toLowerCase())) || [];

      if (titleMatch || keywordMatches.length > 0) {
        opportunities.push({
          page: page.title,
          url: page.url,
          reason: titleMatch
            ? `Page title "${page.title}" mentioned in content`
            : `Keywords mentioned: ${keywordMatches.join(', ')}`,
          relevance: keywordMatches.length + (titleMatch ? 2 : 0),
        });
      }
    });

    // Sort by relevance
    return opportunities.sort((a, b) => b.relevance - a.relevance);
  }

  private static _analyzeAnchorText(links: LinkInfo[]): AnchorTextAnalysis {
    const internal = links.filter(l => l.isInternal);
    const anchorTexts = internal.map(l => l.anchorText);

    const generic = anchorTexts.filter(a =>
      /^(click here|read more|here|link|more)$/i.test(a)
    );
    const descriptive = anchorTexts.filter(
      a => !/^(click here|read more|here|link|more)$/i.test(a) && a.length > 0
    );

    return {
      total: anchorTexts.length,
      generic: generic.length,
      descriptive: descriptive.length,
      empty: anchorTexts.filter(a => a.length === 0).length,
      genericPercentage:
        anchorTexts.length > 0
          ? Math.round((generic.length / anchorTexts.length) * 100)
          : 0,
    };
  }

  private static _generateLinkingRecommendations(data: {
    linkAnalysis: LinkAnalysis;
    opportunities: LinkingOpportunity[];
    anchorAnalysis: AnchorTextAnalysis;
    wordCount: number;
  }): RecommendationType[] {
    const recommendations: RecommendationType[] = [];

    // Link count recommendations
    const wordsPerLink =
      data.wordCount / Math.max(data.linkAnalysis.internal, 1);

    if (data.linkAnalysis.internal === 0) {
      recommendations.push({
        type: 'warning',
        category: 'links',
        title: 'Add Internal Links',
        message:
          'No internal links found. Link to relevant pages to improve navigation and SEO.',
      });
    } else if (wordsPerLink > 300) {
      recommendations.push({
        type: 'info',
        category: 'links',
        title: 'Add More Internal Links',
        message: `Consider adding more internal links. Aim for 1-2 internal links per 200-300 words.`,
      });
    } else if (wordsPerLink < 100) {
      recommendations.push({
        type: 'warning',
        category: 'links',
        title: 'Too Many Links',
        message:
          'Very high link density. Ensure links add value and are not spammy.',
      });
    }

    // Anchor text recommendations
    if (data.anchorAnalysis.generic > 0) {
      recommendations.push({
        type: 'warning',
        category: 'anchor',
        title: 'Improve Anchor Text',
        message: `${data.anchorAnalysis.generic} links use generic anchor text like "click here". Use descriptive text instead.`,
      });
    }

    if (data.anchorAnalysis.empty > 0) {
      recommendations.push({
        type: 'error',
        category: 'anchor',
        title: 'Empty Anchor Text',
        message: `${data.anchorAnalysis.empty} links have no anchor text. Add descriptive text to all links.`,
      });
    }

    // Opportunity recommendations
    if (data.opportunities.length > 0) {
      recommendations.push({
        type: 'info',
        category: 'opportunities',
        title: 'Linking Opportunities Found',
        message: `Found ${data.opportunities.length} opportunities to link to existing pages. Review the opportunities list.`,
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        category: 'general',
        title: 'Good Linking Strategy',
        message: 'Your internal linking looks good. Keep it up!',
      });
    }

    return recommendations;
  }

  private static _calculateLinkingScore(data: {
    linkAnalysis: LinkAnalysis;
    opportunities: LinkingOpportunity[];
    anchorAnalysis: AnchorTextAnalysis;
  }): ScoreResult {
    let score = 0;
    let maxScore = 0;

    // Has internal links (30 points)
    maxScore += 30;
    if (data.linkAnalysis.internal > 0) score += 30;

    // Link density (25 points)
    maxScore += 25;
    if (data.linkAnalysis.internal > 0 && data.linkAnalysis.internal <= 10) {
      score += 25;
    } else if (data.linkAnalysis.internal > 10) {
      score += 15;
    }

    // Anchor text quality (30 points)
    maxScore += 30;
    if (data.anchorAnalysis.total > 0) {
      const descriptivePercentage =
        (data.anchorAnalysis.descriptive / data.anchorAnalysis.total) * 100;
      score += Math.round((descriptivePercentage / 100) * 30);
    }

    // Has opportunities (15 points)
    maxScore += 15;
    if (data.opportunities.length === 0) score += 15; // No missed opportunities

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return {
      score: percentage,
      label:
        percentage >= 80
          ? 'Excellent'
          : percentage >= 60
            ? 'Good'
            : percentage >= 40
              ? 'Fair'
              : 'Poor',
    };
  }

  // ============================================================
  // HELPER METHODS - Content Length
  // ============================================================

  private static _getIdealContentLength(
    targetType: string
  ): ContentLengthRange {
    const ranges: Record<string, ContentLengthRange> = {
      blog: { min: 1000, max: 2000, ideal: 1500 },
      guide: { min: 2000, max: 5000, ideal: 3000 },
      listicle: { min: 800, max: 2000, ideal: 1200 },
      product: { min: 300, max: 1000, ideal: 500 },
      news: { min: 300, max: 800, ideal: 500 },
      pillar: { min: 3000, max: 10000, ideal: 5000 },
    };

    const resolved: ContentLengthRange = (ranges[targetType] ??
      ranges['blog']) as ContentLengthRange;
    return resolved;
  }

  private static _analyzeContentLength(
    wordCount: number,
    idealRange: ContentLengthRange,
    targetType: string
  ): ContentLengthAnalysis {
    const { min, max, ideal } = idealRange;
    const difference = wordCount - ideal;
    const percentageOfIdeal = Math.round((wordCount / ideal) * 100);

    let status: 'too_short' | 'too_long' | 'optimal';
    let message: string;

    if (wordCount < min) {
      status = 'too_short';
      message = `Content is ${min - wordCount} words below the minimum recommended length for ${targetType} content.`;
    } else if (wordCount > max) {
      status = 'too_long';
      message = `Content is ${wordCount - max} words above the maximum recommended length for ${targetType} content.`;
    } else {
      status = 'optimal';
      message = `Content length is within the ideal range for ${targetType} content.`;
    }

    return {
      status,
      message,
      difference,
      percentageOfIdeal,
      score: this._calculateLengthScore(wordCount, idealRange),
    };
  }

  private static _calculateLengthScore(
    wordCount: number,
    range: ContentLengthRange
  ): number {
    const { min, max, ideal } = range;

    if (wordCount >= min && wordCount <= max) {
      // Within range, calculate based on proximity to ideal
      const distanceFromIdeal = Math.abs(wordCount - ideal);
      const maxDistance = Math.max(ideal - min, max - ideal);
      const score = 100 - (distanceFromIdeal / maxDistance) * 30;
      return Math.max(70, Math.round(score));
    } else if (wordCount < min) {
      // Too short
      const percentage = (wordCount / min) * 100;
      return Math.max(0, Math.round(percentage * 0.7));
    } else {
      // Too long
      const excess = wordCount - max;
      const penalty = Math.min(50, (excess / max) * 100);
      return Math.max(20, Math.round(70 - penalty));
    }
  }

  private static _analyzeSections(content: string): SectionAnalysis {
    const parsed = htmlParser.parse(content);
    const headings = parsed.headings || {};
    const h2s = headings.h2 || [];
    const h3s = headings.h3 || [];

    return {
      majorSections: h2s.length,
      subsections: h3s.length,
      hasProperSectioning: h2s.length >= 3,
      sections: h2s.map(h2 => ({ title: h2, type: 'h2' })),
    };
  }

  private static _generateLengthSuggestions(data: {
    wordCount: number;
    idealRange: ContentLengthRange;
    sections: SectionAnalysis;
    targetType: string;
  }): RecommendationType[] {
    const suggestions: RecommendationType[] = [];
    const { wordCount, idealRange, sections, targetType } = data;
    const { min, max, ideal } = idealRange;

    if (wordCount < min) {
      const wordsNeeded = min - wordCount;
      suggestions.push({
        type: 'warning',
        category: 'expand',
        title: 'Content Too Short',
        message: `Add approximately ${wordsNeeded} more words to meet the minimum recommended length for ${targetType} content.`,
      });

      if (sections.majorSections < 3) {
        suggestions.push({
          type: 'info',
          category: 'expand',
          title: 'Add More Sections',
          message:
            'Create additional sections to thoroughly cover your topic. Aim for at least 3-5 major sections.',
        });
      }

      suggestions.push({
        type: 'info',
        category: 'expand',
        title: 'Expansion Ideas',
        message:
          'Consider adding: examples, case studies, statistics, expert quotes, FAQs, or additional details.',
      });
    } else if (wordCount > max) {
      const wordsToRemove = wordCount - max;
      suggestions.push({
        type: 'warning',
        category: 'reduce',
        title: 'Content Too Long',
        message: `Consider removing approximately ${wordsToRemove} words or splitting into multiple pages.`,
      });

      suggestions.push({
        type: 'info',
        category: 'reduce',
        title: 'Reduction Ideas',
        message:
          'Remove redundant information, consolidate similar points, or move detailed sections to separate pages.',
      });
    } else {
      const proximity = Math.abs(wordCount - ideal);
      if (proximity <= 200) {
        suggestions.push({
          type: 'success',
          category: 'optimal',
          title: 'Ideal Content Length',
          message: `Your content is at the sweet spot for ${targetType} content. Well done!`,
        });
      } else {
        suggestions.push({
          type: 'success',
          category: 'optimal',
          title: 'Good Content Length',
          message: `Your content length is appropriate for ${targetType} content.`,
        });
      }
    }

    return suggestions;
  }

  // ============================================================
  // HELPER METHODS - Content Gaps
  // ============================================================

  private static _analyzeTopicCoverage(
    text: string,
    headings: HeadingsMap,
    topics: string[]
  ): TopicCoverage[] {
    const allHeadingsText = Object.values(headings)
      .flat()
      .join(' ')
      .toLowerCase();

    return topics.map(topic => {
      const topicLower = topic.toLowerCase();
      const inText = text.includes(topicLower);
      const inHeadings = allHeadingsText.includes(topicLower);

      // Calculate relevance score
      const words = topicLower.split(/\s+/);
      const wordMatches = words.filter(word => text.includes(word)).length;
      const relevance = (wordMatches / words.length) * 100;

      return {
        topic,
        covered: inText || inHeadings,
        inHeadings,
        relevance: Math.round(relevance),
        depth: this._calculateTopicDepth(text, topicLower),
      };
    });
  }

  private static _calculateTopicDepth(text: string, topic: string): TopicDepth {
    const mentions = (text.match(new RegExp(topic, 'gi')) || []).length;

    if (mentions === 0) return 'none';
    if (mentions === 1) return 'mentioned';
    if (mentions <= 3) return 'shallow';
    if (mentions <= 7) return 'moderate';
    return 'deep';
  }

  private static _analyzeContentDepth(
    text: string,
    coverage: TopicCoverage[]
  ): ContentDepthAnalysis {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const coveredTopics = coverage.filter(t => t.covered).length;

    const wordsPerTopic =
      coveredTopics > 0 ? Math.round(wordCount / coveredTopics) : 0;

    return {
      wordsPerTopic,
      depthLevel:
        wordsPerTopic >= 500
          ? 'comprehensive'
          : wordsPerTopic >= 200
            ? 'adequate'
            : wordsPerTopic >= 100
              ? 'shallow'
              : 'minimal',
      deepTopics: coverage.filter(t => t.depth === 'deep').length,
      shallowTopics: coverage.filter(
        t => t.depth === 'shallow' || t.depth === 'mentioned'
      ).length,
    };
  }

  private static _generateGapSuggestions(data: {
    gaps: TopicCoverage[];
    depth: ContentDepthAnalysis;
    coverage: TopicCoverage[];
  }): RecommendationType[] {
    const suggestions: RecommendationType[] = [];

    if (data.gaps.length > 0) {
      suggestions.push({
        type: 'warning',
        category: 'coverage',
        title: 'Missing Topics',
        message: `${data.gaps.length} topics are not covered: ${data.gaps.map(g => g.topic).join(', ')}`,
      });

      suggestions.push({
        type: 'info',
        category: 'coverage',
        title: 'Add Missing Content',
        message:
          'Create sections addressing the missing topics to provide comprehensive coverage.',
      });
    }

    if (data.depth.shallowTopics > data.coverage.length * 0.5) {
      suggestions.push({
        type: 'warning',
        category: 'depth',
        title: 'Shallow Topic Coverage',
        message:
          'Many topics are only briefly mentioned. Add more depth and examples.',
      });
    }

    if (data.depth.wordsPerTopic < 100 && data.coverage.length > 0) {
      suggestions.push({
        type: 'warning',
        category: 'depth',
        title: 'Insufficient Detail',
        message: `Average ${data.depth.wordsPerTopic} words per topic. Aim for at least 200 words per topic.`,
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        category: 'coverage',
        title: 'Comprehensive Coverage',
        message: 'All topics are well covered with good depth. Excellent!',
      });
    }

    return suggestions;
  }

  private static _calculateCoverageScore(
    coverage: TopicCoverage[]
  ): ScoreResult {
    if (coverage.length === 0) return { score: 100, label: 'N/A' };

    const covered = coverage.filter(t => t.covered).length;
    const percentage = Math.round((covered / coverage.length) * 100);

    // Bonus for depth
    const deepCoverage = coverage.filter(
      t => t.depth === 'deep' || t.depth === 'moderate'
    ).length;
    const depthBonus = Math.round((deepCoverage / coverage.length) * 20);

    const finalScore = Math.min(100, percentage + depthBonus);

    return {
      score: finalScore,
      label:
        finalScore >= 80
          ? 'Excellent'
          : finalScore >= 60
            ? 'Good'
            : finalScore >= 40
              ? 'Fair'
              : 'Poor',
    };
  }

  // ============================================================
  // HELPER METHODS - Competitive Analysis
  // ============================================================

  private static _calculateCompetitorAverages(
    analyses: CompetitorMetrics[]
  ): ContentMetrics {
    if (analyses.length === 0) {
      return {
        wordCount: 0,
        headingCount: 0,
        imageCount: 0,
        listCount: 0,
      };
    }

    return {
      wordCount: Math.round(
        analyses.reduce((sum, a) => sum + a.wordCount, 0) / analyses.length
      ),
      headingCount: Math.round(
        analyses.reduce((sum, a) => sum + a.headingCount, 0) / analyses.length
      ),
      imageCount: Math.round(
        analyses.reduce((sum, a) => sum + a.imageCount, 0) / analyses.length
      ),
      listCount: Math.round(
        analyses.reduce((sum, a) => sum + a.listCount, 0) / analyses.length
      ),
    };
  }

  private static _compareToCompetitors(
    yours: ContentMetrics,
    averages: ContentMetrics
  ): ContentComparison {
    return {
      wordCount: {
        value: yours.wordCount,
        average: averages.wordCount,
        difference: yours.wordCount - averages.wordCount,
        percentage:
          averages.wordCount > 0
            ? Math.round((yours.wordCount / averages.wordCount) * 100)
            : 100,
        status:
          yours.wordCount >= averages.wordCount * 0.9 &&
          yours.wordCount <= averages.wordCount * 1.1
            ? 'competitive'
            : yours.wordCount > averages.wordCount
              ? 'longer'
              : 'shorter',
      },
      headingCount: {
        value: yours.headingCount,
        average: averages.headingCount,
        difference: yours.headingCount - averages.headingCount,
        status:
          yours.headingCount >= averages.headingCount ? 'competitive' : 'below',
      },
      imageCount: {
        value: yours.imageCount,
        average: averages.imageCount,
        difference: yours.imageCount - averages.imageCount,
        status:
          yours.imageCount >= averages.imageCount ? 'competitive' : 'below',
      },
      listCount: {
        value: yours.listCount,
        average: averages.listCount,
        difference: yours.listCount - averages.listCount,
        status: yours.listCount >= averages.listCount ? 'competitive' : 'below',
      },
    };
  }

  private static _generateCompetitiveInsights(data: {
    yourAnalysis: ContentMetrics;
    averages: ContentMetrics;
    comparison: ContentComparison;
    competitorAnalyses: CompetitorMetrics[];
  }): RecommendationType[] {
    const insights: RecommendationType[] = [];
    const { comparison } = data;

    // Word count insights
    if (comparison.wordCount.status === 'shorter') {
      insights.push({
        type: 'warning',
        category: 'length',
        title: 'Content Length Below Average',
        message: `Your content is ${Math.abs(comparison.wordCount.difference)} words shorter than competitor average. Consider expanding.`,
      });
    } else if (comparison.wordCount.status === 'longer') {
      insights.push({
        type: 'success',
        category: 'length',
        title: 'Content Length Above Average',
        message: `Your content is ${comparison.wordCount.difference} words longer than competitors.`,
      });
    } else {
      insights.push({
        type: 'success',
        category: 'length',
        title: 'Competitive Content Length',
        message: 'Your content length matches competitor standards.',
      });
    }

    // Heading insights
    if (comparison.headingCount.status === 'below') {
      insights.push({
        type: 'info',
        category: 'structure',
        title: 'Fewer Headings Than Competitors',
        message: `Add ${Math.abs(comparison.headingCount.difference)} more headings to match competitor structure.`,
      });
    }

    // Image insights
    if (comparison.imageCount.status === 'below') {
      insights.push({
        type: 'info',
        category: 'media',
        title: 'Fewer Images Than Competitors',
        message: `Consider adding ${Math.abs(comparison.imageCount.difference)} more images to match competitor visual content.`,
      });
    }

    // List insights
    if (comparison.listCount.status === 'below') {
      insights.push({
        type: 'info',
        category: 'formatting',
        title: 'Fewer Lists Than Competitors',
        message:
          'Competitors use more lists. Consider formatting information as bulleted or numbered lists.',
      });
    }

    if (insights.filter(i => i.type === 'success').length === insights.length) {
      insights.push({
        type: 'success',
        category: 'overall',
        title: 'Competitive Content',
        message: 'Your content is competitive with top-ranking pages!',
      });
    }

    return insights;
  }

  private static _calculateCompetitiveScore(
    comparison: ContentComparison
  ): ScoreResult {
    let score = 0;
    let maxScore = 0;

    // Word count (40 points)
    maxScore += 40;
    if (comparison.wordCount.status === 'competitive') score += 40;
    else if (comparison.wordCount.status === 'longer') score += 35;
    else if (
      comparison.wordCount.percentage &&
      comparison.wordCount.percentage >= 70
    )
      score += 25;
    else score += 10;

    // Headings (20 points)
    maxScore += 20;
    if (comparison.headingCount.status === 'competitive') score += 20;
    else if (comparison.headingCount.difference >= -2) score += 15;
    else score += 5;

    // Images (20 points)
    maxScore += 20;
    if (comparison.imageCount.status === 'competitive') score += 20;
    else if (comparison.imageCount.difference >= -2) score += 15;
    else score += 5;

    // Lists (20 points)
    maxScore += 20;
    if (comparison.listCount.status === 'competitive') score += 20;
    else if (comparison.listCount.difference >= -1) score += 15;
    else score += 5;

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return {
      score: percentage,
      label:
        percentage >= 80
          ? 'Highly Competitive'
          : percentage >= 60
            ? 'Competitive'
            : percentage >= 40
              ? 'Needs Improvement'
              : 'Below Average',
    };
  }
}

export default ContentServices;
