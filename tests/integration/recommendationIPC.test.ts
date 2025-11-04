import { ipcMain } from 'electron';
import { Database as SqlJsDatabase } from 'sql.js';
import { IPCHandlers } from '../../src/main/ipcHandlers';
import * as recommendationPersistence from '../../src/database/recommendationPersistence';
import dbManager from '../../src/main/dbManager';

// Mock electron
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
    removeAllListeners: jest.fn(),
    eventNames: jest.fn(() => []),
  },
}));

// Mock database manager
jest.mock('../../src/main/dbManager', () => ({
  getDb: jest.fn(),
  beginTransaction: jest.fn(),
  commitTransaction: jest.fn(),
}));

// Mock recommendation persistence
jest.mock('../../src/database/recommendationPersistence');

describe('Recommendation IPC Integration Tests', () => {
  let mockDb: SqlJsDatabase;
  let saveHandler: (...args: any[]) => any;
  let getHandler: (...args: any[]) => any;

  const testAnalysisId = 123;
  const testRecommendations = [
    {
      id: 'rec_1',
      title: 'Improve meta description',
      priority: 'high',
      category: 'meta',
      effort: 'easy',
      status: 'pending',
    },
    {
      id: 'rec_2',
      title: 'Add alt text to images',
      priority: 'medium',
      category: 'content',
      effort: 'medium',
      status: 'pending',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock database
    mockDb = {
      exec: jest.fn(),
      run: jest.fn(),
    } as unknown as SqlJsDatabase;

    (dbManager.getDb as jest.Mock).mockReturnValue(mockDb);

    // Register handlers and capture them
    IPCHandlers.registerHandlers();

    // Find the registered handlers
    const handleCalls = (ipcMain.handle as jest.Mock).mock.calls;
    const saveCall = handleCalls.find(
      call => call[0] === 'seo:saveRecommendations'
    );
    const getCall = handleCalls.find(
      call => call[0] === 'seo:recommendations:get'
    );

    saveHandler = saveCall?.[1];
    getHandler = getCall?.[1];
  });

  describe('Save-Fetch Integration Flow', () => {
    it('should complete full save-fetch cycle successfully', async () => {
      // Mock successful save
      (
        recommendationPersistence.saveRecommendations as jest.Mock
      ).mockReturnValue(2);

      // Mock successful fetch
      const mockFetchedRecommendations = [
        {
          id: 1,
          analysis_id: testAnalysisId,
          rec_id: 'rec_1',
          title: 'Improve meta description',
          priority: 'high',
          category: 'meta',
          status: 'pending',
        },
        {
          id: 2,
          analysis_id: testAnalysisId,
          rec_id: 'rec_2',
          title: 'Add alt text to images',
          priority: 'medium',
          category: 'content',
          status: 'pending',
        },
      ];
      (
        recommendationPersistence.getRecommendations as jest.Mock
      ).mockReturnValue(mockFetchedRecommendations);

      // Mock database verification
      (mockDb.exec as jest.Mock).mockReturnValue([{ values: [[2]] }]);

      // Test save operation
      const saveResult = await saveHandler(
        null,
        testAnalysisId,
        testRecommendations
      );

      expect(saveResult).toMatchObject({
        success: true,
        savedCount: 2,
        analysisId: testAnalysisId,
      });

      // Test fetch operation
      const fetchResult = await getHandler(null, testAnalysisId);

      expect(fetchResult.success).toBe(true);
      expect(fetchResult.recommendations).toHaveLength(2);
      expect(fetchResult.metadata.totalCount).toBe(2);
      expect(fetchResult.metadata.analysisId).toBe(testAnalysisId);
    });

    it('should handle concurrent save operations', async () => {
      (
        recommendationPersistence.saveRecommendations as jest.Mock
      ).mockReturnValue(1);
      (mockDb.exec as jest.Mock).mockReturnValue([{ values: [[1]] }]);

      // Simulate concurrent saves
      const promises = [
        saveHandler(null, testAnalysisId, [testRecommendations[0]]),
        saveHandler(null, testAnalysisId + 1, [testRecommendations[1]]),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.savedCount).toBe(1);
      });
    });

    it('should handle save errors gracefully', async () => {
      // Mock save failure
      (
        recommendationPersistence.saveRecommendations as jest.Mock
      ).mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const result = await saveHandler(
        null,
        testAnalysisId,
        testRecommendations
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
      expect(result.savedCount).toBe(0);
    });

    it('should handle fetch errors with retry mechanism', async () => {
      // Mock fetch failure then success
      (recommendationPersistence.getRecommendations as jest.Mock)
        .mockImplementationOnce(() => {
          throw new Error('Temporary database error');
        })
        .mockReturnValueOnce([]);

      const result = await getHandler(null, testAnalysisId);

      expect(result.success).toBe(true);
      expect(result.recommendations).toEqual([]);
    }, 10000); // Increase timeout to 10 seconds

    it('should validate data integrity across process boundaries', async () => {
      const complexRecommendation = {
        id: 'rec_complex',
        title: 'Complex recommendation with special chars: <>&"\'',
        priority: 'high',
        category: 'meta',
        effort: 'medium',
        status: 'pending',
        actions: [
          { step: 1, action: 'First action', type: 'manual' },
          { step: 2, action: 'Second action', type: 'automated' },
        ],
        example: {
          before: '<title>Old Title</title>',
          after: '<title>New Optimized Title</title>',
        },
        resources: [{ title: 'SEO Guide', url: 'https://example.com/guide' }],
      };

      (
        recommendationPersistence.saveRecommendations as jest.Mock
      ).mockReturnValue(1);
      (mockDb.exec as jest.Mock).mockReturnValue([{ values: [[1]] }]);

      // Test save with complex data
      const saveResult = await saveHandler(null, testAnalysisId, [
        complexRecommendation,
      ]);

      expect(saveResult.success).toBe(true);
      expect(
        recommendationPersistence.saveRecommendations
      ).toHaveBeenCalledWith(
        mockDb,
        testAnalysisId,
        { recommendations: [complexRecommendation] },
        dbManager
      );
    });
  });

  describe('Error Scenarios and Edge Cases', () => {
    it('should handle invalid analysis ID', async () => {
      const result = await saveHandler(null, 'invalid', testRecommendations);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid analysis ID');
    });

    it('should handle empty recommendations array', async () => {
      (
        recommendationPersistence.saveRecommendations as jest.Mock
      ).mockReturnValue(0);

      const result = await saveHandler(null, testAnalysisId, []);

      expect(result.success).toBe(true);
      expect(result.savedCount).toBe(0);
      expect(result.message).toContain('No recommendations to save');
    });

    it('should handle malformed payload', async () => {
      const result = await saveHandler(null, testAnalysisId, 'invalid payload');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid payload format');
    });

    it('should handle database connection failure', async () => {
      (dbManager.getDb as jest.Mock).mockReturnValue(null);

      const result = await saveHandler(
        null,
        testAnalysisId,
        testRecommendations
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection is not available');
    });

    it('should handle fetch timeout gracefully', async () => {
      // Mock very slow operation
      (
        recommendationPersistence.getRecommendations as jest.Mock
      ).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 35000))
      );

      const result = await getHandler(null, testAnalysisId);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('timeout');
      expect(result.recommendations).toEqual([]);
    }, 35000); // Increase timeout to handle the slow operation
  });

  describe('Performance and Monitoring', () => {
    it('should track operation performance metrics', async () => {
      const mockRecommendations = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        analysis_id: testAnalysisId,
        title: `Recommendation ${i + 1}`,
        priority: 'medium',
      }));

      (
        recommendationPersistence.getRecommendations as jest.Mock
      ).mockReturnValue(mockRecommendations);

      const result = await getHandler(null, testAnalysisId);

      expect(result.success).toBe(true);
      expect(result.metadata.performance).toBeDefined();
      expect(result.metadata.performance.fetchTimeMs).toBeGreaterThan(0);
      expect(result.metadata.performance.rating).toMatch(/excellent|good|slow/);
    });

    it('should handle large recommendation datasets', async () => {
      const largeRecommendationSet = Array.from({ length: 100 }, (_, i) => ({
        id: `rec_${i}`,
        title: `Large dataset recommendation ${i}`,
        priority: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
        category: 'content',
        effort: 'medium',
        status: 'pending',
      }));

      (
        recommendationPersistence.saveRecommendations as jest.Mock
      ).mockReturnValue(100);
      (mockDb.exec as jest.Mock).mockReturnValue([{ values: [[100]] }]);

      const result = await saveHandler(
        null,
        testAnalysisId,
        largeRecommendationSet
      );

      expect(result.success).toBe(true);
      expect(result.savedCount).toBe(100);
    });
  });
});
