/**
 * Readability Scoring and Assessment Utilities
 */

import type {
  ReadabilityTotals,
  StructureAnalysis,
  SentenceAnalysis,
  ParagraphAnalysis,
  Recommendation,
  ReadingLevels,
  Summary,
} from './readabilityTypes';
import * as textAnalysis from './textAnalysis';
import type { LanguageConfig } from './readabilityTypes';

/**
 * Calculate readability totals from text
 */
export function calculateTotals(
  text: string,
  langConfig: LanguageConfig
): ReadabilityTotals {
  const words = textAnalysis.tokenizeWords(text);
  const sentences = textAnalysis.splitSentences(text);
  const paragraphs = textAnalysis.splitParagraphs(text);
  const characters = textAnalysis.countCharacters(text);
  const syllables = textAnalysis.countTotalSyllables(words, langConfig);
  const complexWords = textAnalysis.countComplexWords(words, langConfig);
  const vocabularyRichness = textAnalysis.calculateVocabularyRichness(words);

  return {
    words: words.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    characters,
    syllables,
    complexWords,
    averageSentenceLength: textAnalysis.calculateAverageSentenceLength(
      words.length,
      sentences.length
    ),
    averageSyllablesPerWord: textAnalysis.calculateAverageSyllablesPerWord(
      syllables,
      words.length
    ),
    complexWordRatio: textAnalysis.calculateComplexWordRatio(
      complexWords,
      words.length
    ),
    vocabularyRichness,
  };
}

/**
 * Analyze sentence structure
 */
export function analyzeSentences(text: string): SentenceAnalysis {
  const sentences = textAnalysis.splitSentences(text);
  const lengths = sentences.map(
    (s: string) => textAnalysis.tokenizeWords(s).length
  );

  return {
    count: sentences.length,
    averageLength:
      lengths.length > 0
        ? lengths.reduce((sum: number, len: number) => sum + len, 0) /
          lengths.length
        : 0,
    medianLength: textAnalysis.calculateMedian(lengths),
    longestSentence: textAnalysis.getLongestSentence(sentences),
    shortestSentence: textAnalysis.getShortestSentence(sentences),
    longSentences: textAnalysis.filterSentencesByLength(sentences, 25, 'above'),
    shortSentences: textAnalysis.filterSentencesByLength(sentences, 5, 'below'),
    distribution: textAnalysis.createLengthDistribution(lengths, 5),
  };
}

/**
 * Analyze paragraph structure
 */
export function analyzeParagraphs(
  text: string,
  langConfig: LanguageConfig
): ParagraphAnalysis {
  const paragraphs = textAnalysis.splitParagraphs(text);
  const items = paragraphs.map((para: string, index: number) => {
    const words = textAnalysis.tokenizeWords(para);
    const sentences = textAnalysis.splitSentences(para);
    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    const syllables = textAnalysis.countTotalSyllables(words, langConfig);
    const avgSyllablesPerWord = syllables / Math.max(words.length, 1);

    // Calculate Flesch Reading Ease for this paragraph
    const { a, b, c } = langConfig.fleschConstants;
    const readingEase = a - b * avgSentenceLength - c * avgSyllablesPerWord;

    let label = '';
    if (readingEase >= 80) label = 'Very Easy';
    else if (readingEase >= 60) label = 'Easy';
    else if (readingEase >= 40) label = 'Moderate';
    else if (readingEase >= 20) label = 'Difficult';
    else label = 'Very Difficult';

    return {
      index: index + 1,
      text: textAnalysis.truncateText(para, 100),
      words: words.length,
      sentences: sentences.length,
      averageSentenceLength: avgSentenceLength,
      readingEase: Math.round(readingEase),
      label,
    };
  });

  const wordCounts = items.map(p => p.words);
  const sentenceCounts = items.map(p => p.sentences);

  return {
    count: paragraphs.length,
    averageWords:
      wordCounts.length > 0
        ? wordCounts.reduce((sum: number, count: number) => sum + count, 0) /
          wordCounts.length
        : 0,
    averageSentences:
      sentenceCounts.length > 0
        ? sentenceCounts.reduce(
            (sum: number, count: number) => sum + count,
            0
          ) / sentenceCounts.length
        : 0,
    longParagraphs: items.filter(p => p.words > 150),
    shortParagraphs: items.filter(p => p.words < 30 && p.words > 0),
    items,
    distribution: textAnalysis.createLengthDistribution(wordCounts, 50),
  };
}

/**
 * Generate recommendations based on analysis
 */
export function generateRecommendations(
  totals: ReadabilityTotals,
  structure: StructureAnalysis,
  compositeScore: number
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Check word count
  if (totals.words < 100) {
    recommendations.push({
      type: 'warning',
      title: 'Content Too Short',
      message: `Your content has only ${totals.words} words. Aim for at least 100 words for meaningful readability analysis.`,
    });
  }

  // Check sentence length
  if (totals.averageSentenceLength > 25) {
    recommendations.push({
      type: 'critical',
      title: 'Sentences Too Long',
      message: `Average sentence length is ${Math.round(totals.averageSentenceLength)} words. Try to keep sentences under 20 words for better readability.`,
    });
  } else if (totals.averageSentenceLength < 10) {
    recommendations.push({
      type: 'info',
      title: 'Sentences Very Short',
      message: `Average sentence length is ${Math.round(totals.averageSentenceLength)} words. While short sentences are good, varying sentence length can improve flow.`,
    });
  }

  // Check complex words
  if (totals.complexWordRatio > 0.15) {
    recommendations.push({
      type: 'warning',
      title: 'Too Many Complex Words',
      message: `${Math.round(totals.complexWordRatio * 100)}% of words are complex. Consider using simpler alternatives where possible.`,
    });
  }

  // Check paragraph length
  if (structure.paragraphs.longParagraphs.length > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Long Paragraphs Detected',
      message: `${structure.paragraphs.longParagraphs.length} paragraph(s) have more than 150 words. Break them into smaller chunks for better readability.`,
    });
  }

  // Check vocabulary richness
  if (totals.vocabularyRichness < 0.4 && totals.words > 100) {
    recommendations.push({
      type: 'info',
      title: 'Limited Vocabulary Diversity',
      message: 'Consider using more varied vocabulary to keep readers engaged.',
    });
  }

  // Overall score assessment
  if (compositeScore >= 70) {
    recommendations.push({
      type: 'success',
      title: 'Excellent Readability',
      message: 'Your content is very easy to read and understand!',
    });
  } else if (compositeScore < 30) {
    recommendations.push({
      type: 'critical',
      title: 'Readability Needs Improvement',
      message:
        'Your content is difficult to read. Focus on shorter sentences and simpler words.',
    });
  }

  return recommendations;
}

/**
 * Determine reading levels and audience fit
 */
export function determineReadingLevels(gradeValue: number): ReadingLevels {
  const educationStages = [
    { label: 'Elementary School', range: '1st-5th grade', min: 1, max: 5 },
    { label: 'Middle School', range: '6th-8th grade', min: 6, max: 8 },
    { label: 'High School', range: '9th-12th grade', min: 9, max: 12 },
    { label: 'College', range: 'Undergraduate', min: 13, max: 16 },
    { label: 'Graduate', range: 'Graduate level', min: 17, max: 20 },
  ];

  const defaultStage = educationStages[educationStages.length - 1];
  const found = educationStages.find(
    stage => gradeValue >= stage.min && gradeValue <= stage.max
  );
  // Ensure currentStage is never undefined for downstream use
  const currentStage = (found ?? defaultStage) as NonNullable<
    typeof defaultStage
  >;

  const audienceFit: ReadingLevels['audienceFit'] = [
    { audience: 'General Public', suitable: gradeValue <= 8 },
    {
      audience: 'High School Students',
      suitable: gradeValue >= 7 && gradeValue <= 12,
    },
    {
      audience: 'College Students',
      suitable: gradeValue >= 10 && gradeValue <= 16,
    },
    { audience: 'Academic/Professional', suitable: gradeValue >= 13 },
  ];

  return {
    recommendedGrade: Math.round(gradeValue),
    recommendedLabel: currentStage.label,
    educationStages: educationStages.map(stage => ({
      label: stage.label,
      range: stage.range,
    })),
    audienceFit,
  };
}

/**
 * Generate content summary
 */
export function generateSummary(
  totals: ReadabilityTotals,
  compositeScore: number,
  langConfig: LanguageConfig
): Summary {
  const readingTime = textAnalysis.calculateReadingTime(
    totals.words,
    langConfig.defaultWpm
  );

  let pacing = '';
  if (readingTime <= 2) pacing = 'Quick read';
  else if (readingTime <= 5) pacing = 'Short read';
  else if (readingTime <= 10) pacing = 'Medium read';
  else pacing = 'Long read';

  let audience = '';
  if (compositeScore >= 70) audience = 'General audience';
  else if (compositeScore >= 50) audience = 'High school and above';
  else if (compositeScore >= 30) audience = 'College level';
  else audience = 'Advanced/Academic';

  return {
    readingTimeMinutes: readingTime,
    pacing,
    audience,
    wordCount: totals.words,
    language: langConfig.name,
  };
}
