/**
 * Meta Tag Generator
 * Generates and validates SEO meta tags with templates
 */

export interface MetaTagSet {
  title: string;
  description: string;
  keywords?: string;
  ogTags: OpenGraphTags;
  twitterTags: TwitterTags;
  additionalTags: AdditionalMetaTags;
}

export interface OpenGraphTags {
  'og:title': string;
  'og:description': string;
  'og:type': string;
  'og:url': string;
  'og:image': string;
  'og:site_name'?: string;
  'og:locale'?: string;
}

export interface TwitterTags {
  'twitter:card': 'summary' | 'summary_large_image' | 'app' | 'player';
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image': string;
  'twitter:site'?: string;
  'twitter:creator'?: string;
}

export interface AdditionalMetaTags {
  robots?: string;
  canonical?: string;
  author?: string;
  viewport?: string;
  charset?: string;
}

export interface MetaTagValidation {
  isValid: boolean;
  errors: MetaTagError[];
  warnings: MetaTagWarning[];
  score: number;
}

export interface MetaTagError {
  field: string;
  message: string;
  impact: 'critical' | 'high';
}

export interface MetaTagWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface MetaTagTemplate {
  name: string;
  category: string;
  description: string;
  tags: Partial<MetaTagSet>;
}

/**
 * Pre-defined meta tag templates
 */
export const META_TAG_TEMPLATES: MetaTagTemplate[] = [
  {
    name: 'Blog Post',
    category: 'Content',
    description: 'Optimized for blog articles and content pages',
    tags: {
      ogTags: {
        'og:title': '[Article Title]',
        'og:description': '[Brief article summary]',
        'og:type': 'article',
        'og:url': '[Article URL]',
        'og:image': '[Featured image URL]',
      },
      twitterTags: {
        'twitter:card': 'summary_large_image',
        'twitter:title': '[Article Title]',
        'twitter:description': '[Brief article summary]',
        'twitter:image': '[Featured image URL]',
      },
      additionalTags: {
        robots: 'index, follow',
        author: '[Author Name]',
      },
    },
  },
  {
    name: 'Product Page',
    category: 'E-commerce',
    description: 'Optimized for product listings and e-commerce',
    tags: {
      ogTags: {
        'og:title': '[Product Name] - [Brand]',
        'og:description': '[Product description]',
        'og:type': 'product',
        'og:url': '[Product URL]',
        'og:image': '[Product image URL]',
      },
      twitterTags: {
        'twitter:card': 'summary_large_image',
        'twitter:title': '[Product Name]',
        'twitter:description': '[Product description]',
        'twitter:image': '[Product image URL]',
      },
      additionalTags: {
        robots: 'index, follow',
      },
    },
  },
  {
    name: 'Homepage',
    category: 'General',
    description: 'Optimized for website homepage',
    tags: {
      ogTags: {
        'og:title': '[Site Name] - [Tagline]',
        'og:description': '[Site description]',
        'og:type': 'website',
        'og:url': '[Homepage URL]',
        'og:image': '[Logo or hero image URL]',
        'og:site_name': '[Site Name]',
      },
      twitterTags: {
        'twitter:card': 'summary',
        'twitter:title': '[Site Name]',
        'twitter:description': '[Site description]',
        'twitter:image': '[Logo URL]',
      },
      additionalTags: {
        robots: 'index, follow',
      },
    },
  },
  {
    name: 'Service Page',
    category: 'Business',
    description: 'Optimized for service or landing pages',
    tags: {
      ogTags: {
        'og:title': '[Service Name] - [Company]',
        'og:description': '[Service description and benefits]',
        'og:type': 'website',
        'og:url': '[Service page URL]',
        'og:image': '[Service image URL]',
      },
      twitterTags: {
        'twitter:card': 'summary_large_image',
        'twitter:title': '[Service Name]',
        'twitter:description': '[Service description]',
        'twitter:image': '[Service image URL]',
      },
      additionalTags: {
        robots: 'index, follow',
      },
    },
  },
];

/**
 * Generates meta tags from a template
 */
export function generateFromTemplate(
  templateName: string,
  data: Record<string, string>
): MetaTagSet {
  const template = META_TAG_TEMPLATES.find(t => t.name === templateName);

  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }

  const tags = JSON.parse(JSON.stringify(template.tags)) as Partial<MetaTagSet>;

  // Replace placeholders with actual data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const replaceInObject = (obj: any): any => {
    if (typeof obj === 'string') {
      let result = obj;
      Object.entries(data).forEach(([key, value]) => {
        result = result.replace(`[${key}]`, value);
      });
      return result;
    }

    if (Array.isArray(obj)) {
      return obj.map(replaceInObject);
    }

    if (typeof obj === 'object' && obj !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newObj: any = {};
      Object.entries(obj).forEach(([key, value]) => {
        newObj[key] = replaceInObject(value);
      });
      return newObj;
    }

    return obj;
  };

  return replaceInObject(tags) as MetaTagSet;
}

/**
 * Validates meta tags
 */
export function validateMetaTags(tags: Partial<MetaTagSet>): MetaTagValidation {
  const errors: MetaTagError[] = [];
  const warnings: MetaTagWarning[] = [];

  // Title validation
  if (!tags.title) {
    errors.push({
      field: 'title',
      message: 'Title tag is required',
      impact: 'critical',
    });
  } else {
    if (tags.title.length < 30) {
      warnings.push({
        field: 'title',
        message: 'Title is too short',
        suggestion: 'Use 30-60 characters for optimal display',
      });
    }
    if (tags.title.length > 60) {
      warnings.push({
        field: 'title',
        message: 'Title is too long',
        suggestion: 'Keep title under 60 characters to avoid truncation',
      });
    }
  }

  // Description validation
  if (!tags.description) {
    errors.push({
      field: 'description',
      message: 'Meta description is required',
      impact: 'high',
    });
  } else {
    if (tags.description.length < 120) {
      warnings.push({
        field: 'description',
        message: 'Description is too short',
        suggestion: 'Use 120-160 characters for best results',
      });
    }
    if (tags.description.length > 160) {
      warnings.push({
        field: 'description',
        message: 'Description is too long',
        suggestion: 'Keep description under 160 characters',
      });
    }
  }

  // Open Graph validation
  if (tags.ogTags) {
    if (!tags.ogTags['og:title']) {
      warnings.push({
        field: 'og:title',
        message: 'Open Graph title is missing',
        suggestion: 'Add og:title for better social media sharing',
      });
    }

    if (!tags.ogTags['og:image']) {
      warnings.push({
        field: 'og:image',
        message: 'Open Graph image is missing',
        suggestion: 'Add og:image for better social media previews',
      });
    } else {
      if (!tags.ogTags['og:image'].startsWith('http')) {
        warnings.push({
          field: 'og:image',
          message: 'Open Graph image should be absolute URL',
          suggestion: 'Use full URL starting with https://',
        });
      }
    }
  }

  // Twitter Card validation
  if (tags.twitterTags) {
    if (!tags.twitterTags['twitter:card']) {
      warnings.push({
        field: 'twitter:card',
        message: 'Twitter card type is missing',
        suggestion: 'Specify card type (summary or summary_large_image)',
      });
    }
  }

  // Calculate score
  const score = calculateMetaTagScore(tags, errors, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

/**
 * Calculates meta tag quality score
 */
function calculateMetaTagScore(
  tags: Partial<MetaTagSet>,
  errors: MetaTagError[],
  warnings: MetaTagWarning[]
): number {
  let score = 100;

  // Deduct for errors
  errors.forEach(error => {
    score -= error.impact === 'critical' ? 25 : 15;
  });

  // Deduct for warnings
  score -= warnings.length * 5;

  // Bonus for completeness
  if (tags.title && tags.description) score += 10;
  if (tags.ogTags && Object.keys(tags.ogTags).length >= 5) score += 10;
  if (tags.twitterTags && Object.keys(tags.twitterTags).length >= 4) score += 5;
  if (tags.additionalTags?.canonical) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Generates HTML for meta tags
 */
export function generateMetaTagHTML(tags: Partial<MetaTagSet>): string {
  const lines: string[] = [];

  // Basic meta tags
  if (tags.title) {
    lines.push(`<title>${escapeHtml(tags.title)}</title>`);
  }

  if (tags.description) {
    lines.push(
      `<meta name="description" content="${escapeHtml(tags.description)}">`
    );
  }

  if (tags.keywords) {
    lines.push(`<meta name="keywords" content="${escapeHtml(tags.keywords)}">`);
  }

  // Additional meta tags
  if (tags.additionalTags) {
    if (tags.additionalTags.charset) {
      lines.push(`<meta charset="${escapeHtml(tags.additionalTags.charset)}">`);
    }
    if (tags.additionalTags.viewport) {
      lines.push(
        `<meta name="viewport" content="${escapeHtml(tags.additionalTags.viewport)}">`
      );
    }
    if (tags.additionalTags.robots) {
      lines.push(
        `<meta name="robots" content="${escapeHtml(tags.additionalTags.robots)}">`
      );
    }
    if (tags.additionalTags.author) {
      lines.push(
        `<meta name="author" content="${escapeHtml(tags.additionalTags.author)}">`
      );
    }
    if (tags.additionalTags.canonical) {
      lines.push(
        `<link rel="canonical" href="${escapeHtml(tags.additionalTags.canonical)}">`
      );
    }
  }

  // Open Graph tags
  if (tags.ogTags) {
    Object.entries(tags.ogTags).forEach(([key, value]) => {
      if (value) {
        lines.push(
          `<meta property="${escapeHtml(key)}" content="${escapeHtml(value)}">`
        );
      }
    });
  }

  // Twitter Card tags
  if (tags.twitterTags) {
    Object.entries(tags.twitterTags).forEach(([key, value]) => {
      if (value) {
        lines.push(
          `<meta name="${escapeHtml(key)}" content="${escapeHtml(value)}">`
        );
      }
    });
  }

  return lines.join('\n');
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m] || m);
}

/**
 * Creates a basic meta tag set from minimal input
 */
export function createBasicMetaTags(
  title: string,
  description: string,
  url: string,
  imageUrl?: string
): MetaTagSet {
  return {
    title,
    description,
    ogTags: {
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:url': url,
      'og:image': imageUrl || '',
    },
    twitterTags: {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': imageUrl || '',
    },
    additionalTags: {
      robots: 'index, follow',
      viewport: 'width=device-width, initial-scale=1.0',
      charset: 'UTF-8',
    },
  };
}
