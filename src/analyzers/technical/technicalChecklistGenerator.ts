/**
 * Technical SEO Checklist Generator
 * Generates comprehensive technical SEO checklists
 */

export type ChecklistCategory =
  | 'indexability'
  | 'performance'
  | 'mobile'
  | 'security'
  | 'structured-data'
  | 'crawlability'
  | 'international';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  checked: boolean;
  tags: string[];
}

export interface TechnicalChecklist {
  categories: ChecklistCategoryData[];
  totalItems: number;
  checkedItems: number;
  progress: number;
}

export interface ChecklistCategoryData {
  id: ChecklistCategory;
  name: string;
  description: string;
  items: ChecklistItem[];
  completion: number;
}

/**
 * Master technical SEO checklist
 */
const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Indexability
  {
    id: 'robots-txt',
    category: 'indexability',
    title: 'Configure robots.txt properly',
    description:
      'Ensure robots.txt allows important pages and blocks private content',
    priority: 'critical',
    checked: false,
    tags: ['robots', 'crawling'],
  },
  {
    id: 'meta-robots',
    category: 'indexability',
    title: 'Check meta robots tags',
    description: 'Verify pages have correct noindex/nofollow directives',
    priority: 'critical',
    checked: false,
    tags: ['meta', 'indexing'],
  },
  {
    id: 'canonical-tags',
    category: 'indexability',
    title: 'Implement canonical tags',
    description: 'Add canonical URLs to prevent duplicate content issues',
    priority: 'high',
    checked: false,
    tags: ['canonical', 'duplicates'],
  },
  {
    id: 'sitemap-xml',
    category: 'indexability',
    title: 'Create and submit XML sitemap',
    description: 'Generate sitemap.xml and submit to search engines',
    priority: 'high',
    checked: false,
    tags: ['sitemap', 'indexing'],
  },
  {
    id: 'google-search-console',
    category: 'indexability',
    title: 'Set up Google Search Console',
    description: 'Verify site ownership and monitor indexing status',
    priority: 'high',
    checked: false,
    tags: ['tools', 'monitoring'],
  },

  // Performance
  {
    id: 'page-speed',
    category: 'performance',
    title: 'Optimize page speed',
    description: 'Achieve good Core Web Vitals scores (LCP, FID, CLS)',
    priority: 'critical',
    checked: false,
    tags: ['speed', 'core-web-vitals'],
  },
  {
    id: 'image-optimization',
    category: 'performance',
    title: 'Optimize images',
    description: 'Compress images and use modern formats (WebP, AVIF)',
    priority: 'high',
    checked: false,
    tags: ['images', 'speed'],
  },
  {
    id: 'minify-assets',
    category: 'performance',
    title: 'Minify CSS and JavaScript',
    description: 'Reduce file sizes by minifying and combining assets',
    priority: 'high',
    checked: false,
    tags: ['optimization', 'assets'],
  },
  {
    id: 'browser-caching',
    category: 'performance',
    title: 'Enable browser caching',
    description: 'Set appropriate cache headers for static resources',
    priority: 'medium',
    checked: false,
    tags: ['caching', 'performance'],
  },
  {
    id: 'cdn',
    category: 'performance',
    title: 'Use Content Delivery Network (CDN)',
    description: 'Distribute content globally for faster loading',
    priority: 'medium',
    checked: false,
    tags: ['cdn', 'performance'],
  },

  // Mobile
  {
    id: 'mobile-friendly',
    category: 'mobile',
    title: 'Ensure mobile-friendly design',
    description: 'Test site on mobile devices and pass Mobile-Friendly Test',
    priority: 'critical',
    checked: false,
    tags: ['mobile', 'responsive'],
  },
  {
    id: 'viewport-meta',
    category: 'mobile',
    title: 'Add viewport meta tag',
    description: 'Include proper viewport configuration for mobile devices',
    priority: 'critical',
    checked: false,
    tags: ['mobile', 'meta'],
  },
  {
    id: 'tap-targets',
    category: 'mobile',
    title: 'Optimize tap targets',
    description: 'Ensure buttons and links are easily tappable on mobile',
    priority: 'high',
    checked: false,
    tags: ['mobile', 'usability'],
  },
  {
    id: 'font-sizes',
    category: 'mobile',
    title: 'Check font sizes',
    description: 'Use readable font sizes on mobile devices',
    priority: 'medium',
    checked: false,
    tags: ['mobile', 'typography'],
  },

  // Security
  {
    id: 'https',
    category: 'security',
    title: 'Implement HTTPS',
    description: 'Secure all pages with SSL/TLS certificates',
    priority: 'critical',
    checked: false,
    tags: ['security', 'https'],
  },
  {
    id: 'http-to-https',
    category: 'security',
    title: 'Redirect HTTP to HTTPS',
    description: 'Set up permanent redirects from HTTP to HTTPS',
    priority: 'critical',
    checked: false,
    tags: ['security', 'redirects'],
  },
  {
    id: 'mixed-content',
    category: 'security',
    title: 'Fix mixed content issues',
    description: 'Ensure all resources load over HTTPS',
    priority: 'high',
    checked: false,
    tags: ['security', 'https'],
  },
  {
    id: 'hsts',
    category: 'security',
    title: 'Enable HSTS',
    description: 'Implement HTTP Strict Transport Security header',
    priority: 'medium',
    checked: false,
    tags: ['security', 'headers'],
  },

  // Structured Data
  {
    id: 'schema-markup',
    category: 'structured-data',
    title: 'Add schema markup',
    description: 'Implement JSON-LD structured data for rich snippets',
    priority: 'high',
    checked: false,
    tags: ['schema', 'structured-data'],
  },
  {
    id: 'validate-schema',
    category: 'structured-data',
    title: 'Validate structured data',
    description: 'Test schema markup with Google Rich Results Test',
    priority: 'high',
    checked: false,
    tags: ['schema', 'validation'],
  },
  {
    id: 'breadcrumbs-schema',
    category: 'structured-data',
    title: 'Implement breadcrumb schema',
    description: 'Add BreadcrumbList schema for navigation',
    priority: 'medium',
    checked: false,
    tags: ['schema', 'breadcrumbs'],
  },

  // Crawlability
  {
    id: 'site-structure',
    category: 'crawlability',
    title: 'Optimize site structure',
    description: 'Create clear hierarchy with 3-4 click depth maximum',
    priority: 'high',
    checked: false,
    tags: ['structure', 'navigation'],
  },
  {
    id: 'internal-linking',
    category: 'crawlability',
    title: 'Improve internal linking',
    description: 'Link related pages and distribute PageRank effectively',
    priority: 'high',
    checked: false,
    tags: ['links', 'navigation'],
  },
  {
    id: 'broken-links',
    category: 'crawlability',
    title: 'Fix broken links',
    description: 'Find and repair or remove 404 errors',
    priority: 'high',
    checked: false,
    tags: ['links', 'errors'],
  },
  {
    id: 'redirect-chains',
    category: 'crawlability',
    title: 'Eliminate redirect chains',
    description: 'Reduce multiple redirects to single hop',
    priority: 'medium',
    checked: false,
    tags: ['redirects', 'performance'],
  },
  {
    id: 'url-structure',
    category: 'crawlability',
    title: 'Clean URL structure',
    description: 'Use descriptive, keyword-rich URLs',
    priority: 'medium',
    checked: false,
    tags: ['urls', 'structure'],
  },

  // International
  {
    id: 'hreflang',
    category: 'international',
    title: 'Implement hreflang tags',
    description: 'Add hreflang for multi-language or multi-regional sites',
    priority: 'high',
    checked: false,
    tags: ['international', 'hreflang'],
  },
  {
    id: 'language-meta',
    category: 'international',
    title: 'Set language metadata',
    description: 'Specify content language in HTML and HTTP headers',
    priority: 'medium',
    checked: false,
    tags: ['international', 'language'],
  },
  {
    id: 'geo-targeting',
    category: 'international',
    title: 'Configure geo-targeting',
    description: 'Set target country in Search Console if applicable',
    priority: 'low',
    checked: false,
    tags: ['international', 'targeting'],
  },
];

/**
 * Category metadata
 */
const CATEGORY_INFO: Record<
  ChecklistCategory,
  { name: string; description: string }
> = {
  indexability: {
    name: 'Indexability',
    description: 'Ensure search engines can find and index your content',
  },
  performance: {
    name: 'Performance',
    description: 'Optimize site speed and Core Web Vitals',
  },
  mobile: {
    name: 'Mobile Optimization',
    description: 'Ensure excellent mobile user experience',
  },
  security: {
    name: 'Security',
    description: 'Implement security best practices',
  },
  'structured-data': {
    name: 'Structured Data',
    description: 'Add schema markup for rich snippets',
  },
  crawlability: {
    name: 'Crawlability',
    description: 'Make your site easy for search engines to crawl',
  },
  international: {
    name: 'International SEO',
    description: 'Optimize for multiple languages and regions',
  },
};

/**
 * Generates technical SEO checklist
 */
export function generateChecklist(
  checkedItemIds: string[] = []
): TechnicalChecklist {
  const items = CHECKLIST_ITEMS.map(item => ({
    ...item,
    checked: checkedItemIds.includes(item.id),
  }));

  const categories: ChecklistCategoryData[] = Object.keys(CATEGORY_INFO).map(
    categoryId => {
      const category = categoryId as ChecklistCategory;
      const categoryItems = items.filter(item => item.category === category);
      const checkedCount = categoryItems.filter(item => item.checked).length;

      return {
        id: category,
        name: CATEGORY_INFO[category].name,
        description: CATEGORY_INFO[category].description,
        items: categoryItems,
        completion:
          categoryItems.length > 0
            ? (checkedCount / categoryItems.length) * 100
            : 0,
      };
    }
  );

  const totalItems = items.length;
  const checkedItems = items.filter(item => item.checked).length;

  return {
    categories,
    totalItems,
    checkedItems,
    progress: totalItems > 0 ? (checkedItems / totalItems) * 100 : 0,
  };
}

/**
 * Get items by priority
 */
export function getItemsByPriority(
  priority: ChecklistItem['priority']
): ChecklistItem[] {
  return CHECKLIST_ITEMS.filter(item => item.priority === priority);
}

/**
 * Get items by category
 */
export function getItemsByCategory(
  category: ChecklistCategory
): ChecklistItem[] {
  return CHECKLIST_ITEMS.filter(item => item.category === category);
}

/**
 * Search checklist items
 */
export function searchChecklistItems(query: string): ChecklistItem[] {
  const lowerQuery = query.toLowerCase();

  return CHECKLIST_ITEMS.filter(
    item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
