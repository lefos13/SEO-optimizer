/**
 * Readability Formula Calculations
 * Implements: Flesch Reading Ease, Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau, ARI
 */

import type { LanguageConfig, ReadabilityFormula, FleschResult } from './readabilityTypes';

/**
 * Calculate Flesch Reading Ease score
 */
export function calculateFleschReadingEase(
  avgSentenceLength: number,
  avgSyllablesPerWord: number,
  langConfig: LanguageConfig
): number {
  const { a, b, c } = langConfig.fleschConstants;
  return a - (b * avgSentenceLength) - (c * avgSyllablesPerWord);
}

/**
 * Get Flesch Reading Ease interpretation
 */
export function interpretFleschScore(score: number): FleschResult {
  let label = '';
  let gradeLabel = '';
  let gradeValue = 0;

  if (score >= 90) {
    label = 'Very Easy';
    gradeLabel = '5th grade';
    gradeValue = 5;
  } else if (score >= 80) {
    label = 'Easy';
    gradeLabel = '6th grade';
    gradeValue = 6;
  } else if (score >= 70) {
    label = 'Fairly Easy';
    gradeLabel = '7th grade';
    gradeValue = 7;
  } else if (score >= 60) {
    label = 'Standard';
    gradeLabel = '8th-9th grade';
    gradeValue = 8;
  } else if (score >= 50) {
    label = 'Fairly Difficult';
    gradeLabel = '10th-12th grade';
    gradeValue = 10;
  } else if (score >= 30) {
    label = 'Difficult';
    gradeLabel = 'College';
    gradeValue = 13;
  } else {
    label = 'Very Difficult';
    gradeLabel = 'College Graduate';
    gradeValue = 16;
  }

  return { score, label, gradeLabel, gradeValue };
}

/**
 * Calculate Flesch-Kincaid Grade Level
 */
export function calculateFleschKincaidGrade(
  avgSentenceLength: number,
  avgSyllablesPerWord: number
): number {
  return (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
}

/**
 * Calculate Gunning Fog Index
 */
export function calculateGunningFog(
  avgSentenceLength: number,
  complexWordRatio: number
): number {
  return 0.4 * (avgSentenceLength + (100 * complexWordRatio));
}

/**
 * Calculate SMOG Index
 */
export function calculateSMOG(
  complexWordCount: number,
  sentenceCount: number
): number {
  if (sentenceCount === 0) return 0;
  return 1.0430 * Math.sqrt(complexWordCount * (30 / sentenceCount)) + 3.1291;
}

/**
 * Calculate Coleman-Liau Index
 */
export function calculateColemanLiau(
  avgLettersPerWord: number,
  avgSentencesPerWord: number
): number {
  const L = avgLettersPerWord * 100;
  const S = avgSentencesPerWord * 100;
  return (0.0588 * L) - (0.296 * S) - 15.8;
}

/**
 * Calculate Automated Readability Index (ARI)
 */
export function calculateARI(
  avgCharactersPerWord: number,
  avgSentenceLength: number
): number {
  return (4.71 * avgCharactersPerWord) + (0.5 * avgSentenceLength) - 21.43;
}

/**
 * Normalize score to 0-100 scale
 */
export function normalizeScore(score: number, min: number, max: number): number {
  if (score <= min) return 100;
  if (score >= max) return 0;
  return Math.round(100 - ((score - min) / (max - min)) * 100);
}

/**
 * Convert grade level to color
 */
export function gradeToColor(grade: number): string {
  if (grade <= 6) return 'green';
  if (grade <= 9) return 'lightgreen';
  if (grade <= 12) return 'yellow';
  if (grade <= 16) return 'orange';
  return 'red';
}

/**
 * Convert grade level to label
 */
export function gradeToLabel(grade: number): string {
  if (grade <= 6) return 'Elementary';
  if (grade <= 8) return 'Middle School';
  if (grade <= 12) return 'High School';
  if (grade <= 16) return 'College';
  return 'Graduate';
}

/**
 * Calculate all readability formulas
 */
export function calculateAllFormulas(
  wordCount: number,
  sentenceCount: number,
  characterCount: number,
  syllableCount: number,
  complexWordCount: number,
  langConfig: LanguageConfig
): ReadabilityFormula[] {
  const avgSentenceLength = wordCount / Math.max(sentenceCount, 1);
  const avgSyllablesPerWord = syllableCount / Math.max(wordCount, 1);
  const complexWordRatio = complexWordCount / Math.max(wordCount, 1);
  const avgCharactersPerWord = characterCount / Math.max(wordCount, 1);
  const avgSentencesPerWord = sentenceCount / Math.max(wordCount, 1);

  const formulas: ReadabilityFormula[] = [];

  // 1. Flesch Reading Ease
  const fleschScore = calculateFleschReadingEase(avgSentenceLength, avgSyllablesPerWord, langConfig);
  const fleschInterp = interpretFleschScore(fleschScore);
  formulas.push({
    id: 'flesch-reading-ease',
    label: 'Flesch Reading Ease',
    score: Math.round(fleschScore * 10) / 10,
    normalized: normalizeScore(fleschScore, 0, 100),
    interpretation: fleschInterp.label,
    gradeLevel: fleschInterp.gradeLabel,
    gradeValue: fleschInterp.gradeValue,
    color: gradeToColor(fleschInterp.gradeValue),
    type: 'ease'
  });

  // 2. Flesch-Kincaid Grade Level
  const fkGrade = calculateFleschKincaidGrade(avgSentenceLength, avgSyllablesPerWord);
  formulas.push({
    id: 'flesch-kincaid-grade',
    label: 'Flesch-Kincaid Grade',
    score: Math.round(fkGrade * 10) / 10,
    normalized: normalizeScore(fkGrade, 0, 18),
    gradeLevel: `Grade ${Math.round(fkGrade)}`,
    gradeValue: Math.round(fkGrade),
    color: gradeToColor(fkGrade),
    type: 'grade'
  });

  // 3. Gunning Fog Index
  const fogScore = calculateGunningFog(avgSentenceLength, complexWordRatio);
  formulas.push({
    id: 'gunning-fog',
    label: 'Gunning Fog Index',
    score: Math.round(fogScore * 10) / 10,
    normalized: normalizeScore(fogScore, 0, 18),
    gradeLevel: `Grade ${Math.round(fogScore)}`,
    gradeValue: Math.round(fogScore),
    color: gradeToColor(fogScore),
    type: 'grade'
  });

  // 4. SMOG Index
  const smogScore = calculateSMOG(complexWordCount, sentenceCount);
  formulas.push({
    id: 'smog',
    label: 'SMOG Index',
    score: Math.round(smogScore * 10) / 10,
    normalized: normalizeScore(smogScore, 0, 18),
    gradeLevel: `Grade ${Math.round(smogScore)}`,
    gradeValue: Math.round(smogScore),
    color: gradeToColor(smogScore),
    type: 'grade'
  });

  // 5. Coleman-Liau Index
  const colemanScore = calculateColemanLiau(avgCharactersPerWord, avgSentencesPerWord);
  formulas.push({
    id: 'coleman-liau',
    label: 'Coleman-Liau Index',
    score: Math.round(colemanScore * 10) / 10,
    normalized: normalizeScore(colemanScore, 0, 18),
    gradeLevel: `Grade ${Math.round(colemanScore)}`,
    gradeValue: Math.round(colemanScore),
    color: gradeToColor(colemanScore),
    type: 'grade'
  });

  // 6. Automated Readability Index
  const ariScore = calculateARI(avgCharactersPerWord, avgSentenceLength);
  formulas.push({
    id: 'ari',
    label: 'Automated Readability Index',
    score: Math.round(ariScore * 10) / 10,
    normalized: normalizeScore(ariScore, 0, 18),
    gradeLevel: `Grade ${Math.round(ariScore)}`,
    gradeValue: Math.round(ariScore),
    color: gradeToColor(ariScore),
    type: 'grade'
  });

  return formulas;
}

/**
 * Calculate composite readability score
 */
export function calculateCompositeScore(formulas: ReadabilityFormula[]): {
  score: number;
  label: string;
  color: string;
  gradeLevel: string;
} {
  if (formulas.length === 0) {
    return { score: 0, label: 'Unknown', color: 'gray', gradeLevel: 'N/A' };
  }

  const avgNormalized = formulas.reduce((sum, f) => sum + f.normalized, 0) / formulas.length;
  const gradeFormulas = formulas.filter(f => f.type === 'grade');
  const avgGrade = gradeFormulas.length > 0
    ? gradeFormulas.reduce((sum, f) => sum + f.gradeValue, 0) / gradeFormulas.length
    : 0;

  let label = '';
  if (avgNormalized >= 80) label = 'Very Easy';
  else if (avgNormalized >= 60) label = 'Easy';
  else if (avgNormalized >= 40) label = 'Moderate';
  else if (avgNormalized >= 20) label = 'Difficult';
  else label = 'Very Difficult';

  return {
    score: Math.round(avgNormalized),
    label,
    color: gradeToColor(avgGrade),
    gradeLevel: gradeToLabel(avgGrade)
  };
}
