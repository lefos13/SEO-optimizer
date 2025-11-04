import { Database as SqlJsDatabase } from 'sql.js';
import {
  saveRecommendations,
  getRecommendations,
} from '../../src/database/recommendationPersistence';

// Mock database instance
const createMockDb = (): SqlJsDatabase => {
  const mockDb = {
    exec: jest.fn(),
    run: jest.fn(),
    prepare: jest.fn(),
    export: jest.fn(),
    close: jest.fn(),
    getRowsModified: jest.fn(),
    create_function: jest.fn(),
    create_aggregate: jest.fn(),
    each: jest.fn(),
  } as unknown as SqlJsDatabase;

  return mockDb;
};

// Mock database manager
const createMockDbManager = () => ({
  beginTransaction: jest.fn(() => jest.fn()), // Returns rollback function
  commitTransaction: jest.fn(),
});

describe('recommendationPersistence', () => {
  let mockDb: SqlJsDatabase;
  let mockDbManager: ReturnType<typeof createMockDbManager>;

  beforeEach(() => {
    mockDb = createMockDb();
    mockDbManager = createMockDbManager();
    jest.clearAllMocks();
  });

  describe('saveRecommendations', () => {
    const validAnalysisId = 1;
    const validRecommendations = {
      recommendations: [
        {
          id: 'rec_1',
          title: 'Test Recommendation',
          priority: 'high',
          category: 'meta',
          effort: 'easy',
          status: 'pending',
        },
      ],
    };

    beforeEach(() => {
      // Mock successful database operations
      (mockDb.exec as jest.Mock).mockReturnValue([
        {
          values: [[1]], // Mock analysis exists
        },
      ]);
      (mockDb.run as jest.Mock).mockReturnValue(undefined);
    });

    it('should save recommendations successfully', () => {
      // Mock last_insert_rowid for recommendation ID
      (mockDb.exec as jest.Mock)
        .mockReturnValueOnce([{ values: [[1]] }]) // Analysis exists
        .mockReturnValueOnce([{ values: [[123]] }]) // last_insert_rowid
        .mockReturnValueOnce([{ values: [[1]] }]); // Verification count

      const result = saveRecommendations(
        mockDb,
        validAnalysisId,
        validRecommendations,
        mockDbManager
      );

      expect(result).toBe(1);
      expect(mockDbManager.beginTransaction).toHaveBeenCalled();
      expect(mockDbManager.commitTransaction).toHaveBeenCalled();
      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM recommendations WHERE analysis_id = ?',
        [validAnalysisId]
      );
    });

    it('should handle empty recommendations array', () => {
      const emptyRecommendations = { recommendations: [] };

      const result = saveRecommendations(
        mockDb,
        validAnalysisId,
        emptyRecommendations,
        mockDbManager
      );

      expect(result).toBe(0);
      expect(mockDbManager.beginTransaction).not.toHaveBeenCalled();
    });

    it('should validate analysis ID exists', () => {
      // Mock analysis not found
      (mockDb.exec as jest.Mock).mockReturnValue([]);

      expect(() =>
        saveRecommendations(mockDb, 999, validRecommendations, mockDbManager)
      ).toThrow('Analysis ID 999 does not exist in database');
    });

    it('should handle database connection errors', () => {
      // Mock database connection test failure
      (mockDb.exec as jest.Mock).mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      expect(() =>
        saveRecommendations(
          mockDb,
          validAnalysisId,
          validRecommendations,
          mockDbManager
        )
      ).toThrow('Database connection test failed');
    });

    it('should rollback transaction on error', () => {
      const rollbackFn = jest.fn();
      mockDbManager.beginTransaction.mockReturnValue(rollbackFn);

      // Mock analysis exists but insert fails
      (mockDb.exec as jest.Mock).mockReturnValueOnce([{ values: [[1]] }]);
      (mockDb.run as jest.Mock).mockImplementation(() => {
        throw new Error('Insert failed');
      });

      expect(() =>
        saveRecommendations(
          mockDb,
          validAnalysisId,
          validRecommendations,
          mockDbManager
        )
      ).toThrow('Failed to save recommendations');

      expect(rollbackFn).toHaveBeenCalled();
    });

    it('should validate recommendation data', () => {
      const invalidRecommendations = {
        recommendations: [
          {
            // Missing required fields
            priority: 'invalid_priority',
          },
        ],
      };

      expect(() =>
        saveRecommendations(
          mockDb,
          validAnalysisId,
          invalidRecommendations,
          mockDbManager
        )
      ).toThrow('Validation errors');
    });
  });

  describe('getRecommendations', () => {
    const validAnalysisId = 1;

    it('should retrieve recommendations successfully', () => {
      const mockRecommendations = [
        [
          1,
          1,
          'rec_1',
          'rule_1',
          'Test Recommendation',
          'high',
          'meta',
          'Test description',
          'easy',
          '5 min',
          10,
          5,
          'Test why',
          'pending',
          '2024-01-01',
        ],
      ];

      // Mock all required database calls with proper table schema
      (mockDb.exec as jest.Mock)
        .mockReturnValueOnce([{ values: [[1]] }]) // Connectivity test
        .mockReturnValueOnce([{ values: [['ok']] }]) // Integrity check
        .mockReturnValueOnce([{ values: [[1]] }]) // User version
        .mockReturnValueOnce([
          { values: [['recommendations', 'CREATE TABLE...']] },
        ]) // Table exists
        .mockReturnValueOnce([
          {
            values: [
              [1, 'id', 'INTEGER', 0, null, 1],
              [2, 'analysis_id', 'INTEGER', 1, null, 0],
              [3, 'title', 'TEXT', 1, null, 0],
              [4, 'priority', 'TEXT', 1, null, 0],
            ],
          },
        ]) // Table info with required columns
        .mockReturnValueOnce([{ values: [[1]] }]) // Analysis validation
        .mockReturnValueOnce([
          {
            columns: [
              'id',
              'analysis_id',
              'rec_id',
              'rule_id',
              'title',
              'priority',
              'category',
              'description',
              'effort',
              'estimated_time',
              'score_increase',
              'percentage_increase',
              'why_explanation',
              'status',
              'created_at',
            ],
            values: mockRecommendations,
          },
        ]) // Main query
        .mockReturnValue([]); // Mock empty results for actions, examples, resources

      const result = getRecommendations(mockDb, validAnalysisId);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        analysis_id: 1,
        title: 'Test Recommendation',
        priority: 'high',
      });
    });

    it('should return empty array when no recommendations found', () => {
      (mockDb.exec as jest.Mock)
        .mockReturnValueOnce([{ values: [[1]] }]) // Connectivity test
        .mockReturnValueOnce([{ values: [['ok']] }]) // Integrity check
        .mockReturnValueOnce([{ values: [[1]] }]) // User version
        .mockReturnValueOnce([
          { values: [['recommendations', 'CREATE TABLE...']] },
        ]) // Table exists
        .mockReturnValueOnce([
          {
            values: [
              [1, 'id', 'INTEGER', 0, null, 1],
              [2, 'analysis_id', 'INTEGER', 1, null, 0],
              [3, 'title', 'TEXT', 1, null, 0],
              [4, 'priority', 'TEXT', 1, null, 0],
            ],
          },
        ]) // Table info with required columns
        .mockReturnValueOnce([{ values: [[1]] }]) // Analysis validation
        .mockReturnValueOnce({ columns: [], values: [] }); // Empty result

      const result = getRecommendations(mockDb, validAnalysisId);

      expect(result).toEqual([]);
    });

    it('should validate analysis ID parameter', () => {
      // The function returns empty array instead of throwing for invalid IDs
      const result1 = getRecommendations(mockDb, 0);
      expect(result1).toEqual([]);

      const result2 = getRecommendations(mockDb, -1);
      expect(result2).toEqual([]);

      const result3 = getRecommendations(mockDb, 1.5);
      expect(result3).toEqual([]);
    });

    it('should handle database connection errors', () => {
      (mockDb.exec as jest.Mock).mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const result = getRecommendations(mockDb, validAnalysisId);

      expect(result).toEqual([]);
    });

    it('should handle missing recommendations table', () => {
      (mockDb.exec as jest.Mock)
        .mockReturnValueOnce([{ values: [[1]] }]) // Connectivity test
        .mockReturnValueOnce([{ values: [['ok']] }]) // Integrity check
        .mockReturnValueOnce([{ values: [[1]] }]) // User version
        .mockReturnValueOnce([]); // Table doesn't exist

      // The function returns empty array instead of throwing for missing table
      const result = getRecommendations(mockDb, validAnalysisId);
      expect(result).toEqual([]);
    });
  });
});
