import { ipcMain, BrowserWindow } from 'electron';
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
import {
  healthMonitor,
  recordSaveMetrics,
  recordFetchMetrics,
} from './healthMonitor';
export class IPCHandlers {
  /**
   * Register all IPC handlers for main process
   */
  static registerHandlers(): void {
    /* Inserted compatibility handler will be placed inside this method */

    // ============ SEO RECOMMENDATIONS SAVE HANDLER ============
    // Consolidated handler for saving recommendations with proper error handling
    const handleSaveRecommendations = async (
      _event: unknown,
      analysisId: number,
      payload: unknown
    ) => {
      const correlationId = `save-${analysisId}-${Date.now()}`;

      try {
        console.log(
          `[IPC:${correlationId}] 💾 Starting enhanced save process for recommendations, analysis:`,
          analysisId
        );

        // Input validation with detailed error messages
        if (!analysisId || typeof analysisId !== 'number' || analysisId <= 0) {
          throw new Error(
            `Invalid analysis ID: ${analysisId}. Must be a positive number.`
          );
        }

        // Normalize payload to an array of recommendations with enhanced validation
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
          } else {
            throw new Error(
              'Invalid payload format: expected array or object with recommendations array'
            );
          }

          // Validate recommendations array structure
          if (!Array.isArray(recommendationsArray)) {
            throw new Error('Recommendations must be an array');
          }

          if (recommendationsArray.length === 0) {
            console.log(`[IPC:${correlationId}] ⚠️ No recommendations to save`);
            return {
              success: true,
              savedCount: 0,
              analysisId,
              correlationId,
              message: 'No recommendations to save',
            };
          }

          // Validate each recommendation has required fields
          recommendationsArray.forEach((rec, index) => {
            if (!rec || typeof rec !== 'object') {
              throw new Error(
                `Recommendation at index ${index} is not a valid object`
              );
            }
            if (!rec.title && !rec.id) {
              throw new Error(
                `Recommendation at index ${index} missing required title or id`
              );
            }
          });

          console.log(`[IPC:${correlationId}] 📊 Processing recommendations:`, {
            count: recommendationsArray.length,
            sample: recommendationsArray.slice(0, 3).map(r => ({
              id: r.id,
              title: r.title,
              priority: r.priority,
            })),
          });
        } catch (err) {
          console.error(
            `[IPC:${correlationId}] ❌ Error processing payload:`,
            (err as Error).message
          );
          throw err;
        }

        // Validate database connection with enhanced error handling
        let db;
        try {
          db = dbManager.getDb();
          if (!db) {
            throw new Error('Database connection is not available');
          }

          // Test database connectivity
          db.exec('SELECT 1');
          console.log(
            `[IPC:${correlationId}] ✅ Database connection validated`
          );
        } catch (dbError) {
          console.error(
            `[IPC:${correlationId}] ❌ Database connection failed:`,
            (dbError as Error).message
          );
          throw new Error(
            `Database connection failed: ${(dbError as Error).message}`
          );
        }

        // Save recommendations with enhanced transaction management and health monitoring
        let saved: number;
        const saveStartTime = Date.now();
        try {
          saved = recommendationPersistence.saveRecommendations(
            db,
            analysisId,
            {
              recommendations: recommendationsArray,
            },
            dbManager // Pass database manager for transaction management
          );

          // Record successful save metrics
          recordSaveMetrics(
            Date.now() - saveStartTime,
            true,
            analysisId,
            saved
          );
        } catch (saveError) {
          // Record failed save metrics
          recordSaveMetrics(
            Date.now() - saveStartTime,
            false,
            analysisId,
            0,
            (saveError as Error).message
          );

          console.error(
            `[IPC:${correlationId}] ❌ Save operation failed:`,
            (saveError as Error).message
          );
          throw new Error(
            `Save operation failed: ${(saveError as Error).message}`
          );
        }

        console.log(
          `[IPC:${correlationId}] ✅ Recommendations saved successfully with transaction management:`,
          {
            analysisId,
            savedCount: saved,
            expectedCount: recommendationsArray.length,
          }
        );

        // Enhanced verification with detailed logging
        try {
          const verifyResult = db.exec(
            'SELECT COUNT(*) as count FROM recommendations WHERE analysis_id = ?',
            [analysisId]
          );
          const actualCount =
            verifyResult.length > 0 && verifyResult[0]?.values?.[0]?.[0]
              ? (verifyResult[0].values[0][0] as number)
              : 0;

          console.log(
            `[IPC:${correlationId}] 🔍 Final verification - recommendations in DB:`,
            {
              analysisId,
              actualCount,
              expectedCount: saved,
              verified: actualCount === saved,
            }
          );

          if (actualCount !== saved) {
            console.warn(
              `[IPC:${correlationId}] ⚠️ Count mismatch detected in final verification`
            );
          }
        } catch (verifyError) {
          console.error(
            `[IPC:${correlationId}] ⚠️ Final verification failed:`,
            (verifyError as Error).message
          );
          // Don't throw here as the save operation was successful
        }

        return {
          success: true,
          savedCount: saved,
          analysisId,
          correlationId,
          message: `Successfully saved ${saved} recommendations with transaction management`,
        };
      } catch (error) {
        const errorMessage = `Failed to save recommendations for analysis ${analysisId}: ${(error as Error).message}`;
        console.error(`[IPC:${correlationId}] ❌`, errorMessage);

        // Return structured error response with correlation ID
        return {
          success: false,
          error: errorMessage,
          analysisId,
          correlationId,
          savedCount: 0,
        };
      }
    };

    // Register consolidated handler with conflict detection
    try {
      // Check if handlers are already registered to prevent conflicts
      const existingHandlers = ipcMain.eventNames();
      const saveHandlerNames = [
        'seo:saveRecommendations',
        'seo:recommendations:save',
      ];

      saveHandlerNames.forEach(handlerName => {
        if (existingHandlers.includes(handlerName)) {
          console.warn(
            `[IPC] ⚠️ Handler ${handlerName} already registered, removing existing handler`
          );
          ipcMain.removeAllListeners(handlerName);
        }
      });

      // Register the consolidated handler for both legacy and new formats
      ipcMain.handle('seo:saveRecommendations', handleSaveRecommendations);
      ipcMain.handle('seo:recommendations:save', handleSaveRecommendations);

      console.log(
        '[IPC] ✅ Consolidated recommendation save handlers registered successfully'
      );
    } catch (handlerError) {
      console.error(
        '[IPC] ❌ Failed to register recommendation save handlers:',
        (handlerError as Error).message
      );
      throw new Error(
        `Handler registration failed: ${(handlerError as Error).message}`
      );
    }

    ipcMain.handle('db:project:create', async (_event, data: unknown) => {
      try {
        console.log('[IPC] 🆕 Creating new project...');
        const result = DatabaseOperations.createProject(
          data as Parameters<typeof DatabaseOperations.createProject>[0]
        );
        console.log('[IPC] ✅ Project created successfully:', result.id);
        return result;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to create project:',
          (error as Error).message
        );
        throw new Error(
          `Failed to create project: ${(error as Error).message}`
        );
      }
    });

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
    ipcMain.handle('seo:analyze', async (_event, analysisData: unknown) => {
      try {
        const data = analysisData as {
          html?: string;
          keywords?: string;
          language?: string;
        };

        console.log('[IPC] 🔍 SEO analysis requested:', {
          contentLength: data.html?.length || 0,
          keywords: data.keywords || '',
        });

        const analyzer = new SEOAnalyzer();
        const result = await analyzer.analyze({
          html: data.html || '',
          keywords: data.keywords || '',
          language: (data.language || 'en') as 'en' | 'el',
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
    });

    // ============ SEO RECOMMENDATIONS ============
    ipcMain.handle(
      'seo:recommendations:get',
      async (_event, analysisId: number) => {
        const correlationId = `fetch-${analysisId}-${Date.now()}`;
        const operationTimeout = 30000; // 30 second timeout
        const maxRetries = 3;
        let retryCount = 0;

        // Timeout wrapper for the entire operation
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(`Operation timed out after ${operationTimeout}ms`)
            );
          }, operationTimeout);
        });

        // Main operation with retry logic
        const fetchOperation = async (): Promise<{
          success: boolean;
          recommendations: any[];
          metadata: {
            analysisId: number;
            totalCount: number;
            correlationId: string;
            fetchTimestamp: string;
            attempt: number;
            fetchTime: number;
            performance: {
              fetchTimeMs: number;
              rating: string;
            };
          };
        }> => {
          while (retryCount < maxRetries) {
            try {
              console.log(
                `[IPC:${correlationId}] 📋 Enhanced fetch attempt ${retryCount + 1}/${maxRetries} for analysis:`,
                analysisId
              );

              // Enhanced input validation with detailed error messages
              if (analysisId === null || analysisId === undefined) {
                throw new Error('Analysis ID is null or undefined');
              }

              if (typeof analysisId !== 'number') {
                throw new Error(
                  `Invalid analysis ID type: expected number, got ${typeof analysisId}`
                );
              }

              if (!Number.isInteger(analysisId)) {
                throw new Error(
                  `Analysis ID must be an integer, got: ${analysisId}`
                );
              }

              if (analysisId <= 0) {
                throw new Error(
                  `Analysis ID must be positive, got: ${analysisId}`
                );
              }

              // Enhanced database connection validation with retry logic
              let db;
              try {
                db = dbManager.getDb();
                if (!db) {
                  throw new Error(
                    'Database manager returned null/undefined connection'
                  );
                }

                // Enhanced connectivity test with timeout
                const connectivityStart = Date.now();
                const connectivityTest = db.exec(
                  'SELECT 1 as connectivity_test, datetime("now") as current_time'
                );
                const connectivityTime = Date.now() - connectivityStart;

                if (connectivityTime > 5000) {
                  console.warn(
                    `[IPC:${correlationId}] ⚠️ Slow database connectivity: ${connectivityTime}ms`
                  );
                }

                console.log(
                  `[IPC:${correlationId}] ✅ Enhanced database connection validated (${connectivityTime}ms):`,
                  {
                    hasResult: connectivityTest.length > 0,
                    testValue: connectivityTest[0]?.values?.[0]?.[0],
                    timestamp: connectivityTest[0]?.values?.[0]?.[1],
                    responseTime: connectivityTime,
                  }
                );
              } catch (dbError) {
                const dbErrorMsg = `Database connection failed on attempt ${retryCount + 1}: ${(dbError as Error).message}`;
                console.error(`[IPC:${correlationId}] ❌ ${dbErrorMsg}`, {
                  attempt: retryCount + 1,
                  maxRetries,
                  errorType: (dbError as Error).constructor.name,
                  willRetry: retryCount < maxRetries - 1,
                });

                if (retryCount < maxRetries - 1) {
                  retryCount++;
                  const retryDelay = Math.min(
                    1000 * Math.pow(2, retryCount),
                    5000
                  ); // Exponential backoff, max 5s
                  console.log(
                    `[IPC:${correlationId}] 🔄 Retrying in ${retryDelay}ms...`
                  );
                  await new Promise(resolve => setTimeout(resolve, retryDelay));
                  continue;
                }

                throw new Error(dbErrorMsg);
              }

              // Enhanced database state validation with comprehensive diagnostics
              try {
                const diagnosticsStart = Date.now();

                // Check if analysis exists with enhanced validation
                const analysisCheck = db.exec(
                  'SELECT id, title, created_at, status FROM analyses WHERE id = ? LIMIT 1',
                  [analysisId]
                );

                if (
                  !analysisCheck ||
                  analysisCheck.length === 0 ||
                  !analysisCheck[0] ||
                  analysisCheck[0].values.length === 0
                ) {
                  console.warn(
                    `[IPC:${correlationId}] ⚠️ Analysis ${analysisId} not found - running fallback diagnostics`
                  );

                  // Fallback: Get recent analyses for context
                  const recentAnalyses = db.exec(
                    'SELECT id, title, created_at FROM analyses ORDER BY created_at DESC LIMIT 10'
                  );
                  const recentIds =
                    recentAnalyses.length > 0 && recentAnalyses[0]
                      ? recentAnalyses[0].values.map(row => ({
                          id: row[0],
                          title: row[1],
                          created_at: row[2],
                        }))
                      : [];

                  console.log(
                    `[IPC:${correlationId}] 📋 Recent analyses for context:`,
                    recentIds
                  );
                } else {
                  const analysis = analysisCheck[0].values[0];
                  if (analysis) {
                    console.log(
                      `[IPC:${correlationId}] ✅ Analysis validation passed:`,
                      {
                        id: analysis[0],
                        title: analysis[1],
                        created_at: analysis[2],
                        status: analysis[3] || 'unknown',
                      }
                    );
                  }
                }

                // Enhanced recommendations diagnostics with performance monitoring
                const diagnosticsQueries = [
                  {
                    name: 'total_recommendations',
                    query: 'SELECT COUNT(*) as total FROM recommendations',
                    params: [],
                  },
                  {
                    name: 'recommendations_by_analysis',
                    query:
                      'SELECT analysis_id, COUNT(*) as count FROM recommendations GROUP BY analysis_id ORDER BY count DESC LIMIT 10',
                    params: [],
                  },
                  {
                    name: 'specific_analysis_count',
                    query:
                      'SELECT COUNT(*) as count FROM recommendations WHERE analysis_id = ?',
                    params: [analysisId],
                  },
                  {
                    name: 'sample_recommendations',
                    query:
                      'SELECT id, rec_id, title, priority, status, created_at FROM recommendations WHERE analysis_id = ? ORDER BY priority DESC, score_increase DESC LIMIT 5',
                    params: [analysisId],
                  },
                ];

                const diagnosticsResults: Record<
                  string,
                  {
                    success: boolean;
                    queryTime?: number;
                    result?: {
                      columns: string[];
                      rowCount: number;
                      data: any[][];
                    } | null;
                    error?: string;
                    errorType?: string;
                  }
                > = {};

                for (const diagnostic of diagnosticsQueries) {
                  try {
                    const queryStart = Date.now();
                    const result = db.exec(diagnostic.query, diagnostic.params);
                    const queryTime = Date.now() - queryStart;

                    diagnosticsResults[diagnostic.name] = {
                      success: true,
                      queryTime,
                      result:
                        result.length > 0 && result[0]
                          ? {
                              columns: result[0].columns,
                              rowCount: result[0].values.length,
                              data: result[0].values,
                            }
                          : null,
                    };

                    if (queryTime > 1000) {
                      console.warn(
                        `[IPC:${correlationId}] ⚠️ Slow diagnostic query '${diagnostic.name}': ${queryTime}ms`
                      );
                    }
                  } catch (queryError) {
                    diagnosticsResults[diagnostic.name] = {
                      success: false,
                      error: (queryError as Error).message,
                      errorType: (queryError as Error).constructor.name,
                    };
                  }
                }

                const diagnosticsTime = Date.now() - diagnosticsStart;
                console.log(
                  `[IPC:${correlationId}] 🔍 Enhanced diagnostics completed (${diagnosticsTime}ms):`,
                  {
                    totalTime: diagnosticsTime,
                    results: {
                      totalRecommendations:
                        diagnosticsResults.total_recommendations?.result
                          ?.data?.[0]?.[0] || 0,
                      analysisBreakdown:
                        diagnosticsResults.recommendations_by_analysis?.result?.data?.map(
                          (row: (string | number)[]) => ({
                            analysisId: row[0],
                            count: row[1],
                          })
                        ) || [],
                      specificCount:
                        diagnosticsResults.specific_analysis_count?.result
                          ?.data?.[0]?.[0] || 0,
                      sampleRecommendations:
                        diagnosticsResults.sample_recommendations?.result?.data?.map(
                          (row: (string | number)[]) => ({
                            id: row[0],
                            rec_id: row[1],
                            title: row[2],
                            priority: row[3],
                            status: row[4],
                            created_at: row[5],
                          })
                        ) || [],
                    },
                    queryPerformance: Object.entries(diagnosticsResults).map(
                      ([name, result]) => ({
                        query: name,
                        success: result.success,
                        time: result.queryTime || 0,
                        error: result.error || null,
                      })
                    ),
                  }
                );
              } catch (diagnosticsError) {
                console.error(
                  `[IPC:${correlationId}] ❌ Enhanced diagnostics failed:`,
                  {
                    error: (diagnosticsError as Error).message,
                    errorType: (diagnosticsError as Error).constructor.name,
                    attempt: retryCount + 1,
                  }
                );
                // Continue with main operation even if diagnostics fail
              }

              // Enhanced fetch operation with timeout and fallback mechanisms
              let recommendations;
              const fetchStart = Date.now();
              try {
                // Primary fetch attempt with timeout monitoring
                console.log(
                  `[IPC:${correlationId}] 🚀 Starting primary fetch operation...`
                );

                recommendations = recommendationPersistence.getRecommendations(
                  db,
                  analysisId
                );

                const fetchTime = Date.now() - fetchStart;

                // Record successful fetch metrics
                recordFetchMetrics(
                  fetchTime,
                  true,
                  analysisId,
                  recommendations.length
                );

                // Performance monitoring and warnings
                if (fetchTime > 10000) {
                  console.warn(
                    `[IPC:${correlationId}] ⚠️ Very slow fetch operation: ${fetchTime}ms`
                  );
                } else if (fetchTime > 5000) {
                  console.warn(
                    `[IPC:${correlationId}] ⚠️ Slow fetch operation: ${fetchTime}ms`
                  );
                }

                console.log(
                  `[IPC:${correlationId}] ✅ Primary fetch completed (${fetchTime}ms):`,
                  {
                    count: recommendations.length,
                    analysisId,
                    fetchTime,
                    attempt: retryCount + 1,
                    performance:
                      fetchTime < 1000
                        ? 'excellent'
                        : fetchTime < 5000
                          ? 'good'
                          : 'slow',
                  }
                );

                // Enhanced result validation and logging
                if (recommendations && recommendations.length > 0) {
                  try {
                    // Validate recommendation structure
                    const validationResults = recommendations.map(
                      (rec, index) => ({
                        index,
                        hasId: !!rec.id,
                        hasTitle: !!rec.title,
                        hasPriority: !!rec.priority,
                        hasValidStructure: !!(
                          rec.id &&
                          rec.title &&
                          rec.priority
                        ),
                      })
                    );

                    const invalidRecommendations = validationResults.filter(
                      v => !v.hasValidStructure
                    );

                    if (invalidRecommendations.length > 0) {
                      console.warn(
                        `[IPC:${correlationId}] ⚠️ Found ${invalidRecommendations.length} recommendations with invalid structure:`,
                        invalidRecommendations
                      );
                    }

                    console.log(
                      `[IPC:${correlationId}] 📋 Enhanced result summary:`,
                      {
                        totalCount: recommendations.length,
                        validCount: validationResults.filter(
                          v => v.hasValidStructure
                        ).length,
                        invalidCount: invalidRecommendations.length,
                        sampleRecommendations: recommendations
                          .slice(0, 3)
                          .map(r => ({
                            id: r.id,
                            rec_id: r.rec_id,
                            title:
                              r.title?.substring(0, 50) +
                              (r.title?.length > 50 ? '...' : ''),
                            priority: r.priority,
                            status: r.status,
                            category: r.category,
                            hasActions: r.actions?.length || 0,
                            hasExample: !!r.example,
                            hasResources: r.resources?.length || 0,
                          })),
                        byPriority: recommendations.reduce(
                          (acc, r) => {
                            acc[r.priority] = (acc[r.priority] || 0) + 1;
                            return acc;
                          },
                          {} as Record<string, number>
                        ),
                        byStatus: recommendations.reduce(
                          (acc, r) => {
                            acc[r.status] = (acc[r.status] || 0) + 1;
                            return acc;
                          },
                          {} as Record<string, number>
                        ),
                      }
                    );
                  } catch (loggingError) {
                    console.warn(
                      `[IPC:${correlationId}] ⚠️ Error in enhanced result logging:`,
                      (loggingError as Error).message
                    );
                  }
                } else {
                  console.log(
                    `[IPC:${correlationId}] ℹ️ No recommendations found for analysis ${analysisId} on attempt ${retryCount + 1}`
                  );

                  // If no recommendations found and this is not the last retry, continue to retry
                  if (retryCount < maxRetries - 1) {
                    console.log(
                      `[IPC:${correlationId}] 🔄 No results found, will retry...`
                    );
                    throw new Error('No recommendations found, retrying...');
                  }
                }

                // Success - return results
                return {
                  success: true,
                  recommendations,
                  metadata: {
                    analysisId,
                    totalCount: recommendations.length,
                    correlationId,
                    fetchTimestamp: new Date().toISOString(),
                    attempt: retryCount + 1,
                    fetchTime,
                    performance: {
                      fetchTimeMs: fetchTime,
                      rating:
                        fetchTime < 1000
                          ? 'excellent'
                          : fetchTime < 5000
                            ? 'good'
                            : 'slow',
                    },
                  },
                };
              } catch (fetchError) {
                // Record failed fetch metrics
                recordFetchMetrics(
                  Date.now() - fetchStart,
                  false,
                  analysisId,
                  0,
                  (fetchError as Error).message
                );

                const fetchErrorMsg = `Fetch operation failed on attempt ${retryCount + 1}: ${(fetchError as Error).message}`;
                console.error(`[IPC:${correlationId}] ❌ ${fetchErrorMsg}`, {
                  attempt: retryCount + 1,
                  maxRetries,
                  errorType: (fetchError as Error).constructor.name,
                  willRetry: retryCount < maxRetries - 1,
                  stack: (fetchError as Error).stack,
                });

                if (retryCount < maxRetries - 1) {
                  retryCount++;
                  const retryDelay = Math.min(
                    1000 * Math.pow(2, retryCount),
                    5000
                  ); // Exponential backoff
                  console.log(
                    `[IPC:${correlationId}] 🔄 Retrying fetch in ${retryDelay}ms...`
                  );
                  await new Promise(resolve => setTimeout(resolve, retryDelay));
                  continue;
                }

                throw new Error(fetchErrorMsg);
              }
            } catch (attemptError) {
              if (retryCount < maxRetries - 1) {
                retryCount++;
                const retryDelay = Math.min(
                  1000 * Math.pow(2, retryCount),
                  5000
                );
                console.log(
                  `[IPC:${correlationId}] 🔄 Operation failed, retrying in ${retryDelay}ms...`
                );
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
              }
              throw attemptError;
            }
          }

          // If we reach here, all retries failed
          throw new Error(
            `All ${maxRetries} attempts failed for analysis ${analysisId}`
          );
        };

        try {
          // Race between the main operation and timeout
          const result = await Promise.race([fetchOperation(), timeoutPromise]);

          return result;
        } catch (error) {
          const isTimeout = (error as Error).message.includes('timed out');
          const errorMessage = `Failed to fetch recommendations for analysis ${analysisId}: ${(error as Error).message}`;

          console.error(`[IPC:${correlationId}] ❌ Final error:`, {
            error: errorMessage,
            isTimeout,
            totalAttempts: retryCount + 1,
            maxRetries,
            errorType: (error as Error).constructor.name,
          });

          // Enhanced error response with fallback data
          const errorResponse = {
            success: false,
            error: errorMessage,
            errorType: isTimeout ? 'timeout' : 'fetch_failed',
            metadata: {
              analysisId,
              correlationId,
              totalAttempts: retryCount + 1,
              maxRetries,
              timeoutMs: operationTimeout,
              timestamp: new Date().toISOString(),
            },
            // Provide empty recommendations as fallback
            recommendations: [],
            fallbackData: {
              message:
                'Operation failed, returning empty recommendations as fallback',
              suggestedActions: [
                'Check database connection',
                'Verify analysis ID exists',
                'Try again in a few moments',
                'Check application logs for details',
              ],
            },
          };

          // For timeout errors, don't throw - return error response
          if (isTimeout) {
            console.log(
              `[IPC:${correlationId}] 🔄 Returning timeout fallback response`
            );
            return errorResponse;
          }

          // For other errors, throw to maintain existing error handling
          throw new Error(errorMessage);
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
          const densities = analysis.densityResults.map(result => ({
            keyword: result.keyword,
            density: result.density || 0,
          }));

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

    // ============ HEALTH MONITORING & DIAGNOSTICS ============

    ipcMain.handle('health:check', async _event => {
      try {
        console.log('[IPC] 🏥 Health check requested...');
        const healthStatus = await healthMonitor.performHealthCheck();
        console.log('[IPC] ✅ Health check completed:', healthStatus.overall);
        return healthStatus;
      } catch (error) {
        console.error(
          '[IPC] ❌ Health check failed:',
          (error as Error).message
        );
        throw new Error(`Health check failed: ${(error as Error).message}`);
      }
    });

    ipcMain.handle('health:status', async _event => {
      try {
        console.log('[IPC] 📊 Health status requested...');
        const status = healthMonitor.getCurrentHealthStatus();
        console.log('[IPC] ✅ Health status retrieved');
        return status;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to get health status:',
          (error as Error).message
        );
        throw new Error(
          `Failed to get health status: ${(error as Error).message}`
        );
      }
    });

    ipcMain.handle('health:metrics', async _event => {
      try {
        console.log('[IPC] 📈 Performance metrics requested...');
        const metrics = healthMonitor.getPerformanceStats();
        console.log('[IPC] ✅ Performance metrics retrieved:', {
          totalOperations: metrics.totalOperations,
          successRate: (metrics.successRate * 100).toFixed(1) + '%',
          avgResponseTime: Math.round(metrics.averageResponseTime) + 'ms',
        });
        return metrics;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to get performance metrics:',
          (error as Error).message
        );
        throw new Error(
          `Failed to get performance metrics: ${(error as Error).message}`
        );
      }
    });

    ipcMain.handle('health:reset', async _event => {
      try {
        console.log('[IPC] 🔄 Health monitor reset requested...');
        healthMonitor.reset();
        console.log('[IPC] ✅ Health monitor reset completed');
        return { success: true, message: 'Health monitor reset successfully' };
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to reset health monitor:',
          (error as Error).message
        );
        throw new Error(
          `Failed to reset health monitor: ${(error as Error).message}`
        );
      }
    });

    // ============ SETTINGS & SYSTEM OPERATIONS ============

    ipcMain.handle('settings:clearDatabase', async _event => {
      try {
        console.log('[IPC] 🗑️ Clearing database...');

        // Clear all tables in order (respecting foreign key constraints)
        const db = await dbManager.getDb();

        // Delete in reverse dependency order
        db.exec('DELETE FROM mini_service_results');
        db.exec('DELETE FROM recommendations');
        db.exec('DELETE FROM analyses');
        db.exec('DELETE FROM projects');
        db.exec('DELETE FROM seo_rules');

        // Reset auto-increment counters
        db.exec('DELETE FROM sqlite_sequence');

        console.log('[IPC] ✅ Database cleared successfully');
        return { success: true, message: 'Database cleared successfully' };
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to clear database:',
          (error as Error).message
        );
        throw new Error(
          `Failed to clear database: ${(error as Error).message}`
        );
      }
    });

    ipcMain.handle('settings:exportData', async _event => {
      try {
        console.log('[IPC] 📤 Exporting data...');

        const projects = DatabaseOperations.getAllProjects({ isActive: null });
        const analyses = [];
        const rules = DatabaseOperations.getAllSeoRules({ isActive: null });

        // Get all analyses for all projects
        for (const project of projects) {
          const projectAnalyses = DatabaseOperations.getProjectAnalyses(
            project.id
          );
          analyses.push(...projectAnalyses);
        }

        const exportData = {
          version: '1.0.0',
          exportDate: new Date().toISOString(),
          data: {
            projects,
            analyses,
            rules,
          },
        };

        console.log('[IPC] ✅ Data exported successfully:', {
          projects: projects.length,
          analyses: analyses.length,
          rules: rules.length,
        });

        return exportData;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to export data:',
          (error as Error).message
        );
        throw new Error(`Failed to export data: ${(error as Error).message}`);
      }
    });

    ipcMain.handle(
      'settings:importData',
      async (_event, importData: unknown) => {
        try {
          console.log('[IPC] 📥 Importing data...');

          const data = importData as {
            version: string;
            data: {
              projects: Array<Record<string, unknown>>;
              analyses: Array<Record<string, unknown>>;
              rules: Array<Record<string, unknown>>;
            };
          };

          const imported = { projects: 0, analyses: 0, rules: 0 };

          // Import projects
          for (const project of data.data.projects || []) {
            try {
              DatabaseOperations.createProject(
                project as unknown as Parameters<
                  typeof DatabaseOperations.createProject
                >[0]
              );
              imported.projects++;
            } catch (error) {
              console.warn(
                '[IPC] ⚠️ Failed to import project:',
                (error as Error).message
              );
            }
          }

          // Import rules
          for (const rule of data.data.rules || []) {
            try {
              DatabaseOperations.createSeoRule(
                rule as unknown as Parameters<
                  typeof DatabaseOperations.createSeoRule
                >[0]
              );
              imported.rules++;
            } catch (error) {
              console.warn(
                '[IPC] ⚠️ Failed to import rule:',
                (error as Error).message
              );
            }
          }

          // Import analyses
          for (const analysis of data.data.analyses || []) {
            try {
              DatabaseOperations.createAnalysis(
                analysis as unknown as Parameters<
                  typeof DatabaseOperations.createAnalysis
                >[0]
              );
              imported.analyses++;
            } catch (error) {
              console.warn(
                '[IPC] ⚠️ Failed to import analysis:',
                (error as Error).message
              );
            }
          }

          console.log('[IPC] ✅ Data imported successfully:', imported);
          return { success: true, imported };
        } catch (error) {
          console.error(
            '[IPC] ❌ Failed to import data:',
            (error as Error).message
          );
          throw new Error(`Failed to import data: ${(error as Error).message}`);
        }
      }
    );

    ipcMain.handle('settings:getAppInfo', async _event => {
      try {
        console.log('[IPC] ℹ️ Getting app info...');

        const stats = await dbManager.getStats();
        const packageInfo = await import('../../package.json');

        const appInfo = {
          version: packageInfo.version,
          name: packageInfo.name,
          description: packageInfo.description,
          author: packageInfo.author,
          license: packageInfo.license,
          database: {
            location: 'In-memory SQLite',
            ...stats,
          },
          platform: {
            os: process.platform,
            arch: process.arch,
            node: process.version,
          },
        };

        console.log('[IPC] ✅ App info retrieved');
        return appInfo;
      } catch (error) {
        console.error(
          '[IPC] ❌ Failed to get app info:',
          (error as Error).message
        );
        throw new Error(`Failed to get app info: ${(error as Error).message}`);
      }
    });

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

    // ============ WINDOW CONTROLS ============
    ipcMain.handle('window:minimize', () => {
      const win = BrowserWindow.getFocusedWindow();
      if (win) {
        win.minimize();
      }
    });

    ipcMain.handle('window:maximize', () => {
      const win = BrowserWindow.getFocusedWindow();
      if (win) {
        if (win.isMaximized()) {
          win.unmaximize();
        } else {
          win.maximize();
        }
      }
    });

    ipcMain.handle('window:close', () => {
      const win = BrowserWindow.getFocusedWindow();
      if (win) {
        win.close();
      }
    });

    ipcMain.handle('window:isMaximized', () => {
      const win = BrowserWindow.getFocusedWindow();
      return win ? win.isMaximized() : false;
    });
  }
}

/**
 * Export convenience function for main.ts
 */
export function registerHandlers(): void {
  IPCHandlers.registerHandlers();
}
