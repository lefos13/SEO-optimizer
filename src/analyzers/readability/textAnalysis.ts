/**
 * Text Analysis Utilities
 * Tokenization, syllable counting, sentence/paragraph analysis
 */

import type { LanguageConfig } from './readabilityTypes';

/**
 * Tokenize text into words (alphanumeric sequences)
 */
export function tokenizeWords(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(/\b[a-zA-Z0-9\u0370-\u03FF\u1F00-\u1FFF]+\b/g);
  return matches || [];
}

/**
 * Split text into sentences
 */
export function splitSentences(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  // Split on sentence terminators, keeping terminators
  const sentences = text
    .split(/([.!?]+\s+)/)
    .filter((s: string) => s.trim().length > 0);

  // Recombine sentences with their terminators
  const result: string[] = [];
  for (let i = 0; i < sentences.length; i++) {
    if (i % 2 === 0) {
      const sentence = sentences[i] + (sentences[i + 1] || '');
      if (sentence.trim().length > 0) {
        result.push(sentence.trim());
      }
    }
  }

  return result.length > 0 ? result : [text];
}

/**
 * Split text into paragraphs
 * Handles both double newlines (\n\n) and single newlines (\n)
 * for better plain text support
 */
export function splitParagraphs(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  // Try to split by one or more newlines
  // This works for both plain text (single \n) and markdown (double \n\n)
  const paragraphs = text
    .split(/\n+/)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);

  return paragraphs;
}

/**
 * Count syllables in a word
 */
export function countSyllables(
  word: string,
  langConfig: LanguageConfig
): number {
  if (!word || typeof word !== 'string') return 0;

  const cleanWord = word.toLowerCase().trim();
  if (cleanWord.length === 0) return 0;

  // Count vowel groups
  const matches = cleanWord.match(langConfig.vowelGroups);
  let count = matches ? matches.length : 0;

  // Adjust for silent 'e' in English
  if (langConfig.code === 'en' && cleanWord.endsWith('e') && count > 1) {
    count--;
  }

  // Minimum one syllable per word
  return Math.max(count, 1);
}

/**
 * Check if a word is complex (has more syllables than threshold)
 */
export function isComplexWord(
  word: string,
  langConfig: LanguageConfig
): boolean {
  return countSyllables(word, langConfig) >= langConfig.complexThreshold;
}

/**
 * Count total syllables in text
 */
export function countTotalSyllables(
  words: string[],
  langConfig: LanguageConfig
): number {
  return words.reduce(
    (sum: number, word: string) => sum + countSyllables(word, langConfig),
    0
  );
}

/**
 * Count complex words in array
 */
export function countComplexWords(
  words: string[],
  langConfig: LanguageConfig
): number {
  return words.filter((word: string) => isComplexWord(word, langConfig)).length;
}

/**
 * Calculate vocabulary richness (unique words / total words)
 */
export function calculateVocabularyRichness(words: string[]): number {
  if (words.length === 0) return 0;
  const uniqueWords = new Set(words.map((w: string) => w.toLowerCase()));
  return uniqueWords.size / words.length;
}

/**
 * Calculate median of an array of numbers
 */
export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const sorted = [...numbers].sort((a: number, b: number) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    const left = sorted[mid - 1] ?? 0;
    const right = sorted[mid] ?? 0;
    return (left + right) / 2;
  }
  return sorted[mid] ?? 0;
}

/**
 * Count characters in text (excluding whitespace)
 */
export function countCharacters(text: string): number {
  return text.replace(/\s/g, '').length;
}

/**
 * Calculate average sentence length
 */
export function calculateAverageSentenceLength(
  wordCount: number,
  sentenceCount: number
): number {
  if (sentenceCount === 0) return 0;
  return wordCount / sentenceCount;
}

/**
 * Calculate average syllables per word
 */
export function calculateAverageSyllablesPerWord(
  syllableCount: number,
  wordCount: number
): number {
  if (wordCount === 0) return 0;
  return syllableCount / wordCount;
}

/**
 * Calculate complex word ratio
 */
export function calculateComplexWordRatio(
  complexWordCount: number,
  wordCount: number
): number {
  if (wordCount === 0) return 0;
  return complexWordCount / wordCount;
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(wordCount: number, wpm: number): number {
  if (wpm === 0) return 0;
  return Math.ceil(wordCount / wpm);
}

/**
 * Get longest sentence from array
 */
export function getLongestSentence(
  sentences: string[]
): { text: string; length: number } | null {
  if (sentences.length === 0) return null;

  let longest = sentences[0] ?? '';
  let maxWords = tokenizeWords(longest).length;

  for (const sentence of sentences) {
    const wordCount = tokenizeWords(sentence).length;
    if (wordCount > maxWords) {
      maxWords = wordCount;
      longest = sentence;
    }
  }

  return { text: longest, length: maxWords };
}

/**
 * Get shortest sentence from array
 */
export function getShortestSentence(
  sentences: string[]
): { text: string; length: number } | null {
  if (sentences.length === 0) return null;

  let shortest = sentences[0] ?? '';
  let minWords = tokenizeWords(shortest).length;

  for (const sentence of sentences) {
    const wordCount = tokenizeWords(sentence).length;
    if (wordCount < minWords && wordCount > 0) {
      minWords = wordCount;
      shortest = sentence;
    }
  }

  return { text: shortest, length: minWords };
}

/**
 * Filter sentences by length threshold
 */
export function filterSentencesByLength(
  sentences: string[],
  threshold: number,
  comparison: 'above' | 'below'
): Array<{ text: string; length: number }> {
  return sentences
    .map((text: string) => ({ text, length: tokenizeWords(text).length }))
    .filter(({ length }) =>
      comparison === 'above' ? length > threshold : length < threshold
    );
}

/**
 * Create length distribution buckets
 */
export function createLengthDistribution(
  lengths: number[],
  bucketSize: number
): Array<{ range: string; count: number }> {
  if (lengths.length === 0) return [];

  const max = Math.max(...lengths);
  const buckets: Array<{ range: string; count: number }> = [];

  for (let i = 0; i <= max; i += bucketSize) {
    const start = i;
    const end = i + bucketSize - 1;
    const count = lengths.filter(
      (len: number) => len >= start && len <= end
    ).length;

    if (count > 0) {
      buckets.push({
        range: `${start}-${end}`,
        count,
      });
    }
  }

  return buckets;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
