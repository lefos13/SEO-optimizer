/**
 * URL Content Fetcher
 * Fetches and extracts content from URLs for SEO analysis
 */

const https = require('https');
const http = require('http');
const zlib = require('zlib');

/**
 * Fetch content from a URL
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Fetched content data
 */
async function fetchUrl(url, options = {}) {
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
    return {
      success: false,
      url,
      error: error.message,
      errorCode: error.code,
      fetchedAt: new Date().toISOString(),
    };
  }
}

/**
 * Fetch URL with redirect handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Options
 * @returns {Promise<string>} HTML content
 */
function fetchWithRedirects(url, options) {
  return new Promise((resolve, reject) => {
    const { timeout, maxRedirects, userAgent, redirectCount } = options;

    if (redirectCount >= maxRedirects) {
      return reject(new Error('Too many redirects'));
    }

    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const requestOptions = {
      method: 'GET',
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
      const contentType = res.headers['content-type'] || '';
      if (!contentType.includes('text/html')) {
        return reject(
          new Error(`Invalid content type: ${contentType}. Expected HTML.`)
        );
      }

      // Handle response encoding (gzip, deflate, or plain)
      let responseStream = res;
      const encoding = res.headers['content-encoding'];

      if (encoding === 'gzip') {
        responseStream = res.pipe(zlib.createGunzip());
      } else if (encoding === 'deflate') {
        responseStream = res.pipe(zlib.createInflate());
      }

      // Collect response data
      let data = '';
      responseStream.setEncoding('utf8');

      responseStream.on('data', chunk => {
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

      responseStream.on('error', error => {
        reject(new Error(`Decompression error: ${error.message}`));
      });
    });

    req.on('error', error => {
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
 * @param {string} html - HTML content
 * @param {string} url - Original URL
 * @returns {Object} Extracted metadata
 */
function extractMetadata(html, url) {
  const metadata = {
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
  if (titleMatch) {
    metadata.title = decodeHtmlEntities(titleMatch[1].trim());
  }

  // Extract meta description
  const descMatch = html.match(
    /<meta\s+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  if (descMatch) {
    metadata.description = decodeHtmlEntities(descMatch[1]);
  }

  // Extract meta keywords
  const keywordsMatch = html.match(
    /<meta\s+name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  if (keywordsMatch) {
    metadata.keywords = decodeHtmlEntities(keywordsMatch[1]);
  }

  // Extract author
  const authorMatch = html.match(
    /<meta\s+name=["']author["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  if (authorMatch) {
    metadata.author = decodeHtmlEntities(authorMatch[1]);
  }

  // Extract canonical URL
  const canonicalMatch = html.match(
    /<link\s+rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i
  );
  if (canonicalMatch) {
    metadata.finalUrl = canonicalMatch[1];
  }

  // Extract Open Graph data
  const ogRegex =
    /<meta\s+property=["']og:([^"']*)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
  let ogMatch;
  while ((ogMatch = ogRegex.exec(html)) !== null) {
    const property = ogMatch[1];
    const content = decodeHtmlEntities(ogMatch[2]);
    metadata.ogData[property] = content;
  }

  // Extract Twitter Card data
  const twitterRegex =
    /<meta\s+name=["']twitter:([^"']*)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
  let twitterMatch;
  while ((twitterMatch = twitterRegex.exec(html)) !== null) {
    const property = twitterMatch[1];
    const content = decodeHtmlEntities(twitterMatch[2]);
    metadata.twitterData[property] = content;
  }

  return metadata;
}

/**
 * Decode HTML entities
 * @param {string} text - Text with HTML entities
 * @returns {string} Decoded text
 */
function decodeHtmlEntities(text) {
  if (!text) return '';

  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid
 */
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch (e) {
    return false;
  }
}

module.exports = {
  fetchUrl,
  isValidUrl,
  extractMetadata,
  decodeHtmlEntities,
};
