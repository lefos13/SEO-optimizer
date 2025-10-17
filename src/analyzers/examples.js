/**
 * SEO Analyzer Usage Examples
 * Demonstrates how to use the SEO analysis engine
 */

const SEOAnalyzer = require('./seoAnalyzer');

/**
 * Example 1: Basic content analysis
 */
async function exampleBasicAnalysis() {
  console.log('\n=== Example 1: Basic Content Analysis ===\n');

  const analyzer = new SEOAnalyzer();

  const content = {
    title: 'Complete Guide to SEO Optimization for Beginners',
    description:
      'Learn everything about SEO optimization with our comprehensive guide. Discover proven strategies, best practices, and expert tips to improve your search rankings.',
    keywords: 'seo optimization, search engine optimization, seo guide',
    html: `
      <h1>Complete Guide to SEO Optimization</h1>
      
      <p>SEO optimization is crucial for improving your website's visibility in search engines. 
      In this comprehensive guide, we'll cover everything you need to know about search engine optimization.</p>
      
      <h2>What is SEO Optimization?</h2>
      <p>Search engine optimization (SEO) is the practice of optimizing your website to rank higher 
      in search engine results. Good SEO optimization can significantly increase your organic traffic.</p>
      
      <h2>Why SEO Matters</h2>
      <p>With proper SEO optimization, your website can attract more visitors, generate more leads, 
      and ultimately grow your business. The benefits of SEO are numerous and long-lasting.</p>
      
      <h2>Key SEO Strategies</h2>
      <p>Successful SEO optimization requires a combination of on-page and off-page techniques. 
      This includes keyword research, content creation, link building, and technical optimization.</p>
      
      <img src="seo-guide.jpg" alt="SEO optimization guide illustration" />
      
      <p>For more information, visit our <a href="/seo-resources">SEO resources page</a> or 
      check out this <a href="https://example.com/seo">external SEO guide</a>.</p>
    `,
    language: 'en',
  };

  try {
    const results = await analyzer.analyze(content);

    console.log('Analysis Results:');
    console.log('----------------');
    console.log(
      `Score: ${results.score}/${results.maxScore} (${results.percentage}%)`
    );
    console.log(`Grade: ${results.grade}`);
    console.log(`Passed Rules: ${results.passedRules}`);
    console.log(`Failed Rules: ${results.failedRules}`);
    console.log(`Warnings: ${results.warnings}`);

    console.log('\nMetadata:');
    console.log('--------');
    console.log(`Word Count: ${results.metadata.wordCount}`);
    console.log(`Character Count: ${results.metadata.characterCount}`);
    console.log(`Images: ${results.metadata.images.length}`);
    console.log(`Links: ${results.metadata.links.length}`);

    if (results.issues.length > 0) {
      console.log('\nIssues Found:');
      console.log('------------');
      results.issues.forEach((issue, index) => {
        console.log(
          `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`
        );
        console.log(`   ${issue.description}`);
      });
    }

    if (results.recommendations.length > 0) {
      console.log('\nRecommendations:');
      console.log('---------------');
      Object.keys(results.recommendationsByCategory).forEach(category => {
        console.log(`\n${category.toUpperCase()}:`);
        results.recommendationsByCategory[category].forEach(rec => {
          console.log(`  • ${rec}`);
        });
      });
    }

    return results;
  } catch (error) {
    console.error('Analysis failed:', error.message);
  }
}

/**
 * Example 2: Poor SEO content analysis
 */
async function examplePoorSEO() {
  console.log('\n=== Example 2: Poor SEO Content ===\n');

  const analyzer = new SEOAnalyzer();

  const content = {
    title: 'My Page', // Too short
    description: 'This is a page.', // Too short
    keywords: 'test keyword',
    html: `
      <h1>First Heading</h1>
      <h1>Second Heading</h1>
      
      <p>Short content without enough words.</p>
      
      <img src="image.jpg" />
    `,
    language: 'en',
  };

  try {
    const results = await analyzer.analyze(content);

    console.log(
      `Score: ${results.score}/${results.maxScore} (${results.percentage}%)`
    );
    console.log(`Grade: ${results.grade}`);
    console.log(`Issues: ${results.issues.length}`);

    console.log('\nTop Issues:');
    results.issues.slice(0, 5).forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title} - ${issue.description}`);
    });

    return results;
  } catch (error) {
    console.error('Analysis failed:', error.message);
  }
}

/**
 * Example 3: Keyword density calculation
 */
async function exampleKeywordDensity() {
  console.log('\n=== Example 3: Keyword Density Analysis ===\n');

  const analyzer = new SEOAnalyzer();

  const text = `
    SEO optimization is essential for modern websites. When you focus on SEO optimization,
    you improve your search rankings. Good SEO optimization practices include keyword research,
    content creation, and technical SEO. Remember that SEO optimization is an ongoing process.
  `;

  const keywords = ['seo optimization', 'keyword research', 'content creation'];

  const densities = analyzer.calculateAllKeywordDensities(text, keywords);

  console.log('Keyword Density Results:');
  console.log('----------------------');
  densities.forEach(result => {
    console.log(`\nKeyword: "${result.keyword}"`);
    console.log(`Occurrences: ${result.count}`);
    console.log(`Density: ${result.density}%`);
    console.log(
      `Status: ${result.density >= 1 && result.density <= 3 ? '✓ Optimal' : '✗ Needs adjustment'}`
    );
  });
}

/**
 * Example 4: Greek content analysis
 */
async function exampleGreekContent() {
  console.log('\n=== Example 4: Greek Content Analysis ===\n');

  const analyzer = new SEOAnalyzer();

  const content = {
    title: 'Οδηγός Βελτιστοποίησης SEO για Αρχάριους',
    description:
      'Μάθετε τα πάντα για το SEO με τον αναλυτικό μας οδηγό. Ανακαλύψτε αποδεδειγμένες στρατηγικές και συμβουλές ειδικών για να βελτιώσετε τις κατατάξεις σας.',
    keywords: 'seo, βελτιστοποίηση, αναζήτηση',
    html: `
      <h1>Οδηγός Βελτιστοποίησης SEO</h1>
      
      <p>Το SEO είναι σημαντικό για την ορατότητα του ιστότοπού σας στις μηχανές αναζήτησης.</p>
      
      <h2>Τι είναι το SEO;</h2>
      <p>Η βελτιστοποίηση για μηχανές αναζήτησης είναι η διαδικασία βελτίωσης της κατάταξης 
      του ιστότοπού σας. Με καλές πρακτικές SEO μπορείτε να αυξήσετε την οργανική επισκεψιμότητα.</p>
      
      <h2>Γιατί έχει σημασία;</h2>
      <p>Με σωστή βελτιστοποίηση, ο ιστότοπός σας μπορεί να προσελκύσει περισσότερους επισκέπτες 
      και να αναπτύξει την επιχείρησή σας. Τα οφέλη του SEO είναι μακροπρόθεσμα.</p>
    `,
    language: 'el',
  };

  try {
    const results = await analyzer.analyze(content);

    console.log(
      `Score: ${results.score}/${results.maxScore} (${results.percentage}%)`
    );
    console.log(`Grade: ${results.grade}`);
    console.log(`Language: ${results.metadata.language}`);
    console.log(`Word Count: ${results.metadata.wordCount}`);

    return results;
  } catch (error) {
    console.error('Analysis failed:', error.message);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    await exampleBasicAnalysis();
    await examplePoorSEO();
    await exampleKeywordDensity();
    await exampleGreekContent();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export examples for use in other modules
module.exports = {
  exampleBasicAnalysis,
  examplePoorSEO,
  exampleKeywordDensity,
  exampleGreekContent,
  runAllExamples,
};

// Run examples if executed directly
if (require.main === module) {
  runAllExamples();
}
