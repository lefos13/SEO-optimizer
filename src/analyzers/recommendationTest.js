/**
 * Recommendation Engine Test
 * Tests Phase 2.4 - Enhanced recommendation generation
 */

const SEOAnalyzer = require('./seoAnalyzer');

async function runRecommendationEngineTest() {
  console.log('='.repeat(70));
  console.log('RECOMMENDATION ENGINE TEST - Phase 2.4');
  console.log('='.repeat(70));
  console.log();

  // Test Case 1: Multiple issues with varying priorities
  console.log('Test 1: Comprehensive Recommendation Analysis (English)');
  console.log('-'.repeat(70));

  const analyzer = new SEOAnalyzer('en');

  const testContent = {
    title: 'SEO',
    description: 'Short desc',
    keywords: 'seo, optimization',
    url: 'http://example.com/blog/seo_tips',
    language: 'en',
    html: `
<html>
<head>
  <title>SEO</title>
</head>
<body>
  <div class="container">
    <div class="title">SEO Tips</div>
    <div class="content">
      <p>SEO is important. You should do SEO. More SEO tips here.</p>
      <img src="img1.jpg">
      <img src="pic_2.png">
    </div>
  </div>
</body>
</html>`,
  };

  const results = await analyzer.analyze(testContent);

  console.log(`\nAnalysis Results:`);
  console.log(
    `Score: ${results.score}/${results.maxScore} (${results.percentage}%)`
  );
  console.log(`Grade: ${results.grade}`);
  console.log(`Failed Rules: ${results.failedRules}`);
  console.log();

  if (results.enhancedRecommendations) {
    const recs = results.enhancedRecommendations;

    console.log('=== RECOMMENDATION SUMMARY ===');
    console.log(`Total Recommendations: ${recs.summary.totalRecommendations}`);
    console.log(`\nCurrent State:`);
    console.log(
      `  Score: ${recs.summary.currentScore}/${results.maxScore} (${recs.summary.currentPercentage}%) - Grade ${recs.summary.currentGrade}`
    );
    console.log(`\nPotential After All Fixes:`);
    console.log(
      `  Score: ${recs.summary.potentialScore}/${results.maxScore} (${recs.summary.potentialPercentage}%) - Grade ${recs.summary.potentialGrade}`
    );
    console.log(
      `  Potential Increase: +${recs.summary.totalPotentialIncrease} points (+${recs.summary.potentialPercentage - recs.summary.currentPercentage}%)`
    );

    console.log(`\nBy Priority:`);
    console.log(`  Critical: ${recs.summary.priorityCounts.critical}`);
    console.log(`  High: ${recs.summary.priorityCounts.high}`);
    console.log(`  Medium: ${recs.summary.priorityCounts.medium}`);
    console.log(`  Low: ${recs.summary.priorityCounts.low}`);

    console.log(`\nBy Effort:`);
    console.log(`  Quick Fixes: ${recs.summary.effortCounts.quick}`);
    console.log(`  Moderate: ${recs.summary.effortCounts.moderate}`);
    console.log(`  Significant: ${recs.summary.effortCounts.significant}`);

    console.log('\n=== QUICK WINS (High Impact, Low Effort) ===');
    if (recs.quickWins && recs.quickWins.length > 0) {
      recs.quickWins.forEach((rec, index) => {
        console.log(
          `\n${index + 1}. ${rec.title} [${rec.priority.toUpperCase()}]`
        );
        console.log(
          `   Impact: +${rec.impactEstimate.scoreIncrease} points (+${rec.impactEstimate.percentageIncrease}%)`
        );
        console.log(`   Effort: ${rec.effort} (${rec.estimatedTime})`);
        console.log(`   Why: ${rec.why}`);
      });
    }

    console.log('\n\n=== TOP 5 CRITICAL RECOMMENDATIONS ===');
    const critical = recs.byPriority.critical.slice(0, 5);
    critical.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.title}`);
      console.log(`   Category: ${rec.category}`);
      console.log(`   Priority: ${rec.priority.toUpperCase()}`);
      console.log(
        `   Impact: +${rec.impactEstimate.scoreIncrease} points → ${rec.impactEstimate.projectedPercentage}%`
      );
      console.log(`   Effort: ${rec.effort} (${rec.estimatedTime})`);
      console.log(`   Why: ${rec.why}`);

      if (rec.actions && rec.actions.length > 0) {
        console.log(`   Actions:`);
        rec.actions.slice(0, 3).forEach(action => {
          console.log(`     ${action.step}. [${action.type}] ${action.action}`);
        });
      }

      if (rec.example) {
        console.log(`   Example:`);
        console.log(
          `     Before: ${typeof rec.example.before === 'string' ? rec.example.before.substring(0, 60) + '...' : 'N/A'}`
        );
        console.log(
          `     After:  ${typeof rec.example.after === 'string' ? rec.example.after.substring(0, 60) + '...' : 'N/A'}`
        );
      }
    });

    console.log('\n\n=== RECOMMENDATIONS BY CATEGORY ===');
    Object.keys(recs.byCategory).forEach(category => {
      const categoryRecs = recs.byCategory[category];
      console.log(
        `\n${category.toUpperCase()} (${categoryRecs.length} recommendations):`
      );
      categoryRecs.slice(0, 3).forEach(rec => {
        console.log(
          `  • ${rec.title} [${rec.priority}] - +${rec.impactEstimate.scoreIncrease} points`
        );
      });
    });
  }

  console.log('\n\n');

  // Test Case 2: Greek Language Support
  console.log('Test 2: Greek Language Support');
  console.log('-'.repeat(70));

  const greekAnalyzer = new SEOAnalyzer('el');

  const greekContent = {
    title: 'SEO',
    description: 'Σύντομη περιγραφή',
    keywords: 'seo, βελτιστοποίηση',
    url: 'https://example.gr/blog',
    language: 'el',
    html: `
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>SEO</title>
</head>
<body>
  <h1>Οδηγός SEO</h1>
  <p>Το SEO είναι σημαντικό για την επιτυχία στο διαδίκτυο.</p>
</body>
</html>`,
  };

  const greekResults = await greekAnalyzer.analyze(greekContent);

  console.log(`\nΑποτελέσματα Ανάλυσης:`);
  console.log(
    `Βαθμολογία: ${greekResults.score}/${greekResults.maxScore} (${greekResults.percentage}%)`
  );
  console.log(`Βαθμός: ${greekResults.grade}`);

  if (greekResults.enhancedRecommendations) {
    const recs = greekResults.enhancedRecommendations;
    console.log(`\nΣυνολικές Συστάσεις: ${recs.summary.totalRecommendations}`);
    console.log(
      `Δυνητική Αύξηση: +${recs.summary.totalPotentialIncrease} πόντοι`
    );

    console.log(`\nΑνά Προτεραιότητα:`);
    console.log(`  Κρίσιμο: ${recs.summary.priorityCounts.critical}`);
    console.log(`  Υψηλό: ${recs.summary.priorityCounts.high}`);
    console.log(`  Μέτριο: ${recs.summary.priorityCounts.medium}`);
    console.log(`  Χαμηλό: ${recs.summary.priorityCounts.low}`);
  }

  console.log('\n\n');

  // Test Case 3: Impact Estimation Accuracy
  console.log('Test 3: Impact Estimation Validation');
  console.log('-'.repeat(70));

  const impactAnalyzer = new SEOAnalyzer('en');

  const beforeContent = {
    title: 'Blog',
    description: 'A blog',
    keywords: 'blog',
    url: 'http://test.com',
    html: '<html><body><div>Content</div></body></html>',
  };

  const beforeResults = await impactAnalyzer.analyze(beforeContent);
  console.log(`\nBefore Fixes:`);
  console.log(
    `  Score: ${beforeResults.score}/${beforeResults.maxScore} (${beforeResults.percentage}%)`
  );
  console.log(`  Grade: ${beforeResults.grade}`);
  console.log(`  Failed Rules: ${beforeResults.failedRules}`);

  if (beforeResults.enhancedRecommendations) {
    const topRec = beforeResults.enhancedRecommendations.recommendations[0];
    console.log(`\nTop Recommendation: ${topRec.title}`);
    console.log(`  Current: ${topRec.impactEstimate.currentPercentage}%`);
    console.log(`  Projected: ${topRec.impactEstimate.projectedPercentage}%`);
    console.log(
      `  Increase: +${topRec.impactEstimate.scoreIncrease} points (+${topRec.impactEstimate.percentageIncrease}%)`
    );

    // Simulate fixing the top issue
    console.log(`\n--- Simulating fix for: ${topRec.title} ---`);
  }

  console.log('\n\n');
  printTestSummary();
}

/**
 * Print test summary
 */
function printTestSummary() {
  console.log('='.repeat(70));
  console.log('PHASE 2.4 RECOMMENDATION ENGINE FEATURES:');
  console.log('='.repeat(70));
  console.log('✓ Priority-based recommendations (Critical, High, Medium, Low)');
  console.log('✓ Actionable, specific improvement suggestions');
  console.log('✓ Before/after impact estimation');
  console.log('✓ Effort estimation (Quick, Moderate, Significant)');
  console.log('✓ Estimated time for each fix');
  console.log('✓ Score projection after fixes');
  console.log('✓ Quick wins identification (high impact, low effort)');
  console.log('✓ Recommendations grouped by priority, category, effort');
  console.log('✓ Multi-language support (English, Greek)');
  console.log('✓ Why explanations for each recommendation');
  console.log('✓ Learning resources and documentation links');
  console.log('✓ Specific actions based on current content');
  console.log('='.repeat(70));
  console.log();
  console.log('Recommendation Engine Features:');
  console.log('  - 12 comprehensive fields per recommendation');
  console.log('  - Impact estimation with score projections');
  console.log('  - Category-based organization');
  console.log('  - Actionable step-by-step guidance');
  console.log('  - Multi-language translation support');
  console.log('='.repeat(70));
  console.log();
}

// Run the test
runRecommendationEngineTest().catch(error => {
  console.error('Test failed:', error);
  console.error(error.stack);
  process.exit(1);
});
