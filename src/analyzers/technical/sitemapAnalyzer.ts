/**
 * Sitemap Analyzer
 * Analyzes XML sitemaps for SEO compliance
 */

export interface SitemapAnalysis {
  isValid: boolean;
  urlCount: number;
  issues: SitemapIssue[];
  recommendations: SitemapRecommendation[];
  statistics: SitemapStatistics;
  score: number;
}

export interface SitemapIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  url?: string;
  impact: 'high' | 'medium' | 'low';
}

export interface SitemapRecommendation {
  category: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SitemapStatistics {
  totalUrls: number;
  validUrls: number;
  invalidUrls: number;
  priorityDistribution: Record<string, number>;
  changeFreqDistribution: Record<string, number>;
  lastModifiedCount: number;
}

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

/**
 * Parses and analyzes sitemap XML
 */
export function analyzeSitemap(xmlContent: string): SitemapAnalysis {
  const urls = parseSitemapXML(xmlContent);
  const issues = findSitemapIssues(urls, xmlContent);
  const statistics = calculateStatistics(urls);
  const recommendations = generateRecommendations(statistics, issues);
  const score = calculateSitemapScore(statistics, issues);

  return {
    isValid: issues.filter(i => i.type === 'error').length === 0,
    urlCount: urls.length,
    issues,
    recommendations,
    statistics,
    score,
  };
}

/**
 * Parses sitemap XML content
 */
function parseSitemapXML(xmlContent: string): SitemapURL[] {
  const urls: SitemapURL[] = [];

  try {
    // Simple regex-based XML parsing (for basic sitemaps)
    const urlMatches = xmlContent.matchAll(/<url>(.*?)<\/url>/gs);

    for (const match of urlMatches) {
      const urlBlock = match[1];
      if (!urlBlock) continue;

      const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
      const lastmodMatch = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/);
      const changefreqMatch = urlBlock.match(/<changefreq>(.*?)<\/changefreq>/);
      const priorityMatch = urlBlock.match(/<priority>(.*?)<\/priority>/);

      if (locMatch && locMatch[1]) {
        urls.push({
          loc: locMatch[1].trim(),
          lastmod:
            lastmodMatch && lastmodMatch[1]
              ? lastmodMatch[1].trim()
              : undefined,
          changefreq:
            changefreqMatch && changefreqMatch[1]
              ? changefreqMatch[1].trim()
              : undefined,
          priority:
            priorityMatch && priorityMatch[1]
              ? priorityMatch[1].trim()
              : undefined,
        });
      }
    }
  } catch (_error) {
    // XML parsing failed
  }

  return urls;
}

/**
 * Finds issues in sitemap
 */
function findSitemapIssues(
  urls: SitemapURL[],
  xmlContent: string
): SitemapIssue[] {
  const issues: SitemapIssue[] = [];

  // Check if XML is valid sitemap format
  if (
    !xmlContent.includes('<urlset') &&
    !xmlContent.includes('<sitemapindex')
  ) {
    issues.push({
      type: 'error',
      message:
        'Invalid sitemap format - missing <urlset> or <sitemapindex> tag',
      impact: 'high',
    });
  }

  // Check URL count limit
  if (urls.length > 50000) {
    issues.push({
      type: 'error',
      message: 'Sitemap exceeds 50,000 URL limit',
      impact: 'high',
    });
  } else if (urls.length > 40000) {
    issues.push({
      type: 'warning',
      message: 'Sitemap approaching 50,000 URL limit',
      impact: 'medium',
    });
  }

  // Check file size (approximate)
  const fileSize = new Blob([xmlContent]).size;
  if (fileSize > 50 * 1024 * 1024) {
    // 50MB
    issues.push({
      type: 'error',
      message: 'Sitemap exceeds 50MB size limit',
      impact: 'high',
    });
  }

  // Check individual URLs
  urls.forEach((url, index) => {
    // Validate URL format
    try {
      new URL(url.loc);
    } catch (_e) {
      issues.push({
        type: 'error',
        message: `Invalid URL format at position ${index + 1}`,
        url: url.loc,
        impact: 'high',
      });
    }

    // Check for HTTPS
    if (url.loc && !url.loc.startsWith('https://')) {
      issues.push({
        type: 'warning',
        message: `Non-HTTPS URL found`,
        url: url.loc,
        impact: 'medium',
      });
    }

    // Validate changefreq values
    const validChangefreq = [
      'always',
      'hourly',
      'daily',
      'weekly',
      'monthly',
      'yearly',
      'never',
    ];
    if (url.changefreq && !validChangefreq.includes(url.changefreq)) {
      issues.push({
        type: 'warning',
        message: `Invalid changefreq value: ${url.changefreq}`,
        url: url.loc,
        impact: 'low',
      });
    }

    // Validate priority values
    if (url.priority) {
      const priority = parseFloat(url.priority);
      if (isNaN(priority) || priority < 0 || priority > 1) {
        issues.push({
          type: 'warning',
          message: `Invalid priority value: ${url.priority} (should be 0.0-1.0)`,
          url: url.loc,
          impact: 'low',
        });
      }
    }

    // Validate lastmod date
    if (url.lastmod && !isValidDate(url.lastmod)) {
      issues.push({
        type: 'info',
        message: `Invalid date format in lastmod`,
        url: url.loc,
        impact: 'low',
      });
    }
  });

  // Check for duplicate URLs
  const urlSet = new Set<string>();
  const duplicates: string[] = [];

  urls.forEach(url => {
    if (urlSet.has(url.loc)) {
      duplicates.push(url.loc);
    } else {
      urlSet.add(url.loc);
    }
  });

  if (duplicates.length > 0) {
    issues.push({
      type: 'warning',
      message: `Found ${duplicates.length} duplicate URLs in sitemap`,
      impact: 'medium',
    });
  }

  return issues;
}

/**
 * Calculates sitemap statistics
 */
function calculateStatistics(urls: SitemapURL[]): SitemapStatistics {
  const priorityDistribution: Record<string, number> = {};
  const changeFreqDistribution: Record<string, number> = {};
  let lastModifiedCount = 0;
  let validUrls = 0;

  urls.forEach(url => {
    // Count valid URLs
    try {
      new URL(url.loc);
      validUrls++;
    } catch (_e) {
      // Invalid URL
    }

    // Priority distribution
    if (url.priority) {
      const priorityKey = url.priority;
      priorityDistribution[priorityKey] =
        (priorityDistribution[priorityKey] || 0) + 1;
    }

    // Change frequency distribution
    if (url.changefreq) {
      changeFreqDistribution[url.changefreq] =
        (changeFreqDistribution[url.changefreq] || 0) + 1;
    }

    // Last modified count
    if (url.lastmod) {
      lastModifiedCount++;
    }
  });

  return {
    totalUrls: urls.length,
    validUrls,
    invalidUrls: urls.length - validUrls,
    priorityDistribution,
    changeFreqDistribution,
    lastModifiedCount,
  };
}

/**
 * Generates recommendations
 */
function generateRecommendations(
  stats: SitemapStatistics,
  issues: SitemapIssue[]
): SitemapRecommendation[] {
  const recommendations: SitemapRecommendation[] = [];

  // Basic recommendations
  recommendations.push({
    category: 'Best Practices',
    message: 'Include only canonical, indexable URLs in your sitemap',
    priority: 'high',
  });

  recommendations.push({
    category: 'Updates',
    message: 'Update your sitemap regularly when content changes',
    priority: 'high',
  });

  // URL count recommendations
  if (stats.totalUrls < 10) {
    recommendations.push({
      category: 'Content',
      message: 'Consider adding more content - sitemap has very few URLs',
      priority: 'medium',
    });
  }

  // Last modified recommendations
  if (stats.lastModifiedCount / stats.totalUrls < 0.5) {
    recommendations.push({
      category: 'Metadata',
      message: 'Add <lastmod> tags to help search engines prioritize crawling',
      priority: 'medium',
    });
  }

  // Priority recommendations
  if (Object.keys(stats.priorityDistribution).length === 0) {
    recommendations.push({
      category: 'Metadata',
      message: 'Consider adding priority values to indicate important pages',
      priority: 'low',
    });
  }

  // Issue-based recommendations
  if (issues.some(i => i.message.includes('HTTPS'))) {
    recommendations.push({
      category: 'Security',
      message: 'Ensure all URLs use HTTPS protocol',
      priority: 'high',
    });
  }

  if (issues.some(i => i.message.includes('duplicate'))) {
    recommendations.push({
      category: 'Quality',
      message: 'Remove duplicate URLs from sitemap',
      priority: 'high',
    });
  }

  return recommendations;
}

/**
 * Calculates sitemap quality score
 */
function calculateSitemapScore(
  stats: SitemapStatistics,
  issues: SitemapIssue[]
): number {
  let score = 100;

  // Deduct for issues
  issues.forEach(issue => {
    if (issue.type === 'error') score -= 20;
    else if (issue.type === 'warning') score -= 10;
    else score -= 5;
  });

  // Bonus for good practices
  if (stats.lastModifiedCount / stats.totalUrls > 0.8) score += 10;
  if (stats.validUrls === stats.totalUrls) score += 10;
  if (stats.totalUrls > 0 && stats.totalUrls <= 50000) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Validates date format
 */
function isValidDate(dateString: string): boolean {
  const iso8601Regex =
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)?)?$/;
  return iso8601Regex.test(dateString);
}

/**
 * Generates a basic sitemap XML
 */
export function generateSitemapXML(
  urls: Array<{ url: string; priority?: number }>
): string {
  const lines: string[] = [];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  urls.forEach(({ url, priority }) => {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(url)}</loc>`);
    lines.push(
      `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`
    );
    lines.push(`    <changefreq>weekly</changefreq>`);
    if (priority !== undefined) {
      lines.push(`    <priority>${priority.toFixed(1)}</priority>`);
    }
    lines.push('  </url>');
  });

  lines.push('</urlset>');

  return lines.join('\n');
}

/**
 * Escapes XML special characters
 */
function escapeXml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  };
  return text.replace(/[&<>"']/g, m => map[m] || m);
}
