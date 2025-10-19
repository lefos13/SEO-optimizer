/**
 * SEO-Focused Readability Assessments
 */

import type {
  ReadabilityTotals,
  StructureAnalysis,
  CompositeScore,
  SEOAssessment,
  DynamicLanguageGuidance,
  SEOImpactIssue,
  SEOAdvice,
  SEOStrength,
} from './readabilityTypes';

/**
 * Get SEO readability level description
 */
export function getSEOReadabilityLevel(score: number): string {
  if (score >= 70) return 'Excellent for SEO - highly scannable';
  if (score >= 60) return 'Good for SEO - accessible to most users';
  if (score >= 50) return 'Fair for SEO - may limit reach';
  return 'Poor for SEO - likely to increase bounce rate';
}

/**
 * Assess crawlability for search engines
 */
export function assessCrawlability(
  structure: StructureAnalysis,
  totals: ReadabilityTotals
): SEOAssessment {
  const score = Math.min(
    100,
    (structure.paragraphs.count >= 3 ? 40 : 20) +
      (structure.sentences.count >= 10 ? 30 : 15) +
      (totals.words >= 300 ? 30 : totals.words / 10)
  );

  return {
    score: Math.round(score),
    status:
      score >= 80
        ? 'Excellent'
        : score >= 60
          ? 'Good'
          : score >= 40
            ? 'Fair'
            : 'Poor',
    reason:
      score >= 80
        ? 'Well-structured content is easy for search engines to parse'
        : score >= 60
          ? 'Adequate structure for search engine indexing'
          : 'Content structure may limit search engine understanding',
  };
}

/**
 * Assess user engagement potential
 */
export function assessUserEngagement(
  readabilityScore: number,
  structure: StructureAnalysis
): SEOAssessment {
  const score = Math.min(
    100,
    readabilityScore * 0.6 +
      (structure.paragraphs.count >= 4 ? 20 : 10) +
      (structure.sentences.averageLength <= 20 ? 20 : 10)
  );

  return {
    score: Math.round(score),
    status: score >= 75 ? 'High' : score >= 55 ? 'Moderate' : 'Low',
    reason:
      score >= 75
        ? 'Content is optimized for sustained user engagement'
        : score >= 55
          ? 'Content supports average engagement levels'
          : 'Readability issues may increase bounce rate',
  };
}

/**
 * Assess mobile friendliness
 */
export function assessMobileFriendliness(
  structure: StructureAnalysis
): SEOAssessment {
  const avgParagraphWords = structure.paragraphs.averageWords;
  const score = Math.min(
    100,
    (avgParagraphWords <= 80 ? 50 : (80 / avgParagraphWords) * 50) +
      (structure.sentences.averageLength <= 18
        ? 50
        : (18 / structure.sentences.averageLength) * 50)
  );

  return {
    score: Math.round(score),
    status:
      score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement',
    reason:
      score >= 80
        ? 'Short paragraphs and sentences perfect for mobile reading'
        : score >= 60
          ? 'Acceptable for mobile but could be more concise'
          : 'Text blocks may be difficult to read on mobile devices',
  };
}

/**
 * Assess voice search readiness
 */
export function assessVoiceSearchReadiness(
  readabilityScore: number,
  totals: ReadabilityTotals
): SEOAssessment {
  const score = Math.min(
    100,
    (readabilityScore >= 70 ? 60 : readabilityScore * 0.85) +
      (totals.complexWordRatio < 0.15
        ? 40
        : Math.max(0, (0.15 - totals.complexWordRatio) * 200))
  );

  return {
    score: Math.round(score),
    status: score >= 75 ? 'High' : score >= 55 ? 'Moderate' : 'Low',
    reason:
      score >= 75
        ? 'Conversational tone aligns with voice search queries'
        : score >= 55
          ? 'Partially optimized for voice search'
          : 'Complex language limits voice search compatibility',
  };
}

/**
 * Assess featured snippet potential
 */
export function assessSnippetPotential(
  structure: StructureAnalysis,
  readabilityScore: number
): SEOAssessment {
  const score = Math.min(
    100,
    (readabilityScore >= 60 ? 40 : readabilityScore * 0.65) +
      (structure.paragraphs.averageWords >= 40 &&
      structure.paragraphs.averageWords <= 100
        ? 30
        : 15) +
      (structure.sentences.averageLength <= 20 ? 30 : 15)
  );

  return {
    score: Math.round(score),
    status: score >= 75 ? 'High' : score >= 55 ? 'Moderate' : 'Low',
    reason:
      score >= 75
        ? 'Content structure favors featured snippet selection'
        : score >= 55
          ? 'Some paragraphs may qualify for featured snippets'
          : 'Current structure limits featured snippet eligibility',
  };
}

/**
 * Get language-specific SEO advice
 */
export function getLanguageSpecificSEOAdvice(
  languageCode: string,
  totals: ReadabilityTotals,
  structure: StructureAnalysis,
  compositeScore: CompositeScore
): {
  issues: SEOImpactIssue[];
  advice: SEOAdvice[];
  strengths: SEOStrength[];
} {
  const issues: SEOImpactIssue[] = [];
  const advice: SEOAdvice[] = [];
  const strengths: SEOStrength[] = [];

  if (languageCode === 'en') {
    // English-specific SEO checks
    if (structure.sentences.averageLength > 22) {
      issues.push({
        severity: 'medium',
        category: 'English Sentence Structure',
        finding: `Average sentence length of ${Math.round(structure.sentences.averageLength)} words exceeds English web standard`,
        impact: 'English readers expect concise, direct sentences online',
        examples: [],
      });
      advice.push({
        priority: 'medium',
        rule: 'Apply English Web Writing Standards',
        reason: 'English web content performs best at 15-20 words per sentence',
        action:
          'Target 18-word average sentences. Use active voice and eliminate filler words.',
        seoImpact: 'Better engagement from English-speaking markets',
      });
    }

    if (totals.vocabularyRichness < 0.4) {
      issues.push({
        severity: 'low',
        category: 'Keyword Diversity',
        finding: `Low vocabulary richness (${Math.round(totals.vocabularyRichness * 100)}%) suggests repetitive language`,
        impact: 'Limited semantic keyword coverage',
        examples: [],
      });
      advice.push({
        priority: 'low',
        rule: 'Expand Semantic Keyword Coverage',
        reason: 'Varied vocabulary captures more long-tail search queries',
        action:
          'Use synonyms and related terms to broaden topical relevance without keyword stuffing.',
        seoImpact: 'Improved semantic SEO and featured snippet potential',
      });
    }
  } else if (languageCode === 'el') {
    // Greek-specific SEO checks
    if (structure.paragraphs.averageWords > 100) {
      issues.push({
        severity: 'high',
        category: 'Greek Paragraph Length',
        finding: `Greek paragraphs average ${Math.round(structure.paragraphs.averageWords)} words - exceeds web standard`,
        impact: 'Greek readers expect shorter, focused web paragraphs',
        examples: [],
      });
      advice.push({
        priority: 'high',
        rule: 'Adapt to Greek Web Reading Patterns',
        reason: 'Greek online content performs best with 50-80 word paragraphs',
        action:
          'Break paragraphs at natural thought boundaries. Use bullet points for lists.',
        seoImpact: 'Better engagement from Greek-speaking audiences',
      });
    }

    if (compositeScore.score < 55) {
      advice.push({
        priority: 'high',
        rule: 'Optimize for Greek Search Algorithms',
        reason: 'Greek search engines prioritize accessible content',
        action:
          'Simplify sentence structure. Use contemporary Greek vocabulary over archaic forms.',
        seoImpact: 'Improved visibility in Greek search results',
      });
    }
  }

  return { issues, advice, strengths };
}

/**
 * Generate dynamic language guidance with SEO focus
 */
export function generateDynamicLanguageGuidance(
  totals: ReadabilityTotals,
  structure: StructureAnalysis,
  compositeScore: CompositeScore,
  languageCode: string
): DynamicLanguageGuidance {
  // Content analysis summary
  const contentAnalysis = {
    overallReadability: compositeScore.label,
    score: compositeScore.score,
    targetAudience: compositeScore.gradeLevel,
    seoReadability: getSEOReadabilityLevel(compositeScore.score),
  };

  // Identify specific issues in the content
  const specificIssues: SEOImpactIssue[] = [];
  const actionableAdvice: SEOAdvice[] = [];
  const strengthsIdentified: SEOStrength[] = [];

  // Analyze sentence complexity
  const longSentenceRatio =
    structure.sentences.longSentences.length / structure.sentences.count;
  if (longSentenceRatio > 0.3) {
    specificIssues.push({
      severity: 'high',
      category: 'Sentence Complexity',
      finding: `${Math.round(longSentenceRatio * 100)}% of sentences exceed 25 words`,
      impact: 'Users may abandon pages with dense, hard-to-scan content',
      examples: structure.sentences.longSentences.slice(0, 2).map(s => ({
        text: s.text.substring(0, 100) + (s.text.length > 100 ? '...' : ''),
        wordCount: s.length,
      })),
    });
    actionableAdvice.push({
      priority: 'critical',
      rule: 'Break Up Long Sentences for SEO',
      reason:
        'Search engines favor content that users can quickly scan and understand',
      action:
        'Split sentences over 25 words. Target 15-20 words per sentence for optimal web readability.',
      seoImpact: 'Improved dwell time and reduced bounce rate',
    });
  } else if (longSentenceRatio < 0.1) {
    strengthsIdentified.push({
      category: 'Sentence Length',
      strength: 'Well-controlled sentence length throughout content',
      benefit: 'Users can easily scan and extract information',
    });
  }

  // Analyze paragraph structure
  const longParagraphRatio =
    structure.paragraphs.longParagraphs.length / structure.paragraphs.count;
  if (longParagraphRatio > 0.3) {
    specificIssues.push({
      severity: 'high',
      category: 'Paragraph Structure',
      finding: `${Math.round(longParagraphRatio * 100)}% of paragraphs exceed 120 words`,
      impact: 'Large text blocks reduce scannability and mobile readability',
      examples: structure.paragraphs.longParagraphs.slice(0, 2).map(p => ({
        text: p.text.substring(0, 100) + (p.text.length > 100 ? '...' : ''),
        wordCount: p.words,
      })),
    });
    actionableAdvice.push({
      priority: 'high',
      rule: 'Optimize Paragraph Length for Web',
      reason:
        'Mobile users and search engine crawlers prefer shorter, focused paragraphs',
      action:
        'Break paragraphs into 40-80 word chunks. Use subheadings to improve content hierarchy.',
      seoImpact: 'Better featured snippet eligibility and mobile SEO',
    });
  } else if (structure.paragraphs.averageWords <= 80) {
    strengthsIdentified.push({
      category: 'Paragraph Structure',
      strength: 'Paragraphs are well-sized for web consumption',
      benefit: 'Mobile-friendly and search engine optimized',
    });
  }

  // Analyze vocabulary complexity for SEO
  if (totals.complexWordRatio > 0.2) {
    specificIssues.push({
      severity: 'medium',
      category: 'Vocabulary Complexity',
      finding: `${Math.round(totals.complexWordRatio * 100)}% of words are complex (3+ syllables)`,
      impact: 'Technical jargon may limit organic search reach',
      examples: [],
    });
    actionableAdvice.push({
      priority: 'medium',
      rule: 'Simplify Vocabulary for Broader Reach',
      reason: 'Search engines prioritize content accessible to wider audiences',
      action:
        'Replace complex terms with simpler alternatives. Use jargon only when targeting specialist searches.',
      seoImpact: 'Expanded keyword targeting and voice search optimization',
    });
  } else if (totals.complexWordRatio < 0.12) {
    strengthsIdentified.push({
      category: 'Vocabulary',
      strength: 'Accessible vocabulary suitable for general audiences',
      benefit: 'Better voice search compatibility',
    });
  }

  // Analyze sentence variety
  const shortSentenceCount = structure.sentences.shortSentences?.length || 0;
  const sentenceVariety = shortSentenceCount / structure.sentences.count;
  if (sentenceVariety > 0.4) {
    specificIssues.push({
      severity: 'low',
      category: 'Sentence Variety',
      finding: `${Math.round(sentenceVariety * 100)}% of sentences are very short (≤8 words)`,
      impact: 'Choppy rhythm may reduce engagement time',
      examples: [],
    });
    actionableAdvice.push({
      priority: 'low',
      rule: 'Balance Sentence Lengths',
      reason:
        'Mix of short and medium sentences creates engaging reading rhythm',
      action:
        'Combine some short sentences or add supporting details to create 12-18 word sentences.',
      seoImpact: 'Improved user engagement metrics',
    });
  }

  // Analyze overall readability score for SEO
  if (compositeScore.score < 50) {
    specificIssues.push({
      severity: 'critical',
      category: 'Overall Readability',
      finding: `Readability score of ${compositeScore.score} is below recommended threshold`,
      impact: 'Low readability directly correlates with high bounce rates',
      examples: [],
    });
    actionableAdvice.push({
      priority: 'critical',
      rule: 'Improve Overall Readability for SEO Performance',
      reason:
        'Google considers user engagement signals; poor readability hurts rankings',
      action:
        'Apply sentence and paragraph improvements. Target a score above 60 for optimal SEO.',
      seoImpact:
        'Better rankings, featured snippet opportunities, and user satisfaction',
    });
  } else if (compositeScore.score >= 70) {
    strengthsIdentified.push({
      category: 'Overall Readability',
      strength: 'Excellent readability score for web content',
      benefit: 'Strong foundation for SEO success and user engagement',
    });
  }

  // Language-specific SEO guidance
  const languageSpecificAdvice = getLanguageSpecificSEOAdvice(
    languageCode,
    totals,
    structure,
    compositeScore
  );

  if (languageSpecificAdvice.issues.length > 0) {
    specificIssues.push(...languageSpecificAdvice.issues);
  }
  if (languageSpecificAdvice.advice.length > 0) {
    actionableAdvice.push(...languageSpecificAdvice.advice);
  }
  if (languageSpecificAdvice.strengths.length > 0) {
    strengthsIdentified.push(...languageSpecificAdvice.strengths);
  }

  // SEO Impact Summary
  const seoImpact = {
    crawlability: assessCrawlability(structure, totals),
    userEngagement: assessUserEngagement(compositeScore.score, structure),
    mobileFriendliness: assessMobileFriendliness(structure),
    voiceSearchOptimization: assessVoiceSearchReadiness(
      compositeScore.score,
      totals
    ),
    featuredSnippetPotential: assessSnippetPotential(
      structure,
      compositeScore.score
    ),
  };

  // If no issues found, add general best practices
  if (specificIssues.length === 0) {
    actionableAdvice.push({
      priority: 'maintenance',
      rule: 'Maintain Current Standards',
      reason: 'Your content meets readability best practices',
      action:
        'Continue using clear language, varied sentence structure, and focused paragraphs.',
      seoImpact: 'Sustained organic performance',
    });
  }

  // Sort by severity/priority
  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  specificIssues.sort(
    (a, b) => severityOrder[a.severity]! - severityOrder[b.severity]!
  );

  const priorityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    maintenance: 4,
  };
  actionableAdvice.sort(
    (a, b) => priorityOrder[a.priority]! - priorityOrder[b.priority]!
  );

  return {
    contentAnalysis,
    seoImpact,
    specificIssues,
    actionableAdvice,
    strengthsIdentified,
  };
}
