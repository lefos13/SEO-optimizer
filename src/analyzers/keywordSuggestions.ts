/**
 * Keyword Suggestions Engine
 * Extracts meaningful keywords from content, filtering out code and common words
 *
 * Features:
 * - Filters HTML/CSS/JS code patterns
 * - Removes common stopwords (English & Greek)
 * - Language-aware word detection
 * - Frequency-based ranking
 * - Multi-word phrase support
 * - Returns top suggestions sorted by relevance
 */

import * as htmlParser from './htmlParser';

/**
 * Extended stopwords list (English & Greek)
 * Includes common words that should be filtered from keyword suggestions
 */
export const STOPWORDS = new Set([
  // English stopwords
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'can',
  'could',
  'did',
  'do',
  'does',
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'had',
  'has',
  'have',
  'having',
  'he',
  'her',
  'here',
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'itself',
  'just',
  'me',
  'might',
  'more',
  'most',
  'my',
  'myself',
  'no',
  'nor',
  'not',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'same',
  'she',
  'should',
  'so',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'whom',
  'why',
  'with',
  'would',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves',
  'will',
  'could',
  'should',
  'it',
  'your',
  'you',
  'its',
  'our',

  // Greek stopwords
  'ο',
  'η',
  'το',
  'οι',
  'τα',
  'την',
  'των',
  'τον',
  'του',
  'της',
  'και',
  'που',
  'να',
  'για',
  'είναι',
  'σε',
  'με',
  'αν',
  'από',
  'μόνο',
  'αλλά',
  'δεν',
  'όχι',
  'ή',
  'ως',
  'αυτό',
  'αυτή',
  'αυτοί',
  'αυτές',
  'αυτά',
  'πολύ',
  'πολλά',
  'λίγο',
  'λίγα',
  'κάτι',
  'άλλο',
  'άλλα',
  'άλλη',
  'άλλες',
  'κάποιος',
  'κάποια',
  'κάποιο',
  'κάποιοι',
  'κάποιες',
  'ποιος',
  'ποια',
  'ποιο',
  'ποιοι',
  'ποιες',
  'πώς',
  'πού',
  'πότε',
  'γιατί',
  'ποσο',
  'ποσα',
  'είμαι',
  'είσαι',
  'εστε',
  'ειμαστε',
  'ειστε',
  'εινε',
  'ημουν',
  'ησουν',
  'ημασταν',
  'ησασταν',
  'θα',
  'ας',
]);

/**
 * Code pattern detectors
 * Regex patterns to identify and filter out code elements
 */
export const CODE_PATTERNS = {
  htmlAttribute: /^(href|src|alt|title|class|id|name|value|data-[\w-]+)$/i,
  camelCase: /^[a-z]+[A-Z][a-zA-Z0-9]*$/,
  snakeCase: /^[a-z]+_[a-z0-9_]+$/,
  kebabCase: /^[a-z]+(-[a-z0-9]+)+$/,
  cssUnit: /^(px|em|rem|pt|cm|mm|in|pc|ex|ch|vw|vh|vmin|vmax|%)$/i,
  cssProperty:
    /^(background|color|border|margin|padding|font|width|height|display|position|flex|grid)$/i,
  jsKeyword:
    /^(function|const|let|var|return|if|else|for|while|do|switch|case|try|catch|finally|async|await|class|extends|constructor)$/i,
  numericOnly: /^\d+$/,
  singleChar: /^.$/,
  urlLike: /^(http|https|www|ftp|\.com|\.org|\.net|\.edu)$/i,
  minified: /^[a-z]{1,2}\d+$|^_[a-zA-Z0-9]+$/,
};

/**
 * Keyword suggestion object
 */
export interface KeywordSuggestion {
  keyword: string;
  frequency: number;
  relevance: number;
  type: 'word' | 'phrase';
}

/**
 * Detect if a word is likely code or technical jargon
 * @param word - Word to check
 * @returns True if word appears to be code
 */
export function isCodeWord(word: string): boolean {
  if (!word || word.length === 0) return true;

  // Check against patterns
  if (CODE_PATTERNS.htmlAttribute.test(word)) return true;
  if (CODE_PATTERNS.camelCase.test(word)) return true;
  if (CODE_PATTERNS.snakeCase.test(word)) return true;
  if (CODE_PATTERNS.kebabCase.test(word)) return true;
  if (CODE_PATTERNS.cssUnit.test(word)) return true;
  if (CODE_PATTERNS.cssProperty.test(word)) return true;
  if (CODE_PATTERNS.jsKeyword.test(word)) return true;
  if (CODE_PATTERNS.numericOnly.test(word)) return true;
  if (CODE_PATTERNS.singleChar.test(word)) return true;
  if (CODE_PATTERNS.urlLike.test(word)) return true;
  if (CODE_PATTERNS.minified.test(word)) return true;

  return false;
}

/**
 * Detect if a word contains mostly consonants or special patterns
 * indicating it's not a real language word
 * @param word - Word to check
 * @returns True if word appears to be real language
 */
export function isRealLanguageWord(word: string): boolean {
  if (!word || word.length < 3) return false;

  // Count vowels (for both English and Greek)
  const vowels = /[aeiouoyαειουω]/gi;
  const vocalCount = (word.match(vowels) || []).length;

  // Words should have at least 30% vowels to be considered real language
  const vowelRatio = vocalCount / word.length;
  if (vowelRatio < 0.25) return false;

  // Filter out words that look like hex colors or other code
  if (/^#[0-9a-f]+$/i.test(word)) return false;
  if (/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(word)) return false;

  // Consecutive repeated characters (min 3) usually indicate code/noise
  if (/(.)\1{2,}/.test(word)) return false;

  return true;
}

/**
 * Extract multi-word phrases from text
 * Looks for common 2-3 word phrases
 * @param words - Array of words
 * @returns Map of phrases and their frequencies
 */
function extractPhrases(words: string[]): Map<string, number> {
  const phrases = new Map<string, number>();

  // 2-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
  }

  // 3-word phrases (less frequent)
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
  }

  // Only keep phrases that appear at least twice
  return new Map([...phrases].filter(([_, count]) => count >= 2));
}

/**
 * Calculate relevance score for a keyword
 * Based on frequency, position, and length
 * @param frequency - How many times the word appears
 * @param totalWords - Total words in text
 * @param length - Word length
 * @returns Relevance score (0-100)
 */
function calculateRelevanceScore(
  frequency: number,
  totalWords: number,
  length: number
): number {
  // Frequency score (0-60 points)
  const frequencyScore = Math.min((frequency / (totalWords * 0.01)) * 60, 60);

  // Length bonus (longer words are typically more specific)
  // 3-5 chars: 0 points, 6-8 chars: 5-10 points, 9+ chars: 15 points
  let lengthBonus = 0;
  if (length >= 6 && length <= 8) {
    lengthBonus = 5;
  } else if (length > 8) {
    lengthBonus = 15;
  }

  // Phrase bonus (multi-word phrases get bonus)
  const phraseBonus = length.toString().split(' ').length > 1 ? 10 : 0;

  return Math.min(frequencyScore + lengthBonus + phraseBonus, 100);
}

/**
 * Suggest keywords from content
 * @param html - HTML content to analyze
 * @param maxSuggestions - Maximum number of suggestions to return
 * @param _language - Content language ('en' or 'el') - reserved for future language-specific filtering
 * @returns Array of keyword suggestions with scores
 */
export function suggestKeywords(
  html: string,
  maxSuggestions: number = 10,
  _language?: string
): KeywordSuggestion[] {
  try {
    if (!html || typeof html !== 'string' || html.trim().length === 0) {
      return [];
    }

    // Parse HTML or text to get clean text for analysis
    const parsed = htmlParser.parse(html);
    // If parser returns text, use it; otherwise use raw html/text
    const cleanText =
      parsed.text && parsed.text.trim().length > 0 ? parsed.text : html;

    if (cleanText.length < 50) {
      return []; // Not enough content
    }

    // Split into words and normalize
    const words = cleanText
      .toLowerCase()
      .split(/[\s\-_/]+/)
      .filter(word => {
        // Remove empty strings and words that are too short
        if (!word || word.length < 3) return false;

        // Remove punctuation
        word = word.replace(/[^\w\u0370-\u03FF]/g, '');
        if (!word || word.length < 3) return false;

        // Check if it's a stopword
        if (STOPWORDS.has(word)) return false;

        // Check if it's code
        if (isCodeWord(word)) return false;

        // Check if it's a real language word
        if (!isRealLanguageWord(word)) return false;

        return true;
      })
      .filter(w => w && w.length >= 3);

    if (words.length === 0) {
      return [];
    }

    // Count word frequencies
    const wordFrequencies = new Map<string, number>();
    words.forEach(word => {
      wordFrequencies.set(word, (wordFrequencies.get(word) || 0) + 1);
    });

    // Extract multi-word phrases
    const phrases = extractPhrases(words);

    // Combine single words and phrases
    const allKeywords = new Map([...wordFrequencies, ...phrases]);

    // Calculate relevance scores for all keywords
    const suggestions = Array.from(allKeywords.entries())
      .map(([keyword, frequency]) => {
        const relevanceScore = calculateRelevanceScore(
          frequency,
          words.length,
          keyword.length
        );

        return {
          keyword,
          frequency,
          relevance: Math.round(relevanceScore),
          type: (keyword.includes(' ') ? 'phrase' : 'word') as
            | 'word'
            | 'phrase',
        };
      })
      // Sort by relevance score (descending), then by frequency
      .sort((a, b) => {
        if (b.relevance !== a.relevance) {
          return b.relevance - a.relevance;
        }
        return b.frequency - a.frequency;
      })
      // Take top N suggestions
      .slice(0, maxSuggestions);

    // Log frequency for each suggested keyword and verify against clean text
    console.log(
      '[KEYWORD-SUGGESTIONS] Verifying suggestions against clean text:'
    );
    suggestions.forEach(s => {
      // Test the same regex pattern that density calculator will use
      const normalizedKeyword = s.keyword.toLowerCase().trim();
      const escapedKeyword = normalizedKeyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );
      const isPhrase = normalizedKeyword.includes(' ');
      const regex = isPhrase
        ? new RegExp(escapedKeyword, 'gi')
        : new RegExp(`\\b${escapedKeyword}\\b`, 'gi');

      const matches = cleanText.toLowerCase().match(regex);
      const actualCount = matches ? matches.length : 0;

      console.log(
        `[KEYWORD-SUGGESTIONS] '${s.keyword}': found ${s.frequency} times in word array, ${actualCount} times in clean text (regex)`
      );

      // Show first match context if found
      if (actualCount > 0) {
        const firstMatchIndex = cleanText
          .toLowerCase()
          .indexOf(normalizedKeyword);
        if (firstMatchIndex >= 0) {
          const contextStart = Math.max(0, firstMatchIndex - 30);
          const contextEnd = Math.min(
            cleanText.length,
            firstMatchIndex + normalizedKeyword.length + 30
          );
          console.log(
            `[KEYWORD-SUGGESTIONS] Context: "...${cleanText.substring(contextStart, contextEnd)}..."`
          );
        }
      }
    });

    return suggestions;
  } catch (error) {
    console.error('[KEYWORD-SUGGESTIONS] Error suggesting keywords:', error);
    return [];
  }
}

/**
 * Get simple keyword suggestions (for backward compatibility)
 * Returns just the keyword strings
 * @param html - HTML content
 * @param maxSuggestions - Max suggestions
 * @param _language - Language code - reserved for future use
 * @returns Array of keyword strings
 */
export function getSuggestionStrings(
  html: string,
  maxSuggestions: number = 10,
  _language?: string
): string[] {
  const suggestions = suggestKeywords(html, maxSuggestions, _language);
  return suggestions.map(s => s.keyword);
}
