/**
 * Redirect Chain Analyzer
 * Detects and analyzes redirect chains and loops
 */

export interface RedirectAnalysis {
  url: string;
  hasRedirects: boolean;
  chain: RedirectStep[];
  issues: RedirectIssue[];
  finalDestination: string;
  totalRedirects: number;
  score: number;
}

export interface RedirectStep {
  url: string;
  statusCode: number;
  statusText: string;
  redirectsTo?: string;
  responseTime: number;
}

export interface RedirectIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
}

/**
 * Simulates redirect chain analysis (mock implementation)
 * In a real implementation, this would use fetch/axios to follow redirects
 */
export function analyzeRedirectChain(url: string): RedirectAnalysis {
  // This is a simulation - real implementation would need to make HTTP requests
  // For the purposes of the UI, we'll provide a structure that can be populated

  const chain: RedirectStep[] = [
    {
      url,
      statusCode: 200,
      statusText: 'OK',
      responseTime: 0,
    },
  ];

  const issues = analyzeRedirectIssues(chain);
  const score = calculateRedirectScore(chain, issues);

  return {
    url,
    hasRedirects: chain.length > 1,
    chain,
    issues,
    finalDestination:
      chain.length > 0 ? chain[chain.length - 1]?.url || url : url,
    totalRedirects: chain.length - 1,
    score,
  };
}

/**
 * Analyzes redirect chain for issues
 */
function analyzeRedirectIssues(chain: RedirectStep[]): RedirectIssue[] {
  const issues: RedirectIssue[] = [];

  // Check chain length
  if (chain.length > 3) {
    issues.push({
      type: 'error',
      message: 'Too many redirects in chain (more than 3)',
      impact: 'high',
      suggestion: 'Reduce redirect chain to maximum 2 hops',
    });
  } else if (chain.length > 2) {
    issues.push({
      type: 'warning',
      message: 'Multiple redirects detected',
      impact: 'medium',
      suggestion: 'Consider reducing redirect chain to 1 hop',
    });
  }

  // Check for redirect loops
  const urlsSeen = new Set<string>();
  let hasLoop = false;

  chain.forEach(step => {
    if (urlsSeen.has(step.url)) {
      hasLoop = true;
    }
    urlsSeen.add(step.url);
  });

  if (hasLoop) {
    issues.push({
      type: 'error',
      message: 'Redirect loop detected',
      impact: 'high',
      suggestion: 'Fix redirect configuration to prevent infinite loops',
    });
  }

  // Check for HTTP to HTTPS redirect
  const httpToHttps = chain.some(
    (step, idx) =>
      idx < chain.length - 1 &&
      step.url.startsWith('http://') &&
      chain[idx + 1]?.url.startsWith('https://')
  );

  if (httpToHttps) {
    issues.push({
      type: 'info',
      message: 'HTTP to HTTPS redirect found',
      impact: 'low',
      suggestion: 'This is good practice for security',
    });
  }

  // Check for www to non-www or vice versa
  const domainChange = chain.some((step, idx) => {
    const nextStep = chain[idx + 1];
    if (idx < chain.length - 1 && nextStep) {
      const currentDomain = new URL(step.url).hostname;
      const nextDomain = new URL(nextStep.url).hostname;
      return (
        (currentDomain.startsWith('www.') && !nextDomain.startsWith('www.')) ||
        (!currentDomain.startsWith('www.') && nextDomain.startsWith('www.'))
      );
    }
    return false;
  });

  if (domainChange) {
    issues.push({
      type: 'info',
      message: 'Domain variant redirect detected (www/non-www)',
      impact: 'low',
      suggestion: 'Ensure consistent domain preference across site',
    });
  }

  // Check response times
  const slowRedirects = chain.filter(step => step.responseTime > 500);

  if (slowRedirects.length > 0) {
    issues.push({
      type: 'warning',
      message: `${slowRedirects.length} slow redirect(s) detected (>500ms)`,
      impact: 'medium',
      suggestion: 'Optimize server response times',
    });
  }

  return issues;
}

/**
 * Calculates redirect chain score
 */
function calculateRedirectScore(
  chain: RedirectStep[],
  issues: RedirectIssue[]
): number {
  let score = 100;

  // Deduct for redirect count
  score -= (chain.length - 1) * 15;

  // Deduct for issues
  issues.forEach(issue => {
    if (issue.type === 'error') score -= 25;
    else if (issue.type === 'warning') score -= 15;
    else if (issue.impact === 'high') score -= 10;
  });

  // Bonus for direct access (no redirects)
  if (chain.length === 1) score += 20;

  return Math.max(0, Math.min(100, score));
}

/**
 * Generates redirect recommendations
 */
export function generateRedirectRecommendations(
  analysis: RedirectAnalysis
): string[] {
  const recommendations: string[] = [];

  if (analysis.totalRedirects === 0) {
    recommendations.push('✓ No redirects detected - optimal configuration');
    return recommendations;
  }

  recommendations.push('Minimize redirect chains to reduce page load time');
  recommendations.push('Use server-side 301 redirects for permanent moves');
  recommendations.push(
    'Avoid meta refresh and JavaScript redirects when possible'
  );

  if (analysis.totalRedirects > 1) {
    recommendations.push(
      'Update internal links to point directly to final destination'
    );
  }

  if (analysis.chain.some(s => s.statusCode === 302)) {
    recommendations.push(
      'Use 301 redirects instead of 302 for permanent moves'
    );
  }

  return recommendations;
}

/**
 * Checks redirect type
 */
export function getRedirectType(statusCode: number): string {
  const types: Record<number, string> = {
    301: 'Permanent Redirect (301)',
    302: 'Temporary Redirect (302)',
    303: 'See Other (303)',
    307: 'Temporary Redirect (307)',
    308: 'Permanent Redirect (308)',
  };

  return types[statusCode] || `HTTP ${statusCode}`;
}

/**
 * Mock function to simulate checking a URL
 * In production, this would make actual HTTP requests
 */
export function checkURL(url: string): Promise<RedirectAnalysis> {
  return new Promise(resolve => {
    // Simulate network delay
    setTimeout(() => {
      resolve(analyzeRedirectChain(url));
    }, 500);
  });
}
