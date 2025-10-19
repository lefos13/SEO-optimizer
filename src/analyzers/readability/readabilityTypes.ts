/**
 * Type Definitions for Readability Analysis
 */

export interface LanguageConfig {
  code: string;
  name: string;
  vowels: RegExp;
  vowelGroups: RegExp;
  complexThreshold: number;
  fleschConstants: { a: number; b: number; c: number };
  minWords: number;
  defaultWpm: number;
  guidance: LanguageGuidanceRule[];
}

export interface LanguageGuidanceRule {
  title: string;
  description: string;
}

export interface ReadabilityTotals {
  words: number;
  sentences: number;
  paragraphs: number;
  characters: number;
  syllables: number;
  complexWords: number;
  averageSentenceLength: number;
  averageSyllablesPerWord: number;
  complexWordRatio: number;
  vocabularyRichness: number;
}

export interface ReadabilityFormula {
  id: string;
  label: string;
  score: number;
  normalized: number;
  interpretation?: string;
  gradeLevel: string;
  gradeValue: number;
  color: string;
  type: 'ease' | 'grade';
}

export interface CompositeScore {
  score: number;
  label: string;
  color: string;
  gradeLevel: string;
  readingTimeMinutes: number;
}

export interface SentenceDetail {
  text: string;
  length: number;
}

export interface SentenceAnalysis {
  count: number;
  averageLength: number;
  medianLength: number;
  longestSentence: SentenceDetail | null;
  shortestSentence: SentenceDetail | null;
  longSentences: SentenceDetail[];
  shortSentences: SentenceDetail[];
  distribution: LengthDistribution[];
}

export interface ParagraphDetail {
  index: number;
  text: string;
  words: number;
  sentences: number;
  averageSentenceLength: number;
  readingEase: number;
  label: string;
}

export interface ParagraphAnalysis {
  count: number;
  averageWords: number;
  averageSentences: number;
  longParagraphs: ParagraphDetail[];
  shortParagraphs: ParagraphDetail[];
  items: ParagraphDetail[];
  distribution: LengthDistribution[];
}

export interface StructureAnalysis {
  sentences: SentenceAnalysis;
  paragraphs: ParagraphAnalysis;
}

export interface LengthDistribution {
  range: string;
  count: number;
}

export interface Recommendation {
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
}

export interface EducationStage {
  label: string;
  range: string;
}

export interface AudienceFit {
  audience: string;
  suitable: boolean;
}

export interface ReadingLevels {
  recommendedGrade: number;
  recommendedLabel: string;
  educationStages: EducationStage[];
  audienceFit: AudienceFit[];
}

export interface LanguageGuidance {
  language: string;
  notes: string;
  rules: LanguageGuidanceRule[];
}

export interface Summary {
  readingTimeMinutes: number;
  pacing: string;
  audience: string;
  wordCount: number;
  language: string;
}

export interface ReadabilityMeta {
  language: string;
  languageName: string;
  timestamp: string;
  processingTimeMs: number;
  isInsufficient: boolean;
  warnings: string[];
}

export interface ReadabilityAnalysisResult {
  meta: ReadabilityMeta;
  totals: ReadabilityTotals;
  compositeScore: CompositeScore;
  formulas: ReadabilityFormula[];
  structure: StructureAnalysis;
  recommendations: Recommendation[];
  languageGuidance: LanguageGuidance;
  readingLevels: ReadingLevels;
  summary: Summary;
}

export interface SyllableStats {
  total: number;
  complex: number;
  details: Array<{ word: string; syllables: number }>;
}

export interface FleschResult {
  score: number;
  label: string;
  gradeLabel: string;
  gradeValue: number;
}

export interface SEOImpactIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  finding: string;
  impact: string;
  examples: Array<{ text: string; wordCount?: number }>;
}

export interface SEOAdvice {
  priority: 'critical' | 'high' | 'medium' | 'low' | 'maintenance';
  rule: string;
  reason: string;
  action: string;
  seoImpact: string;
}

export interface SEOStrength {
  category: string;
  strength: string;
  benefit: string;
}

export interface SEOAssessment {
  score: number;
  status: string;
  reason: string;
}

export interface DynamicLanguageGuidance {
  contentAnalysis: {
    overallReadability: string;
    score: number;
    targetAudience: string;
    seoReadability: string;
  };
  seoImpact: {
    crawlability: SEOAssessment;
    userEngagement: SEOAssessment;
    mobileFriendliness: SEOAssessment;
    voiceSearchOptimization: SEOAssessment;
    featuredSnippetPotential: SEOAssessment;
  };
  specificIssues: SEOImpactIssue[];
  actionableAdvice: SEOAdvice[];
  strengthsIdentified: SEOStrength[];
}
