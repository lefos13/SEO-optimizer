import { ipcMain } from 'electron';
import DatabaseOperations from './dbOperations';
import dbManager from './dbManager';
import SEOAnalyzer from '../analyzers/seoAnalyzer';
import * as recommendationPersistence from '../database/recommendationPersistence';
import * as keywordSuggestions from '../analyzers/keywordSuggestions';
import * as urlFetcher from '../analyzers/urlFetcher';
import { KeywordServices } from '../analyzers/keywordServices';
import type { ClusteringOptions } from '../analyzers/keywordServices';
import ReadabilityServices from '../analyzers/readabilityServices';
import ContentServices from '../analyzers/contentServices';
export class IPCHandlers {
  /**
   * Register all IPC handlers for main process
   */
  static registerHandlers(): void {
    /* Inserted compatibility handler will be placed inside this method */

    // Accept both shapes for compatibility:
    // - saveRecommendations: (analysisId, recommendationsArray)
    // - seo:recommendations:save: (analysisId, { recommendations: [...] })
    const handleSaveRecommendations = async (
      _event: unknown,
      analysisId: number,
      payload: unknown
    ) => {
      try {
        console.log(
          '[IPC] \ud83d\udcbe Saving recommendations for analysis:',
          analysisId
        );

        // Normalize payload to an array of recommendations
        let recommendationsArray: Array<Record<string, unknown>> = [];

        try {
          if (Array.isArray(payload)) {
            recommendationsArray = payload as Array<Record<string, unknown>>;
          } else if (
            payload &&
            typeof payload === 'object' &&
            Array.isArray(
              (payload as unknown as { recommendations?: unknown })
                .recommendations
            )
          ) {
            recommendationsArray =
              (
                payload as unknown as {
                  recommendations?: Array<Record<string, unknown>>;
                }
              ).recommendations || [];
          }

          console.log(
            '[IPC] \ud83d\udcbe Incoming recommendations sample:',
            recommendationsArray.slice(0, 5)
          );
        } catch (_err) {
          // ignore logging errors
        }

        const db = await dbManager.getDb();
        const saved = await recommendationPersistence.saveRecommendations(
          db,
          analysisId,
          {
            recommendations: recommendationsArray,
          }
        );

        console.log(
          '[IPC] \u2705 Recommendations saved successfully, count saved:',
          saved
        );
        return { success: true };
      } catch (error) {
        console.error(
          '[IPC] \u274c Failed to save recommendations:',
          (error as Error).message
        );
        throw new Error(
          `Failed to save recommendations: ${(error as Error).message}`
        );
      }
    };

    // Register the normalized handler
    ipcMain.handle('seo:saveRecommendations', handleSaveRecommendations);
    ipcMain.handle('seo:recommendations:save', handleSaveRecommendations);
    // (Removed stray syntax error lines)

    ipcMain.handle('db:project:getAll', async _event => {
      try {
        console.log('[IPC] 📋 Fetching all projects...');
        const result = await DatabaseOperations.getAllProjects();
        console.log('[IPC] ✅ Projects fetched:', result.length);
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to fetch projects:',
          (error as Error).message
        );
        throw new Error(
          `Failed to fetch projects: ${(error as Error).message}`
        );
      }
    });

    ipcMain.handle(
      'db:project:update',
      async (_event, id: number, data: unknown) => {
        try {
          console.log('[IPC] 📝 Updating project:', id);
          const result = await DatabaseOperations.updateProject(
            id,
            data as Parameters<typeof DatabaseOperations.updateProject>[1]
          );
          console.log('[IPC] ✅ Project updated successfully');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to update project:',
            (error as Error).message
          );
          throw new Error(
            `Failed to update project: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle('db:project:delete', async (_event, id: number) => {
      try {
        console.log('[IPC] 🗑️ Deleting project:', id);
        const result = await DatabaseOperations.deleteProject(id);
        console.log('[IPC] ✅ Project deleted successfully');
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to delete project:',
          (error as Error).message
        );
        throw new Error(
          `Failed to delete project: ${(error as Error).message}`
        );
      }
    });

    // ============ DATABASE OPERATIONS - ANALYSES ============
    ipcMain.handle('db:analysis:create', async (_event, data: unknown) => {
      try {
        console.log('[IPC] 🔬 Creating new analysis...');
        const result = await DatabaseOperations.createAnalysis(
          data as Parameters<typeof DatabaseOperations.createAnalysis>[0]
        );
        console.log('[IPC] ✅ Analysis created successfully:', result.id);
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to create analysis:',
          (error as Error).message
        );
        throw new Error(
          `Failed to create analysis: ${(error as Error).message}`
        );
      }
    });

    ipcMain.handle('db:analysis:get', async (_event, id: number) => {
      try {
        console.log('[IPC] 🔍 Fetching analysis:', id);
        const result = await DatabaseOperations.getAnalysis(id);
        console.log('[IPC] ✅ Analysis fetched');
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to fetch analysis:',
          (error as Error).message
        );
        throw new Error(
          `Failed to fetch analysis: ${(error as Error).message}`
        );
      }
    });

    ipcMain.handle(
      'db:analysis:getByProject',
      async (_event, projectId: number) => {
        try {
          if (!projectId) {
            console.warn('[IPC] ⚠️ No project ID provided for analysis fetch');
            return [];
          }

          console.log('[IPC] 📋 Fetching analyses for project:', projectId);
          const result = await DatabaseOperations.getProjectAnalyses(projectId);
          console.log('[IPC] ✅ Analyses fetched:', result.length);
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to fetch analyses:',
            (error as Error).message
          );
          throw new Error(
            `Failed to fetch analyses: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'db:analysis:update',
      async (_event, id: number, data: unknown) => {
        try {
          console.log('[IPC] 📝 Updating analysis:', id);
          const result = await DatabaseOperations.updateAnalysis(
            id,
            data as Parameters<typeof DatabaseOperations.updateAnalysis>[1]
          );
          console.log('[IPC] ✅ Analysis updated successfully');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to update analysis:',
            (error as Error).message
          );
          throw new Error(
            `Failed to update analysis: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle('db:analysis:delete', async (_event, id: number) => {
      try {
        console.log('[IPC] 🗑️ Deleting analysis:', id);
        const result = await DatabaseOperations.deleteAnalysis(id);
        console.log('[IPC] ✅ Analysis deleted successfully');
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to delete analysis:',
          (error as Error).message
        );
        throw new Error(
          `Failed to delete analysis: ${(error as Error).message}`
        );
      }
    });

    // ============ DATABASE OPERATIONS - SEO RULES ============
    ipcMain.handle('db:rule:create', async (_event, data: unknown) => {
      try {
        console.log('[IPC] 📜 Creating new rule...');
        const result = await DatabaseOperations.createSeoRule(
          data as Parameters<typeof DatabaseOperations.createSeoRule>[0]
        );
        console.log('[IPC] ✅ Rule created successfully:', result.id);
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to create rule:',
          (error as Error).message
        );
        throw new Error(`Failed to create rule: ${(error as Error).message}`);
      }
    });

    ipcMain.handle('db:rule:get', async (_event, id: number) => {
      try {
        console.log('[IPC] 🔍 Fetching rule:', id);
        const result = await DatabaseOperations.getSeoRule(id);
        console.log('[IPC] ✅ Rule fetched');
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to fetch rule:',
          (error as Error).message
        );
        throw new Error(`Failed to fetch rule: ${(error as Error).message}`);
      }
    });

    ipcMain.handle('db:rule:getAll', async _event => {
      try {
        console.log('[IPC] 📋 Fetching all rules...');
        const result = await DatabaseOperations.getAllSeoRules();
        console.log('[IPC] ✅ Rules fetched:', result.length);
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to fetch rules:',
          (error as Error).message
        );
        throw new Error(`Failed to fetch rules: ${(error as Error).message}`);
      }
    });

    ipcMain.handle(
      'db:rule:getByCategory',
      async (_event, category: string) => {
        try {
          console.log('[IPC] 📋 Fetching rules by category:', category);
          const result = await DatabaseOperations.getRulesByCategory(category);
          console.log('[IPC] ✅ Rules fetched:', result.length);
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to fetch rules:',
            (error as Error).message
          );
          throw new Error(`Failed to fetch rules: ${(error as Error).message}`);
        }
      }
    );

    ipcMain.handle(
      'db:rule:update',
      async (_event, id: number, data: unknown) => {
        try {
          console.log('[IPC] 📝 Updating rule:', id);
          const result = await DatabaseOperations.updateSeoRule(
            id,
            data as Parameters<typeof DatabaseOperations.updateSeoRule>[1]
          );
          console.log('[IPC] ✅ Rule updated successfully');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to update rule:',
            (error as Error).message
          );
          throw new Error(`Failed to update rule: ${(error as Error).message}`);
        }
      }
    );

    ipcMain.handle('db:rule:delete', async (_event, id: number) => {
      try {
        console.log('[IPC] 🗑️ Deleting rule:', id);
        const result = await DatabaseOperations.deleteSeoRule(id);
        console.log('[IPC] ✅ Rule deleted successfully');
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to delete rule:',
          (error as Error).message
        );
        throw new Error(`Failed to delete rule: ${(error as Error).message}`);
      }
    });

    // ============ DATABASE OPERATIONS - ANALYSIS RESULTS ============
    ipcMain.handle('db:result:create', async (_event, data: unknown) => {
      try {
        console.log('[IPC] 📊 Creating analysis result...');
        const result = await DatabaseOperations.createMiniServiceResult(
          data as Parameters<
            typeof DatabaseOperations.createMiniServiceResult
          >[0]
        );
        console.log('[IPC] ✅ Result created successfully:', result.id);
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to create result:',
          (error as Error).message
        );
        throw new Error(`Failed to create result: ${(error as Error).message}`);
      }
    });

    ipcMain.handle('db:result:get', async (_event, id: number) => {
      try {
        console.log('[IPC] 🔍 Fetching result:', id);
        const result = await DatabaseOperations.getMiniServiceResult(id);
        console.log('[IPC] ✅ Result fetched');
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to fetch result:',
          (error as Error).message
        );
        throw new Error(`Failed to fetch result: ${(error as Error).message}`);
      }
    });

    ipcMain.handle(
      'db:result:getByAnalysis',
      async (_event, analysisId: number) => {
        try {
          console.log('[IPC] 📋 Fetching results for analysis:', analysisId);
          const result =
            await DatabaseOperations.getAnalysisResults(analysisId);
          console.log('[IPC] ✅ Results fetched:', result.length);
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to fetch results:',
            (error as Error).message
          );
          throw new Error(
            `Failed to fetch results: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'db:result:update',
      async (_event, id: number, data: unknown) => {
        try {
          console.log('[IPC] 📝 Updating result:', id);
          const result = await DatabaseOperations.updateMiniServiceResult(
            id,
            data as Parameters<
              typeof DatabaseOperations.updateMiniServiceResult
            >[1]
          );
          console.log('[IPC] ✅ Result updated successfully');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to update result:',
            (error as Error).message
          );
          throw new Error(
            `Failed to update result: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle('db:result:delete', async (_event, id: number) => {
      try {
        console.log('[IPC] 🗑️ Deleting result:', id);
        const result = await DatabaseOperations.deleteMiniServiceResult(id);
        console.log('[IPC] ✅ Result deleted successfully');
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to delete result:',
          (error as Error).message
        );
        throw new Error(`Failed to delete result: ${(error as Error).message}`);
      }
    });

    ipcMain.handle(
      'db:result:deleteByAnalysis',
      async (_event, analysisId: number) => {
        try {
          console.log('[IPC] 🗑️ Deleting results for analysis:', analysisId);
          const result =
            await DatabaseOperations.deleteAnalysisResults(analysisId);
          console.log('[IPC] ✅ Results deleted successfully');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to delete results:',
            (error as Error).message
          );
          throw new Error(
            `Failed to delete results: ${(error as Error).message}`
          );
        }
      }
    );

    // ============ DATABASE STATISTICS ============
    ipcMain.handle('db:stats', async _event => {
      try {
        console.log('[IPC] 📊 Fetching database statistics...');
        const result = await dbManager.getStats();
        console.log('[IPC] ✅ Statistics fetched');
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to fetch statistics:',
          (error as Error).message
        );
        throw new Error(
          `Failed to fetch statistics: ${(error as Error).message}`
        );
      }
    });

    // ============ SEO ANALYZER ============
    ipcMain.handle(
      'seo:analyze',
      async (
        _event,
        content: string,
        keywords: string[],
        options?: unknown
      ) => {
        try {
          console.log('[IPC] 🔍 SEO analysis requested:', {
            contentLength: content?.length || 0,
            keywordCount: keywords?.length || 0,
          });

          const analyzer = new SEOAnalyzer();
          const result = await analyzer.analyze({
            html: content,
            keywords: keywords.join(', '),
            language: ((options as { language?: string })?.language || 'en') as
              | 'en'
              | 'el',
          });

          console.log('[IPC] ✅ SEO analysis complete:', {
            score: result.score,
            issuesFound: result.issues.length,
          });
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ SEO analysis failed:',
            (error as Error).message
          );
          throw new Error(`SEO analysis failed: ${(error as Error).message}`);
        }
      }
    );

    // ============ SEO RECOMMENDATIONS ============
    ipcMain.handle(
      'seo:recommendations:get',
      async (_event, analysisId: number) => {
        try {
          console.log(
            '[IPC] 📋 Fetching recommendations for analysis:',
            analysisId
          );
          const db = await dbManager.getDb();
          const recommendations =
            await recommendationPersistence.getRecommendations(db, analysisId);

          console.log(
            '[IPC] ✅ Recommendations fetched:',
            recommendations.length
          );
          try {
            console.log(
              '[IPC] ✅ Sample fetched recs:',
              recommendations
                .slice(0, 5)
                .map(r => ({ id: r.id, title: r.title }))
            );
          } catch (_err) {
            // ignore logging errors
          }
          return recommendations;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to fetch recommendations:',
            (error as Error).message
          );
          throw new Error(
            `Failed to fetch recommendations: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'seo:recommendations:updateStatus',
      async (_event, recommendationId: number, status: string) => {
        try {
          console.log('[IPC] 🔄 Updating recommendation status:', {
            id: recommendationId,
            status,
          });
          const db = await dbManager.getDb();
          await recommendationPersistence.updateRecommendationStatus(
            db,
            recommendationId,
            status
          );

          console.log('[IPC] ✅ Recommendation status updated');
          return { success: true };
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to update recommendation status:',
            (error as Error).message
          );
          throw new Error(
            `Failed to update recommendation status: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'seo:recommendations:quickWins',
      async (_event, analysisId: number, maxItems: number = 5) => {
        try {
          console.log('[IPC] ⚡ Fetching quick wins for analysis:', analysisId);
          const db = await dbManager.getDb();
          const quickWins = await recommendationPersistence.getQuickWins(
            db,
            analysisId,
            maxItems
          );

          console.log('[IPC] ✅ Quick wins fetched:', quickWins.length);
          return quickWins;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to fetch quick wins:',
            (error as Error).message
          );
          throw new Error(
            `Failed to fetch quick wins: ${(error as Error).message}`
          );
        }
      }
    );

    // ============ SEO KEYWORD DENSITY ============
    ipcMain.handle(
      'seo:calculateDensity',
      async (_event, htmlContent: string, keyword: string) => {
        try {
          console.log('[IPC] 📊 Calculating keyword density for:', keyword);
          const analysis = KeywordServices.analyzeKeywordDensity(htmlContent, [
            keyword,
          ]);
          const density = analysis.densityResults[0]?.density || 0;

          console.log('[IPC] ✅ Keyword density calculated:', density);
          return density;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to calculate keyword density:',
            (error as Error).message
          );
          throw new Error(
            `Failed to calculate keyword density: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'seo:calculateDensities',
      async (_event, htmlContent: string, keywords: string[]) => {
        try {
          console.log(
            '[IPC] 📊 Calculating densities for',
            keywords.length,
            'keywords'
          );
          const analysis = KeywordServices.analyzeKeywordDensity(
            htmlContent,
            keywords
          );
          const densities = analysis.densityResults.map(
            result => result.density
          );

          console.log('[IPC] ✅ Keyword densities calculated');
          return densities;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to calculate keyword densities:',
            (error as Error).message
          );
          throw new Error(
            `Failed to calculate keyword densities: ${(error as Error).message}`
          );
        }
      }
    );

    // ============ SEO KEYWORD SUGGESTIONS ============
    ipcMain.handle(
      'seo:suggestKeywords',
      async (
        _event,
        content: string,
        options?: { maxSuggestions?: number } | number
      ) => {
        try {
          console.log('[IPC] 🎯 Generating keyword suggestions...');
          const maxSuggestions =
            typeof options === 'number'
              ? options
              : options &&
                  typeof options === 'object' &&
                  'maxSuggestions' in options
                ? (options as { maxSuggestions: number }).maxSuggestions
                : 10;
          const suggestions = keywordSuggestions.suggestKeywords(
            content,
            maxSuggestions
          );

          console.log(
            '[IPC] ✅ Keyword suggestions generated:',
            suggestions.length
          );
          return suggestions;
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to generate keyword suggestions:',
            (error as Error).message
          );
          throw new Error(
            `Failed to generate keyword suggestions: ${(error as Error).message}`
          );
        }
      }
    );

    // (save handler normalized and registered earlier)

    // ============ SEO URL FETCHER ============
    ipcMain.handle('seo:fetchUrl', async (_event, url: string) => {
      try {
        if (!urlFetcher.isValidUrl(url)) {
          throw new Error('Invalid URL provided');
        }

        console.log('[IPC] 🔗 Fetching URL:', url);
        const result = await urlFetcher.fetchUrl(url);

        console.log('[IPC] ✅ URL fetched successfully:', {
          contentLength: result.html?.length || 0,
          hasTitle: !!result.title,
        });
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to fetch URL:',
          (error as Error).message
        );
        throw new Error(`Failed to fetch URL: ${(error as Error).message}`);
      }
    });

    // ============ KEYWORD SERVICES ============
    ipcMain.handle(
      'keyword:analyzeDensity',
      async (_event, content: string, keywords: string[]) => {
        try {
          console.log('[IPC] 📊 Analyzing keyword density:', {
            contentLength: content?.length || 0,
            keywordCount: keywords?.length || 0,
          });
          const result = KeywordServices.analyzeKeywordDensity(
            content,
            keywords
          );

          console.log('[IPC] ✅ Keyword density analysis complete');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Keyword density analysis failed:',
            (error as Error).message
          );
          throw new Error(
            `Keyword density analysis failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'keyword:generateLongTail',
      async (
        _event,
        content: string,
        seedKeywords: string[] = [],
        maxSuggestions: number = 10
      ) => {
        try {
          console.log('[IPC] 🎯 Generating long-tail keywords:', {
            contentLength: content?.length || 0,
            seedCount: seedKeywords?.length || 0,
            maxSuggestions,
          });
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
          console.error(
            '[IPC] ❌ Long-tail generation failed:',
            (error as Error).message
          );
          throw new Error(
            `Long-tail generation failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'keyword:estimateDifficulty',
      async (_event, keywords: string[]) => {
        try {
          console.log('[IPC] 📊 Estimating keyword difficulty:', {
            keywordCount: keywords?.length || 0,
          });
          const result = KeywordServices.estimateKeywordDifficulty(keywords);

          console.log('[IPC] ✅ Keyword difficulty estimated');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Difficulty estimation failed:',
            (error as Error).message
          );
          throw new Error(
            `Difficulty estimation failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'keyword:cluster',
      async (_event, keywords: string[], options?: ClusteringOptions) => {
        try {
          console.log('[IPC] 🔍 Clustering keywords:', {
            keywordCount: keywords?.length || 0,
          });
          const result = KeywordServices.clusterKeywords(
            keywords,
            '',
            options || {}
          );

          console.log('[IPC] ✅ Keywords clustered:', {
            clusterCount: result.clusters?.length || 0,
          });
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Keyword clustering failed:',
            (error as Error).message
          );
          throw new Error(
            `Keyword clustering failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'keyword:generateLSI',
      async (
        _event,
        content: string,
        mainKeywords: string[],
        maxSuggestions: number = 10
      ) => {
        try {
          console.log('[IPC] 📝 Generating LSI keywords:', {
            contentLength: content?.length || 0,
            mainKeywordsCount: mainKeywords?.length || 0,
            maxSuggestions,
          });
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
          console.error(
            '[IPC] ❌ LSI generation failed:',
            (error as Error).message
          );
          throw new Error(`LSI generation failed: ${(error as Error).message}`);
        }
      }
    );

    // ============ READABILITY SERVICES (MINI-SERVICES) ============
    ipcMain.handle(
      'readability:analyze',
      async (_event, content: string, options: { language?: string } = {}) => {
        try {
          console.log('[IPC] 📖 Readability analysis requested:', {
            contentLength: content?.length || 0,
            language: (options as { language?: string })?.language || 'en',
          });
          const result = ReadabilityServices.analyze(content, options);

          console.log('[IPC] ✅ Readability analysis complete:', {
            score: result?.compositeScore?.score,
            warnings: result?.meta?.warnings?.length || 0,
          });
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Readability analysis failed:',
            (error as Error).message
          );
          throw new Error(
            `Readability analysis failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'readability:analyzeOverview',
      async (_event, content: string, options: { language?: string } = {}) => {
        try {
          console.log('[IPC] 📊 Readability overview analysis requested');
          const result = ReadabilityServices.analyzeOverview(content, options);

          console.log('[IPC] ✅ Overview analysis complete');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Overview analysis failed:',
            (error as Error).message
          );
          throw new Error(
            `Overview analysis failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'readability:analyzeStructure',
      async (_event, content: string, options: { language?: string } = {}) => {
        try {
          console.log('[IPC] 🧱 Readability structure analysis requested');
          const result = ReadabilityServices.analyzeStructure(content, options);

          console.log('[IPC] ✅ Structure analysis complete');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Structure analysis failed:',
            (error as Error).message
          );
          throw new Error(
            `Structure analysis failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'readability:analyzeReadingLevels',
      async (_event, content: string, options: { language?: string } = {}) => {
        try {
          console.log('[IPC] 🎓 Reading levels analysis requested');
          const result = ReadabilityServices.analyzeReadingLevels(
            content,
            options
          );

          console.log('[IPC] ✅ Reading levels analysis complete');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Reading levels analysis failed:',
            (error as Error).message
          );
          throw new Error(
            `Reading levels analysis failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'readability:analyzeImprovements',
      async (_event, content: string, options: { language?: string } = {}) => {
        try {
          console.log('[IPC] 💡 Improvements analysis requested');
          const result = ReadabilityServices.analyzeImprovements(
            content,
            options
          );

          console.log('[IPC] ✅ Improvements analysis complete');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Improvements analysis failed:',
            (error as Error).message
          );
          throw new Error(
            `Improvements analysis failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'readability:analyzeLanguageGuidance',
      async (_event, content: string, options: { language?: string } = {}) => {
        try {
          console.log('[IPC] 🌐 Language guidance analysis requested');
          const result = ReadabilityServices.analyzeLanguageGuidance(
            content,
            options
          );

          console.log('[IPC] ✅ Language guidance analysis complete');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Language guidance analysis failed:',
            (error as Error).message
          );
          throw new Error(
            `Language guidance analysis failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'readability:analyzeLiveScore',
      async (_event, content: string, options: { language?: string } = {}) => {
        try {
          console.log('[IPC] ⚡ Live score analysis requested');
          const result = ReadabilityServices.analyzeLiveScore(content, options);

          console.log('[IPC] ✅ Live score analysis complete');
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Live score analysis failed:',
            (error as Error).message
          );
          throw new Error(
            `Live score analysis failed: ${(error as Error).message}`
          );
        }
      }
    );

    // ============ CONTENT OPTIMIZATION SERVICES ============

    ipcMain.handle(
      'content:analyzeStructure',
      async (
        _event,
        content: string,
        options: Record<string, unknown> = {}
      ) => {
        try {
          console.log('[IPC] 🏗️ Content structure analysis requested');
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
            (error as Error).message
          );
          throw new Error(
            `Content structure analysis failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'content:optimizeHeadings',
      async (_event, content: string, keywords: string[] = []) => {
        try {
          console.log('[IPC] 📋 Heading optimization requested:', {
            keywordCount: keywords.length,
          });
          const result = ContentServices.optimizeHeadings(content, keywords);

          console.log('[IPC] ✅ Heading optimization complete:', {
            score: result.score.score,
            suggestions: result.suggestions.length,
          });
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Heading optimization failed:',
            (error as Error).message
          );
          throw new Error(
            `Heading optimization failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'content:recommendInternalLinks',
      async (
        _event,
        content: string,
        existingPages: Array<{
          title: string;
          url: string;
          keywords?: string[];
        }> = []
      ) => {
        try {
          console.log('[IPC] 🔗 Internal linking analysis requested:', {
            existingPages: existingPages.length,
          });
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
            (error as Error).message
          );
          throw new Error(
            `Internal linking analysis failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'content:optimizeLength',
      async (
        _event,
        content: string,
        options: { targetType?: string } = {}
      ) => {
        try {
          console.log('[IPC] 📏 Content length optimization requested:', {
            targetType:
              (options as { targetType?: string })?.targetType || 'blog',
          });
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
            (error as Error).message
          );
          throw new Error(
            `Content length optimization failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'content:analyzeGaps',
      async (_event, content: string, topics: string[] = []) => {
        try {
          console.log('[IPC] 🔍 Content gap analysis requested:', {
            topics: topics.length,
          });
          const result = ContentServices.analyzeContentGaps(content, topics);

          console.log('[IPC] ✅ Content gap analysis complete:', {
            gaps: result.gaps.length,
            score: result.score.score,
          });
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Content gap analysis failed:',
            (error as Error).message
          );
          throw new Error(
            `Content gap analysis failed: ${(error as Error).message}`
          );
        }
      }
    );

    ipcMain.handle(
      'content:analyzeCompetitive',
      async (
        _event,
        content: string,
        competitors: Array<{
          title: string;
          content: string;
          url?: string;
        }> = []
      ) => {
        try {
          console.log('[IPC] 📊 Competitive content analysis requested:', {
            competitors: competitors.length,
          });
          const normalizedCompetitors = competitors.map(c => ({
            title: c.title,
            content: c.content,
            url: c.url || '',
          }));

          const result = ContentServices.analyzeCompetitiveContent(
            content,
            normalizedCompetitors
          );

          console.log('[IPC] ✅ Competitive content analysis complete:', {
            score: result.score.score,
            insights: result.insights.length,
          });
          return result;
        } catch (error) {
          console.error(
            '[IPC] ❌ Competitive content analysis failed:',
            (error as Error).message
          );
          throw new Error(
            `Competitive content analysis failed: ${(error as Error).message}`
          );
        }
      }
    );
  }
}

/**
 * Export convenience function for main.ts
 */
export function registerHandlers(): void {
  IPCHandlers.registerHandlers();
}
