/**
 * Language Configuration for Readability Analysis
 * Supports English (EN) and Greek (EL)
 */

import type { LanguageConfig } from './readabilityTypes';

export const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
  EN: {
    code: 'en',
    name: 'English',
    vowels: /[aeiouAEIOU]/,
    vowelGroups: /[aeiouyAEIOUY]+/g,
    complexThreshold: 3,
    fleschConstants: { a: 206.835, b: 1.015, c: 84.6 },
    minWords: 100,
    defaultWpm: 200,
    guidance: [
      {
        title: 'Use Short Sentences',
        description: 'Keep sentences under 20 words for better readability.',
      },
      {
        title: 'Use Simple Words',
        description:
          'Replace complex words with simpler alternatives where possible.',
      },
      {
        title: 'Break Up Paragraphs',
        description:
          'Keep paragraphs to 3-5 sentences for better comprehension.',
      },
      {
        title: 'Use Active Voice',
        description:
          'Active voice makes your content more engaging and easier to read.',
      },
      {
        title: 'Include Transition Words',
        description:
          'Use transition words like "however", "therefore", and "additionally" to improve flow.',
      },
    ],
  },
  EL: {
    code: 'el',
    name: 'Greek',
    vowels: /[αειουωηάέίόύώήΑΕΙΟΥΩΗΆΈΊΌΎΏΉ]/,
    vowelGroups: /[αειουωηάέίόύώήΑΕΙΟΥΩΗΆΈΊΌΎΏΉ]+/g,
    complexThreshold: 4,
    fleschConstants: { a: 206.835, b: 1.015, c: 84.6 },
    minWords: 100,
    defaultWpm: 180,
    guidance: [
      {
        title: 'Χρησιμοποιήστε Απλές Προτάσεις',
        description:
          'Κρατήστε τις προτάσεις κάτω από 20 λέξεις για καλύτερη αναγνωσιμότητα.',
      },
      {
        title: 'Χρησιμοποιήστε Απλές Λέξεις',
        description:
          'Αντικαταστήστε πολύπλοκες λέξεις με απλούστερες εναλλακτικές όπου είναι δυνατόν.',
      },
      {
        title: 'Χωρίστε τις Παραγράφους',
        description:
          'Κρατήστε τις παραγράφους στις 3-5 προτάσεις για καλύτερη κατανόηση.',
      },
      {
        title: 'Χρησιμοποιήστε Ενεργητική Φωνή',
        description:
          'Η ενεργητική φωνή κάνει το περιεχόμενό σας πιο ελκυστικό και ευανάγνωστο.',
      },
      {
        title: 'Συμπεριλάβετε Συνδετικές Λέξεις',
        description:
          'Χρησιμοποιήστε συνδετικές λέξεις όπως "ωστόσο", "επομένως", και "επιπλέον" για να βελτιώσετε τη ροή.',
      },
    ],
  },
};

/**
 * Get language configuration by code
 */
export function getLanguageConfig(langCode: string): LanguageConfig {
  const normalizedCode = langCode.toUpperCase();
  return LANGUAGE_CONFIG[normalizedCode] || LANGUAGE_CONFIG['EN']!;
}

/**
 * Detect language from text content (basic detection)
 */
export function detectLanguage(text: string): string {
  // Check for Greek characters
  const greekChars = /[α-ωΑ-Ω]/;
  if (greekChars.test(text)) {
    return 'EL';
  }
  return 'EN';
}

/**
 * Get all supported language codes
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGE_CONFIG);
}
