/**
 * URL Content Fetcher
 * Fetches and extracts content from URLs for SEO analysis
 */

import * as https from 'https';
import * as http from 'http';
import * as zlib from 'zlib';

/**
 * URL fetch result with metadata
 */
export interface UrlFetchResult {
  success: boolean;
  url: string;
  finalUrl?: string;
  html?: string;
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogData?: Record<string, string>;
  twitterData?: Record<string, string>;
  error?: string;
  errorCode?: string;
  fetchedAt: string;
}

/**
 * Extracted metadata from HTML
 */
interface UrlMetadata {
  title: string;
  description: string;
  keywords: string;
  author: string;
  finalUrl: string;
  ogData: Record<string, string>;
  twitterData: Record<string, string>;
}

/**
 * Fetch options
 */
interface FetchWithRedirectsOptions {
  timeout: number;
  maxRedirects: number;
  userAgent: string;
  redirectCount: number;
}

/**
 * Fetch content from a URL
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Fetched content data
 */
export async function fetchUrl(
  url: string,
  options: { timeout?: number; maxRedirects?: number; userAgent?: string } = {}
): Promise<UrlFetchResult> {
  const {
    timeout = 10000, // 10 seconds
    maxRedirects = 5,
    userAgent = 'SEO-Optimizer/1.0',
  } = options;

  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are supported');
    }

    // Fetch the content
    const html = await fetchWithRedirects(url, {
      timeout,
      maxRedirects,
      userAgent,
      redirectCount: 0,
    });

    // Extract metadata
    const metadata = extractMetadata(html, url);

    return {
      success: true,
      url,
      finalUrl: metadata.finalUrl || url,
      html,
      title: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords,
      author: metadata.author,
      ogData: metadata.ogData,
      twitterData: metadata.twitterData,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode =
      error instanceof Error && 'code' in error
        ? (error.code as string)
        : undefined;

    return {
      success: false,
      url,
      error: errorMessage,
      errorCode,
      fetchedAt: new Date().toISOString(),
    };
  }
}

/**
 * Fetch URL with redirect handling
 * @param url - URL to fetch
 * @param options - Options
 * @returns HTML content
 */
function fetchWithRedirects(
  url: string,
  options: FetchWithRedirectsOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const { timeout, maxRedirects, userAgent, redirectCount } = options;

    if (redirectCount >= maxRedirects) {
      return reject(new Error('Too many redirects'));
    }

    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const requestOptions = {
      method: 'GET' as const,
      headers: {
        'User-Agent': userAgent,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
      },
      timeout,
    };

    const req = protocol.get(url, requestOptions, res => {
      // Handle redirects
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        const redirectUrl = new URL(res.headers.location, url).href;
        return fetchWithRedirects(redirectUrl, {
          ...options,
          redirectCount: redirectCount + 1,
        })
          .then(resolve)
          .catch(reject);
      }

      // Handle non-success status codes
      if (res.statusCode !== 200) {
        return reject(
          new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`)
        );
      }

      // Check content type
      const contentType = (res.headers['content-type'] || '').toString();
      if (!contentType.includes('text/html')) {
        return reject(
          new Error(`Invalid content type: ${contentType}. Expected HTML.`)
        );
      }

      // Handle response encoding (gzip, deflate, or plain)
      let responseStream: NodeJS.ReadableStream = res;
      const encoding = res.headers['content-encoding'];

      if (encoding === 'gzip') {
        responseStream = res.pipe(zlib.createGunzip());
      } else if (encoding === 'deflate') {
        responseStream = res.pipe(zlib.createInflate());
      }

      // Collect response data
      let data = '';
      responseStream.setEncoding('utf8');

      responseStream.on('data', (chunk: string) => {
        data += chunk;
        // Limit response size to 10MB
        if (data.length > 10 * 1024 * 1024) {
          req.destroy();
          reject(new Error('Response too large (max 10MB)'));
        }
      });

      responseStream.on('end', () => {
        resolve(data);
      });

      responseStream.on('error', (error: Error) => {
        reject(new Error(`Decompression error: ${error.message}`));
      });
    });

    req.on('error', (error: Error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Extract metadata from HTML
 * @param html - HTML content
 * @param url - Original URL
 * @returns Extracted metadata
 */
export function extractMetadata(html: string, url: string): UrlMetadata {
  const metadata: UrlMetadata = {
    title: '',
    description: '',
    keywords: '',
    author: '',
    finalUrl: url,
    ogData: {},
    twitterData: {},
  };

  if (!html) return metadata;

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    metadata.title = decodeHtmlEntities(titleMatch[1].trim());
  }

  // Extract meta description
  const descMatch = html.match(
    /<meta\s+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  if (descMatch && descMatch[1]) {
    metadata.description = decodeHtmlEntities(descMatch[1]);
  }

  // Extract meta keywords
  const keywordsMatch = html.match(
    /<meta\s+name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  if (keywordsMatch && keywordsMatch[1]) {
    metadata.keywords = decodeHtmlEntities(keywordsMatch[1]);
  }

  // Extract author
  const authorMatch = html.match(
    /<meta\s+name=["']author["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  if (authorMatch && authorMatch[1]) {
    metadata.author = decodeHtmlEntities(authorMatch[1]);
  }

  // Extract canonical URL
  const canonicalMatch = html.match(
    /<link\s+rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i
  );
  if (canonicalMatch && canonicalMatch[1]) {
    metadata.finalUrl = canonicalMatch[1];
  }

  // Extract Open Graph data
  const ogRegex =
    /<meta\s+property=["']og:([^"']*)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
  let ogMatch;
  while ((ogMatch = ogRegex.exec(html)) !== null) {
    const property = ogMatch[1];
    const content = ogMatch[2];
    if (property && content) {
      metadata.ogData[property] = decodeHtmlEntities(content);
    }
  }

  // Extract Twitter Card data
  const twitterRegex =
    /<meta\s+name=["']twitter:([^"']*)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
  let twitterMatch;
  while ((twitterMatch = twitterRegex.exec(html)) !== null) {
    const property = twitterMatch[1];
    const content = twitterMatch[2];
    if (property && content) {
      metadata.twitterData[property] = decodeHtmlEntities(content);
    }
  }

  return metadata;
}

/**
 * Decode HTML entities
 * @param text - Text with HTML entities
 * @returns Decoded text
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';

  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_match: string, dec: string) =>
      String.fromCharCode(parseInt(dec, 10))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_match: string, hex: string) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns Is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch (_e) {
    return false;
  }
}
