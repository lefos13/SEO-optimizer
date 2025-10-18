/**
 * AnalysisResults View
 * Comprehensive results display integrating all result components
 * Features:
 * - Tabbed interface (Overview, Recommendations, Comparison, Export)
 * - Score breakdown visualization
 * - Filtered recommendations list
 * - Before/After comparison
 * - Export functionality
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ScoreBreakdown from '../results/ScoreBreakdown';
import RecommendationsList from '../results/RecommendationsList';
import ResultsFilter from '../results/ResultsFilter';
import BeforeAfterComparison from '../results/BeforeAfterComparison';
import ComparisonSelector from '../results/ComparisonSelector';
import ExportResults from '../results/ExportResults';
import { calculateCategoryScores } from '../../utils/scoreCalculator';

const AnalysisResults = ({
  analysisId: propAnalysisId,
  onBack: propOnBack,
}) => {
  const { id: routeAnalysisId } = useParams();
  const navigate = useNavigate();

  // Use route param if available, otherwise use prop
  const analysisId = routeAnalysisId || propAnalysisId;
  const onBack = propOnBack || (() => navigate(-1));
  const [activeTab, setActiveTab] = useState('overview');
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [quickWins, setQuickWins] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [filters, setFilters] = useState({
    priorities: [],
    categories: [],
    statuses: [],
    search: '',
    sortBy: 'priority',
  });
  const [comparisonAnalysis, setComparisonAnalysis] = useState(null);
  const [selectedComparisonAnalysisId, setSelectedComparisonAnalysisId] =
    useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'recommendations', label: 'Recommendations', icon: '💡' },
    { id: 'comparison', label: 'Comparison', icon: '📈' },
  ];

  useEffect(() => {
    if (analysisId) {
      loadAnalysisData();
    }
  }, [analysisId, loadAnalysisData]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendations, filters]);

  const loadAnalysisData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load analysis data
      const analysisData = await window.electronAPI.analyses.get(analysisId);

      if (!analysisData) {
        throw new Error('Analysis not found');
      }

      // Parse JSON data if stored as string and map snake_case to camelCase
      const parsedAnalysis = {
        ...analysisData,
        // Map snake_case database fields to camelCase for UI
        score: analysisData.overall_score || 0,
        maxScore: analysisData.max_score || 100,
        percentage: analysisData.percentage || 0,
        grade: analysisData.grade || 'F',
        passedRules: analysisData.passed_rules || 0,
        failedRules: analysisData.failed_rules || 0,
        warnings: analysisData.warnings || 0,
        categoryScores:
          typeof analysisData.category_scores === 'string' &&
          analysisData.category_scores
            ? JSON.parse(analysisData.category_scores)
            : analysisData.category_scores || {},
      };

      setAnalysis(parsedAnalysis);

      // Load recommendations
      const recs = await window.electronAPI.seo.getRecommendations(analysisId);
      setRecommendations(recs || []);

      // Load quick wins using dedicated IPC method
      const wins = await window.electronAPI.seo.getQuickWins(analysisId);
      setQuickWins(wins || []);

      // Auto-select the most recent previous analysis for comparison
      // Note: database uses snake_case (project_id) not camelCase (projectId)
      const projectId = analysisData.project_id || analysisData.projectId;
      if (projectId) {
        const projectAnalyses = await window.electronAPI.analyses.getByProject(
          projectId,
          { limit: 2, orderBy: 'createdAt DESC' }
        );

        if (projectAnalyses && projectAnalyses.length > 1) {
          const prevAnalysis = projectAnalyses[1];
          const parsedPrevAnalysis = {
            ...prevAnalysis,
            // Map snake_case database fields to camelCase for UI
            score: prevAnalysis.overall_score || 0,
            maxScore: prevAnalysis.max_score || 100,
            percentage: prevAnalysis.percentage || 0,
            grade: prevAnalysis.grade || 'F',
            passedRules: prevAnalysis.passed_rules || 0,
            failedRules: prevAnalysis.failed_rules || 0,
            warnings: prevAnalysis.warnings || 0,
            categoryScores:
              typeof prevAnalysis.category_scores === 'string' &&
              prevAnalysis.category_scores
                ? JSON.parse(prevAnalysis.category_scores)
                : prevAnalysis.category_scores || {},
          };
          setComparisonAnalysis(parsedPrevAnalysis);
          setSelectedComparisonAnalysisId(prevAnalysis.id);
        }
      }
    } catch (err) {
      console.error('Error loading analysis data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [analysisId]);

  // Calculate category scores from analysis data
  const categoryScores = useMemo(() => {
    if (!analysis) return {};
    return calculateCategoryScores(analysis);
  }, [analysis]);

  const applyFilters = () => {
    let filtered = [...recommendations];

    // Apply priority filter
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(rec =>
        filters.priorities.includes(rec.priority?.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(rec =>
        filters.categories.includes(rec.category)
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
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const impactOrder = { high: 0, medium: 1, low: 2 };

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'priority':
          return (
            (priorityOrder[a.priority?.toLowerCase()] || 999) -
            (priorityOrder[b.priority?.toLowerCase()] || 999)
          );
        case 'impact':
          return (
            (impactOrder[a.impact?.toLowerCase()] || 999) -
            (impactOrder[b.impact?.toLowerCase()] || 999)
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

  const handleUpdateRecommendationStatus = async (recId, newStatus) => {
    try {
      await window.electronAPI.seo.updateRecommendationStatus(
        recId,
        newStatus,
        ''
      );

      // Update local state
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === recId ? { ...rec, status: newStatus } : rec
        )
      );
    } catch (err) {
      console.error('Error updating recommendation status:', err);
    }
  };

  const handleSelectComparisonAnalysis = async comparisonAnalysisId => {
    setSelectedComparisonAnalysisId(comparisonAnalysisId);

    try {
      const selectedAnalysis =
        await window.electronAPI.analyses.get(comparisonAnalysisId);

      if (selectedAnalysis) {
        // Parse and map snake_case to camelCase
        const parsedAnalysis = {
          ...selectedAnalysis,
          score: selectedAnalysis.overall_score || 0,
          maxScore: selectedAnalysis.max_score || 100,
          percentage: selectedAnalysis.percentage || 0,
          grade: selectedAnalysis.grade || 'F',
          passedRules: selectedAnalysis.passed_rules || 0,
          failedRules: selectedAnalysis.failed_rules || 0,
          warnings: selectedAnalysis.warnings || 0,
          categoryScores:
            typeof selectedAnalysis.category_scores === 'string' &&
            selectedAnalysis.category_scores
              ? JSON.parse(selectedAnalysis.category_scores)
              : selectedAnalysis.category_scores || {},
        };
        setComparisonAnalysis(parsedAnalysis);
      }
    } catch (err) {
      console.error('Error loading comparison analysis:', err);
    }
  };

  const getFilterStats = () => {
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

  const getUniqueCategories = () => {
    const categories = new Set(
      recommendations.map(r => r.category).filter(Boolean)
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
                  analysis.created_at || analysis.createdAt
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
            analysis={analysis}
            recommendations={recommendations}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="results-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
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
            <ScoreBreakdown
              analysis={analysis}
              categoryScores={categoryScores}
            />

            {quickWins.length > 0 && (
              <Card className="quick-wins-card">
                <h3 className="card-title">🚀 Quick Wins</h3>
                <p className="card-subtitle">
                  Start with these high-impact, easy-to-fix recommendations
                </p>
                <RecommendationsList
                  recommendations={quickWins}
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
                  onFilterChange={setFilters}
                  onSortChange={sortBy => setFilters({ ...filters, sortBy })}
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
                  recommendations={filteredRecommendations}
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
                  currentAnalysisId={analysisId}
                  projectId={analysis?.project_id || analysis?.projectId}
                  currentAnalysis={analysis}
                  selectedAnalysisId={selectedComparisonAnalysisId}
                  onSelectAnalysis={handleSelectComparisonAnalysis}
                />
              </div>

              <div className="comparison-results-section">
                {comparisonAnalysis ? (
                  <BeforeAfterComparison
                    beforeAnalysis={comparisonAnalysis}
                    afterAnalysis={analysis}
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

AnalysisResults.propTypes = {
  analysisId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onBack: PropTypes.func,
};

export default AnalysisResults;
