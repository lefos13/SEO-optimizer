/**
 * SEO Rules Definitions
 * Contains all SEO analysis rules with weights and recommendations
 */

import type {
  SEORule,
  RuleCheckResult,
  SEOContentInput,
} from '../types/seo.types';

const rules: SEORule[] = [
  // ============================================================
  // META TAG RULES
  // ============================================================
  {
    id: 'meta-title-exists',
    category: 'meta',
    severity: 'critical',
    weight: 10,
    title: 'Page Title Exists',
    description: 'Every page must have a title tag',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const passed = content.title && content.title.trim().length > 0;
      return {
        passed: passed || false,
        message: passed ? 'Page title is present' : 'Page title is missing',
      };
    },
    recommendations: [
      'Add a unique, descriptive title for this page',
      'Include primary keywords in the title',
    ],
  },

  {
    id: 'meta-title-length',
    category: 'meta',
    severity: 'high',
    weight: 8,
    title: 'Page Title Length',
    description: 'Title should be between 30-60 characters',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const titleLength = content.title ? content.title.length : 0;
      const passed = titleLength >= 30 && titleLength <= 60;

      let message = 'Title length is optimal';
      if (titleLength === 0) {
        message = 'Title is missing';
      } else if (titleLength < 30) {
        message = `Title is too short (${titleLength} chars). Recommended: 30-60 chars`;
      } else if (titleLength > 60) {
        message = `Title is too long (${titleLength} chars). Recommended: 30-60 chars`;
      }

      return {
        passed,
        message,
        warning: titleLength > 60 || titleLength < 30,
      };
    },
    recommendations: [
      'Keep title between 30-60 characters for optimal display',
      'Titles longer than 60 chars may be truncated in search results',
    ],
  },

  {
    id: 'meta-title-keywords',
    category: 'meta',
    severity: 'high',
    weight: 7,
    title: 'Keywords in Title',
    description: 'Title should contain target keywords',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      if (!content.keywords || content.keywords.length === 0) {
        return { passed: true, message: 'No target keywords defined' };
      }

      const title = (content.title || '').toLowerCase();
      const foundKeywords = content.keywords.filter(keyword =>
        title.includes(keyword.toLowerCase())
      );

      const passed = foundKeywords.length > 0;
      const message = passed
        ? `Found ${foundKeywords.length} keyword(s) in title: ${foundKeywords.join(', ')}`
        : 'No target keywords found in title';

      return { passed, message };
    },
    recommendations: [
      'Include your primary keyword near the beginning of the title',
      'Make sure keywords appear naturally in the title',
    ],
  },

  {
    id: 'meta-description-exists',
    category: 'meta',
    severity: 'critical',
    weight: 10,
    title: 'Meta Description Exists',
    description: 'Every page should have a meta description',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const passed =
        content.description && content.description.trim().length > 0;
      return {
        passed: passed || false,
        message: passed
          ? 'Meta description is present'
          : 'Meta description is missing',
      };
    },
    recommendations: [
      'Add a compelling meta description that summarizes the page content',
      'Include a call-to-action to improve click-through rates',
    ],
  },

  {
    id: 'meta-description-length',
    category: 'meta',
    severity: 'high',
    weight: 8,
    title: 'Meta Description Length',
    description: 'Description should be between 120-160 characters',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const descLength = content.description ? content.description.length : 0;
      const passed = descLength >= 120 && descLength <= 160;

      let message = 'Description length is optimal';
      if (descLength === 0) {
        message = 'Description is missing';
      } else if (descLength < 120) {
        message = `Description is too short (${descLength} chars). Recommended: 120-160 chars`;
      } else if (descLength > 160) {
        message = `Description is too long (${descLength} chars). Recommended: 120-160 chars`;
      }

      return {
        passed,
        message,
        warning: descLength > 160 || descLength < 120,
      };
    },
    recommendations: [
      'Keep description between 120-160 characters',
      'Descriptions longer than 160 chars may be truncated in search results',
    ],
  },

  {
    id: 'meta-description-keywords',
    category: 'meta',
    severity: 'medium',
    weight: 6,
    title: 'Keywords in Description',
    description: 'Description should contain target keywords',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      if (!content.keywords || content.keywords.length === 0) {
        return { passed: true, message: 'No target keywords defined' };
      }

      const description = (content.description || '').toLowerCase();
      const foundKeywords = content.keywords.filter(keyword =>
        description.includes(keyword.toLowerCase())
      );

      const passed = foundKeywords.length > 0;
      const message = passed
        ? `Found ${foundKeywords.length} keyword(s) in description`
        : 'No target keywords found in description';

      return { passed, message };
    },
    recommendations: [
      'Include target keywords naturally in the meta description',
      'Avoid keyword stuffing - write for users, not just search engines',
    ],
  },

  // ============================================================
  // CONTENT RULES
  // ============================================================
  {
    id: 'content-length',
    category: 'content',
    severity: 'high',
    weight: 8,
    title: 'Content Length',
    description: 'Content should have at least 300 words',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const wordCount = content.wordCount || 0;
      const passed = wordCount >= 300;

      let message = `Content has ${wordCount} words`;
      if (wordCount < 300) {
        message += '. Recommended minimum: 300 words';
      }

      return {
        passed,
        message,
        warning: wordCount < 500,
      };
    },
    recommendations: [
      'Aim for at least 300 words of quality content',
      'Longer content (500-1000+ words) often ranks better',
      'Focus on providing comprehensive, valuable information',
    ],
  },

  {
    id: 'keyword-density',
    category: 'content',
    severity: 'medium',
    weight: 6,
    title: 'Keyword Density',
    description: 'Keywords should appear 1-3% of total words',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      if (!content.keywords || content.keywords.length === 0) {
        return { passed: true, message: 'No target keywords defined' };
      }

      // Need text content from parsed HTML
      const html = content.html || '';
      // Simple text extraction (already done by htmlParser, but we need to get it from content)
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      const wordCount = content.wordCount || 0;

      if (wordCount === 0) {
        return { passed: false, message: 'No content to analyze' };
      }

      // Check density for primary keyword
      const primaryKeyword = content.keywords[0];
      const regex = new RegExp(`\\b${primaryKeyword}\\b`, 'gi');
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;
      const density = (count / wordCount) * 100;

      const passed = density >= 1 && density <= 3;
      const message = `Primary keyword density: ${density.toFixed(2)}% (${count} occurrences)`;

      return {
        passed,
        message,
        warning: density > 3 || density < 0.5,
      };
    },
    recommendations: [
      'Maintain keyword density between 1-3%',
      'Use keywords naturally throughout the content',
      'Include keyword variations and synonyms',
    ],
  },

  {
    id: 'headings-structure',
    category: 'content',
    severity: 'medium',
    weight: 7,
    title: 'Heading Structure',
    description: 'Content should use proper heading hierarchy (H1, H2, H3)',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const headings = content.headings || {};
      const h1Count = (headings.h1 || []).length;
      const h2Count = (headings.h2 || []).length;

      // Should have exactly one H1
      const hasOneH1 = h1Count === 1;
      // Should have at least one H2
      const hasH2s = h2Count > 0;

      const passed = hasOneH1 && hasH2s;

      let message = '';
      if (h1Count === 0) {
        message = 'Missing H1 heading';
      } else if (h1Count > 1) {
        message = `Multiple H1 headings found (${h1Count}). Should have exactly one`;
      } else if (h2Count === 0) {
        message = 'No H2 headings found. Add subheadings to structure content';
      } else {
        message = `Proper heading structure: 1 H1, ${h2Count} H2 headings`;
      }

      return { passed, message };
    },
    recommendations: [
      'Use exactly one H1 heading per page',
      'Include H2 headings to structure your content',
      'Use heading hierarchy properly (H1 > H2 > H3)',
    ],
  },

  {
    id: 'headings-keywords',
    category: 'content',
    severity: 'medium',
    weight: 5,
    title: 'Keywords in Headings',
    description: 'Headings should contain target keywords',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      if (!content.keywords || content.keywords.length === 0) {
        return { passed: true, message: 'No target keywords defined' };
      }

      const headings = content.headings || {};
      const allHeadingsText = Object.values(headings)
        .flat()
        .join(' ')
        .toLowerCase();

      const foundKeywords = content.keywords.filter(keyword =>
        allHeadingsText.includes(keyword.toLowerCase())
      );

      const passed = foundKeywords.length > 0;
      const message = passed
        ? `Found keywords in headings: ${foundKeywords.join(', ')}`
        : 'No target keywords found in headings';

      return { passed, message };
    },
    recommendations: [
      'Include target keywords in your H1 and H2 headings',
      'Use keywords naturally in heading text',
    ],
  },

  {
    id: 'images-alt-text',
    category: 'content',
    severity: 'medium',
    weight: 6,
    title: 'Image Alt Text',
    description: 'All images should have descriptive alt text',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const images = content.images || [];

      if (images.length === 0) {
        return { passed: true, message: 'No images found' };
      }

      const imagesWithAlt = images.filter(
        img => img.alt && img.alt.trim().length > 0
      );
      const passed = imagesWithAlt.length === images.length;

      const message = passed
        ? `All ${images.length} images have alt text`
        : `${images.length - imagesWithAlt.length} of ${images.length} images missing alt text`;

      return { passed, message };
    },
    recommendations: [
      'Add descriptive alt text to all images',
      'Include keywords in alt text when relevant',
      'Keep alt text concise and descriptive',
    ],
  },

  // ============================================================
  // TECHNICAL RULES
  // ============================================================
  {
    id: 'internal-links',
    category: 'technical',
    severity: 'low',
    weight: 4,
    title: 'Internal Links',
    description: 'Content should include internal links',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const links = content.links || [];
      const internalLinks = links.filter(link => link.type === 'internal');

      const passed = internalLinks.length > 0;
      const message = passed
        ? `Found ${internalLinks.length} internal link(s)`
        : 'No internal links found';

      return { passed, message };
    },
    recommendations: [
      'Add internal links to related content on your site',
      'Use descriptive anchor text for links',
      'Link to important pages to distribute page authority',
    ],
  },

  {
    id: 'external-links',
    category: 'technical',
    severity: 'low',
    weight: 3,
    title: 'External Links',
    description: 'Content should include relevant external links',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const links = content.links || [];
      const externalLinks = links.filter(link => link.type === 'external');

      const passed = externalLinks.length > 0;
      const message = passed
        ? `Found ${externalLinks.length} external link(s)`
        : 'No external links found';

      return {
        passed,
        message,
        warning: externalLinks.length === 0,
      };
    },
    recommendations: [
      'Link to authoritative external sources when relevant',
      'Add rel="noopener noreferrer" to external links for security',
    ],
  },

  // ============================================================
  // ADVANCED CONTENT ANALYSIS RULES
  // ============================================================
  {
    id: 'heading-hierarchy',
    category: 'content',
    severity: 'medium',
    weight: 5,
    title: 'Heading Hierarchy',
    description:
      'Headings should follow proper hierarchy without skipping levels',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const headings = content.headings || {};
      const h1Count = (headings.h1 || []).length;
      const h2Count = (headings.h2 || []).length;
      const h3Count = (headings.h3 || []).length;
      const h4Count = (headings.h4 || []).length;

      const issues: string[] = [];

      // Check for skipped levels
      if (h3Count > 0 && h2Count === 0) {
        issues.push('H3 used without H2');
      }
      if (h4Count > 0 && h3Count === 0) {
        issues.push('H4 used without H3');
      }

      const passed = issues.length === 0 && h1Count === 1;
      const message =
        issues.length > 0
          ? `Heading hierarchy issues: ${issues.join(', ')}`
          : 'Proper heading hierarchy maintained';

      return { passed, message };
    },
    recommendations: [
      'Use headings in sequential order (H1 → H2 → H3)',
      'Do not skip heading levels',
      'Maintain logical document structure',
    ],
  },

  {
    id: 'paragraph-length',
    category: 'readability',
    severity: 'low',
    weight: 3,
    title: 'Paragraph Length',
    description: 'Paragraphs should be reasonably sized for readability',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const paragraphs = content.paragraphs || [];

      if (paragraphs.length === 0) {
        return { passed: true, message: 'No paragraphs to analyze' };
      }

      // Check for overly long paragraphs (>150 words)
      const longParagraphs = paragraphs.filter(p => {
        const wordCount = p.split(/\s+/).length;
        return wordCount > 150;
      });

      const passed = longParagraphs.length === 0;
      const message = passed
        ? 'All paragraphs are reasonably sized'
        : `${longParagraphs.length} paragraph(s) exceed 150 words`;

      return {
        passed,
        message,
        warning: longParagraphs.length > 0,
      };
    },
    recommendations: [
      'Keep paragraphs under 150 words for better readability',
      'Break long paragraphs into smaller chunks',
      'Use bullet points or lists for long content',
    ],
  },

  {
    id: 'readability-score',
    category: 'readability',
    severity: 'medium',
    weight: 5,
    title: 'Content Readability',
    description: 'Content should be easily readable (Flesch Reading Ease)',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const readability = content.readability || { score: 0, level: 'N/A' };

      // Optimal range: 60-80 (Standard to Fairly Easy)
      const score = readability.score || 0;
      const passed = score >= 60 && score <= 80;

      let message = `Readability score: ${score} (${readability.level})`;
      if (score < 60) {
        message += ' - Content may be too complex';
      } else if (score > 80) {
        message += ' - Content may be too simple';
      }

      return {
        passed,
        message,
        warning: score < 50 || score > 90,
      };
    },
    recommendations: [
      'Aim for a Flesch Reading Ease score of 60-80',
      'Use shorter sentences for better readability',
      'Avoid complex vocabulary when simpler words work',
      'Write for your target audience level',
    ],
  },

  {
    id: 'sentence-length',
    category: 'readability',
    severity: 'low',
    weight: 3,
    title: 'Sentence Length',
    description: 'Sentences should be concise and easy to read',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const html = content.html || '';
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

      if (!text) {
        return { passed: true, message: 'No content to analyze' };
      }

      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = text.split(/\s+/).filter(w => w.length > 0);

      if (sentences.length === 0) {
        return { passed: true, message: 'No sentences found' };
      }

      const avgWordsPerSentence = words.length / sentences.length;
      const passed = avgWordsPerSentence <= 20;

      const message = `Average sentence length: ${avgWordsPerSentence.toFixed(1)} words`;

      return {
        passed,
        message,
        warning: avgWordsPerSentence > 25,
      };
    },
    recommendations: [
      'Keep average sentence length under 20 words',
      'Mix short and long sentences for better flow',
      'Break complex sentences into simpler ones',
    ],
  },

  {
    id: 'link-anchor-text',
    category: 'technical',
    severity: 'medium',
    weight: 4,
    title: 'Descriptive Link Anchor Text',
    description: 'Links should have descriptive anchor text',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const links = content.links || [];

      if (links.length === 0) {
        return { passed: true, message: 'No links found' };
      }

      // Check for generic anchor text
      const genericTexts = [
        'click here',
        'read more',
        'here',
        'link',
        'more',
        'this',
      ];

      const poorLinks = links.filter(link => {
        const text = (link.text || '').toLowerCase().trim();
        return (
          text.length === 0 || genericTexts.includes(text) || text.length < 3
        );
      });

      const passed = poorLinks.length === 0;
      const message = passed
        ? 'All links have descriptive anchor text'
        : `${poorLinks.length} link(s) have poor anchor text`;

      return { passed, message };
    },
    recommendations: [
      'Use descriptive, keyword-rich anchor text',
      'Avoid generic text like "click here" or "read more"',
      'Anchor text should describe the destination',
    ],
  },

  {
    id: 'image-file-names',
    category: 'technical',
    severity: 'low',
    weight: 3,
    title: 'Descriptive Image File Names',
    description: 'Image file names should be descriptive',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const images = content.images || [];

      if (images.length === 0) {
        return { passed: true, message: 'No images found' };
      }

      // Check for poor file names
      const poorNamePatterns =
        /^(img|image|photo|pic|picture|dsc|screenshot)\d*$/i;

      const poorImages = images.filter(img => {
        const src = img.src || '';
        const parts = src.split('/');
        const lastPart = parts[parts.length - 1] || '';
        const fileNameWithExt = lastPart.split('?')[0] || '';
        const fileName = fileNameWithExt.split('.')[0] || '';
        return (
          poorNamePatterns.test(fileName) ||
          fileName.length < 3 ||
          /^\d+$/.test(fileName)
        );
      });

      const passed = poorImages.length === 0;
      const message = passed
        ? 'All images have descriptive file names'
        : `${poorImages.length} image(s) have generic file names`;

      return {
        passed,
        message,
        warning: poorImages.length > 0,
      };
    },
    recommendations: [
      'Use descriptive, keyword-rich image file names',
      'Avoid generic names like "image1.jpg" or "DSC001.jpg"',
      'Use hyphens to separate words in file names',
    ],
  },

  {
    id: 'broken-links-check',
    category: 'technical',
    severity: 'medium',
    weight: 5,
    title: 'Link Validity',
    description: 'Check for potentially broken links',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const links = content.links || [];

      if (links.length === 0) {
        return { passed: true, message: 'No links to check' };
      }

      // Check for suspicious links
      const suspiciousLinks = links.filter(link => {
        const href = link.href || '';
        return (
          href === '' ||
          href === '#' ||
          href === 'javascript:void(0)' ||
          href === 'javascript:;'
        );
      });

      const passed = suspiciousLinks.length === 0;
      const message = passed
        ? 'All links appear valid'
        : `${suspiciousLinks.length} suspicious or empty link(s) found`;

      return { passed, message };
    },
    recommendations: [
      'Ensure all links have valid destinations',
      'Avoid empty or placeholder links',
      'Regularly check for broken links',
    ],
  },

  {
    id: 'content-freshness',
    category: 'content',
    severity: 'low',
    weight: 2,
    title: 'Content Structure Indicators',
    description: 'Check for time-sensitive content structure',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const html = content.html || '';
      const text = html.replace(/<[^>]+>/g, ' ').toLowerCase();

      // Look for date mentions or temporal words
      const temporalWords = [
        'today',
        'yesterday',
        'last week',
        'this month',
        'current',
        'latest',
        'recent',
        'updated',
      ];

      const hasTemporalContent = temporalWords.some(word =>
        text.includes(word)
      );

      // This is more of an informational rule
      const message = hasTemporalContent
        ? 'Content contains time-sensitive information - ensure regular updates'
        : 'No time-sensitive indicators found';

      return {
        passed: true, // Always passes, just informational
        message,
        warning: hasTemporalContent,
      };
    },
    recommendations: [
      'Update time-sensitive content regularly',
      'Add publication/update dates to content',
      'Review and refresh old content periodically',
    ],
  },

  {
    id: 'schema-markup',
    category: 'technical',
    severity: 'low',
    weight: 4,
    title: 'Schema Markup Detection',
    description: 'Check for structured data markup',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const html = content.html || '';

      // Check for common schema markup patterns
      const hasJsonLd = html.includes('application/ld+json');
      const hasMicrodata =
        html.includes('itemscope') || html.includes('itemprop');
      const hasRDFa = html.includes('vocab=') || html.includes('typeof=');

      const hasSchema = hasJsonLd || hasMicrodata || hasRDFa;

      const schemaTypes = [
        hasJsonLd && 'JSON-LD',
        hasMicrodata && 'Microdata',
        hasRDFa && 'RDFa',
      ].filter(Boolean);

      const message = hasSchema
        ? `Schema markup detected: ${schemaTypes.join(', ')}`
        : 'No schema markup detected';

      return {
        passed: hasSchema,
        message,
        warning: !hasSchema,
      };
    },
    recommendations: [
      'Add structured data markup (Schema.org)',
      'Use JSON-LD format for best compatibility',
      'Implement relevant schema types (Article, Product, etc.)',
      'Test with Google Rich Results Test',
    ],
  },

  {
    id: 'content-uniqueness',
    category: 'content',
    severity: 'high',
    weight: 7,
    title: 'Content Uniqueness Check',
    description: 'Check for repetitive or duplicate content patterns',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const paragraphs = content.paragraphs || [];

      if (paragraphs.length < 2) {
        return { passed: true, message: 'Not enough paragraphs to analyze' };
      }

      // Check for duplicate paragraphs
      const uniqueParagraphs = new Set(
        paragraphs.map(p => p.toLowerCase().trim())
      );
      const duplicateCount = paragraphs.length - uniqueParagraphs.size;

      const passed = duplicateCount === 0;
      const message = passed
        ? 'No duplicate content detected'
        : `${duplicateCount} duplicate paragraph(s) found`;

      return {
        passed,
        message,
        warning: duplicateCount > 0,
      };
    },
    recommendations: [
      'Ensure all content is unique and original',
      'Avoid copying and pasting duplicate text',
      'Use plagiarism checkers for verification',
      'Rewrite similar sections with unique content',
    ],
  },

  {
    id: 'multimedia-content',
    category: 'content',
    severity: 'low',
    weight: 3,
    title: 'Multimedia Content',
    description: 'Content should include images or other media',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const images = content.images || [];
      const wordCount = content.wordCount || 0;

      if (wordCount === 0) {
        return { passed: true, message: 'No content to analyze' };
      }

      // Recommend at least one image per 300 words
      const recommendedImages = Math.ceil(wordCount / 300);
      const passed = images.length >= Math.min(recommendedImages, 1);

      const message =
        images.length === 0
          ? 'No images found. Consider adding visual content'
          : `${images.length} image(s) found`;

      return {
        passed,
        message,
        warning: images.length === 0 && wordCount > 300,
      };
    },
    recommendations: [
      'Include relevant images to break up text',
      'Add at least one image per 300 words of content',
      'Use charts, infographics, or screenshots when relevant',
      'Ensure all media files are optimized for web',
    ],
  },

  {
    id: 'list-usage',
    category: 'readability',
    severity: 'low',
    weight: 2,
    title: 'List Elements Usage',
    description: 'Check for proper use of lists for better readability',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const html = content.html || '';
      const wordCount = content.wordCount || 0;

      const hasLists = html.includes('<ul>') || html.includes('<ol>');

      // For longer content, lists improve readability
      const shouldHaveLists = wordCount > 500;

      const passed = !shouldHaveLists || hasLists;
      const message = hasLists
        ? 'Lists used for better content structure'
        : wordCount > 500
          ? 'Consider using lists to organize information'
          : 'No lists needed for short content';

      return {
        passed,
        message,
        warning: shouldHaveLists && !hasLists,
      };
    },
    recommendations: [
      'Use bullet points or numbered lists for sequential information',
      'Break down complex information into lists',
      'Lists improve scannability and readability',
    ],
  },

  // ============================================================
  // URL STRUCTURE RULES
  // ============================================================
  {
    id: 'url-length',
    category: 'technical',
    severity: 'medium',
    weight: 4,
    title: 'URL Length',
    description: 'URL should be concise and under 75 characters',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const url = content.url || '';

      if (!url) {
        return { passed: true, message: 'No URL provided for analysis' };
      }

      // Remove protocol and domain to get the path
      const urlPath = url.replace(/^https?:\/\/[^/]+/i, '');
      const passed = urlPath.length <= 75;

      const message =
        urlPath.length === 0
          ? 'URL is root path'
          : `URL path length: ${urlPath.length} characters`;

      return {
        passed,
        message,
        warning: urlPath.length > 100,
      };
    },
    recommendations: [
      'Keep URLs under 75 characters when possible',
      'Use short, descriptive URLs',
      'Avoid unnecessary parameters and subdirectories',
    ],
  },

  {
    id: 'url-keywords',
    category: 'technical',
    severity: 'medium',
    weight: 5,
    title: 'Keywords in URL',
    description: 'URL should contain target keywords',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const url = (content.url || '').toLowerCase();
      const keywords = content.keywords || [];

      if (!url) {
        return { passed: true, message: 'No URL provided for analysis' };
      }

      if (keywords.length === 0) {
        return { passed: true, message: 'No target keywords defined' };
      }

      // Check if any keyword appears in URL
      const foundKeywords = keywords.filter(keyword =>
        url.includes(keyword.toLowerCase().replace(/\s+/g, '-'))
      );

      const passed = foundKeywords.length > 0;
      const message = passed
        ? `Found keyword(s) in URL: ${foundKeywords.join(', ')}`
        : 'No target keywords found in URL';

      return { passed, message };
    },
    recommendations: [
      'Include primary keyword in URL',
      'Use hyphens to separate words in URLs',
      'Keep URLs descriptive and relevant to content',
    ],
  },

  {
    id: 'url-structure',
    category: 'technical',
    severity: 'medium',
    weight: 4,
    title: 'Clean URL Structure',
    description: 'URL should be clean and readable',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const url = content.url || '';

      if (!url) {
        return { passed: true, message: 'No URL provided for analysis' };
      }

      const issues: string[] = [];

      // Check for common issues
      if (url.includes('_')) {
        issues.push('Contains underscores (use hyphens instead)');
      }
      if (url.includes('%20')) {
        issues.push('Contains URL-encoded spaces');
      }
      if (/[A-Z]/.test(url)) {
        issues.push('Contains uppercase letters');
      }
      if (url.includes('?')) {
        const paramCount = (url.match(/[?&]/g) || []).length;
        if (paramCount > 2) {
          issues.push(`Too many URL parameters (${paramCount})`);
        }
      }
      if (/\d{5,}/.test(url)) {
        issues.push('Contains long number sequences');
      }

      const passed = issues.length === 0;
      const message = passed
        ? 'URL structure is clean and SEO-friendly'
        : `URL issues: ${issues.join(', ')}`;

      return { passed, message };
    },
    recommendations: [
      'Use lowercase letters in URLs',
      'Use hyphens instead of underscores',
      'Avoid special characters and spaces',
      'Minimize URL parameters',
      'Avoid auto-generated IDs in URLs when possible',
    ],
  },

  {
    id: 'url-depth',
    category: 'technical',
    severity: 'low',
    weight: 3,
    title: 'URL Depth',
    description: 'URL should not be too deeply nested',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const url = content.url || '';

      if (!url) {
        return { passed: true, message: 'No URL provided for analysis' };
      }

      // Count URL depth (number of slashes in path)
      const urlPath = url.replace(/^https?:\/\/[^/]+/i, '');
      const depth = (urlPath.match(/\//g) || []).length;

      const passed = depth <= 3;
      const message = `URL depth: ${depth} level(s)`;

      return {
        passed,
        message,
        warning: depth > 4,
      };
    },
    recommendations: [
      'Keep URL structure shallow (3 levels or less)',
      'Flat URL structures are easier to crawl and understand',
      'Consider restructuring deep hierarchies',
    ],
  },

  // ============================================================
  // ADVANCED TECHNICAL SEO RULES
  // ============================================================
  {
    id: 'viewport-meta',
    category: 'technical',
    severity: 'high',
    weight: 7,
    title: 'Mobile Viewport Meta Tag',
    description: 'Page must have viewport meta tag for mobile optimization',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const metaTags = content.metaTags || {};
      const viewport = metaTags.viewport;

      const passed =
        viewport !== null && viewport !== undefined && viewport.length > 0;
      const message = passed
        ? `Viewport configured: ${viewport}`
        : 'Viewport meta tag is missing';

      return { passed, message };
    },
    recommendations: [
      'Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">',
      'Viewport is essential for mobile-friendliness',
      'Ensure responsive design for all screen sizes',
    ],
  },

  {
    id: 'canonical-url',
    category: 'technical',
    severity: 'high',
    weight: 7,
    title: 'Canonical URL',
    description: 'Page should specify canonical URL to avoid duplicate content',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const metaTags = content.metaTags || {};
      const canonical = metaTags.canonical;

      const passed =
        canonical !== null && canonical !== undefined && canonical.length > 0;
      const message = passed
        ? `Canonical URL defined: ${canonical}`
        : 'Canonical URL not specified';

      return {
        passed,
        message,
        warning: !passed,
      };
    },
    recommendations: [
      'Add canonical link: <link rel="canonical" href="https://example.com/page">',
      'Prevents duplicate content issues',
      'Helps search engines understand preferred URL',
    ],
  },

  {
    id: 'robots-meta',
    category: 'technical',
    severity: 'medium',
    weight: 5,
    title: 'Robots Meta Tag',
    description: 'Check robots meta tag configuration',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const metaTags = content.metaTags || {};
      const robots = metaTags.robots;

      if (!robots) {
        return {
          passed: true,
          message: 'No robots meta tag (default: index, follow)',
        };
      }

      const robotsLower = robots.toLowerCase();
      const hasNoindex = robotsLower.includes('noindex');
      const hasNofollow = robotsLower.includes('nofollow');

      if (hasNoindex || hasNofollow) {
        const warnings: string[] = [];
        if (hasNoindex) warnings.push('noindex');
        if (hasNofollow) warnings.push('nofollow');

        return {
          passed: false,
          message: `Robots directives may limit indexing: ${warnings.join(', ')}`,
          warning: true,
        };
      }

      return {
        passed: true,
        message: `Robots meta tag configured: ${robots}`,
      };
    },
    recommendations: [
      'Ensure robots meta tag allows indexing for public pages',
      'Use "noindex" only for pages you want excluded from search',
      'Check robots.txt file as well',
    ],
  },

  {
    id: 'https-protocol',
    category: 'technical',
    severity: 'critical',
    weight: 10,
    title: 'HTTPS/SSL Security',
    description: 'Page should use HTTPS protocol for security',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const url = content.url || '';

      if (!url) {
        return {
          passed: true,
          message: 'No URL provided for protocol check',
        };
      }

      const passed = url.toLowerCase().startsWith('https://');
      const message = passed
        ? 'Page uses secure HTTPS protocol'
        : 'Page uses insecure HTTP protocol';

      return { passed, message };
    },
    recommendations: [
      'Install SSL certificate for HTTPS',
      'HTTPS is a ranking factor for Google',
      'Protects user data and improves trust',
      'Redirect all HTTP traffic to HTTPS',
    ],
  },

  {
    id: 'semantic-html',
    category: 'technical',
    severity: 'medium',
    weight: 5,
    title: 'Semantic HTML5 Structure',
    description: 'Page should use semantic HTML5 elements',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const structural = content.structuralElements || { semanticScore: 0 };

      const score = structural.semanticScore || 0;
      const passed = score >= 3;

      const elements: string[] = [];
      if (structural.hasHeader) elements.push('header');
      if (structural.hasNav) elements.push('nav');
      if (structural.hasMain) elements.push('main');
      if (structural.hasArticle) elements.push('article');
      if (structural.hasFooter) elements.push('footer');

      const message =
        elements.length > 0
          ? `Found semantic elements: ${elements.join(', ')} (${score}/5)`
          : 'No semantic HTML5 elements found';

      return {
        passed,
        message,
        warning: score < 3,
      };
    },
    recommendations: [
      'Use semantic HTML5 tags: <header>, <nav>, <main>, <article>, <footer>',
      'Improves accessibility and SEO',
      'Helps search engines understand page structure',
    ],
  },

  {
    id: 'html-lang',
    category: 'technical',
    severity: 'medium',
    weight: 5,
    title: 'HTML Language Declaration',
    description: 'HTML tag should declare page language',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const metaTags = content.metaTags || {};
      const language = metaTags.language;

      const passed =
        language !== null && language !== undefined && language.length > 0;
      const message = passed
        ? `Language declared: ${language}`
        : 'HTML language attribute not set';

      return { passed, message };
    },
    recommendations: [
      'Add lang attribute to <html> tag: <html lang="en">',
      'Use correct language code (en, el, fr, etc.)',
      'Helps screen readers and search engines',
    ],
  },

  {
    id: 'charset-declaration',
    category: 'technical',
    severity: 'high',
    weight: 6,
    title: 'Character Encoding',
    description: 'Page should declare character encoding',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const metaTags = content.metaTags || {};
      const charset = metaTags.charset;

      const passed =
        charset !== null && charset !== undefined && charset.length > 0;
      const isUtf8 = charset && charset.toLowerCase() === 'utf-8';

      let message = 'Character encoding not declared';
      if (passed) {
        message = isUtf8
          ? `Charset declared: ${charset} (recommended)`
          : `Charset declared: ${charset}`;
      }

      return {
        passed,
        message,
        warning: passed && !isUtf8,
      };
    },
    recommendations: [
      'Add charset meta tag: <meta charset="UTF-8">',
      'UTF-8 supports all languages and special characters',
      'Place charset declaration early in <head>',
    ],
  },

  {
    id: 'html-validation',
    category: 'technical',
    severity: 'low',
    weight: 3,
    title: 'Basic HTML Structure',
    description: 'Check for basic HTML structure elements',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const html = content.html || '';

      if (!html) {
        return { passed: true, message: 'No HTML content to validate' };
      }

      const issues: string[] = [];

      // Check for basic structure
      if (!/<html[^>]*>/i.test(html)) {
        issues.push('Missing <html> tag');
      }
      if (!/<head[^>]*>/i.test(html)) {
        issues.push('Missing <head> tag');
      }
      if (!/<body[^>]*>/i.test(html)) {
        issues.push('Missing <body> tag');
      }
      if (!/<title[^>]*>/i.test(html)) {
        issues.push('Missing <title> tag');
      }

      const passed = issues.length === 0;
      const message = passed
        ? 'Basic HTML structure is valid'
        : `Structure issues: ${issues.join(', ')}`;

      return {
        passed,
        message,
        warning: issues.length > 0,
      };
    },
    recommendations: [
      'Ensure proper HTML document structure',
      'Include <!DOCTYPE html> declaration',
      'Validate HTML with W3C validator',
    ],
  },

  {
    id: 'accessibility-basics',
    category: 'technical',
    severity: 'medium',
    weight: 5,
    title: 'Basic Accessibility',
    description: 'Check basic accessibility requirements',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const images = content.images || [];
      const headings = content.headings || {};
      const links = content.links || [];

      const issues: string[] = [];

      // Check image alt texts
      const imagesWithoutAlt = images.filter(
        img => !img.alt || img.alt.trim() === ''
      );
      if (imagesWithoutAlt.length > 0) {
        issues.push(`${imagesWithoutAlt.length} image(s) without alt text`);
      }

      // Check heading structure
      const h1Count = (headings.h1 || []).length;
      if (h1Count === 0) {
        issues.push('No H1 heading (required for screen readers)');
      } else if (h1Count > 1) {
        issues.push('Multiple H1 headings (should have only one)');
      }

      // Check for empty links
      const emptyLinks = links.filter(
        link => !link.text || link.text.trim() === ''
      );
      if (emptyLinks.length > 0) {
        issues.push(`${emptyLinks.length} link(s) without text`);
      }

      const passed = issues.length === 0;
      const message = passed
        ? 'Basic accessibility checks passed'
        : `Accessibility issues: ${issues.join(', ')}`;

      return {
        passed,
        message,
        warning: issues.length > 0,
      };
    },
    recommendations: [
      'Add alt text to all images',
      'Use single H1 per page',
      'Ensure all links have descriptive text',
      'Test with screen readers',
      'Follow WCAG guidelines',
    ],
  },

  {
    id: 'page-size-estimate',
    category: 'technical',
    severity: 'low',
    weight: 3,
    title: 'Page Size Performance',
    description: 'Estimate page size for performance',
    check: async (content: SEOContentInput): Promise<RuleCheckResult> => {
      const html = content.html || '';
      const pageSizeKB = Math.round((html.length / 1024) * 10) / 10;

      // Recommended: under 100KB for HTML
      const passed = pageSizeKB < 100;

      const message = `Estimated HTML size: ${pageSizeKB} KB`;

      return {
        passed,
        message,
        warning: pageSizeKB > 150,
      };
    },
    recommendations: [
      'Keep HTML under 100KB for better performance',
      'Minify HTML for production',
      'Remove unnecessary whitespace and comments',
      'Consider lazy loading for large content',
    ],
  },
];

/**
 * Get all rules
 * @returns All SEO rules
 */
export function getAllRules(): SEORule[] {
  return rules;
}

/**
 * Get rules by category
 * @param category - Rule category
 * @returns Rules in category
 */
export function getRulesByCategory(category: string): SEORule[] {
  return rules.filter(rule => rule.category === category);
}

/**
 * Get rule by ID
 * @param id - Rule ID
 * @returns Rule or null if not found
 */
export function getRuleById(id: string): SEORule | null {
  return rules.find(rule => rule.id === id) || null;
}

/**
 * Get rules by severity
 * @param severity - Rule severity
 * @returns Rules with given severity
 */
export function getRulesBySeverity(severity: string): SEORule[] {
  return rules.filter(rule => rule.severity === severity);
}

export { rules };
