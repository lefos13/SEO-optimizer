/**
 * Robots.txt Analyzer
 * Parses and validates robots.txt files
 */

export interface RobotsAnalysis {
  isValid: boolean;
  rules: RobotsRule[];
  issues: RobotsIssue[];
  sitemaps: string[];
  userAgents: string[];
  statistics: RobotsStatistics;
  score: number;
}

export interface RobotsRule {
  userAgent: string;
  directives: RobotsDirective[];
}

export interface RobotsDirective {
  type: 'Allow' | 'Disallow' | 'Crawl-delay' | 'Sitemap' | 'Other';
  value: string;
  lineNumber: number;
}

export interface RobotsIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  lineNumber?: number;
  impact: 'high' | 'medium' | 'low';
}

export interface RobotsStatistics {
  totalLines: number;
  totalRules: number;
  totalUserAgents: number;
  allowCount: number;
  disallowCount: number;
  sitemapCount: number;
}

/**
 * Parses and analyzes robots.txt content
 */
export function analyzeRobotsTxt(content: string): RobotsAnalysis {
  const lines = content.split('\n').map(l => l.trim());
  const rules = parseRobotsTxt(lines);
  const sitemaps = extractSitemaps(lines);
  const userAgents = extractUserAgents(rules);
  const issues = findRobotsIssues(rules, lines);
  const statistics = calculateRobotsStatistics(rules, lines, sitemaps);
  const score = calculateRobotsScore(statistics, issues);

  return {
    isValid: issues.filter(i => i.type === 'error').length === 0,
    rules,
    issues,
    sitemaps,
    userAgents,
    statistics,
    score,
  };
}

/**
 * Parses robots.txt into structured rules
 */
function parseRobotsTxt(lines: string[]): RobotsRule[] {
  const rules: RobotsRule[] = [];
  let currentUserAgent: string | null = null;
  let currentDirectives: RobotsDirective[] = [];

  lines.forEach((line, index) => {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.length === 0) {
      return;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const directive = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    if (directive.toLowerCase() === 'user-agent') {
      // Save previous user-agent's rules
      if (currentUserAgent && currentDirectives.length > 0) {
        rules.push({
          userAgent: currentUserAgent,
          directives: currentDirectives,
        });
      }

      // Start new user-agent block
      currentUserAgent = value;
      currentDirectives = [];
    } else if (currentUserAgent) {
      // Add directive to current user-agent
      let type: RobotsDirective['type'] = 'Other';

      if (directive.toLowerCase() === 'allow') type = 'Allow';
      else if (directive.toLowerCase() === 'disallow') type = 'Disallow';
      else if (directive.toLowerCase() === 'crawl-delay') type = 'Crawl-delay';
      else if (directive.toLowerCase() === 'sitemap') type = 'Sitemap';

      currentDirectives.push({
        type,
        value,
        lineNumber: index + 1,
      });
    }
  });

  // Save last user-agent's rules
  if (currentUserAgent && currentDirectives.length > 0) {
    rules.push({
      userAgent: currentUserAgent,
      directives: currentDirectives,
    });
  }

  return rules;
}

/**
 * Extracts sitemap URLs
 */
function extractSitemaps(lines: string[]): string[] {
  const sitemaps: string[] = [];

  lines.forEach(line => {
    if (line.toLowerCase().startsWith('sitemap:')) {
      const url = line.substring(8).trim();
      if (url) sitemaps.push(url);
    }
  });

  return sitemaps;
}

/**
 * Extracts unique user agents
 */
function extractUserAgents(rules: RobotsRule[]): string[] {
  return [...new Set(rules.map(r => r.userAgent))];
}

/**
 * Finds issues in robots.txt
 */
function findRobotsIssues(rules: RobotsRule[], lines: string[]): RobotsIssue[] {
  const issues: RobotsIssue[] = [];

  // Check if file is empty
  if (lines.filter(l => l.length > 0 && !l.startsWith('#')).length === 0) {
    issues.push({
      type: 'warning',
      message: 'robots.txt file is empty',
      impact: 'medium',
    });
    return issues;
  }

  // Check for wildcard user-agent
  const hasWildcard = rules.some(r => r.userAgent === '*');
  if (!hasWildcard) {
    issues.push({
      type: 'warning',
      message: 'No wildcard (*) user-agent found',
      impact: 'medium',
    });
  }

  // Check for blocking all content
  rules.forEach(rule => {
    const disallowAll = rule.directives.some(
      d => d.type === 'Disallow' && d.value === '/'
    );

    if (disallowAll && rule.userAgent === '*') {
      issues.push({
        type: 'error',
        message: 'Entire site is blocked for all crawlers',
        impact: 'high',
        lineNumber: rule.directives.find(
          d => d.type === 'Disallow' && d.value === '/'
        )?.lineNumber,
      });
    }
  });

  // Check for common typos
  lines.forEach((line, index) => {
    if (line.length === 0 || line.startsWith('#')) return;

    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('useragent') || lowerLine.includes('user agent')) {
      issues.push({
        type: 'error',
        message: 'Incorrect spacing in User-agent directive',
        lineNumber: index + 1,
        impact: 'high',
      });
    }

    if (
      lowerLine.startsWith('allow:') ||
      lowerLine.startsWith('disallow:') ||
      lowerLine.startsWith('user-agent:')
    ) {
      // Check if there's no space after colon
      if (!line.match(/:\s/)) {
        issues.push({
          type: 'warning',
          message: 'Consider adding space after colon for readability',
          lineNumber: index + 1,
          impact: 'low',
        });
      }
    }
  });

  // Check for sitemap
  const sitemaps = extractSitemaps(lines);
  if (sitemaps.length === 0) {
    issues.push({
      type: 'info',
      message: 'No sitemap specified in robots.txt',
      impact: 'low',
    });
  }

  // Check for valid sitemap URLs
  sitemaps.forEach(sitemap => {
    try {
      new URL(sitemap);
    } catch (_e) {
      issues.push({
        type: 'error',
        message: `Invalid sitemap URL: ${sitemap}`,
        impact: 'medium',
      });
    }
  });

  // Check for conflicting rules
  rules.forEach(rule => {
    const paths = new Set<string>();
    rule.directives.forEach(directive => {
      if (directive.type === 'Allow' || directive.type === 'Disallow') {
        if (paths.has(directive.value)) {
          issues.push({
            type: 'warning',
            message: `Duplicate path found: ${directive.value}`,
            lineNumber: directive.lineNumber,
            impact: 'low',
          });
        }
        paths.add(directive.value);
      }
    });
  });

  return issues;
}

/**
 * Calculates robots.txt statistics
 */
function calculateRobotsStatistics(
  rules: RobotsRule[],
  lines: string[],
  sitemaps: string[]
): RobotsStatistics {
  let allowCount = 0;
  let disallowCount = 0;

  rules.forEach(rule => {
    rule.directives.forEach(directive => {
      if (directive.type === 'Allow') allowCount++;
      if (directive.type === 'Disallow') disallowCount++;
    });
  });

  return {
    totalLines: lines.length,
    totalRules: rules.length,
    totalUserAgents: rules.length,
    allowCount,
    disallowCount,
    sitemapCount: sitemaps.length,
  };
}

/**
 * Calculates robots.txt quality score
 */
function calculateRobotsScore(
  stats: RobotsStatistics,
  issues: RobotsIssue[]
): number {
  let score = 100;

  // Deduct for issues
  issues.forEach(issue => {
    if (issue.type === 'error') score -= 20;
    else if (issue.type === 'warning') score -= 10;
    else score -= 5;
  });

  // Bonus for good practices
  if (stats.sitemapCount > 0) score += 10;
  if (stats.totalUserAgents > 0) score += 5;
  if (stats.allowCount > 0) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Generates a basic robots.txt template
 */
export function generateRobotsTxtTemplate(
  includeAllowAll: boolean = true
): string {
  const lines: string[] = [];

  lines.push('# robots.txt for https://example.com/');
  lines.push('');
  lines.push('User-agent: *');

  if (includeAllowAll) {
    lines.push('Allow: /');
  } else {
    lines.push('Disallow: /admin/');
    lines.push('Disallow: /private/');
  }

  lines.push('');
  lines.push('# Sitemap');
  lines.push('Sitemap: https://example.com/sitemap.xml');

  return lines.join('\n');
}

/**
 * Checks if a path is allowed for a user agent
 */
export function isPathAllowed(
  rules: RobotsRule[],
  userAgent: string,
  path: string
): boolean {
  // Find matching user-agent rules
  let applicableRules = rules.find(
    r => r.userAgent.toLowerCase() === userAgent.toLowerCase()
  );

  // Fall back to wildcard
  if (!applicableRules) {
    applicableRules = rules.find(r => r.userAgent === '*');
  }

  if (!applicableRules) {
    return true; // No rules = allow by default
  }

  // Check directives (most specific first)
  const sortedDirectives = [...applicableRules.directives].sort(
    (a, b) => b.value.length - a.value.length
  );

  for (const directive of sortedDirectives) {
    if (directive.type === 'Allow' || directive.type === 'Disallow') {
      if (path.startsWith(directive.value) || directive.value === '/') {
        return directive.type === 'Allow';
      }
    }
  }

  return true; // Allow by default if no matching rule
}
