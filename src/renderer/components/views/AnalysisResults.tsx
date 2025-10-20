/**
 * AnalysisResults View
 * Comprehensive results display integrating all result components
 * Features:
 * - Tabbed interface (Overview, Recommendations, Comparison, Export)
 * - Score breakdown visualization
 * - Filtered recommendations list
 * - Before/After comparison
 * - Export functionality
 *
 * Note: Type assertions to 'any' are used in this file to handle compatibility
 * between database types and child component types. This is a pragmatic approach
 * for component integration while maintaining type safety in the database layer.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ScoreBreakdown from '../results/ScoreBreakdown';
import RecommendationsList from '../results/RecommendationsList';
import ResultsFilter from '../results/ResultsFilter';
import BeforeAfterComparison from '../results/BeforeAfterComparison';
import ComparisonSelector from '../results/ComparisonSelector';
import ExportResults from '../results/ExportResults';

// Local type for filters to avoid import conflicts
interface Filters {
  priorities: string[];
  categories: string[];
  statuses: string[];
  search: string;
  sortBy: string;
}

interface AnalysisResultsProps {
  analysisId?: string | number;
  onBack?: () => void;
}

interface DatabaseAnalysis {
  id: number;
  overall_score: number;
  max_score: number;
  percentage: number;
  grade: string;
  passed_rules: number;
  failed_rules: number;
  warnings: number;
  category_scores: string | Record<string, unknown>;
  created_at: string;
  createdAt?: string;
  url?: string;
  project_id: number;
  projectId?: number;
  score?: number;
  maxScore?: number;
  passedRules?: number;
  failedRules?: number;
  categoryScores?: Record<string, unknown>;
  issues?: unknown[];
}

interface Recommendation {
  id: number;
  title: string;
  description?: string;
  message?: string;
  priority: string;
  category: string;
  status: string;
  impact?: string;
}

interface Tab {
  id: string;
  label: string;
  icon: string;
}

type TabId = 'overview' | 'recommendations' | 'comparison';

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysisId: propAnalysisId,
  onBack: propOnBack,
}) => {
  const { id: routeAnalysisId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Use route param if available, otherwise use prop
  const analysisId = routeAnalysisId || propAnalysisId;
  const onBack = propOnBack || (() => navigate(-1));
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [analysis, setAnalysis] = useState<DatabaseAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [quickWins, setQuickWins] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<
    Recommendation[]
  >([]);
  const [filters, setFilters] = useState<Filters>({
    priorities: [],
    categories: [],
    statuses: [],
    search: '',
    sortBy: 'priority',
  });
  const [comparisonAnalysis, setComparisonAnalysis] =
    useState<DatabaseAnalysis | null>(null);
  const [selectedComparisonAnalysisId, setSelectedComparisonAnalysisId] =
    useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'recommendations', label: 'Recommendations', icon: '💡' },
    { id: 'comparison', label: 'Comparison', icon: '📈' },
  ];

  const loadAnalysisData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Load analysis data
      const analysisData = (await window.electronAPI.analyses.get(
        Number(analysisId)
      )) as DatabaseAnalysis;

      if (!analysisData) {
        throw new Error('Analysis not found');
      }

      // Parse JSON data if stored as string and add computed fields
      const parsedAnalysis: DatabaseAnalysis = {
        ...analysisData,
        score: analysisData.overall_score || 0,
        maxScore: analysisData.max_score || 100,
        passedRules: analysisData.passed_rules || 0,
        failedRules: analysisData.failed_rules || 0,
        categoryScores:
          typeof analysisData.category_scores === 'string' &&
          analysisData.category_scores
            ? JSON.parse(analysisData.category_scores)
            : analysisData.category_scores || {},
        issues: [], // Add empty issues array for calculateCategoryScores
      };

      setAnalysis(parsedAnalysis);

      // Load recommendations
      const recs = (await window.electronAPI.seo.getRecommendations(
        Number(analysisId)
      )) as Recommendation[];
      console.log('[RENDERER] Fetched recommendations from electronAPI:', {
        count: (recs || []).length,
        sample: (recs || [])
          .slice(0, 5)
          .map(r => ({ id: r.id, title: r.title })),
      });
      setRecommendations(recs || []);

      // Load quick wins using dedicated IPC method
      const wins = (await window.electronAPI.seo.getQuickWins(
        Number(analysisId)
      )) as Recommendation[];
      setQuickWins(wins || []);

      // Auto-select the most recent previous analysis for comparison
      const projectId = analysisData.project_id || analysisData.projectId;
      if (projectId) {
        const projectAnalyses = (await window.electronAPI.analyses.getByProject(
          projectId,
          { limit: 2, orderBy: 'createdAt DESC' }
        )) as DatabaseAnalysis[];

        if (projectAnalyses && projectAnalyses.length > 1) {
          const prevAnalysis = projectAnalyses[1];
          if (prevAnalysis) {
            const parsedPrevAnalysis: DatabaseAnalysis = {
              ...prevAnalysis,
              score: prevAnalysis.overall_score || 0,
              maxScore: prevAnalysis.max_score || 100,
              passedRules: prevAnalysis.passed_rules || 0,
              failedRules: prevAnalysis.failed_rules || 0,
              categoryScores:
                typeof prevAnalysis.category_scores === 'string' &&
                prevAnalysis.category_scores
                  ? JSON.parse(prevAnalysis.category_scores)
                  : prevAnalysis.category_scores || {},
              issues: [],
            };
            setComparisonAnalysis(parsedPrevAnalysis);
            setSelectedComparisonAnalysisId(prevAnalysis.id);
          }
        }
      }
    } catch (err) {
      console.error('Error loading analysis data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    if (analysisId) {
      loadAnalysisData();
    }
  }, [analysisId, loadAnalysisData]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendations, filters]);

  const applyFilters = (): void => {
    let filtered = [...recommendations];

    // Apply priority filter
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(rec =>
        filters.priorities.includes(rec.priority?.toLowerCase() || '')
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(rec =>
        filters.categories.includes(rec.category || '')
      );
    }

    // Apply status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(rec =>
        filters.statuses.includes(rec.status?.toLowerCase() || 'pending')
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        rec =>
          rec.title?.toLowerCase().includes(searchLower) ||
          rec.description?.toLowerCase().includes(searchLower) ||
          rec.message?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    const priorityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    const impactOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'priority':
          return (
            (priorityOrder[a.priority?.toLowerCase() || ''] ?? 999) -
            (priorityOrder[b.priority?.toLowerCase() || ''] ?? 999)
          );
        case 'impact':
          return (
            (impactOrder[a.impact?.toLowerCase() || ''] ?? 999) -
            (impactOrder[b.impact?.toLowerCase() || ''] ?? 999)
          );
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'status':
          return (a.status || 'pending').localeCompare(b.status || 'pending');
        default:
          return 0;
      }
    });

    setFilteredRecommendations(filtered);
  };

  const handleUpdateRecommendationStatus = async (
    recId: string | number,
    newStatus: string
  ): Promise<void> => {
    try {
      await window.electronAPI.seo.updateRecommendationStatus(
        Number(recId),
        newStatus,
        ''
      );

      // Update local state
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === Number(recId) ? { ...rec, status: newStatus } : rec
        )
      );
    } catch (err) {
      console.error('Error updating recommendation status:', err);
    }
  };

  const handleSelectComparisonAnalysis = async (
    comparisonAnalysisId: number
  ): Promise<void> => {
    setSelectedComparisonAnalysisId(comparisonAnalysisId);

    try {
      const selectedAnalysis = (await window.electronAPI.analyses.get(
        comparisonAnalysisId
      )) as DatabaseAnalysis;

      if (selectedAnalysis) {
        const parsedAnalysis: DatabaseAnalysis = {
          ...selectedAnalysis,
          score: selectedAnalysis.overall_score || 0,
          maxScore: selectedAnalysis.max_score || 100,
          passedRules: selectedAnalysis.passed_rules || 0,
          failedRules: selectedAnalysis.failed_rules || 0,
          categoryScores:
            typeof selectedAnalysis.category_scores === 'string' &&
            selectedAnalysis.category_scores
              ? JSON.parse(selectedAnalysis.category_scores)
              : selectedAnalysis.category_scores || {},
          issues: [],
        };
        setComparisonAnalysis(parsedAnalysis);
      }
    } catch (err) {
      console.error('Error loading comparison analysis:', err);
    }
  };

  const getFilterStats = (): Record<string, number> => {
    const stats = {
      criticalCount: recommendations.filter(
        r => r.priority?.toLowerCase() === 'critical'
      ).length,
      highCount: recommendations.filter(
        r => r.priority?.toLowerCase() === 'high'
      ).length,
      mediumCount: recommendations.filter(
        r => r.priority?.toLowerCase() === 'medium'
      ).length,
      lowCount: recommendations.filter(r => r.priority?.toLowerCase() === 'low')
        .length,
      pendingCount: recommendations.filter(
        r => !r.status || r.status === 'pending'
      ).length,
      'in-progressCount': recommendations.filter(
        r => r.status === 'in-progress'
      ).length,
      completedCount: recommendations.filter(r => r.status === 'completed')
        .length,
      dismissedCount: recommendations.filter(r => r.status === 'dismissed')
        .length,
    };
    return stats;
  };

  const getUniqueCategories = (): string[] => {
    const categories = new Set(
      recommendations.map(r => r.category).filter(Boolean) as string[]
    );
    return Array.from(categories);
  };

  if (isLoading) {
    return (
      <div className="results-loading">
        <div className="loading-spinner"></div>
        <p>Loading analysis results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Results</h3>
        <p>{error}</p>
        <Button variant="primary" onClick={onBack}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="results-empty">
        <div className="empty-icon">📊</div>
        <h3>No Analysis Found</h3>
        <p>The requested analysis could not be found.</p>
        <Button variant="primary" onClick={onBack}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="analysis-results">
      {/* Header */}
      <div className="results-header">
        <div className="results-header-content">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <div className="results-title-section">
            <h1 className="results-title">Analysis Results</h1>
            <div className="results-meta">
              <Badge variant="info">
                {new Date(
                  analysis.created_at || analysis.createdAt || ''
                ).toLocaleDateString()}
              </Badge>
              {analysis.url && (
                <span className="results-url">{analysis.url}</span>
              )}
            </div>
          </div>
        </div>
        <div className="results-header-actions">
          <ExportResults
            analysis={analysis as any}
            recommendations={recommendations as any}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="results-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as TabId)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.id === 'recommendations' && recommendations.length > 0 && (
              <Badge variant="primary" size="small">
                {recommendations.length}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="results-content">
        {activeTab === 'overview' && (
          <div className="results-overview">
            <ScoreBreakdown analysis={analysis as any} />

            {quickWins.length > 0 && (
              <Card className="quick-wins-card">
                <h3 className="card-title">🚀 Quick Wins</h3>
                <p className="card-subtitle">
                  Start with these high-impact, easy-to-fix recommendations
                </p>
                <RecommendationsList
                  recommendations={quickWins as any}
                  onUpdateStatus={handleUpdateRecommendationStatus}
                />
              </Card>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="results-recommendations">
            <div className="recommendations-layout">
              <aside className="recommendations-sidebar">
                <ResultsFilter
                  filters={filters}
                  onFilterChange={newFilters => setFilters(newFilters as any)}
                  onSearchChange={search => setFilters({ ...filters, search })}
                  categories={getUniqueCategories()}
                  stats={getFilterStats()}
                />
              </aside>

              <div className="recommendations-main">
                <div className="recommendations-header">
                  <h3 className="recommendations-title">All Recommendations</h3>
                  <Badge variant="info">
                    {filteredRecommendations.length} of {recommendations.length}
                  </Badge>
                </div>

                <RecommendationsList
                  recommendations={filteredRecommendations as any}
                  onUpdateStatus={handleUpdateRecommendationStatus}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="results-comparison">
            <div className="comparison-layout">
              <div className="comparison-selector-section">
                <ComparisonSelector
                  currentAnalysisId={Number(analysisId)}
                  projectId={(analysis?.project_id || analysis?.projectId) ?? 0}
                  currentAnalysis={analysis as any}
                  selectedAnalysisId={selectedComparisonAnalysisId ?? undefined}
                  onSelectAnalysis={id =>
                    handleSelectComparisonAnalysis(Number(id))
                  }
                />
              </div>

              <div className="comparison-results-section">
                {comparisonAnalysis ? (
                  <BeforeAfterComparison
                    beforeAnalysis={comparisonAnalysis as any}
                    afterAnalysis={analysis as any}
                  />
                ) : (
                  <Card className="comparison-empty-state">
                    <div className="empty-state-content">
                      <div className="empty-icon">📊</div>
                      <h3>Select an Analysis to Compare</h3>
                      <p>
                        Choose a previous analysis from the list to compare and
                        track improvements over time.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
