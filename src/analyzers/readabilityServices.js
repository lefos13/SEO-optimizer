/**
 * Readability Services - Advanced Content Readability Analysis
 *
 * Provides multi-formula readability analysis, structural insights,
 * real-time scoring support, and language-aware recommendations.
 */

const htmlParser = require('./htmlParser');

const LANGUAGE_CONFIG = {
  en: {
    code: 'en',
    name: 'English',
    vowels: /[aeiouy]/i,
    vowelGroups: /[aeiouy]+/gi,
    complexThreshold: 3,
    fleschConstants: { a: 206.835, b: 1.015, c: 84.6 },
    minWords: 40,
    defaultWpm: 200,
    guidance: [
      {
        title: 'Shorten Long Sentences',
        description:
          'Aim for sentences under 20 words to maintain flow. Split complex ideas into separate sentences.',
      },
      {
        title: 'Favor Active Voice',
        description:
          'Active voice improves clarity and keeps sentences direct. It also reduces unnecessary words.',
      },
      {
        title: 'Avoid Overly Technical Terms',
        description:
          'Replace jargon with simpler alternatives unless your audience expects specialist vocabulary.',
      },
      {
        title: 'Mix Sentence Lengths',
        description:
          'Use a blend of short and medium sentences to create a natural rhythm that keeps readers engaged.',
      },
    ],
  },
  el: {
    code: 'el',
    name: 'Greek',
    vowels: /[αεηιουωάέήίόύώϊΐϋΰ]/i,
    vowelGroups: /[αεηιουωάέήίόύώϊΐϋΰ]+/gi,
    complexThreshold: 4,
    fleschConstants: { a: 206.84, b: 1.3, c: 60 },
    minWords: 40,
    defaultWpm: 180,
    guidance: [
      {
        title: 'Keep Paragraphs Focused',
        description:
          'Large Greek paragraphs can hide key ideas. Break long sections into 3-4 sentence blocks.',
      },
      {
        title: 'Prefer Simple Verb Constructions',
        description:
          'Use straightforward verb forms to avoid complex clauses that increase cognitive load.',
      },
      {
        title: 'Balance Ancient and Modern Terms',
        description:
          'Combine contemporary vocabulary with formal terms only when necessary to match your readers.',
      },
      {
        title: 'Highlight Key Information Early',
        description:
          'Place the main message near the start of each paragraph where readers naturally expect it.',
      },
    ],
  },
};

class ReadabilityServices {
  /**
   * Analyze readability using multiple formulas and structural insights.
   * @param {string} content - HTML or plain text to analyze
   * @param {Object} options - Analysis options
   * @param {string} [options.language='en'] - Target language code
   * @returns {Object} Detailed readability analysis payload
   */
  static analyze(content, options = {}) {
    const start = Date.now();
    const languageCode = (options.language || 'en').toLowerCase();
    const language = LANGUAGE_CONFIG[languageCode]
      ? LANGUAGE_CONFIG[languageCode]
      : LANGUAGE_CONFIG.en;

    const raw = typeof content === 'string' ? content : '';
    const trimmed = raw.trim();

    if (!trimmed) {
      return this._buildEmptyResult(language, start, 'No content provided');
    }

    const parsed = htmlParser.parse(raw);
    const text =
      parsed.text && parsed.text.trim().length > 0
        ? parsed.text.trim()
        : this._stripFallback(raw);
    const sanitized = text.replace(/\s+/g, ' ').trim();

    if (!sanitized) {
      return this._buildEmptyResult(
        language,
        start,
        'Unable to extract text from content'
      );
    }

    const words = this._tokenizeWords(sanitized, language.code);
    const sentences = this._splitSentences(sanitized, language.code);
    const paragraphs = this._collectParagraphs(parsed, raw);

    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const paragraphCount = paragraphs.length;

    if (wordCount === 0 || sentenceCount === 0) {
      return this._buildEmptyResult(
        language,
        start,
        'Insufficient textual content'
      );
    }

    const charCount = sanitized.replace(/\s/g, '').length;
    const syllableStats = this._countSyllables(words, language);
    const totalSyllables = syllableStats.total;
    const complexWords = syllableStats.complex;

    const avgSentenceLength = sentenceCount ? wordCount / sentenceCount : 0;
    const syllablesPerWord = wordCount ? totalSyllables / wordCount : 0;
    const complexWordRatio = wordCount ? complexWords / wordCount : 0;

    const totals = {
      words: wordCount,
      sentences: sentenceCount,
      paragraphs: paragraphCount,
      characters: charCount,
      syllables: totalSyllables,
      complexWords,
      averageSentenceLength: this._round(avgSentenceLength, 2),
      averageSyllablesPerWord: this._round(syllablesPerWord, 2),
      complexWordRatio: this._round(complexWordRatio, 3),
      vocabularyRichness: this._calculateVocabularyRichness(words),
    };

    const formulas = this._calculateFormulas({
      words: wordCount,
      sentences: sentenceCount,
      syllables: totalSyllables,
      complexWords,
      characters: charCount,
      language,
    });

    const formulaMap = Object.fromEntries(formulas.map(f => [f.id, f]));

    const compositeScore = this._buildCompositeScore({
      formulas,
      totals,
      language,
    });

    const structure = this._analyzeStructure({
      sentences,
      paragraphs,
      language,
    });

    const recommendations = this._generateRecommendations({
      totals,
      formulaMap,
      structure,
      language,
    });

    const readingLevels = this._determineReadingLevels({
      formulaMap,
      language,
    });

    const summary = this._buildSummary({
      totals,
      compositeScore,
      readingLevels,
      language,
    });

    const warnings = this._collectWarnings({
      totals,
      structure,
      formulas,
      language,
    });

    return {
      meta: {
        language: language.code,
        languageName: language.name,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - start,
        isInsufficient: wordCount < language.minWords || sentenceCount < 3,
        warnings,
      },
      totals,
      compositeScore,
      formulas,
      structure,
      recommendations,
      languageGuidance: {
        language: language.name,
        notes: this._buildLanguageNotes(language),
        rules: language.guidance,
      },
      readingLevels,
      summary,
    };
  }

  // ----------------------------------------------------------
  // Core Calculations
  // ----------------------------------------------------------

  static _calculateFormulas({
    words,
    sentences,
    syllables,
    complexWords,
    characters,
    language,
  }) {
    const safeSentences = sentences === 0 ? 1 : sentences;
    const safeWords = words === 0 ? 1 : words;

    const readingEase = this._calculateFlesch({
      words: safeWords,
      sentences: safeSentences,
      syllables,
      language,
    });

    const fleschKincaid =
      0.39 * (words / safeSentences) + 11.8 * (syllables / safeWords) - 15.59;

    const gunningFog =
      0.4 * (words / safeSentences + 100 * (complexWords / safeWords));

    const smogBase = complexWords * (30 / safeSentences);
    const smog = smogBase > 0 ? 1.043 * Math.sqrt(smogBase) + 3.1291 : 0;

    const L = (characters / safeWords) * 100;
    const S = (safeSentences / safeWords) * 100;
    const colemanLiau = 0.0588 * L - 0.296 * S - 15.8;

    const automatedReadabilityIndex =
      4.71 * (characters / safeWords) + 0.5 * (words / safeSentences) - 21.43;

    return [
      {
        id: 'fleschReadingEase',
        label: 'Flesch Reading Ease',
        score: this._round(readingEase.score, 1),
        normalized: this._clamp(readingEase.score, 0, 100),
        interpretation: readingEase.label,
        gradeLevel: readingEase.gradeLabel,
        gradeValue: readingEase.gradeValue,
        color: this._scoreColor(readingEase.score),
        type: 'ease',
      },
      this._gradeMetric('fleschKincaid', 'Flesch-Kincaid Grade', fleschKincaid),
      this._gradeMetric('gunningFog', 'Gunning Fog Index', gunningFog),
      this._gradeMetric('smog', 'SMOG Index', smog),
      this._gradeMetric('colemanLiau', 'Coleman-Liau Index', colemanLiau),
      this._gradeMetric(
        'automatedReadabilityIndex',
        'Automated Readability Index',
        automatedReadabilityIndex
      ),
    ];
  }

  static _calculateFlesch({ words, sentences, syllables, language }) {
    const { a, b, c } = language.fleschConstants;
    const sentenceLength = words / sentences;
    const syllablesPerWord = syllables / words;

    const score = a - b * sentenceLength - c * syllablesPerWord;
    const clampedScore = this._clamp(score, -10, 120);

    const gradeValue = this._readingEaseToGrade(clampedScore);

    return {
      score: clampedScore,
      label: this._readingEaseLabel(clampedScore),
      gradeLabel: this._gradeLabel(gradeValue),
      gradeValue,
    };
  }

  static _gradeMetric(id, label, rawScore) {
    const normalized = this._normalizeGrade(rawScore);
    const gradeValue = rawScore < 0 ? 0 : rawScore;
    return {
      id,
      label,
      score: this._round(rawScore, 2),
      normalized,
      gradeLevel: this._gradeLabel(rawScore),
      gradeValue: this._round(gradeValue, 2),
      interpretation: this._gradeInterpretation(rawScore),
      color: this._scoreColor(100 - normalized),
      type: 'grade',
    };
  }

  static _buildCompositeScore({ formulas, totals, language }) {
    const easeMetric = formulas.find(f => f.id === 'fleschReadingEase');
    const gradeMetrics = formulas.filter(f => f.type === 'grade');

    const normalizedGrades = gradeMetrics.map(metric =>
      this._normalizeGrade(metric.score)
    );

    const averageGradeScore =
      normalizedGrades.length > 0
        ? normalizedGrades.reduce((sum, value) => sum + value, 0) /
          normalizedGrades.length
        : 0;

    const score = easeMetric
      ? 0.6 * easeMetric.normalized + 0.4 * averageGradeScore
      : averageGradeScore;

    return {
      score: this._round(score, 1),
      label: this._compositeLabel(score),
      color: this._scoreColor(score),
      gradeLevel: this._gradeLabel(this._readingEaseToGrade(score)),
      readingTimeMinutes: Math.max(
        1,
        Math.round(totals.words / language.defaultWpm)
      ),
    };
  }

  static _analyzeStructure({ sentences, paragraphs, language }) {
    const sentenceStats = this._analyzeSentences(sentences, language);
    const paragraphStats = this._analyzeParagraphs(paragraphs, language);

    return {
      sentences: sentenceStats,
      paragraphs: paragraphStats,
    };
  }

  static _generateRecommendations({ totals, formulaMap, structure, language }) {
    const recs = [];

    if (
      formulaMap.fleschReadingEase &&
      formulaMap.fleschReadingEase.score < 60
    ) {
      recs.push({
        type: 'critical',
        title: 'Improve overall readability',
        message:
          'Shorten sentences and simplify vocabulary to raise the reading ease score above 60.',
      });
    }

    if (
      structure.sentences.longSentences.length > 0 &&
      structure.sentences.longSentences.length / structure.sentences.count > 0.2
    ) {
      recs.push({
        type: 'warning',
        title: 'Break up long sentences',
        message:
          'More than 20% of your sentences exceed 25 words. Split them to keep readers engaged.',
      });
    }

    if (totals.complexWordRatio > 0.15) {
      recs.push({
        type: 'warning',
        title: 'Reduce complex vocabulary',
        message:
          'Consider replacing multi-syllable words with simpler alternatives where possible.',
      });
    }

    if (structure.paragraphs.longParagraphs.length > 0) {
      recs.push({
        type: 'warning',
        title: 'Shorten lengthy paragraphs',
        message:
          'Break paragraphs longer than 120 words into smaller sections to improve scanning.',
      });
    }

    if (recs.length === 0) {
      recs.push({
        type: 'success',
        title: 'Strong readability baseline',
        message: `Your content aligns well with ${language.name} readability best practices. Maintain the current structure.`,
      });
    }

    return recs;
  }

  static _determineReadingLevels({ formulaMap, language }) {
    const gradeMetrics = [
      'fleschKincaid',
      'gunningFog',
      'smog',
      'colemanLiau',
      'automatedReadabilityIndex',
    ];

    const grades = gradeMetrics
      .map(id => formulaMap[id]?.gradeValue)
      .filter(value => typeof value === 'number' && !Number.isNaN(value));

    const averageGrade =
      grades.length > 0
        ? grades.reduce((sum, value) => sum + value, 0) / grades.length
        : 0;

    const recommendedGrade = this._round(averageGrade, 1);

    return {
      recommendedGrade,
      recommendedLabel: this._gradeLabel(recommendedGrade),
      educationStages: this._educationStages(),
      audienceFit: this._audienceFit(recommendedGrade, language),
    };
  }

  static _buildSummary({ totals, compositeScore, readingLevels, language }) {
    return {
      readingTimeMinutes: compositeScore.readingTimeMinutes,
      pacing: compositeScore.label,
      audience: readingLevels.recommendedLabel,
      wordCount: totals.words,
      language: language.name,
    };
  }

  static _collectWarnings({ totals, structure, formulas, language }) {
    const warnings = [];

    if (totals.words < language.minWords) {
      warnings.push(
        `Content has fewer than ${language.minWords} words. Results may be unstable.`
      );
    }

    if (structure.sentences.count < 3) {
      warnings.push('Add more sentences for reliable readability scoring.');
    }

    const ease = formulas.find(f => f.id === 'fleschReadingEase');
    if (ease && ease.score < 30) {
      warnings.push('Content is considered very difficult to read.');
    }

    return warnings;
  }

  // ----------------------------------------------------------
  // Helpers: Structure Analysis
  // ----------------------------------------------------------

  static _analyzeSentences(sentences, language) {
    const lengths = sentences.map(
      sentence => this._tokenizeWords(sentence, language.code).length
    );

    const count = sentences.length;
    const average = lengths.length
      ? lengths.reduce((sum, value) => sum + value, 0) / lengths.length
      : 0;

    const distribution = this._lengthDistribution(lengths, [
      { label: '1-10', max: 10 },
      { label: '11-20', max: 20 },
      { label: '21-30', max: 30 },
      { label: '31+', max: Infinity },
    ]);

    const longSentences = sentences
      .map((sentence, index) => ({
        text: sentence.trim(),
        length: lengths[index],
      }))
      .filter(item => item.length > 25);

    const shortSentences = sentences
      .map((sentence, index) => ({
        text: sentence.trim(),
        length: lengths[index],
      }))
      .filter(item => item.length <= 8);

    return {
      count,
      averageLength: this._round(average, 1),
      medianLength: this._median(lengths),
      longestSentence: this._extreme(sentences, lengths, 'max'),
      shortestSentence: this._extreme(sentences, lengths, 'min'),
      longSentences,
      shortSentences,
      distribution,
    };
  }

  static _analyzeParagraphs(paragraphs, language) {
    const paragraphDetails = paragraphs.map((paragraph, index) => {
      const words = this._tokenizeWords(paragraph, language.code);
      const sentences = this._splitSentences(paragraph, language.code);
      const syllableStats = this._countSyllables(
        words,
        LANGUAGE_CONFIG[language.code]
      );
      const ease = this._calculateFlesch({
        words: words.length || 1,
        sentences: sentences.length || 1,
        syllables: syllableStats.total || 1,
        language: LANGUAGE_CONFIG[language.code],
      });

      return {
        index: index + 1,
        text: paragraph.trim(),
        words: words.length,
        sentences: sentences.length,
        averageSentenceLength: this._round(
          words.length && sentences.length
            ? words.length / sentences.length
            : 0,
          1
        ),
        readingEase: this._round(ease.score, 1),
        label: ease.label,
      };
    });

    const wordLengths = paragraphDetails.map(item => item.words);

    return {
      count: paragraphs.length,
      averageWords: this._round(
        paragraphDetails.length
          ? paragraphDetails.reduce((sum, item) => sum + item.words, 0) /
              paragraphDetails.length
          : 0,
        1
      ),
      averageSentences: this._round(
        paragraphDetails.length
          ? paragraphDetails.reduce((sum, item) => sum + item.sentences, 0) /
              paragraphDetails.length
          : 0,
        1
      ),
      longParagraphs: paragraphDetails.filter(item => item.words > 120),
      shortParagraphs: paragraphDetails.filter(item => item.words < 40),
      items: paragraphDetails,
      distribution: this._lengthDistribution(wordLengths, [
        { label: '1-60', max: 60 },
        { label: '61-120', max: 120 },
        { label: '121-200', max: 200 },
        { label: '200+', max: Infinity },
      ]),
    };
  }

  // ----------------------------------------------------------
  // Utility helpers
  // ----------------------------------------------------------

  static _buildEmptyResult(language, start, reason) {
    return {
      meta: {
        language: language.code,
        languageName: language.name,
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
        label: 'Insufficient Data',
        color: this._scoreColor(0),
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
      recommendations: [],
      languageGuidance: {
        language: language.name,
        notes: this._buildLanguageNotes(language),
        rules: language.guidance,
      },
      readingLevels: {
        recommendedGrade: 0,
        recommendedLabel: 'N/A',
        educationStages: this._educationStages(),
        audienceFit: [],
      },
      summary: {
        readingTimeMinutes: 0,
        pacing: 'N/A',
        audience: 'N/A',
        wordCount: 0,
        language: language.name,
      },
    };
  }

  static _tokenizeWords(text, language) {
    if (!text) return [];
    const pattern =
      language === 'el'
        ? /[Α-ΩA-ZΆΈΉΊΌΎΏΪΫα-ωa-zάέήίόύώϊΐϋΰ]+/g
        : /[A-Za-zÀ-ÖØ-öø-ÿ]+/g;
    const matches = text.match(pattern);
    return matches ? matches.map(w => w.toLowerCase()) : [];
  }

  static _splitSentences(text) {
    return text
      .split(/[.!?]+\s+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);
  }

  static _collectParagraphs(parsed, fallbackText) {
    if (parsed.paragraphs && parsed.paragraphs.length > 0) {
      return parsed.paragraphs;
    }

    // Normalize line endings
    const normalizedText = fallbackText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // First, try splitting on clear paragraph breaks (double newlines)
    let paragraphs = normalizedText
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);

    // If we only got one paragraph, it might be single-spaced content
    // Try splitting on single newlines, but only if it creates reasonable paragraphs
    if (paragraphs.length === 1) {
      const singleLineParagraphs = normalizedText
        .split(/\n/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0);

      // Only use single-line splits if we get multiple paragraphs
      // and they're not too short (avoid splitting every sentence)
      if (
        singleLineParagraphs.length > 1 &&
        singleLineParagraphs.every(p => p.length > 20)
      ) {
        paragraphs = singleLineParagraphs;
      }
    }

    return paragraphs;
  }

  static _countSyllables(words, language) {
    const details = words.map(word => ({
      word,
      syllables: this._syllableCount(word, language),
    }));

    const total = details.reduce((sum, item) => sum + item.syllables, 0);
    const complex = details.filter(
      item => item.syllables >= language.complexThreshold
    ).length;

    return { total, complex, details };
  }

  static _syllableCount(word, language) {
    if (!word) return 0;

    const normalized = word.toLowerCase();
    const matches = normalized.match(language.vowelGroups);
    let syllables = matches ? matches.length : 1;

    if (language.code === 'en') {
      if (normalized.endsWith('e')) syllables -= 1;
      if (normalized.endsWith('le') && normalized.length > 2) syllables += 1;
      if (normalized.startsWith('mc')) syllables += 1;
      if (normalized.includes('ia')) syllables += 1;
      if (/[^aeiou]y$/.test(normalized)) syllables += 1;
    }

    if (language.code === 'el') {
      if (normalized.endsWith('οι') || normalized.endsWith('ει'))
        syllables -= 1;
      if (normalized.endsWith('ια') && normalized.length > 3) syllables += 1;
    }

    return Math.max(1, syllables);
  }

  static _calculateVocabularyRichness(words) {
    if (!words || words.length === 0) return 0;
    const uniqueWords = new Set(words);
    return this._round(uniqueWords.size / words.length, 3);
  }

  static _lengthDistribution(lengths, buckets) {
    return buckets.map(bucket => {
      const count = lengths.filter(length => length <= bucket.max).length;
      lengths = lengths.filter(length => length > bucket.max);
      return {
        range: bucket.label,
        count,
      };
    });
  }

  static _median(values) {
    if (!values || values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? this._round((sorted[mid - 1] + sorted[mid]) / 2, 1)
      : sorted[mid];
  }

  static _extreme(sentences, lengths, kind) {
    if (!sentences || sentences.length === 0) return null;
    const comparator = kind === 'max' ? Math.max : Math.min;
    const target = comparator(...lengths);
    const index = lengths.indexOf(target);
    return {
      length: target,
      text: sentences[index]?.trim() || '',
    };
  }

  static _stripFallback(content) {
    return htmlParser.stripHtmlTags(content || '').trim();
  }

  static _readingEaseLabel(score) {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  static _readingEaseToGrade(score) {
    if (score >= 90) return 5;
    if (score >= 80) return 6;
    if (score >= 70) return 7;
    if (score >= 60) return 9;
    if (score >= 50) return 10;
    if (score >= 30) return 12;
    return 16;
  }

  static _gradeLabel(grade) {
    if (grade <= 0) return 'Early Readers';
    if (grade < 1) return 'Kindergarten';
    if (grade < 6) return 'Elementary';
    if (grade < 9) return 'Middle School';
    if (grade < 12) return 'High School';
    if (grade < 16) return 'College';
    return 'Graduate';
  }

  static _gradeInterpretation(value) {
    if (value <= 6) return 'Accessible to most readers';
    if (value <= 10) return 'Suitable for secondary education';
    if (value <= 14) return 'Appropriate for college audiences';
    return 'Challenging academic reading';
  }

  static _normalizeGrade(value) {
    const grade = Math.max(0, Math.min(18, value));
    return this._clamp(100 - grade * 5, 0, 100);
  }

  static _scoreColor(score) {
    if (score >= 70) return '#10b981';
    if (score >= 55) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }

  static _compositeLabel(score) {
    if (score >= 75) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 45) return 'Needs Attention';
    return 'Critical';
  }

  static _buildLanguageNotes(language) {
    return `Analysis uses ${language.name} heuristics with a minimum sample of ${language.minWords} words for reliable scoring.`;
  }

  static _educationStages() {
    return [
      { label: 'Elementary', range: 'Grades 1-5' },
      { label: 'Middle School', range: 'Grades 6-8' },
      { label: 'High School', range: 'Grades 9-12' },
      { label: 'College', range: 'Grades 13-16' },
      { label: 'Graduate', range: '17+' },
    ];
  }

  static _audienceFit(grade, language) {
    const bands = [
      { label: 'General Web Audience', max: 8 },
      { label: 'Educated Consumers', max: 12 },
      { label: 'Academic Readers', max: 16 },
      { label: `${language.name} Specialists`, max: 20 },
    ];

    return bands.map(band => ({
      audience: band.label,
      suitable: grade <= band.max,
    }));
  }

  static _round(value, decimals = 0) {
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  static _clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // ----------------------------------------------------------
  // Dynamic Language Guidance Generation (SEO-Focused)
  // ----------------------------------------------------------

  /**
   * Generate dynamic, content-specific language guidance for SEO optimization
   * @param {Object} data - Analysis data
   * @returns {Object} Dynamic guidance with specific issues and advice
   */
  static _generateDynamicLanguageGuidance(data) {
    const { totals, structure, compositeScore, languageCode } = data;

    // Content analysis summary
    const contentAnalysis = {
      overallReadability: compositeScore.label,
      score: compositeScore.score,
      targetAudience: compositeScore.gradeLevel,
      seoReadability: this._getSEOReadabilityLevel(compositeScore.score),
    };

    // Identify specific issues in the content
    const specificIssues = [];
    const actionableAdvice = [];
    const strengthsIdentified = [];

    // Analyze sentence complexity
    const longSentenceRatio =
      structure.sentences.longSentences.length / structure.sentences.count;
    if (longSentenceRatio > 0.3) {
      specificIssues.push({
        severity: 'high',
        category: 'Sentence Complexity',
        finding: `${this._round(longSentenceRatio * 100, 0)}% of sentences exceed 25 words`,
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
        action: `Split sentences over 25 words. Target 15-20 words per sentence for optimal web readability.`,
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
        finding: `${this._round(longParagraphRatio * 100, 0)}% of paragraphs exceed 120 words`,
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
        action: `Break paragraphs into 40-80 word chunks. Use subheadings to improve content hierarchy.`,
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
        finding: `${this._round(totals.complexWordRatio * 100, 0)}% of words are complex (3+ syllables)`,
        impact: 'Technical jargon may limit organic search reach',
        examples: [],
      });
      actionableAdvice.push({
        priority: 'medium',
        rule: 'Simplify Vocabulary for Broader Reach',
        reason:
          'Search engines prioritize content accessible to wider audiences',
        action: `Replace complex terms with simpler alternatives. Use jargon only when targeting specialist searches.`,
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
        finding: `${this._round(sentenceVariety * 100, 0)}% of sentences are very short (≤8 words)`,
        impact: 'Choppy rhythm may reduce engagement time',
        examples: [],
      });
      actionableAdvice.push({
        priority: 'low',
        rule: 'Balance Sentence Lengths',
        reason:
          'Mix of short and medium sentences creates engaging reading rhythm',
        action: `Combine some short sentences or add supporting details to create 12-18 word sentences.`,
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
        action: `Apply sentence and paragraph improvements. Target a score above 60 for optimal SEO.`,
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
    const languageSpecificAdvice = this._getLanguageSpecificSEOAdvice(
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
      crawlability: this._assessCrawlability(structure, totals),
      userEngagement: this._assessUserEngagement(
        compositeScore.score,
        structure
      ),
      mobileFriendliness: this._assessMobileFriendliness(structure),
      voiceSearchOptimization: this._assessVoiceSearchReadiness(
        compositeScore.score,
        totals
      ),
      featuredSnippetPotential: this._assessSnippetPotential(
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
        action: `Continue using clear language, varied sentence structure, and focused paragraphs.`,
        seoImpact: 'Sustained organic performance',
      });
    }

    return {
      contentAnalysis,
      seoImpact,
      specificIssues: (specificIssues || []).sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      actionableAdvice: (actionableAdvice || []).sort((a, b) => {
        const priorityOrder = {
          critical: 0,
          high: 1,
          medium: 2,
          low: 3,
          maintenance: 4,
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }),
      strengthsIdentified: strengthsIdentified || [],
    };
  }

  static _getSEOReadabilityLevel(score) {
    if (score >= 70) return 'Excellent for SEO - highly scannable';
    if (score >= 60) return 'Good for SEO - accessible to most users';
    if (score >= 50) return 'Fair for SEO - may limit reach';
    return 'Poor for SEO - likely to increase bounce rate';
  }

  static _getLanguageSpecificSEOAdvice(
    languageCode,
    totals,
    structure,
    compositeScore
  ) {
    const issues = [];
    const advice = [];
    const strengths = [];

    if (languageCode === 'en') {
      // English-specific SEO checks
      if (structure.sentences.averageLength > 22) {
        issues.push({
          severity: 'medium',
          category: 'English Sentence Structure',
          finding: `Average sentence length of ${structure.sentences.averageLength} words exceeds English web standard`,
          impact: 'English readers expect concise, direct sentences online',
          examples: [],
        });
        advice.push({
          priority: 'medium',
          rule: 'Apply English Web Writing Standards',
          reason:
            'English web content performs best at 15-20 words per sentence',
          action: `Target 18-word average sentences. Use active voice and eliminate filler words.`,
          seoImpact: 'Better engagement from English-speaking markets',
        });
      }

      if (totals.vocabularyRichness < 0.4) {
        issues.push({
          severity: 'low',
          category: 'Keyword Diversity',
          finding: `Low vocabulary richness (${this._round(totals.vocabularyRichness * 100, 0)}%) suggests repetitive language`,
          impact: 'Limited semantic keyword coverage',
          examples: [],
        });
        advice.push({
          priority: 'low',
          rule: 'Expand Semantic Keyword Coverage',
          reason: 'Varied vocabulary captures more long-tail search queries',
          action: `Use synonyms and related terms to broaden topical relevance without keyword stuffing.`,
          seoImpact: 'Improved semantic SEO and featured snippet potential',
        });
      }
    } else if (languageCode === 'el') {
      // Greek-specific SEO checks
      if (structure.paragraphs.averageWords > 100) {
        issues.push({
          severity: 'high',
          category: 'Greek Paragraph Length',
          finding: `Greek paragraphs average ${structure.paragraphs.averageWords} words - exceeds web standard`,
          impact: 'Greek readers expect shorter, focused web paragraphs',
          examples: [],
        });
        advice.push({
          priority: 'high',
          rule: 'Adapt to Greek Web Reading Patterns',
          reason:
            'Greek online content performs best with 50-80 word paragraphs',
          action: `Break paragraphs at natural thought boundaries. Use bullet points for lists.`,
          seoImpact: 'Better engagement from Greek-speaking audiences',
        });
      }

      if (compositeScore.score < 55) {
        advice.push({
          priority: 'high',
          rule: 'Optimize for Greek Search Algorithms',
          reason: 'Greek search engines prioritize accessible content',
          action: `Simplify sentence structure. Use contemporary Greek vocabulary over archaic forms.`,
          seoImpact: 'Improved visibility in Greek search results',
        });
      }
    }

    return { issues, advice, strengths };
  }

  static _assessCrawlability(structure, totals) {
    const score = Math.min(
      100,
      (structure.paragraphs.count >= 3 ? 40 : 20) +
        (structure.sentences.count >= 10 ? 30 : 15) +
        (totals.words >= 300 ? 30 : totals.words / 10)
    );

    return {
      score: this._round(score, 0),
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

  static _assessUserEngagement(readabilityScore, structure) {
    const score = Math.min(
      100,
      readabilityScore * 0.6 +
        (structure.paragraphs.count >= 4 ? 20 : 10) +
        (structure.sentences.averageLength <= 20 ? 20 : 10)
    );

    return {
      score: this._round(score, 0),
      status: score >= 75 ? 'High' : score >= 55 ? 'Moderate' : 'Low',
      reason:
        score >= 75
          ? 'Content is optimized for sustained user engagement'
          : score >= 55
            ? 'Content supports average engagement levels'
            : 'Readability issues may increase bounce rate',
    };
  }

  static _assessMobileFriendliness(structure) {
    const avgParagraphWords = structure.paragraphs.averageWords;
    const score = Math.min(
      100,
      (avgParagraphWords <= 80 ? 50 : (80 / avgParagraphWords) * 50) +
        (structure.sentences.averageLength <= 18
          ? 50
          : (18 / structure.sentences.averageLength) * 50)
    );

    return {
      score: this._round(score, 0),
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

  static _assessVoiceSearchReadiness(readabilityScore, totals) {
    const score = Math.min(
      100,
      (readabilityScore >= 70 ? 60 : readabilityScore * 0.85) +
        (totals.complexWordRatio < 0.15
          ? 40
          : (0.15 - totals.complexWordRatio) * 200)
    );

    return {
      score: this._round(score, 0),
      status: score >= 75 ? 'High' : score >= 55 ? 'Moderate' : 'Low',
      reason:
        score >= 75
          ? 'Conversational tone aligns with voice search queries'
          : score >= 55
            ? 'Partially optimized for voice search'
            : 'Complex language limits voice search compatibility',
    };
  }

  static _assessSnippetPotential(structure, readabilityScore) {
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
      score: this._round(score, 0),
      status: score >= 75 ? 'High' : score >= 55 ? 'Moderate' : 'Low',
      reason:
        score >= 75
          ? 'Content structure favors featured snippet selection'
          : score >= 55
            ? 'Some paragraphs may qualify for featured snippets'
            : 'Current structure limits featured snippet eligibility',
    };
  }

  // ----------------------------------------------------------
  // Specialized Mini-Service Methods
  // ----------------------------------------------------------

  /**
   * Get overview-specific data (composite score, formulas, totals)
   * @param {string} content - HTML or plain text
   * @param {Object} options - Analysis options
   * @returns {Object} Overview-focused analysis
   */
  static analyzeOverview(content, options = {}) {
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
   * @param {string} content - HTML or plain text
   * @param {Object} options - Analysis options
   * @returns {Object} Structure-focused analysis
   */
  static analyzeStructure(content, options = {}) {
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
   * @param {string} content - HTML or plain text
   * @param {Object} options - Analysis options
   * @returns {Object} Reading level-focused analysis
   */
  static analyzeReadingLevels(content, options = {}) {
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
   * @param {string} content - HTML or plain text
   * @param {Object} options - Analysis options
   * @returns {Object} Recommendations-focused analysis
   */
  static analyzeImprovements(content, options = {}) {
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
   * @param {string} content - HTML or plain text
   * @param {Object} options - Analysis options
   * @returns {Object} Language guidance-focused analysis with SEO insights
   */
  static analyzeLanguageGuidance(content, options = {}) {
    const full = this.analyze(content, options);

    // Generate dynamic, content-specific language guidance
    const dynamicGuidance = this._generateDynamicLanguageGuidance({
      totals: full.totals,
      structure: full.structure,
      formulas: full.formulas,
      compositeScore: full.compositeScore,
      language: full.meta.languageName,
      languageCode: full.meta.language,
    });

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
   * @param {string} content - HTML or plain text
   * @param {Object} options - Analysis options
   * @returns {Object} Live scoring-focused analysis
   */
  static analyzeLiveScore(content, options = {}) {
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
}

module.exports = ReadabilityServices;
