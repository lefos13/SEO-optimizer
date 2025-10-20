/**
 * URL Structure Analyzer
 * Analyzes and optimizes URL structures for SEO
 */

export interface URLAnalysisResult {
  url: string;
  isValid: boolean;
  score: number;
  issues: URLIssue[];
  recommendations: URLRecommendation[];
  components: URLComponents;
  seoMetrics: URLSEOMetrics;
}

export interface URLIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
}

export interface URLRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  message: string;
  example?: string;
}

export interface URLComponents {
  protocol: string;
  domain: string;
  path: string;
  pathSegments: string[];
  query: Record<string, string>;
  fragment: string;
  length: number;
}

export interface URLSEOMetrics {
  readabilityScore: number;
  keywordPresence: boolean;
  lengthScore: number;
  structureScore: number;
  httpsEnabled: boolean;
  hasSubdirectories: boolean;
  depth: number;
}

export interface OptimizedURLSuggestion {
  original: string;
  optimized: string;
  improvements: string[];
  score: number;
}

/**
 * Analyzes a URL for SEO best practices
 */
export function analyzeURL(url: string): URLAnalysisResult {
  const components = parseURL(url);
  const issues = findURLIssues(components);
  const validComponents = components || createEmptyComponents();
  const recommendations = generateURLRecommendations(issues, validComponents);
  const seoMetrics = calculateSEOMetrics(validComponents);
  const score = calculateURLScore(seoMetrics, issues);

  return {
    url,
    isValid:
      components !== null &&
      issues.filter(i => i.type === 'error').length === 0,
    score,
    issues,
    recommendations,
    components: validComponents,
    seoMetrics,
  };
}

/**
 * Parses URL into components
 */
function parseURL(url: string): URLComponents | null {
  try {
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname
      .split('/')
      .filter(segment => segment.length > 0);

    const query: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    return {
      protocol: urlObj.protocol.replace(':', ''),
      domain: urlObj.hostname,
      path: urlObj.pathname,
      pathSegments,
      query,
      fragment: urlObj.hash.replace('#', ''),
      length: url.length,
    };
  } catch (_error) {
    return null;
  }
}

/**
 * Finds issues in URL structure
 */
function findURLIssues(components: URLComponents | null): URLIssue[] {
  const issues: URLIssue[] = [];

  if (!components) {
    issues.push({
      type: 'error',
      category: 'Validity',
      message: 'Invalid URL format',
      impact: 'high',
    });
    return issues;
  }

  // Protocol check
  if (components.protocol !== 'https') {
    issues.push({
      type: 'warning',
      category: 'Security',
      message: 'URL should use HTTPS protocol',
      impact: 'high',
    });
  }

  // Length check
  if (components.length > 100) {
    issues.push({
      type: 'warning',
      category: 'Length',
      message: 'URL is too long (over 100 characters)',
      impact: 'medium',
    });
  }

  // Special characters
  if (/[A-Z]/.test(components.path)) {
    issues.push({
      type: 'warning',
      category: 'Format',
      message: 'URL contains uppercase letters',
      impact: 'medium',
    });
  }

  if (/[_\s]/.test(components.path)) {
    issues.push({
      type: 'warning',
      category: 'Format',
      message: 'URL contains underscores or spaces',
      impact: 'medium',
    });
  }

  // Stop words
  const stopWords = ['and', 'or', 'but', 'the', 'a', 'an', 'in', 'on', 'at'];
  const hasStopWords = components.pathSegments.some(segment =>
    stopWords.some(word => segment.includes(word))
  );

  if (hasStopWords) {
    issues.push({
      type: 'info',
      category: 'Optimization',
      message: 'URL contains stop words',
      impact: 'low',
    });
  }

  // Depth check
  if (components.pathSegments.length > 4) {
    issues.push({
      type: 'warning',
      category: 'Structure',
      message: 'URL has too many subdirectories (more than 4)',
      impact: 'medium',
    });
  }

  // Query parameters
  if (Object.keys(components.query).length > 3) {
    issues.push({
      type: 'info',
      category: 'Parameters',
      message: 'URL has many query parameters',
      impact: 'low',
    });
  }

  // Dynamic parameters
  const hasDynamicParams = Object.keys(components.query).some(key =>
    /^(id|session|tracking|utm_)/.test(key)
  );

  if (hasDynamicParams) {
    issues.push({
      type: 'info',
      category: 'Parameters',
      message: 'URL contains tracking or session parameters',
      impact: 'low',
    });
  }

  return issues;
}

/**
 * Generates recommendations based on issues
 */
function generateURLRecommendations(
  issues: URLIssue[],
  _components: URLComponents
): URLRecommendation[] {
  const recommendations: URLRecommendation[] = [];

  // Basic recommendations
  recommendations.push({
    priority: 'high',
    category: 'Best Practices',
    message: 'Use hyphens (-) to separate words in URLs',
    example: 'example.com/seo-best-practices',
  });

  recommendations.push({
    priority: 'high',
    category: 'Best Practices',
    message: 'Keep URLs short and descriptive',
    example: 'example.com/blog/seo-tips',
  });

  recommendations.push({
    priority: 'medium',
    category: 'Keywords',
    message: 'Include target keywords in URL',
    example: 'example.com/keyword-research-guide',
  });

  // Issue-specific recommendations
  if (issues.some(i => i.category === 'Security')) {
    recommendations.push({
      priority: 'high',
      category: 'Security',
      message: 'Implement HTTPS for all URLs',
      example: 'https://example.com/page',
    });
  }

  if (issues.some(i => i.category === 'Length')) {
    recommendations.push({
      priority: 'high',
      category: 'Optimization',
      message: 'Shorten URL by removing unnecessary words',
      example:
        'example.com/tips instead of example.com/tips-and-tricks-for-beginners',
    });
  }

  if (issues.some(i => i.category === 'Format')) {
    recommendations.push({
      priority: 'medium',
      category: 'Format',
      message: 'Use lowercase letters and hyphens only',
      example: 'example.com/seo-guide',
    });
  }

  if (issues.some(i => i.category === 'Structure')) {
    recommendations.push({
      priority: 'medium',
      category: 'Structure',
      message: 'Limit URL depth to 3-4 levels maximum',
      example: 'example.com/blog/category/post',
    });
  }

  return recommendations;
}

/**
 * Calculates SEO metrics for URL
 */
function calculateSEOMetrics(components: URLComponents): URLSEOMetrics {
  const readabilityScore = calculateReadability(components);
  const lengthScore = calculateLengthScore(components.length);
  const structureScore = calculateStructureScore(components);
  const keywordPresence = hasKeywords(components);

  return {
    readabilityScore,
    keywordPresence,
    lengthScore,
    structureScore,
    httpsEnabled: components.protocol === 'https',
    hasSubdirectories: components.pathSegments.length > 0,
    depth: components.pathSegments.length,
  };
}

/**
 * Calculates URL readability score
 */
function calculateReadability(components: URLComponents): number {
  let score = 100;

  // Penalize for special characters
  const specialChars = (components.path.match(/[^a-z0-9\-/]/gi) || []).length;
  score -= specialChars * 5;

  // Penalize for numbers
  const numbers = (components.path.match(/\d/g) || []).length;
  score -= numbers * 2;

  // Reward for hyphens (good separation)
  const hyphens = (components.path.match(/-/g) || []).length;
  score += Math.min(hyphens * 2, 10);

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculates length score
 */
function calculateLengthScore(length: number): number {
  if (length <= 60) return 100;
  if (length <= 80) return 80;
  if (length <= 100) return 60;
  if (length <= 120) return 40;
  return 20;
}

/**
 * Calculates structure score
 */
function calculateStructureScore(components: URLComponents): number {
  let score = 100;

  // Ideal depth is 2-3 levels
  const depth = components.pathSegments.length;
  if (depth === 0) score -= 20;
  else if (depth > 4) score -= (depth - 4) * 15;

  // Penalize for query parameters
  const paramCount = Object.keys(components.query).length;
  score -= paramCount * 5;

  // Penalize for fragments
  if (components.fragment) score -= 10;

  return Math.max(0, score);
}

/**
 * Checks if URL contains descriptive keywords
 */
function hasKeywords(components: URLComponents): boolean {
  return components.pathSegments.some(segment => segment.length > 3);
}

/**
 * Calculates overall URL score
 */
function calculateURLScore(metrics: URLSEOMetrics, issues: URLIssue[]): number {
  let score = 100;

  // Deduct for issues
  issues.forEach(issue => {
    if (issue.impact === 'high') score -= 15;
    else if (issue.impact === 'medium') score -= 10;
    else score -= 5;
  });

  // Add metrics bonuses
  score += (metrics.readabilityScore - 50) * 0.2;
  score += (metrics.lengthScore - 50) * 0.2;
  score += (metrics.structureScore - 50) * 0.2;

  if (metrics.httpsEnabled) score += 5;
  if (metrics.keywordPresence) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Creates empty components object
 */
function createEmptyComponents(): URLComponents {
  return {
    protocol: '',
    domain: '',
    path: '',
    pathSegments: [],
    query: {},
    fragment: '',
    length: 0,
  };
}

/**
 * Generates optimized URL suggestions
 */
export function generateOptimizedURL(
  url: string,
  _targetKeywords?: string[]
): OptimizedURLSuggestion {
  const components = parseURL(url);
  if (!components) {
    return {
      original: url,
      optimized: url,
      improvements: ['Invalid URL format'],
      score: 0,
    };
  }

  const improvements: string[] = [];
  let optimizedPath = components.path;

  // Convert to lowercase
  if (/[A-Z]/.test(optimizedPath)) {
    optimizedPath = optimizedPath.toLowerCase();
    improvements.push('Converted to lowercase');
  }

  // Replace underscores and spaces with hyphens
  if (/[_\s]/.test(optimizedPath)) {
    optimizedPath = optimizedPath.replace(/[_\s]+/g, '-');
    improvements.push('Replaced underscores/spaces with hyphens');
  }

  // Remove stop words
  const stopWords = ['and', 'or', 'but', 'the', 'a', 'an', 'in', 'on', 'at'];
  stopWords.forEach(word => {
    const regex = new RegExp(`-${word}-`, 'gi');
    if (regex.test(optimizedPath)) {
      optimizedPath = optimizedPath.replace(regex, '-');
      improvements.push(`Removed stop word: "${word}"`);
    }
  });

  // Clean up multiple hyphens
  optimizedPath = optimizedPath.replace(/-+/g, '-');

  // Remove trailing/leading hyphens
  optimizedPath = optimizedPath.replace(/^-+|-+$/g, '');

  const optimized = `${components.protocol}://${components.domain}${optimizedPath}`;
  const analysis = analyzeURL(optimized);

  return {
    original: url,
    optimized,
    improvements,
    score: analysis.score,
  };
}
