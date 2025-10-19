/**
 * Main Readability Services
 * Orchestrates all readability analysis modules
 */

import * as htmlParser from './htmlParser';
import type {
  ReadabilityAnalysisResult,
  LanguageGuidance,
} from './readability/readabilityTypes';
import { getLanguageConfig } from './readability/languageConfig';
import {
  calculateAllFormulas,
  calculateCompositeScore,
} from './readability/readabilityFormulas';
import {
  calculateTotals,
  analyzeSentences,
  analyzeParagraphs,
  generateRecommendations,
  determineReadingLevels,
  generateSummary,
} from './readability/readabilityScoring';
import { generateDynamicLanguageGuidance } from './readability/seoReadability';
import * as textAnalysis from './readability/textAnalysis';

export class ReadabilityServices {
  /**
   * Analyze readability using multiple formulas and structural insights
   */
  static analyze(
    content: string,
    options: { language?: string } = {}
  ): ReadabilityAnalysisResult {
    const start = Date.now();
    const languageCode = (options.language || 'en').toLowerCase();
    const langConfig = getLanguageConfig(languageCode);

    const raw = typeof content === 'string' ? content : '';
    const trimmed = raw.trim();

    if (!trimmed) {
      return this._buildEmptyResult(langConfig, start, 'No content provided');
    }

    // Parse HTML or use plain text
    const parsed = htmlParser.parse(raw);
    const text =
      parsed.text && parsed.text.trim().length > 0
        ? parsed.text.trim()
        : this._stripFallback(raw);
    const sanitized = text.replace(/\s+/g, ' ').trim();

    if (!sanitized) {
      return this._buildEmptyResult(
        langConfig,
        start,
        'Unable to extract text from content'
      );
    }

    // Calculate basic totals
    const totals = calculateTotals(sanitized, langConfig);

    if (totals.words === 0 || totals.sentences === 0) {
      return this._buildEmptyResult(
        langConfig,
        start,
        'Insufficient textual content'
      );
    }

    // Calculate readability formulas
    const formulas = calculateAllFormulas(
      totals.words,
      totals.sentences,
      totals.characters,
      totals.syllables,
      totals.complexWords,
      langConfig
    );

    // Calculate composite score
    const compositeScore = calculateCompositeScore(formulas);
    const readingTime = textAnalysis.calculateReadingTime(
      totals.words,
      langConfig.defaultWpm
    );
    const compositeWithTime = {
      ...compositeScore,
      readingTimeMinutes: readingTime,
    };

    // Analyze structure
    const structure = {
      sentences: analyzeSentences(sanitized),
      paragraphs: analyzeParagraphs(sanitized, langConfig),
    };

    // Generate recommendations
    const recommendations = generateRecommendations(
      totals,
      structure,
      compositeScore.score
    );

    // Determine reading levels
    const gradeFormulas = formulas.filter(f => f.type === 'grade');
    const avgGrade =
      gradeFormulas.length > 0
        ? gradeFormulas.reduce((sum, f) => sum + f.gradeValue, 0) /
          gradeFormulas.length
        : 0;
    const readingLevels = determineReadingLevels(avgGrade);

    // Generate summary
    const summary = generateSummary(totals, compositeScore.score, langConfig);

    // Generate language guidance
    const languageGuidance: LanguageGuidance = {
      language: langConfig.name,
      notes: this._buildLanguageNotes(langConfig),
      rules: langConfig.guidance,
    };

    // Collect warnings
    const warnings = this._collectWarnings(totals, structure, langConfig);

    return {
      meta: {
        language: langConfig.code,
        languageName: langConfig.name,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - start,
        isInsufficient:
          totals.words < langConfig.minWords || totals.sentences < 3,
        warnings,
      },
      totals,
      compositeScore: compositeWithTime,
      formulas,
      structure,
      recommendations,
      languageGuidance,
      readingLevels,
      summary,
    };
  }

  /**
   * Get overview-specific data (composite score, formulas, totals)
   */
  static analyzeOverview(content: string, options: { language?: string } = {}) {
    const full = this.analyze(content, options);
    return {
      meta: full.meta,
      compositeScore: full.compositeScore,
      formulas: full.formulas,
      totals: full.totals,
      summary: full.summary,
    };
  }

  /**
   * Get structure-specific data (sentences and paragraphs)
   */
  static analyzeStructure(
    content: string,
    options: { language?: string } = {}
  ) {
    const full = this.analyze(content, options);
    return {
      meta: full.meta,
      structure: full.structure,
      totals: {
        words: full.totals.words,
        sentences: full.totals.sentences,
        paragraphs: full.totals.paragraphs,
        averageSentenceLength: full.totals.averageSentenceLength,
      },
    };
  }

  /**
   * Get reading level data (grades and audience fit)
   */
  static analyzeReadingLevels(
    content: string,
    options: { language?: string } = {}
  ) {
    const full = this.analyze(content, options);
    return {
      meta: full.meta,
      readingLevels: full.readingLevels,
      compositeScore: {
        gradeLevel: full.compositeScore.gradeLevel,
        label: full.compositeScore.label,
      },
      formulas: full.formulas.map(f => ({
        id: f.id,
        label: f.label,
        gradeLevel: f.gradeLevel,
        gradeValue: f.gradeValue,
      })),
    };
  }

  /**
   * Get improvement recommendations
   */
  static analyzeImprovements(
    content: string,
    options: { language?: string } = {}
  ) {
    const full = this.analyze(content, options);
    return {
      meta: full.meta,
      recommendations: full.recommendations,
      compositeScore: {
        score: full.compositeScore.score,
        label: full.compositeScore.label,
      },
      totals: {
        words: full.totals.words,
        complexWordRatio: full.totals.complexWordRatio,
        averageSentenceLength: full.totals.averageSentenceLength,
      },
      structure: {
        sentences: {
          longSentences: full.structure.sentences.longSentences,
        },
        paragraphs: {
          longParagraphs: full.structure.paragraphs.longParagraphs,
        },
      },
    };
  }

  /**
   * Get language-specific guidance with dynamic content analysis
   */
  static analyzeLanguageGuidance(
    content: string,
    options: { language?: string } = {}
  ) {
    const full = this.analyze(content, options);

    // Generate dynamic, content-specific language guidance
    const dynamicGuidance = generateDynamicLanguageGuidance(
      full.totals,
      full.structure,
      full.compositeScore,
      full.meta.language
    );

    return {
      meta: full.meta,
      compositeScore: {
        score: full.compositeScore.score,
        label: full.compositeScore.label,
        gradeLevel: full.compositeScore.gradeLevel,
      },
      totals: {
        words: full.totals.words,
        sentences: full.totals.sentences,
        paragraphs: full.totals.paragraphs,
        averageSentenceLength: full.totals.averageSentenceLength,
        complexWordRatio: full.totals.complexWordRatio,
        vocabularyRichness: full.totals.vocabularyRichness,
      },
      languageGuidance: {
        language: full.meta.languageName,
        contentAnalysis: dynamicGuidance.contentAnalysis,
        seoImpact: dynamicGuidance.seoImpact,
        specificIssues: dynamicGuidance.specificIssues,
        actionableAdvice: dynamicGuidance.actionableAdvice,
        strengthsIdentified: dynamicGuidance.strengthsIdentified,
      },
      structure: {
        sentences: {
          count: full.structure.sentences.count,
          averageLength: full.structure.sentences.averageLength,
          longSentences: full.structure.sentences.longSentences.slice(0, 3),
        },
        paragraphs: {
          count: full.structure.paragraphs.count,
          averageWords: full.structure.paragraphs.averageWords,
          longParagraphs: full.structure.paragraphs.longParagraphs.slice(0, 3),
        },
      },
    };
  }

  /**
   * Get live scoring data (minimal payload for real-time updates)
   */
  static analyzeLiveScore(
    content: string,
    options: { language?: string } = {}
  ) {
    const full = this.analyze(content, options);
    return {
      meta: {
        timestamp: full.meta.timestamp,
        language: full.meta.language,
        isInsufficient: full.meta.isInsufficient,
        processingTimeMs: full.meta.processingTimeMs,
      },
      compositeScore: full.compositeScore,
      totals: {
        words: full.totals.words,
        sentences: full.totals.sentences,
        averageSentenceLength: full.totals.averageSentenceLength,
      },
      summary: full.summary,
    };
  }

  // ----------------------------------------------------------
  // Private Helper Methods
  // ----------------------------------------------------------

  /**
   * Build empty result for invalid/insufficient content
   */
  private static _buildEmptyResult(
    langConfig: ReturnType<typeof getLanguageConfig>,
    start: number,
    reason: string
  ): ReadabilityAnalysisResult {
    return {
      meta: {
        language: langConfig.code,
        languageName: langConfig.name,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - start,
        isInsufficient: true,
        warnings: [reason],
      },
      totals: {
        words: 0,
        sentences: 0,
        paragraphs: 0,
        characters: 0,
        syllables: 0,
        complexWords: 0,
        averageSentenceLength: 0,
        averageSyllablesPerWord: 0,
        complexWordRatio: 0,
        vocabularyRichness: 0,
      },
      compositeScore: {
        score: 0,
        label: 'N/A',
        color: 'gray',
        gradeLevel: 'N/A',
        readingTimeMinutes: 0,
      },
      formulas: [],
      structure: {
        sentences: {
          count: 0,
          averageLength: 0,
          medianLength: 0,
          longestSentence: null,
          shortestSentence: null,
          longSentences: [],
          shortSentences: [],
          distribution: [],
        },
        paragraphs: {
          count: 0,
          averageWords: 0,
          averageSentences: 0,
          longParagraphs: [],
          shortParagraphs: [],
          items: [],
          distribution: [],
        },
      },
      recommendations: [
        {
          type: 'warning',
          title: 'Insufficient Content',
          message: reason,
        },
      ],
      languageGuidance: {
        language: langConfig.name,
        notes: '',
        rules: langConfig.guidance,
      },
      readingLevels: {
        recommendedGrade: 0,
        recommendedLabel: 'N/A',
        educationStages: [],
        audienceFit: [],
      },
      summary: {
        readingTimeMinutes: 0,
        pacing: 'N/A',
        audience: 'N/A',
        wordCount: 0,
        language: langConfig.name,
      },
    };
  }

  /**
   * Strip HTML fallback when parser fails
   */
  private static _stripFallback(raw: string): string {
    return raw
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Build language-specific notes
   */
  private static _buildLanguageNotes(
    langConfig: ReturnType<typeof getLanguageConfig>
  ): string {
    if (langConfig.code === 'en') {
      return 'English content is analyzed using US English readability standards. Aim for 60+ readability score for general audiences.';
    } else if (langConfig.code === 'el') {
      return 'Το ελληνικό περιεχόμενο αναλύεται χρησιμοποιώντας προσαρμοσμένες παραμέτρους αναγνωσιμότητας. Στοχεύστε σε βαθμολογία 60+ για γενικό κοινό.';
    }
    return 'Content analyzed using standard readability metrics.';
  }

  /**
   * Collect warnings based on analysis
   */
  private static _collectWarnings(
    totals: ReturnType<typeof calculateTotals>,
    structure:
      | (ReturnType<typeof analyzeSentences> & {
          paragraphs: ReturnType<typeof analyzeParagraphs>;
        })
      | {
          sentences: ReturnType<typeof analyzeSentences>;
          paragraphs: ReturnType<typeof analyzeParagraphs>;
        },
    langConfig: ReturnType<typeof getLanguageConfig>
  ): string[] {
    const warnings: string[] = [];

    if (totals.words < langConfig.minWords) {
      warnings.push(
        `Content length (${totals.words} words) is below recommended minimum of ${langConfig.minWords} words for accurate analysis.`
      );
    }

    if (totals.sentences < 3) {
      warnings.push(
        'Content has fewer than 3 sentences. Results may be less reliable.'
      );
    }

    const structureSentences =
      'sentences' in structure ? structure.sentences : structure;
    if (structureSentences.count > 0 && structureSentences.averageLength > 30) {
      warnings.push(
        'Average sentence length exceeds 30 words. Consider breaking up long sentences.'
      );
    }

    if (totals.complexWordRatio > 0.3) {
      warnings.push(
        'High ratio of complex words (>30%). Content may be difficult for general audiences.'
      );
    }

    return warnings;
  }
}

export default ReadabilityServices;
