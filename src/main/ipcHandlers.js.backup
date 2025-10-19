const { ipcMain } = require('electron');
const DatabaseOperations = require('./dbOperations');

/**
 * IPC Handlers for Database Operations
 * Sets up all electron IPC handlers for database communication
 */
class IPCHandlers {
  /**
   * Register all IPC handlers
   */
  static registerHandlers() {
    // ============ PROJECTS ============
    ipcMain.handle('db:project:create', (event, projectData) => {
      try {
        return DatabaseOperations.createProject(projectData);
      } catch (error) {
        throw new Error(`Create project failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:project:get', (event, projectId) => {
      try {
        return DatabaseOperations.getProject(projectId);
      } catch (error) {
        throw new Error(`Get project failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:project:getAll', (event, options) => {
      try {
        return DatabaseOperations.getAllProjects(options);
      } catch (error) {
        throw new Error(`Get all projects failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:project:update', (event, projectId, updates) => {
      try {
        return DatabaseOperations.updateProject(projectId, updates);
      } catch (error) {
        throw new Error(`Update project failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:project:delete', (event, projectId) => {
      try {
        return DatabaseOperations.deleteProject(projectId);
      } catch (error) {
        throw new Error(`Delete project failed: ${error.message}`);
      }
    });

    // ============ ANALYSES ============
    ipcMain.handle('db:analysis:create', (event, analysisData) => {
      try {
        console.log('[IPC] db:analysis:create called with data:', {
          project_id: analysisData.project_id,
          language: analysisData.language,
          title: analysisData.title,
          contentLength: analysisData.content?.length,
          keywordsCount: analysisData.keywords?.split(',').length,
        });
        const result = DatabaseOperations.createAnalysis(analysisData);

        console.log('[IPC] ✅ Analysis created:', {
          id: result.id,
          project_id: result.project_id,
        });
        return result;
      } catch (error) {
        console.error('[IPC] ❌ Create analysis failed:', error.message);
        throw new Error(`Create analysis failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:analysis:get', (event, analysisId) => {
      try {
        console.log('[IPC] db:analysis:get called with ID:', analysisId);
        const result = DatabaseOperations.getAnalysis(analysisId);

        console.log('[IPC] ✅ Analysis retrieved:', { id: result?.id });
        return result;
      } catch (error) {
        console.error('[IPC] ❌ Get analysis failed:', error.message);
        throw new Error(`Get analysis failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:analysis:getByProject', (event, projectId, options) => {
      try {
        // Validate projectId
        if (!projectId) {
          console.warn(
            '[IPC] ⚠️ db:analysis:getByProject called with invalid projectId:',
            projectId
          );
          throw new Error('Project ID is required');
        }

        console.log('[IPC] db:analysis:getByProject called:', {
          projectId,
          options,
        });
        const result = DatabaseOperations.getProjectAnalyses(
          projectId,
          options
        );

        console.log('[IPC] ✅ Project analyses retrieved:', {
          count: result?.length || 0,
        });
        return result;
      } catch (error) {
        console.error('[IPC] ❌ Get project analyses failed:', error.message);
        throw new Error(`Get project analyses failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:analysis:update', (event, analysisId, updates) => {
      try {
        console.log('[IPC] db:analysis:update called:', {
          analysisId,
          updateKeys: Object.keys(updates),
        });
        const result = DatabaseOperations.updateAnalysis(analysisId, updates);

        console.log('[IPC] ✅ Analysis updated:', { id: result?.id });
        return result;
      } catch (error) {
        throw new Error(`Update analysis failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:analysis:delete', (event, analysisId) => {
      try {
        return DatabaseOperations.deleteAnalysis(analysisId);
      } catch (error) {
        throw new Error(`Delete analysis failed: ${error.message}`);
      }
    });

    // ============ SEO RULES ============
    ipcMain.handle('db:rule:create', (event, ruleData) => {
      try {
        return DatabaseOperations.createSeoRule(ruleData);
      } catch (error) {
        throw new Error(`Create rule failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:rule:get', (event, ruleId) => {
      try {
        return DatabaseOperations.getSeoRule(ruleId);
      } catch (error) {
        throw new Error(`Get rule failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:rule:getAll', (event, options) => {
      try {
        return DatabaseOperations.getAllSeoRules(options);
      } catch (error) {
        throw new Error(`Get all rules failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:rule:getByCategory', (event, category) => {
      try {
        return DatabaseOperations.getRulesByCategory(category);
      } catch (error) {
        throw new Error(`Get rules by category failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:rule:update', (event, ruleId, updates) => {
      try {
        return DatabaseOperations.updateSeoRule(ruleId, updates);
      } catch (error) {
        throw new Error(`Update rule failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:rule:delete', (event, ruleId) => {
      try {
        return DatabaseOperations.deleteSeoRule(ruleId);
      } catch (error) {
        throw new Error(`Delete rule failed: ${error.message}`);
      }
    });

    // ============ MINI SERVICE RESULTS ============
    ipcMain.handle('db:result:create', (event, resultData) => {
      try {
        return DatabaseOperations.createMiniServiceResult(resultData);
      } catch (error) {
        throw new Error(`Create result failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:result:get', (event, resultId) => {
      try {
        return DatabaseOperations.getMiniServiceResult(resultId);
      } catch (error) {
        throw new Error(`Get result failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:result:getByAnalysis', (event, analysisId) => {
      try {
        return DatabaseOperations.getAnalysisResults(analysisId);
      } catch (error) {
        throw new Error(`Get analysis results failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:result:update', (event, resultId, updates) => {
      try {
        return DatabaseOperations.updateMiniServiceResult(resultId, updates);
      } catch (error) {
        throw new Error(`Update result failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:result:delete', (event, resultId) => {
      try {
        return DatabaseOperations.deleteMiniServiceResult(resultId);
      } catch (error) {
        throw new Error(`Delete result failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:result:deleteByAnalysis', (event, analysisId) => {
      try {
        return DatabaseOperations.deleteAnalysisResults(analysisId);
      } catch (error) {
        throw new Error(`Delete analysis results failed: ${error.message}`);
      }
    });

    // ============ GENERAL ============
    ipcMain.handle('db:stats', () => {
      try {
        const dbManager = require('./dbManager');
        return dbManager.getStats();
      } catch (error) {
        throw new Error(`Get database stats failed: ${error.message}`);
      }
    });

    // ============ SEO ANALYZER ============
    ipcMain.handle('seo:analyze', async (event, content) => {
      try {
        console.log('[IPC] seo:analyze called with content:', {
          htmlLength: content.html?.length,
          keywords: content.keywords,
          language: content.language,
          url: content.url,
        });
        const SEOAnalyzer = require('../analyzers/seoAnalyzer');
        const analyzer = new SEOAnalyzer(content.language || 'en');

        console.log('[IPC] SEOAnalyzer instance created, running analysis...');
        const results = await analyzer.analyze(content);

        console.log('[IPC] ✅ SEO analysis complete, returning results:', {
          score: results.score,
          percentage: results.percentage,
          grade: results.grade,
          issuesCount: results.issues?.length || 0,
        });
        return results;
      } catch (error) {
        console.error('[IPC] ❌ SEO analysis failed:', error.message);
        throw new Error(`SEO analysis failed: ${error.message}`);
      }
    });

    ipcMain.handle('seo:recommendations:get', (event, analysisId) => {
      try {
        const dbManager = require('./dbManager');
        const persistence = require('../database/recommendationPersistence');
        return persistence.getRecommendations(dbManager.getDb(), analysisId);
      } catch (error) {
        throw new Error(`Get recommendations failed: ${error.message}`);
      }
    });

    ipcMain.handle(
      'seo:recommendations:updateStatus',
      (event, recId, status, notes) => {
        try {
          const dbManager = require('./dbManager');
          const persistence = require('../database/recommendationPersistence');
          return persistence.updateRecommendationStatus(
            dbManager.getDb(),
            recId,
            status,
            notes
          );
        } catch (error) {
          throw new Error(
            `Update recommendation status failed: ${error.message}`
          );
        }
      }
    );

    ipcMain.handle('seo:recommendations:quickWins', (event, analysisId) => {
      try {
        const dbManager = require('./dbManager');
        const persistence = require('../database/recommendationPersistence');
        return persistence.getQuickWins(dbManager.getDb(), analysisId, 5);
      } catch (error) {
        throw new Error(`Get quick wins failed: ${error.message}`);
      }
    });

    // ============ KEYWORD DENSITY ============
    ipcMain.handle('seo:calculateDensity', async (event, text, keyword) => {
      try {
        const SEOAnalyzer = require('../analyzers/seoAnalyzer');
        const analyzer = new SEOAnalyzer();
        return analyzer.calculateKeywordDensity(text, keyword);
      } catch (error) {
        throw new Error(`Calculate density failed: ${error.message}`);
      }
    });

    ipcMain.handle('seo:calculateDensities', async (event, text, keywords) => {
      try {
        console.log('[IPC] seo:calculateDensities called:', {
          rawTextLength: text?.length || 0,
          keywordsCount: keywords?.length || 0,
          keywords: keywords,
        });
        // Parse content to extract clean text (align with suggestions engine)
        const htmlParser = require('../analyzers/htmlParser');
        const parsed = htmlParser.parse(text || '');
        const cleanText = parsed.text || text;
        console.log('[IPC] Clean text extracted for density calculation:', {
          cleanTextLength: cleanText?.length || 0,
        });
        const SEOAnalyzer = require('../analyzers/seoAnalyzer');
        const analyzer = new SEOAnalyzer();
        const results = analyzer.calculateAllKeywordDensities(
          cleanText,
          keywords
        );
        console.log('[IPC] ✅ Densities calculated:', {
          resultsCount: results.length,
          results: results,
        });
        return results;
      } catch (error) {
        console.error('[IPC] ❌ Calculate densities failed:', error.message);
        throw new Error(`Calculate densities failed: ${error.message}`);
      }
    });

    // ============ KEYWORD SUGGESTIONS ============
    ipcMain.handle(
      'seo:suggestKeywords',
      async (event, html, maxSuggestions = 10) => {
        try {
          console.log('[IPC] seo:suggestKeywords called:', {
            htmlLength: html?.length || 0,
            maxSuggestions,
          });
          const keywordSuggestions = require('../analyzers/keywordSuggestions');
          const suggestions = keywordSuggestions.suggestKeywords(
            html,
            maxSuggestions
          );

          console.log('[IPC] ✅ Keyword suggestions generated:', {
            count: suggestions.length,
            topSuggestions: suggestions.slice(0, 3).map(s => s.keyword),
          });
          return suggestions;
        } catch (error) {
          console.error('[IPC] ❌ Keyword suggestions failed:', error.message);
          throw new Error(`Keyword suggestions failed: ${error.message}`);
        }
      }
    );

    ipcMain.handle(
      'seo:recommendations:save',
      (event, analysisId, enhancedRecommendations) => {
        try {
          console.log('[IPC] seo:recommendations:save called:', {
            analysisId,
            recommendationCount:
              enhancedRecommendations?.recommendations?.length || 0,
          });
          const dbManager = require('./dbManager');
          const persistence = require('../database/recommendationPersistence');
          const result = persistence.saveRecommendations(
            dbManager.getDb(),
            analysisId,
            enhancedRecommendations
          );

          console.log('[IPC] ✅ Recommendations saved successfully');
          return result;
        } catch (error) {
          console.error('[IPC] ❌ Save recommendations failed:', error.message);
          throw new Error(`Save recommendations failed: ${error.message}`);
        }
      }
    );

    // ============ URL FETCHER ============
    ipcMain.handle('seo:fetchUrl', async (event, url, options = {}) => {
      try {
        console.log('[IPC] 🔗 Fetching URL:', url);
        const urlFetcher = require('../analyzers/urlFetcher');

        // Validate URL first
        if (!urlFetcher.isValidUrl(url)) {
          throw new Error('Invalid URL format. Please use HTTP or HTTPS.');
        }

        // Fetch the URL
        const result = await urlFetcher.fetchUrl(url, options);

        if (!result.success) {
          console.error('[IPC] ❌ URL fetch failed:', result.error);
          throw new Error(result.error || 'Failed to fetch URL');
        }

        console.log('[IPC] ✅ URL fetched successfully:', {
          finalUrl: result.finalUrl,
          title: result.title,
          htmlLength: result.html?.length || 0,
        });

        return result;
      } catch (error) {
        console.error('[IPC] ❌ Fetch URL failed:', error.message);
        throw new Error(`Fetch URL failed: ${error.message}`);
      }
    });

    // ============ KEYWORD SERVICES (MINI-SERVICES) ============
    ipcMain.handle(
      'keyword:analyzeDensity',
      async (event, content, keywords) => {
        try {
          console.log('[IPC] 🔍 Analyzing keyword density:', {
            contentLength: content?.length || 0,
            keywordsCount: keywords?.length || 0,
          });
          const KeywordServices = require('../analyzers/keywordServices');
          const result = KeywordServices.analyzeKeywordDensity(
            content,
            keywords
          );

          console.log('[IPC] ✅ Keyword density analysis complete:', {
            totalWords: result.totalWords,
            resultsCount: result.densityResults?.length || 0,
          });
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Keyword density analysis failed:',
            error.message
          );
          throw new Error(`Keyword density analysis failed: ${error.message}`);
        }
      }
    );

    ipcMain.handle(
      'keyword:generateLongTail',
      async (event, content, seedKeywords, maxSuggestions) => {
        try {
          console.log('[IPC] 🎯 Generating long-tail keywords:', {
            contentLength: content?.length || 0,
            seedCount: seedKeywords?.length || 0,
            maxSuggestions,
          });
          const KeywordServices = require('../analyzers/keywordServices');
          const result = KeywordServices.generateLongTailKeywords(
            content,
            seedKeywords,
            maxSuggestions
          );

          console.log('[IPC] ✅ Long-tail keywords generated:', {
            suggestionsCount: result.suggestions?.length || 0,
          });
          return result;
        } catch (error) {
          console.error('[IPC] ❌ Long-tail generation failed:', error.message);
          throw new Error(`Long-tail generation failed: ${error.message}`);
        }
      }
    );

    ipcMain.handle(
      'keyword:estimateDifficulty',
      async (event, keywords, content) => {
        try {
          console.log('[IPC] 📊 Estimating keyword difficulty:', {
            keywordsCount: keywords?.length || 0,
          });
          const KeywordServices = require('../analyzers/keywordServices');
          const result = KeywordServices.estimateKeywordDifficulty(
            keywords,
            content
          );

          console.log('[IPC] ✅ Difficulty estimation complete:', {
            estimatesCount: result.estimates?.length || 0,
          });
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Difficulty estimation failed:',
            error.message
          );
          throw new Error(`Difficulty estimation failed: ${error.message}`);
        }
      }
    );

    ipcMain.handle('keyword:cluster', async (event, keywords, content) => {
      try {
        console.log('[IPC] 🔗 Clustering keywords:', {
          keywordsCount: keywords?.length || 0,
        });
        const KeywordServices = require('../analyzers/keywordServices');
        const result = KeywordServices.clusterKeywords(keywords, content);

        console.log('[IPC] ✅ Keyword clustering complete:', {
          clustersCount: result.totalClusters,
        });
        return result;
      } catch (error) {
        console.error('[IPC] ❌ Keyword clustering failed:', error.message);
        throw new Error(`Keyword clustering failed: ${error.message}`);
      }
    });

    ipcMain.handle(
      'keyword:generateLSI',
      async (event, content, mainKeywords, maxSuggestions) => {
        try {
          console.log('[IPC] 📝 Generating LSI keywords:', {
            contentLength: content?.length || 0,
            mainKeywordsCount: mainKeywords?.length || 0,
            maxSuggestions,
          });
          const KeywordServices = require('../analyzers/keywordServices');
          const result = KeywordServices.generateLSIKeywords(
            content,
            mainKeywords,
            maxSuggestions
          );

          console.log('[IPC] ✅ LSI keywords generated:', {
            suggestionsCount: result.lsiKeywords?.length || 0,
          });
          return result;
        } catch (error) {
          console.error('[IPC] ❌ LSI generation failed:', error.message);
          throw new Error(`LSI generation failed: ${error.message}`);
        }
      }
    );

    // ============ READABILITY SERVICES (MINI-SERVICES) ============
    ipcMain.handle(
      'readability:analyze',
      async (event, content, options = {}) => {
        try {
          console.log('[IPC] 📖 Readability analysis requested:', {
            contentLength: content?.length || 0,
            language: options?.language || 'en',
          });
          const ReadabilityServices = require('../analyzers/readabilityServices');
          const result = ReadabilityServices.analyze(content, options);

          console.log('[IPC] ✅ Readability analysis complete:', {
            score: result?.compositeScore?.score,
            warnings: result?.meta?.warnings?.length || 0,
          });
          return result;
        } catch (error) {
          console.error('[IPC] ❌ Readability analysis failed:', error.message);
          throw new Error(`Readability analysis failed: ${error.message}`);
        }
      }
    );

    ipcMain.handle(
      'readability:analyzeOverview',
      async (event, content, options = {}) => {
        try {
          console.log('[IPC] 📊 Readability overview analysis requested');
          const ReadabilityServices = require('../analyzers/readabilityServices');
          const result = ReadabilityServices.analyzeOverview(content, options);

          console.log('[IPC] ✅ Overview analysis complete');
          return result;
        } catch (error) {
          console.error('[IPC] ❌ Overview analysis failed:', error.message);
          throw new Error(`Overview analysis failed: ${error.message}`);
        }
      }
    );

    ipcMain.handle(
      'readability:analyzeStructure',
      async (event, content, options = {}) => {
        try {
          console.log('[IPC] 🧱 Readability structure analysis requested');
          const ReadabilityServices = require('../analyzers/readabilityServices');
          const result = ReadabilityServices.analyzeStructure(content, options);

          console.log('[IPC] ✅ Structure analysis complete');
          return result;
        } catch (error) {
          console.error('[IPC] ❌ Structure analysis failed:', error.message);
          throw new Error(`Structure analysis failed: ${error.message}`);
        }
      }
    );

    ipcMain.handle(
      'readability:analyzeReadingLevels',
      async (event, content, options = {}) => {
        try {
          console.log('[IPC] 🎓 Reading levels analysis requested');
          const ReadabilityServices = require('../analyzers/readabilityServices');
          const result = ReadabilityServices.analyzeReadingLevels(
            content,
            options
          );

          console.log('[IPC] ✅ Reading levels analysis complete');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Reading levels analysis failed:',
            error.message
          );
          throw new Error(`Reading levels analysis failed: ${error.message}`);
        }
      }
    );

    ipcMain.handle(
      'readability:analyzeImprovements',
      async (event, content, options = {}) => {
        try {
          console.log('[IPC] 💡 Improvements analysis requested');
          const ReadabilityServices = require('../analyzers/readabilityServices');
          const result = ReadabilityServices.analyzeImprovements(
            content,
            options
          );

          console.log('[IPC] ✅ Improvements analysis complete');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Improvements analysis failed:',
            error.message
          );
          throw new Error(`Improvements analysis failed: ${error.message}`);
        }
      }
    );

    ipcMain.handle(
      'readability:analyzeLanguageGuidance',
      async (event, content, options = {}) => {
        try {
          console.log('[IPC] 🌐 Language guidance analysis requested');
          const ReadabilityServices = require('../analyzers/readabilityServices');
          const result = ReadabilityServices.analyzeLanguageGuidance(
            content,
            options
          );

          console.log('[IPC] ✅ Language guidance analysis complete');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Language guidance analysis failed:',
            error.message
          );
          throw new Error(
            `Language guidance analysis failed: ${error.message}`
          );
        }
      }
    );

    ipcMain.handle(
      'readability:analyzeLiveScore',
      async (event, content, options = {}) => {
        try {
          console.log('[IPC] ⚡ Live score analysis requested');
          const ReadabilityServices = require('../analyzers/readabilityServices');
          const result = ReadabilityServices.analyzeLiveScore(content, options);

          console.log('[IPC] ✅ Live score analysis complete');
          return result;
        } catch (error) {
          console.error('[IPC] ❌ Live score analysis failed:', error.message);
          throw new Error(`Live score analysis failed: ${error.message}`);
        }
      }
    );

    // ============ CONTENT OPTIMIZATION SERVICES ============

    ipcMain.handle(
      'content:analyzeStructure',
      async (event, content, options = {}) => {
        try {
          console.log('[IPC] 🏗️ Content structure analysis requested');
          const ContentServices = require('../analyzers/contentServices');
          const result = ContentServices.analyzeContentStructure(
            content,
            options
          );

          console.log('[IPC] ✅ Content structure analysis complete:', {
            score: result.score.score,
            recommendations: result.recommendations.length,
          });
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Content structure analysis failed:',
            error.message
          );
          throw new Error(
            `Content structure analysis failed: ${error.message}`
          );
        }
      }
    );

    ipcMain.handle(
      'content:optimizeHeadings',
      async (event, content, keywords = []) => {
        try {
          console.log('[IPC] 📋 Heading optimization requested:', {
            keywordCount: keywords.length,
          });
          const ContentServices = require('../analyzers/contentServices');
          const result = ContentServices.optimizeHeadings(content, keywords);

          console.log('[IPC] ✅ Heading optimization complete:', {
            score: result.score.score,
            suggestions: result.suggestions.length,
          });
          return result;
        } catch (error) {
          console.error('[IPC] ❌ Heading optimization failed:', error.message);
          throw new Error(`Heading optimization failed: ${error.message}`);
        }
      }
    );

    ipcMain.handle(
      'content:recommendInternalLinks',
      async (event, content, existingPages = []) => {
        try {
          console.log('[IPC] 🔗 Internal linking analysis requested:', {
            existingPages: existingPages.length,
          });
          const ContentServices = require('../analyzers/contentServices');
          const result = ContentServices.recommendInternalLinks(
            content,
            existingPages
          );

          console.log('[IPC] ✅ Internal linking analysis complete:', {
            opportunities: result.opportunities.length,
            score: result.score.score,
          });
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Internal linking analysis failed:',
            error.message
          );
          throw new Error(`Internal linking analysis failed: ${error.message}`);
        }
      }
    );

    ipcMain.handle(
      'content:optimizeLength',
      async (event, content, options = {}) => {
        try {
          console.log('[IPC] 📏 Content length optimization requested:', {
            targetType: options.targetType || 'blog',
          });
          const ContentServices = require('../analyzers/contentServices');
          const result = ContentServices.optimizeContentLength(
            content,
            options
          );

          console.log('[IPC] ✅ Content length optimization complete:', {
            currentWords: result.currentLength.words,
            score: result.score,
          });
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Content length optimization failed:',
            error.message
          );
          throw new Error(
            `Content length optimization failed: ${error.message}`
          );
        }
      }
    );

    ipcMain.handle(
      'content:analyzeGaps',
      async (event, content, topics = []) => {
        try {
          console.log('[IPC] 🔍 Content gap analysis requested:', {
            topics: topics.length,
          });
          const ContentServices = require('../analyzers/contentServices');
          const result = ContentServices.analyzeContentGaps(content, topics);

          console.log('[IPC] ✅ Content gap analysis complete:', {
            gaps: result.gaps.length,
            score: result.score.score,
          });
          return result;
        } catch (error) {
          console.error('[IPC] ❌ Content gap analysis failed:', error.message);
          throw new Error(`Content gap analysis failed: ${error.message}`);
        }
      }
    );

    ipcMain.handle(
      'content:analyzeCompetitive',
      async (event, content, competitors = []) => {
        try {
          console.log('[IPC] 📊 Competitive content analysis requested:', {
            competitors: competitors.length,
          });
          const ContentServices = require('../analyzers/contentServices');
          const result = ContentServices.analyzeCompetitiveContent(
            content,
            competitors
          );

          console.log('[IPC] ✅ Competitive content analysis complete:', {
            score: result.score.score,
            insights: result.insights.length,
          });
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Competitive content analysis failed:',
            error.message
          );
          throw new Error(
            `Competitive content analysis failed: ${error.message}`
          );
        }
      }
    );
  }
}

module.exports = IPCHandlers;
