// Mock for window.electronAPI used in tests
export const analyses = {
  get: jest.fn(async (id: number) => {
    return {
      id,
      overall_score: 85,
      max_score: 100,
      percentage: 85,
      grade: 'B',
      passed_rules: 15,
      failed_rules: 5,
      warnings: 2,
      category_scores: JSON.stringify({ meta: 90, content: 80 }),
      created_at: new Date().toISOString(),
      project_id: 1,
    };
  }),
  getByProject: jest.fn(async (projectId: number) => {
    return [
      {
        id: 10,
        overall_score: 82,
        max_score: 100,
        percentage: 82,
        grade: 'B',
        passed_rules: 14,
        failed_rules: 6,
        warnings: 1,
        category_scores: JSON.stringify({ meta: 88, content: 76 }),
        created_at: new Date().toISOString(),
        project_id: projectId,
      },
    ];
  }),
};

export const seo = {
  getRecommendations: jest.fn(async (_analysisId: number) => {
    // Return sample recommendations for test
    if (_analysisId === 9999) return [];
    return [
      {
        id: 1,
        title: 'Add meta description',
        priority: 'high',
        category: 'meta',
        status: 'pending',
        impact: 'high',
      },
      {
        id: 2,
        title: 'Improve headings',
        priority: 'medium',
        category: 'structure',
        status: 'pending',
        impact: 'medium',
      },
    ];
  }),
  getQuickWins: jest.fn(async (_analysisId: number) => {
    return [
      {
        id: 3,
        title: 'Fix broken links',
        priority: 'critical',
        category: 'links',
        status: 'pending',
        impact: 'high',
      },
    ];
  }),
  updateRecommendationStatus: jest.fn(async () => true),
};

export default { analyses, seo };
