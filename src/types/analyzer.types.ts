/**
 * Analyzer Services Type Definitions
 * Types for keyword, readability, and content analysis services
 */

import type { SupportedLanguage } from './seo.types';

// ============================================================
// Keyword Services
// ============================================================

export interface KeywordExtraction {
  keyword: string;
  frequency: number;
  score: number;
  type: 'single' | 'bigram' | 'trigram';
}

export interface KeywordSuggestion {
  keyword: string;
  relevance: number;
  searchVolume?: number;
  difficulty?: number;
  related: string[];
}

export interface KeywordClustering {
  cluster: string;
  keywords: string[];
  commonality: number;
}

export interface KeywordMetrics {
  keyword: string;
  tfIdf: number;
  proximity: number;
  distribution: number;
  semanticRelevance: number;
}

// ============================================================
// Readability Services
// ============================================================

export interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  smog: number;
  colemanLiau: number;
  automatedReadability: number;
  averageGrade: number;
  readingLevel: ReadingLevel;
}

export type ReadingLevel =
  | 'Very Easy'
  | 'Easy'
  | 'Fairly Easy'
  | 'Standard'
  | 'Fairly Difficult'
  | 'Difficult'
  | 'Very Difficult'
  | 'N/A';

export interface ReadabilityScore {
  score: number;
  level: string;
  description: string;
  recommendations?: string[];
}

export interface TextStatistics {
  sentenceCount: number;
  wordCount: number;
  syllableCount: number;
  characterCount: number;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  complexWordCount: number;
  complexWordPercentage: number;
}

export interface SentenceAnalysis {
  sentence: string;
  wordCount: number;
  syllableCount: number;
  complexity: 'simple' | 'moderate' | 'complex';
  readabilityScore: number;
}

// ============================================================
// Content Services
// ============================================================

export interface ContentQualityMetrics {
  originalityScore: number;
  depthScore: number;
  structureScore: number;
  engagementScore: number;
  overallQuality: number;
}

export interface ContentStructure {
  hasIntroduction: boolean;
  hasConclusion: boolean;
  hasClearSections: boolean;
  headingHierarchy: boolean;
  logicalFlow: boolean;
  score: number;
}

export interface ContentDepthAnalysis {
  topicCoverage: number;
  detailLevel: number;
  exampleUsage: number;
  dataSupport: number;
  score: number;
}

export interface ContentOptimizationSuggestion {
  type: 'structure' | 'keyword' | 'readability' | 'engagement' | 'quality';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: number;
}

// ============================================================
// HTML Parser Results
// ============================================================

export interface HeadingsMap {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
}

export interface ImageInfo {
  src: string;
  alt: string;
  title: string;
  hasAlt: boolean;
  hasTitle: boolean;
}

export interface LinkInfo {
  href: string;
  text: string;
  rel: string;
  type: 'internal' | 'external' | 'email' | 'phone' | 'anchor';
  hasText: boolean;
}

export interface MetaTags {
  viewport: string | null;
  canonical: string | null;
  robots: string | null;
  charset: string | null;
  language: string | null;
}

export interface StructuralElements {
  hasNav: boolean;
  hasHeader: boolean;
  hasFooter: boolean;
  hasMain: boolean;
  hasArticle: boolean;
  semanticScore: number;
}

export interface ParsedHTML {
  text: string;
  html: string;
  wordCount: number;
  characterCount: number;
  headings: HeadingsMap;
  images: ImageInfo[];
  links: LinkInfo[];
  paragraphs: string[];
  readability: ReadabilityScore;
  metaTags: MetaTags;
  structuralElements: StructuralElements;
}

// ============================================================
// URL Fetcher
// ============================================================

export interface FetchOptions {
  timeout?: number;
  headers?: Record<string, string>;
  followRedirects?: boolean;
  maxRedirects?: number;
  validateSSL?: boolean;
}

export interface FetchResult {
  success: boolean;
  url: string;
  statusCode?: number;
  html?: string;
  error?: string;
  redirectUrl?: string;
  headers?: Record<string, string>;
  fetchTime: number;
}

export interface CrawlOptions extends FetchOptions {
  maxPages?: number;
  depthLimit?: number;
  sameDomain?: boolean;
}

// ============================================================
// Language Processing
// ============================================================

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number;
  alternativeLanguages: { language: string; confidence: number }[];
}

export interface TextProcessingOptions {
  removeStopWords?: boolean;
  stemming?: boolean;
  lowercase?: boolean;
  removePunctuation?: boolean;
  removeNumbers?: boolean;
}

export interface ProcessedText {
  original: string;
  processed: string;
  tokens: string[];
  stems?: string[];
  language?: SupportedLanguage;
}

// ============================================================
// N-Gram Analysis
// ============================================================

export interface NGram {
  text: string;
  count: number;
  positions: number[];
  type: 'unigram' | 'bigram' | 'trigram';
}

export interface NGramAnalysis {
  unigrams: NGram[];
  bigrams: NGram[];
  trigrams: NGram[];
  mostFrequent: NGram[];
}

// ============================================================
// Sentiment Analysis
// ============================================================

export interface SentimentResult {
  score: number; // -1 to 1
  magnitude: number; // 0 to infinity
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

// ============================================================
// Topic Modeling
// ============================================================

export interface Topic {
  id: string;
  name: string;
  keywords: string[];
  relevance: number;
}

export interface TopicAnalysis {
  mainTopics: Topic[];
  topicDistribution: Record<string, number>;
  coherenceScore: number;
}
