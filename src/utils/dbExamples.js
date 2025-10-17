/**
 * Database Usage Examples
 *
 * This file contains practical examples of how to use the database layer
 * in your SEO Optimizer application. These examples can be used in React
 * components to interact with the database.
 *
 * eslint-disable no-console, no-unused-vars
 */

// ============ PROJECT MANAGEMENT ============

/**
 * Example: Create a new SEO project
 */
async function createNewProject() {
  try {
    const project = await window.electronAPI.projects.create({
      name: 'My Blog',
      description: 'Blog SEO analysis',
      url: 'https://myblog.com',
    });
    console.log('Project created:', project);
    return project;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
}

/**
 * Example: Retrieve all projects
 */
async function fetchAllProjects() {
  try {
    const projects = await window.electronAPI.projects.getAll({
      isActive: true,
      limit: 50,
      offset: 0,
    });
    console.log('Retrieved projects:', projects);
    return projects;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
}

/**
 * Example: Update a project
 */
async function updateProjectInfo(projectId, newData) {
  try {
    const updated = await window.electronAPI.projects.update(projectId, {
      name: newData.name,
      url: newData.url,
      description: newData.description,
    });
    console.log('Project updated:', updated);
    return updated;
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error;
  }
}

/**
 * Example: Delete a project
 */
async function deleteProject(projectId) {
  try {
    const success = await window.electronAPI.projects.delete(projectId);
    if (success) {
      console.log('Project deleted successfully');
    }
    return success;
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw error;
  }
}

// ============ CONTENT ANALYSIS ============

/**
 * Example: Analyze content
 */
async function analyzeContent(projectId, contentData) {
  try {
    // Step 1: Create analysis record
    const analysis = await window.electronAPI.analyses.create({
      project_id: projectId,
      content: contentData.htmlContent,
      language: contentData.language || 'en',
      title: contentData.title,
      meta_description: contentData.metaDescription,
      keywords: contentData.keywords,
    });

    console.log('Analysis created:', analysis);

    // Step 2: Get applicable rules
    const rules = await window.electronAPI.rules.getAll({
      isActive: true,
    });

    // Step 3: Run each rule (would be actual SEO analysis)
    let totalScore = 0;
    let resultCount = 0;

    for (const rule of rules) {
      try {
        // Simulate scoring (replace with actual analysis)
        const score = Math.random() * 100;
        const status =
          score > 70 ? 'passed' : score > 50 ? 'warning' : 'failed';

        // Create result record
        const result = await window.electronAPI.results.create({
          analysis_id: analysis.id,
          rule_id: rule.id,
          score: score,
          status: status,
          message: `${rule.name} analysis complete`,
          details: JSON.stringify({ sample: 'details' }),
        });

        totalScore += score * rule.weight;
        resultCount++;
      } catch (error) {
        console.error(`Failed to process rule ${rule.id}:`, error);
      }
    }

    // Step 4: Update overall score
    const overallScore = totalScore / (resultCount || 1);
    await window.electronAPI.analyses.update(analysis.id, {
      overall_score: Math.round(overallScore * 100) / 100,
    });

    return {
      analysis,
      overallScore,
      resultCount,
    };
  } catch (error) {
    console.error('Failed to analyze content:', error);
    throw error;
  }
}

/**
 * Example: Get analysis history for a project
 */
async function getProjectAnalysisHistory(projectId) {
  try {
    const analyses = await window.electronAPI.analyses.getByProject(projectId, {
      limit: 100,
      offset: 0,
    });

    console.log(`Found ${analyses.length} analyses for project ${projectId}`);
    return analyses;
  } catch (error) {
    console.error('Failed to get analysis history:', error);
    throw error;
  }
}

/**
 * Example: Get detailed results for an analysis
 */
async function getAnalysisDetails(analysisId) {
  try {
    // Get analysis info
    const analysis = await window.electronAPI.analyses.get(analysisId);

    // Get detailed results with rule information
    const results = await window.electronAPI.results.getByAnalysis(analysisId);

    return {
      analysis,
      results,
      score: analysis.overall_score,
      resultCount: results.length,
    };
  } catch (error) {
    console.error('Failed to get analysis details:', error);
    throw error;
  }
}

// ============ SEO RULES MANAGEMENT ============

/**
 * Example: Initialize default SEO rules
 */
async function initializeDefaultRules() {
  const defaultRules = [
    // Content Analysis
    {
      category: 'content',
      name: 'Keyword Density',
      description: 'Check keyword frequency in content',
      weight: 1.0,
    },
    {
      category: 'content',
      name: 'Content Length',
      description: 'Verify minimum content length',
      weight: 0.8,
    },
    {
      category: 'content',
      name: 'Readability Score',
      description: 'Analyze content readability',
      weight: 1.0,
    },

    // Meta Information
    {
      category: 'meta',
      name: 'Meta Title',
      description: 'Validate meta title',
      weight: 1.2,
    },
    {
      category: 'meta',
      name: 'Meta Description',
      description: 'Validate meta description',
      weight: 1.0,
    },
    {
      category: 'meta',
      name: 'Open Graph Tags',
      description: 'Check Open Graph tags',
      weight: 0.5,
    },

    // Structure
    {
      category: 'structure',
      name: 'Heading Structure',
      description: 'Validate H1-H6 hierarchy',
      weight: 1.0,
    },
    {
      category: 'structure',
      name: 'Image Alt Text',
      description: 'Check for image alt attributes',
      weight: 0.8,
    },
    {
      category: 'structure',
      name: 'Internal Links',
      description: 'Analyze internal linking',
      weight: 0.9,
    },

    // Performance
    {
      category: 'performance',
      name: 'Mobile Friendly',
      description: 'Check mobile responsiveness',
      weight: 1.1,
    },
    {
      category: 'performance',
      name: 'Page Speed',
      description: 'Evaluate page load speed',
      weight: 0.9,
    },
  ];

  try {
    const created = [];
    for (const rule of defaultRules) {
      const createdRule = await window.electronAPI.rules.create(rule);
      created.push(createdRule);
    }
    console.log(`Created ${created.length} default rules`);
    return created;
  } catch (error) {
    console.error('Failed to initialize rules:', error);
    throw error;
  }
}

/**
 * Example: Get rules by category
 */
async function getRulesByCategory(category) {
  try {
    const rules = await window.electronAPI.rules.getByCategory(category);
    console.log(`Retrieved ${rules.length} rules for category: ${category}`);
    return rules;
  } catch (error) {
    console.error('Failed to get rules by category:', error);
    throw error;
  }
}

// ============ REPORTING ============

/**
 * Example: Generate analysis summary
 */
async function generateAnalysisSummary(analysisId) {
  try {
    const analysis = await window.electronAPI.analyses.get(analysisId);
    const results = await window.electronAPI.results.getByAnalysis(analysisId);

    const summary = {
      title: analysis.title,
      url: analysis.url,
      language: analysis.language,
      overallScore: analysis.overall_score,
      analyzedAt: analysis.created_at,
      resultsByCategory: {},
      recommendations: [],
    };

    // Group results by category
    results.forEach(result => {
      if (!summary.resultsByCategory[result.category]) {
        summary.resultsByCategory[result.category] = [];
      }
      summary.resultsByCategory[result.category].push({
        name: result.rule_name,
        score: result.score,
        status: result.status,
        message: result.message,
      });

      // Add recommendations for failed items
      if (result.status === 'failed') {
        summary.recommendations.push(
          `⚠️ ${result.rule_name}: ${result.message}`
        );
      }
    });

    return summary;
  } catch (error) {
    console.error('Failed to generate summary:', error);
    throw error;
  }
}

/**
 * Example: Compare two analyses
 */
async function compareAnalyses(analysisId1, analysisId2) {
  try {
    const analysis1 = await window.electronAPI.analyses.get(analysisId1);
    const analysis2 = await window.electronAPI.analyses.get(analysisId2);

    const results1 =
      await window.electronAPI.results.getByAnalysis(analysisId1);
    const results2 =
      await window.electronAPI.results.getByAnalysis(analysisId2);

    const comparison = {
      scoreChange: analysis2.overall_score - analysis1.overall_score,
      scoreChangePercent:
        (
          ((analysis2.overall_score - analysis1.overall_score) /
            analysis1.overall_score) *
          100
        ).toFixed(2) + '%',
      improved: [],
      degraded: [],
      unchanged: [],
    };

    // Compare each rule score
    results1.forEach(result1 => {
      const result2 = results2.find(r => r.rule_id === result1.rule_id);
      if (!result2) return;

      const diff = result2.score - result1.score;
      if (diff > 5) {
        comparison.improved.push({
          rule: result1.rule_name,
          from: result1.score,
          to: result2.score,
          gain: diff,
        });
      } else if (diff < -5) {
        comparison.degraded.push({
          rule: result1.rule_name,
          from: result1.score,
          to: result2.score,
          loss: Math.abs(diff),
        });
      } else {
        comparison.unchanged.push(result1.rule_name);
      }
    });

    return comparison;
  } catch (error) {
    console.error('Failed to compare analyses:', error);
    throw error;
  }
}

// ============ DATABASE UTILITIES ============

/**
 * Example: Get database statistics
 */
async function getDatabaseStats() {
  try {
    const stats = await window.electronAPI.database.getStats();
    console.log('Database Statistics:', stats);
    return stats;
  } catch (error) {
    console.error('Failed to get database stats:', error);
    throw error;
  }
}

/**
 * Example: Export analysis results
 */
async function exportAnalysisAsJSON(analysisId) {
  try {
    const analysis = await window.electronAPI.analyses.get(analysisId);
    const results = await window.electronAPI.results.getByAnalysis(analysisId);

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        appVersion: '1.0.0',
      },
      analysis: analysis,
      results: results,
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export analysis:', error);
    throw error;
  }
}

// Export examples for use in components
module.exports = {
  // Projects
  createNewProject,
  fetchAllProjects,
  updateProjectInfo,
  deleteProject,

  // Analysis
  analyzeContent,
  getProjectAnalysisHistory,
  getAnalysisDetails,

  // Rules
  initializeDefaultRules,
  getRulesByCategory,

  // Reporting
  generateAnalysisSummary,
  compareAnalyses,

  // Utilities
  getDatabaseStats,
  exportAnalysisAsJSON,
};
