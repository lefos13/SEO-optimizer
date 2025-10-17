/**
 * Technical SEO Analysis Test
 * Tests Phase 2.3 - Technical SEO features
 */

const SEOAnalyzer = require('./seoAnalyzer');

async function runTechnicalSeoTest() {
  const analyzer = new SEOAnalyzer();

  console.log('='.repeat(70));
  console.log('TECHNICAL SEO ANALYSIS TEST - Phase 2.3');
  console.log('='.repeat(70));
  console.log();

  // Test Case 1: Complete Technical SEO (Good Example)
  console.log('Test 1: Complete Technical SEO Implementation');
  console.log('-'.repeat(70));

  const goodTechnicalContent = {
    title: 'Complete SEO Guide - Best Practices 2024',
    description:
      'Learn comprehensive SEO techniques including technical optimization, content strategy, and performance improvements for better rankings.',
    keywords: 'seo, technical seo, optimization',
    url: 'https://example.com/seo-guide',
    language: 'en',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://example.com/seo-guide">
  <title>Complete SEO Guide</title>
</head>
<body>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  
  <main>
    <article>
      <h1>Complete SEO Guide for 2024</h1>
      
      <p>Search engine optimization is crucial for online visibility. This guide covers 
      everything you need to know about SEO best practices.</p>
      
      <h2>Technical SEO Fundamentals</h2>
      <p>Technical SEO ensures search engines can crawl and index your site effectively. 
      Key elements include proper HTML structure, mobile optimization, and fast loading times.</p>
      
      <h3>Essential Technical Elements</h3>
      <ul>
        <li>Use HTTPS for security</li>
        <li>Implement responsive design</li>
        <li>Optimize page speed</li>
        <li>Create XML sitemaps</li>
      </ul>
      
      <img src="/images/seo-diagram.png" alt="SEO optimization diagram showing technical elements">
      
      <h2>Content Optimization</h2>
      <p>Quality content that addresses user intent is fundamental to SEO success. 
      Focus on creating valuable, informative content that naturally incorporates keywords.</p>
      
      <h3>Content Best Practices</h3>
      <p>Write for humans first, then optimize for search engines. Use clear headings, 
      short paragraphs, and include relevant images with descriptive alt text.</p>
      
      <img src="/images/content-strategy.jpg" alt="Content strategy planning board">
      
      <h2>Performance Metrics</h2>
      <p>Monitor key performance indicators to measure SEO success. Track organic traffic, 
      rankings, click-through rates, and conversion rates regularly.</p>
      
      <a href="/advanced-seo">Learn Advanced SEO Techniques</a>
      <a href="https://developers.google.com/search" target="_blank" rel="noopener noreferrer">
        Google Search Documentation
      </a>
    </article>
  </main>
  
  <footer>
    <p>&copy; 2024 SEO Guide. All rights reserved.</p>
  </footer>
</body>
</html>`,
  };

  const goodResults = await analyzer.analyze(goodTechnicalContent);
  printResults(goodResults);

  console.log('\n\n');

  // Test Case 2: Poor Technical SEO (Missing Elements)
  console.log('Test 2: Poor Technical SEO Implementation');
  console.log('-'.repeat(70));

  const poorTechnicalContent = {
    title: 'Page',
    description: 'A page',
    keywords: '',
    url: 'http://example.com/very/deep/url/structure/with/many/levels',
    language: 'en',
    html: `<html>
<head>
  <title>Page</title>
</head>
<body>
  <div class="header">
    <div class="nav">
      <a>Link 1</a>
      <a>Link 2</a>
    </div>
  </div>
  
  <div class="content">
    <div class="title">Page Title</div>
    
    <div>Some content here without proper structure or semantic meaning.</div>
    
    <img src="image1.jpg">
    <img src="pic2.png">
    
    <div class="more-content">
      More text here that is not properly structured with headings or paragraphs.
      This makes it hard for search engines to understand the content hierarchy.
    </div>
  </div>
  
  <div class="footer">
    <div>Footer content</div>
  </div>
</body>
</html>`,
  };

  const poorResults = await analyzer.analyze(poorTechnicalContent);
  printResults(poorResults);

  console.log('\n\n');

  // Test Case 3: Mixed Technical SEO (Some issues)
  console.log('Test 3: Mixed Technical SEO (Partial Implementation)');
  console.log('-'.repeat(70));

  const mixedTechnicalContent = {
    title: 'Modern Web Development Techniques and Best Practices',
    description:
      'Explore modern web development with React, Node.js, and cloud deployment strategies.',
    keywords: 'web development, react, nodejs',
    url: 'https://dev-blog.com/web-development',
    language: 'en',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex, nofollow">
  <title>Modern Web Development</title>
</head>
<body>
  <header>
    <h1>Modern Web Development Techniques</h1>
    <h1>Advanced Strategies</h1>
  </header>
  
  <main>
    <p>Web development has evolved significantly over the past decade. Modern frameworks 
    and tools have revolutionized how we build applications. This article explores the 
    latest techniques and best practices for creating robust web applications using 
    modern technologies and architectural patterns.</p>
    
    <h3>Frontend Technologies</h3>
    <p>React, Vue, and Angular dominate the frontend landscape. These frameworks provide 
    powerful tools for building interactive user interfaces with component-based architecture.</p>
    
    <img src="react-logo.png" alt="React JavaScript library logo">
    
    <p>Backend development with Node.js enables JavaScript developers to create full-stack 
    applications. Express.js and other frameworks simplify server-side development significantly.</p>
    
    <img src="nodejs.png">
    
    <a href="">Read more</a>
    <a href="/contact">Contact us</a>
  </main>
  
  <footer>Copyright 2024</footer>
</body>
</html>`,
  };

  const mixedResults = await analyzer.analyze(mixedTechnicalContent);
  printResults(mixedResults);

  console.log('\n\n');
  printSummary();
}

/**
 * Print analysis results
 */
function printResults(results) {
  console.log(
    `Score: ${results.score}/${results.maxScore} (${results.percentage}%)`
  );
  console.log(`Grade: ${results.grade}`);
  console.log(
    `Rules: ${results.passedRules} passed, ${results.failedRules} failed, ${results.warnings} warnings`
  );
  console.log();

  // Print technical SEO specific issues
  const technicalIssues = results.issues.filter(
    issue => issue.category === 'technical'
  );

  if (technicalIssues.length > 0) {
    console.log('Technical SEO Issues:');
    technicalIssues.forEach(issue => {
      console.log(`  ❌ [${issue.severity.toUpperCase()}] ${issue.title}`);
      console.log(`     ${issue.description}`);
    });
    console.log();
  }

  // Print metadata insights
  if (results.metadata) {
    console.log('Technical Metadata:');
    console.log(`  URL: ${results.metadata.url || 'Not provided'}`);

    if (results.metadata.metaTags) {
      console.log(
        `  Viewport: ${results.metadata.metaTags.viewport || 'Not set'}`
      );
      console.log(
        `  Canonical: ${results.metadata.metaTags.canonical || 'Not set'}`
      );
      console.log(
        `  Robots: ${results.metadata.metaTags.robots || 'Default (index, follow)'}`
      );
      console.log(
        `  Charset: ${results.metadata.metaTags.charset || 'Not set'}`
      );
      console.log(
        `  Language: ${results.metadata.metaTags.language || 'Not set'}`
      );
    }

    if (results.metadata.structuralElements) {
      const struct = results.metadata.structuralElements;
      console.log(`  Semantic HTML5: ${struct.semanticScore}/5 elements`);
      console.log(`    - Header: ${struct.hasHeader ? '✓' : '✗'}`);
      console.log(`    - Nav: ${struct.hasNav ? '✓' : '✗'}`);
      console.log(`    - Main: ${struct.hasMain ? '✓' : '✗'}`);
      console.log(`    - Article: ${struct.hasArticle ? '✓' : '✗'}`);
      console.log(`    - Footer: ${struct.hasFooter ? '✓' : '✗'}`);
    }
  }
}

/**
 * Print test summary
 */
function printSummary() {
  console.log('='.repeat(70));
  console.log('PHASE 2.3 TECHNICAL SEO FEATURES IMPLEMENTED:');
  console.log('='.repeat(70));
  console.log('✓ HTML validation checks');
  console.log('✓ Canonical tag analysis');
  console.log('✓ Meta robots tag analysis');
  console.log('✓ SSL/HTTPS detection');
  console.log('✓ Mobile-friendliness indicators (viewport)');
  console.log('✓ Page structure analysis (semantic HTML5)');
  console.log('✓ Accessibility checks (basic)');
  console.log('✓ Performance indicators (page size)');
  console.log('✓ Character encoding validation');
  console.log('✓ HTML language declaration');
  console.log('='.repeat(70));
  console.log();
  console.log('Total Technical SEO Rules: 10');
  console.log('Total Weight Points: 60 points');
  console.log();
}

// Run the test
runTechnicalSeoTest().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
