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
        // eslint-disable-next-line no-console
        console.log('[IPC] db:analysis:create called with data:', {
          project_id: analysisData.project_id,
          language: analysisData.language,
          title: analysisData.title,
          contentLength: analysisData.content?.length,
          keywordsCount: analysisData.keywords?.split(',').length,
        });
        const result = DatabaseOperations.createAnalysis(analysisData);
        // eslint-disable-next-line no-console
        console.log('[IPC] ✅ Analysis created:', {
          id: result.id,
          project_id: result.project_id,
        });
        return result;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[IPC] ❌ Create analysis failed:', error.message);
        throw new Error(`Create analysis failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:analysis:get', (event, analysisId) => {
      try {
        // eslint-disable-next-line no-console
        console.log('[IPC] db:analysis:get called with ID:', analysisId);
        const result = DatabaseOperations.getAnalysis(analysisId);
        // eslint-disable-next-line no-console
        console.log('[IPC] ✅ Analysis retrieved:', { id: result?.id });
        return result;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[IPC] ❌ Get analysis failed:', error.message);
        throw new Error(`Get analysis failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:analysis:getByProject', (event, projectId, options) => {
      try {
        // Validate projectId
        if (!projectId) {
          // eslint-disable-next-line no-console
          console.warn(
            '[IPC] ⚠️ db:analysis:getByProject called with invalid projectId:',
            projectId
          );
          throw new Error('Project ID is required');
        }

        // eslint-disable-next-line no-console
        console.log('[IPC] db:analysis:getByProject called:', {
          projectId,
          options,
        });
        const result = DatabaseOperations.getProjectAnalyses(
          projectId,
          options
        );
        // eslint-disable-next-line no-console
        console.log('[IPC] ✅ Project analyses retrieved:', {
          count: result?.length || 0,
        });
        return result;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[IPC] ❌ Get project analyses failed:', error.message);
        throw new Error(`Get project analyses failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:analysis:update', (event, analysisId, updates) => {
      try {
        // eslint-disable-next-line no-console
        console.log('[IPC] db:analysis:update called:', {
          analysisId,
          updateKeys: Object.keys(updates),
        });
        const result = DatabaseOperations.updateAnalysis(analysisId, updates);
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.log('[IPC] seo:analyze called with content:', {
          htmlLength: content.html?.length,
          keywords: content.keywords,
          language: content.language,
          url: content.url,
        });
        const SEOAnalyzer = require('../analyzers/seoAnalyzer');
        const analyzer = new SEOAnalyzer(content.language || 'en');
        // eslint-disable-next-line no-console
        console.log('[IPC] SEOAnalyzer instance created, running analysis...');
        const results = await analyzer.analyze(content);
        // eslint-disable-next-line no-console
        console.log('[IPC] ✅ SEO analysis complete, returning results:', {
          score: results.score,
          percentage: results.percentage,
          grade: results.grade,
          issuesCount: results.issues?.length || 0,
        });
        return results;
      } catch (error) {
        // eslint-disable-next-line no-console
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
        const SEOAnalyzer = require('../analyzers/seoAnalyzer');
        const analyzer = new SEOAnalyzer();
        return analyzer.calculateAllKeywordDensities(text, keywords);
      } catch (error) {
        throw new Error(`Calculate densities failed: ${error.message}`);
      }
    });

    ipcMain.handle(
      'seo:recommendations:save',
      (event, analysisId, enhancedRecommendations) => {
        try {
          // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
          console.log('[IPC] ✅ Recommendations saved successfully');
          return result;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[IPC] ❌ Save recommendations failed:', error.message);
          throw new Error(`Save recommendations failed: ${error.message}`);
        }
      }
    );

    // ============ URL FETCHER ============
    ipcMain.handle('seo:fetchUrl', async (event, url, options = {}) => {
      try {
        // eslint-disable-next-line no-console
        console.log('[IPC] 🔗 Fetching URL:', url);
        const urlFetcher = require('../analyzers/urlFetcher');

        // Validate URL first
        if (!urlFetcher.isValidUrl(url)) {
          throw new Error('Invalid URL format. Please use HTTP or HTTPS.');
        }

        // Fetch the URL
        const result = await urlFetcher.fetchUrl(url, options);

        if (!result.success) {
          // eslint-disable-next-line no-console
          console.error('[IPC] ❌ URL fetch failed:', result.error);
          throw new Error(result.error || 'Failed to fetch URL');
        }

        // eslint-disable-next-line no-console
        console.log('[IPC] ✅ URL fetched successfully:', {
          finalUrl: result.finalUrl,
          title: result.title,
          htmlLength: result.html?.length || 0,
        });

        return result;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[IPC] ❌ Fetch URL failed:', error.message);
        throw new Error(`Fetch URL failed: ${error.message}`);
      }
    });
  }
}

module.exports = IPCHandlers;
