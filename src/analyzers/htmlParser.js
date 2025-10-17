/**
 * HTML Content Parser
 * Parses HTML content and extracts SEO-relevant information
 */

/**
 * Parse HTML content and extract SEO elements
 * @param {string} html - HTML content to parse
 * @returns {Object} Parsed content structure
 */
function parse(html) {
  try {
    if (!html || typeof html !== 'string') {
      return getEmptyResult();
    }

    // Remove HTML tags for text analysis
    const text = stripHtmlTags(html);

    // Extract various elements
    const result = {
      text: text.trim(),
      html: html, // Keep original HTML for schema detection
      wordCount: countWords(text),
      characterCount: text.length,
      headings: extractHeadings(html),
      images: extractImages(html),
      links: extractLinks(html),
      paragraphs: extractParagraphs(html),
      readability: analyzeReadability(text),
      metaTags: extractMetaTags(html),
      structuralElements: extractStructuralElements(html),
    };

    return result;
  } catch (error) {
    console.error('HTML parsing error:', error);
    return getEmptyResult();
  }
}

/**
 * Get empty result structure
 * @returns {Object} Empty result
 */
function getEmptyResult() {
  return {
    text: '',
    html: '',
    wordCount: 0,
    characterCount: 0,
    headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
    images: [],
    links: [],
    paragraphs: [],
    readability: { score: 0, level: 'N/A', description: 'No content' },
    metaTags: {
      viewport: null,
      canonical: null,
      robots: null,
      charset: null,
      language: null,
    },
    structuralElements: {
      hasNav: false,
      hasHeader: false,
      hasFooter: false,
      hasMain: false,
      hasArticle: false,
      semanticScore: 0,
    },
  };
}

/**
 * Strip HTML tags from text
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
function stripHtmlTags(html) {
  if (!html) return '';

  return (
    html
      // Remove script and style elements with their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove all HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Count words in text
 * @param {string} text - Text to count
 * @returns {number} Word count
 */
function countWords(text) {
  if (!text || typeof text !== 'string') return 0;

  const words = text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);

  return words.length;
}

/**
 * Extract headings from HTML
 * @param {string} html - HTML content
 * @returns {Object} Headings grouped by level
 */
function extractHeadings(html) {
  const headings = {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
  };

  if (!html) return headings;

  // Extract each heading level
  for (let i = 1; i <= 6; i++) {
    const regex = new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi');
    let match;

    while ((match = regex.exec(html)) !== null) {
      const content = stripHtmlTags(match[1]).trim();
      if (content) {
        headings[`h${i}`].push(content);
      }
    }
  }

  return headings;
}

/**
 * Extract images from HTML
 * @param {string} html - HTML content
 * @returns {Array<Object>} Array of image objects
 */
function extractImages(html) {
  const images = [];

  if (!html) return images;

  // Match img tags
  const regex = /<img[^>]*>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const imgTag = match[0];

    // Extract src
    const srcMatch = /src=["']([^"']+)["']/i.exec(imgTag);
    const src = srcMatch ? srcMatch[1] : '';

    // Extract alt
    const altMatch = /alt=["']([^"']+)["']/i.exec(imgTag);
    const alt = altMatch ? altMatch[1] : '';

    // Extract title
    const titleMatch = /title=["']([^"']+)["']/i.exec(imgTag);
    const title = titleMatch ? titleMatch[1] : '';

    images.push({
      src,
      alt,
      title,
      hasAlt: alt.length > 0,
      hasTitle: title.length > 0,
    });
  }

  return images;
}

/**
 * Extract links from HTML
 * @param {string} html - HTML content
 * @returns {Array<Object>} Array of link objects
 */
function extractLinks(html) {
  const links = [];

  if (!html) return links;

  // Match anchor tags
  const regex = /<a[^>]*>[\s\S]*?<\/a>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const linkTag = match[0];

    // Extract href
    const hrefMatch = /href=["']([^"']+)["']/i.exec(linkTag);
    const href = hrefMatch ? hrefMatch[1] : '';

    // Extract link text
    const textMatch = /<a[^>]*>([\s\S]*?)<\/a>/i.exec(linkTag);
    const text = textMatch ? stripHtmlTags(textMatch[1]).trim() : '';

    // Extract rel attribute
    const relMatch = /rel=["']([^"']+)["']/i.exec(linkTag);
    const rel = relMatch ? relMatch[1] : '';

    // Determine link type
    let type = 'internal';
    if (href.startsWith('http://') || href.startsWith('https://')) {
      type = 'external';
    } else if (href.startsWith('mailto:')) {
      type = 'email';
    } else if (href.startsWith('tel:')) {
      type = 'phone';
    } else if (href.startsWith('#')) {
      type = 'anchor';
    }

    links.push({
      href,
      text,
      rel,
      type,
      hasText: text.length > 0,
    });
  }

  return links;
}

/**
 * Extract paragraphs from HTML
 * @param {string} html - HTML content
 * @returns {Array<string>} Array of paragraph texts
 */
function extractParagraphs(html) {
  const paragraphs = [];

  if (!html) return paragraphs;

  // Match paragraph tags
  const regex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const content = stripHtmlTags(match[1]).trim();
    if (content) {
      paragraphs.push(content);
    }
  }

  return paragraphs;
}

/**
 * Calculate reading time
 * @param {number} wordCount - Number of words
 * @param {number} wordsPerMinute - Reading speed (default: 200)
 * @returns {number} Reading time in minutes
 */
function calculateReadingTime(wordCount, wordsPerMinute = 200) {
  if (wordCount <= 0) return 0;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Analyze text readability (Flesch Reading Ease approximation)
 * @param {string} text - Text to analyze
 * @returns {Object} Readability score and level
 */
function analyzeReadability(text) {
  if (!text || text.length === 0) {
    return {
      score: 0,
      level: 'N/A',
      description: 'No content to analyze',
    };
  }

  const words = countWords(text);
  const sentences = text
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 0).length;
  const syllables = estimateSyllables(text);

  if (words === 0 || sentences === 0) {
    return {
      score: 0,
      level: 'N/A',
      description: 'Insufficient content',
    };
  }

  // Flesch Reading Ease formula
  // Score = 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const score =
    206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

  let level, description;
  if (score >= 90) {
    level = 'Very Easy';
    description = '5th grade level';
  } else if (score >= 80) {
    level = 'Easy';
    description = '6th grade level';
  } else if (score >= 70) {
    level = 'Fairly Easy';
    description = '7th grade level';
  } else if (score >= 60) {
    level = 'Standard';
    description = '8th-9th grade level';
  } else if (score >= 50) {
    level = 'Fairly Difficult';
    description = '10th-12th grade level';
  } else if (score >= 30) {
    level = 'Difficult';
    description = 'College level';
  } else {
    level = 'Very Difficult';
    description = 'College graduate level';
  }

  return {
    score: Math.round(score),
    level,
    description,
  };
}

/**
 * Estimate syllable count in text
 * @param {string} text - Text to analyze
 * @returns {number} Estimated syllable count
 */
function estimateSyllables(text) {
  if (!text) return 0;

  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  let syllableCount = 0;

  words.forEach(word => {
    // Count vowel groups as syllables
    const vowelGroups = word.match(/[aeiouy]+/g);
    let syllables = vowelGroups ? vowelGroups.length : 0;

    // Adjust for silent e
    if (word.endsWith('e')) {
      syllables--;
    }

    // Ensure at least 1 syllable per word
    syllables = Math.max(1, syllables);

    syllableCount += syllables;
  });

  return syllableCount;
}

/**
 * Extract meta tags from HTML
 * @param {string} html - HTML content
 * @returns {Object} Meta tag information
 */
function extractMetaTags(html) {
  const metaTags = {
    viewport: null,
    canonical: null,
    robots: null,
    charset: null,
    language: null,
  };

  if (!html) return metaTags;

  // Extract viewport meta tag
  const viewportMatch = html.match(
    /<meta\s+name=["']viewport["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  if (viewportMatch) {
    metaTags.viewport = viewportMatch[1];
  }

  // Extract canonical link
  const canonicalMatch = html.match(
    /<link\s+rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i
  );
  if (canonicalMatch) {
    metaTags.canonical = canonicalMatch[1];
  }

  // Extract robots meta tag
  const robotsMatch = html.match(
    /<meta\s+name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  if (robotsMatch) {
    metaTags.robots = robotsMatch[1];
  }

  // Extract charset
  const charsetMatch = html.match(/<meta\s+charset=["']([^"']*)["'][^>]*>/i);
  if (charsetMatch) {
    metaTags.charset = charsetMatch[1];
  }

  // Extract language
  const langMatch = html.match(/<html[^>]*lang=["']([^"']*)["'][^>]*>/i);
  if (langMatch) {
    metaTags.language = langMatch[1];
  }

  return metaTags;
}

/**
 * Extract structural/semantic HTML5 elements
 * @param {string} html - HTML content
 * @returns {Object} Structural element information
 */
function extractStructuralElements(html) {
  if (!html) {
    return {
      hasNav: false,
      hasHeader: false,
      hasFooter: false,
      hasMain: false,
      hasArticle: false,
      semanticScore: 0,
    };
  }

  const hasNav = /<nav[^>]*>/i.test(html);
  const hasHeader = /<header[^>]*>/i.test(html);
  const hasFooter = /<footer[^>]*>/i.test(html);
  const hasMain = /<main[^>]*>/i.test(html);
  const hasArticle = /<article[^>]*>/i.test(html);

  // Calculate semantic score (0-5 points)
  const semanticScore = [
    hasNav,
    hasHeader,
    hasFooter,
    hasMain,
    hasArticle,
  ].filter(Boolean).length;

  return {
    hasNav,
    hasHeader,
    hasFooter,
    hasMain,
    hasArticle,
    semanticScore,
  };
}

module.exports = {
  parse,
  stripHtmlTags,
  countWords,
  extractHeadings,
  extractImages,
  extractLinks,
  extractParagraphs,
  calculateReadingTime,
  analyzeReadability,
  extractMetaTags,
  extractStructuralElements,
};
