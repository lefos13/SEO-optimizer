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
/* eslint-disable react-hooks/exhaustive-deps */
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

interface ErrorState {
  type: 'analysis' | 'recommendations' | 'quickwins' | 'comparison' | 'general';
  message: string;
  details?: string;
  retryable: boolean;
}

interface LoadingState {
  analysis: boolean;
  recommendations: boolean;
  quickwins: boolean;
  comparison: boolean;
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
  const [isLoading, setIsLoading] = useState<LoadingState>({
    analysis: true,
    recommendations: false,
    quickwins: false,
    comparison: false,
  });
  const [error, setError] = useState<ErrorState | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'recommendations', label: 'Recommendations', icon: '💡' },
    { id: 'comparison', label: 'Comparison', icon: '📈' },
  ];

  // Helper function to create error states
  const createError = (
    type: ErrorState['type'],
    message: string,
    details?: string,
    retryable: boolean = true
  ): ErrorState => ({
    type,
    message,
    details,
    retryable,
  });

  // Helper function to update loading state
  const updateLoadingState = (updates: Partial<LoadingState>): void => {
    setIsLoading(prev => ({ ...prev, ...updates }));
  };

  // Helper function to handle errors with logging
  const handleError = (
    type: ErrorState['type'],
    error: unknown,
    context: string
  ): void => {
    console.error(`[AnalysisResults] ${context}:`, error);

    let message = 'An unexpected error occurred';
    let details = '';
    let retryable = true;

    if (error instanceof Error) {
      message = error.message;
      details = error.stack || '';
    } else if (typeof error === 'string') {
      message = error;
    }

    // Determine if error is retryable based on type and message
    if (message.includes('not found') || message.includes('404')) {
      retryable = false;
    }

    setError(createError(type, message, details, retryable));
  };

  // Retry mechanism with exponential backoff
  const retryWithBackoff = async (
    operation: () => Promise<void>,
    maxRetries: number = 3
  ): Promise<void> => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await operation();
        setRetryCount(0); // Reset retry count on success
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error; // Re-throw on final attempt
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(
          `[AnalysisResults] Retry attempt ${attempt + 1} in ${delay}ms`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  // Data validation functions
  const isValidRecommendation = (rec: unknown): rec is Recommendation => {
    if (!rec || typeof rec !== 'object') {
      return false;
    }

    const recommendation = rec as Record<string, unknown>;

    // Required fields
    if (typeof recommendation.id !== 'number' || recommendation.id <= 0) {
      return false;
    }

    if (
      typeof recommendation.title !== 'string' ||
      !recommendation.title.trim()
    ) {
      return false;
    }

    // Optional but validated fields
    if (
      recommendation.priority &&
      typeof recommendation.priority === 'string' &&
      !['critical', 'high', 'medium', 'low'].includes(
        recommendation.priority.toLowerCase()
      )
    ) {
      return false;
    }

    if (
      recommendation.category &&
      typeof recommendation.category !== 'string'
    ) {
      return false;
    }

    if (recommendation.status && typeof recommendation.status !== 'string') {
      return false;
    }

    return true;
  };

  const validateRecommendationsArray = (data: unknown): Recommendation[] => {
    if (!Array.isArray(data)) {
      console.warn(
        '[AnalysisResults] Recommendations data is not an array:',
        typeof data
      );
      return [];
    }

    const validRecommendations: Recommendation[] = [];
    const invalidItems: unknown[] = [];

    data.forEach((item, index) => {
      if (isValidRecommendation(item)) {
        // Sanitize and normalize the recommendation
        const sanitizedRec: Recommendation = {
          id: item.id,
          title: item.title.trim(),
          description:
            typeof item.description === 'string'
              ? item.description.trim()
              : undefined,
          message:
            typeof item.message === 'string' ? item.message.trim() : undefined,
          priority:
            typeof item.priority === 'string'
              ? item.priority.toLowerCase()
              : 'medium',
          category:
            typeof item.category === 'string' ? item.category : 'general',
          status:
            typeof item.status === 'string'
              ? item.status.toLowerCase()
              : 'pending',
          impact:
            typeof item.impact === 'string'
              ? item.impact.toLowerCase()
              : undefined,
        };
        validRecommendations.push(sanitizedRec);
      } else {
        console.warn(
          `[AnalysisResults] Invalid recommendation at index ${index}:`,
          item
        );
        invalidItems.push(item);
      }
    });

    if (invalidItems.length > 0) {
      console.warn(
        `[AnalysisResults] Found ${invalidItems.length} invalid recommendations out of ${data.length} total`
      );
    }

    return validRecommendations;
  };

  const validateAndSetRecommendations = (
    data: unknown,
    context: string
  ): void => {
    try {
      const validatedRecommendations = validateRecommendationsArray(data);

      console.log(`[AnalysisResults] ${context} - Validated recommendations:`, {
        total: Array.isArray(data) ? data.length : 0,
        valid: validatedRecommendations.length,
        invalid: Array.isArray(data)
          ? data.length - validatedRecommendations.length
          : 0,
      });

      setRecommendations(validatedRecommendations);
    } catch (error) {
      console.error(
        `[AnalysisResults] Error validating recommendations in ${context}:`,
        error
      );
      setRecommendations([]); // Fallback to empty array
      throw new Error(
        `Invalid recommendations data received: ${error instanceof Error ? error.message : 'Unknown validation error'}`
      );
    }
  };

  const validateAndSetQuickWins = (data: unknown, context: string): void => {
    try {
      const validatedQuickWins = validateRecommendationsArray(data);

      console.log(`[AnalysisResults] ${context} - Validated quick wins:`, {
        total: Array.isArray(data) ? data.length : 0,
        valid: validatedQuickWins.length,
        invalid: Array.isArray(data)
          ? data.length - validatedQuickWins.length
          : 0,
      });

      setQuickWins(validatedQuickWins);
    } catch (error) {
      console.error(
        `[AnalysisResults] Error validating quick wins in ${context}:`,
        error
      );
      setQuickWins([]); // Fallback to empty array
      throw new Error(
        `Invalid quick wins data received: ${error instanceof Error ? error.message : 'Unknown validation error'}`
      );
    }
  };

  const loadAnalysisData = useCallback(async (): Promise<void> => {
    updateLoadingState({ analysis: true });
    setError(null);

    try {
      await retryWithBackoff(async () => {
        // Load analysis data
        console.log(
          '[AnalysisResults] Loading analysis data for ID:',
          analysisId
        );
        const analysisData = (await window.electronAPI.analyses.get(
          Number(analysisId)
        )) as DatabaseAnalysis;

        if (!analysisData) {
          throw new Error(`Analysis with ID ${analysisId} not found`);
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
        console.log('[AnalysisResults] Analysis data loaded successfully');
      });
    } catch (err) {
      handleError('analysis', err, 'Loading analysis data');
      return; // Don't continue if analysis loading failed
    } finally {
      updateLoadingState({ analysis: false });
    }

    // Load recommendations with separate error handling
    await loadRecommendations();

    // Load quick wins with separate error handling
    await loadQuickWins();

    // Load comparison data with separate error handling
    await loadComparisonData();
  }, [analysisId]);

  const loadRecommendations = useCallback(async (): Promise<void> => {
    if (!analysisId) return;

    updateLoadingState({ recommendations: true });

    try {
      await retryWithBackoff(async () => {
        console.log(
          '[AnalysisResults] Loading recommendations for analysis ID:',
          analysisId
        );
        const response = await window.electronAPI.seo.getRecommendations(
          Number(analysisId)
        );

        console.log(
          '[AnalysisResults] Raw recommendations response received:',
          {
            type: typeof response,
            isArray: Array.isArray(response),
            hasRecommendations:
              response &&
              typeof response === 'object' &&
              'recommendations' in response,
            responseStructure:
              response && typeof response === 'object'
                ? Object.keys(response)
                : 'Not an object',
          }
        );

        // Extract recommendations array from response object
        let recs: unknown;
        if (Array.isArray(response)) {
          // Direct array response (legacy format)
          recs = response;
        } else if (
          response &&
          typeof response === 'object' &&
          'recommendations' in response
        ) {
          // Object response with recommendations property (new format)
          recs = (response as any).recommendations;
        } else {
          console.warn(
            '[AnalysisResults] Unexpected response format:',
            response
          );
          recs = [];
        }

        console.log('[AnalysisResults] Extracted recommendations data:', {
          type: typeof recs,
          isArray: Array.isArray(recs),
          count: Array.isArray(recs) ? recs.length : 'N/A',
          sample: Array.isArray(recs)
            ? recs.slice(0, 3).map((r: any) => ({
                id: r?.id,
                title: r?.title,
                category: r?.category,
                hasRequiredFields: !!(r?.id && r?.title),
              }))
            : 'Not an array',
        });

        validateAndSetRecommendations(recs, 'loadRecommendations');
      });
    } catch (err) {
      handleError('recommendations', err, 'Loading recommendations');
      // Validation function already sets empty array as fallback
    } finally {
      updateLoadingState({ recommendations: false });
    }
  }, [analysisId]);

  const loadQuickWins = useCallback(async (): Promise<void> => {
    if (!analysisId) return;

    updateLoadingState({ quickwins: true });

    try {
      await retryWithBackoff(async () => {
        console.log(
          '[AnalysisResults] Loading quick wins for analysis ID:',
          analysisId
        );
        const wins = await window.electronAPI.seo.getQuickWins(
          Number(analysisId)
        );

        console.log('[AnalysisResults] Raw quick wins data received:', {
          type: typeof wins,
          isArray: Array.isArray(wins),
          count: Array.isArray(wins) ? wins.length : 'N/A',
          sample: Array.isArray(wins)
            ? wins.slice(0, 3).map((r: any) => ({
                id: r?.id,
                title: r?.title,
                category: r?.category,
                hasRequiredFields: !!(r?.id && r?.title),
              }))
            : 'Not an array',
        });

        validateAndSetQuickWins(wins, 'loadQuickWins');
      });
    } catch (err) {
      handleError('quickwins', err, 'Loading quick wins');
      // Validation function already sets empty array as fallback
    } finally {
      updateLoadingState({ quickwins: false });
    }
  }, [analysisId]);

  const loadComparisonData = useCallback(async (): Promise<void> => {
    if (!analysis) return;

    updateLoadingState({ comparison: true });

    try {
      await retryWithBackoff(async () => {
        const projectId = analysis.project_id || analysis.projectId;
        if (!projectId) {
          console.log(
            '[AnalysisResults] No project ID found, skipping comparison data'
          );
          return;
        }

        console.log(
          '[AnalysisResults] Loading comparison data for project ID:',
          projectId
        );
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
            console.log(
              '[AnalysisResults] Comparison data loaded successfully'
            );
          }
        }
      });
    } catch (err) {
      handleError('comparison', err, 'Loading comparison data');
      // Don't set fallback data for comparison as it's optional
    } finally {
      updateLoadingState({ comparison: false });
    }
  }, [analysis]);

  useEffect(() => {
    if (analysisId) {
      loadAnalysisData();
    }
  }, [analysisId, loadAnalysisData]);

  useEffect(() => {
    applyFilters();
  }, [recommendations, filters]);

  const applyFilters = (): void => {
    try {
      // Validate recommendations before filtering
      const validRecommendations = recommendations.filter(rec => {
        if (!isValidRecommendation(rec)) {
          console.warn(
            '[AnalysisResults] Invalid recommendation found during filtering:',
            rec
          );
          return false;
        }
        return true;
      });

      if (validRecommendations.length !== recommendations.length) {
        console.warn(
          `[AnalysisResults] Filtered out ${recommendations.length - validRecommendations.length} invalid recommendations during filtering`
        );
      }

      let filtered = [...validRecommendations];

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
      const impactOrder: Record<string, number> = {
        high: 0,
        medium: 1,
        low: 2,
      };

      filtered.sort((a, b) => {
        try {
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
              return (a.status || 'pending').localeCompare(
                b.status || 'pending'
              );
            default:
              return 0;
          }
        } catch (sortError) {
          console.warn(
            '[AnalysisResults] Error sorting recommendations:',
            sortError
          );
          return 0;
        }
      });

      setFilteredRecommendations(filtered);
    } catch (error) {
      console.error('[AnalysisResults] Error applying filters:', error);
      // Fallback to empty array if filtering fails
      setFilteredRecommendations([]);
    }
  };

  const handleRetry = useCallback(async (): Promise<void> => {
    if (!error?.retryable) return;

    setRetryCount(prev => prev + 1);
    setError(null);

    console.log(
      `[AnalysisResults] Retrying operation (attempt ${retryCount + 1})`
    );

    switch (error.type) {
      case 'analysis':
        await loadAnalysisData();
        break;
      case 'recommendations':
        await loadRecommendations();
        break;
      case 'quickwins':
        await loadQuickWins();
        break;
      case 'comparison':
        await loadComparisonData();
        break;
      default:
        await loadAnalysisData();
        break;
    }
  }, [
    error,
    retryCount,
    loadAnalysisData,
    loadRecommendations,
    loadQuickWins,
    loadComparisonData,
  ]);

  const handleUpdateRecommendationStatus = async (
    recId: string | number,
    newStatus: string
  ): Promise<void> => {
    try {
      console.log(
        `[AnalysisResults] Updating recommendation ${recId} status to ${newStatus}`
      );

      await retryWithBackoff(async () => {
        await window.electronAPI.seo.updateRecommendationStatus(
          Number(recId),
          newStatus,
          ''
        );
      });

      // Update local state
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === Number(recId) ? { ...rec, status: newStatus } : rec
        )
      );

      console.log(
        `[AnalysisResults] Successfully updated recommendation ${recId} status`
      );
    } catch (err) {
      handleError('general', err, `Updating recommendation ${recId} status`);
    }
  };

  const handleSelectComparisonAnalysis = async (
    comparisonAnalysisId: number
  ): Promise<void> => {
    setSelectedComparisonAnalysisId(comparisonAnalysisId);
    updateLoadingState({ comparison: true });

    try {
      await retryWithBackoff(async () => {
        console.log(
          '[AnalysisResults] Loading comparison analysis:',
          comparisonAnalysisId
        );

        const selectedAnalysis = (await window.electronAPI.analyses.get(
          comparisonAnalysisId
        )) as DatabaseAnalysis;

        if (!selectedAnalysis) {
          throw new Error(
            `Comparison analysis with ID ${comparisonAnalysisId} not found`
          );
        }

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
        console.log(
          '[AnalysisResults] Comparison analysis loaded successfully'
        );
      });
    } catch (err) {
      handleError(
        'comparison',
        err,
        `Loading comparison analysis ${comparisonAnalysisId}`
      );
      // Reset comparison analysis on error
      setComparisonAnalysis(null);
    } finally {
      updateLoadingState({ comparison: false });
    }
  };

  const getFilterStats = (): Record<string, number> => {
    try {
      // Validate recommendations before calculating stats
      const validRecommendations = recommendations.filter(
        isValidRecommendation
      );

      const stats = {
        criticalCount: validRecommendations.filter(
          r => r.priority?.toLowerCase() === 'critical'
        ).length,
        highCount: validRecommendations.filter(
          r => r.priority?.toLowerCase() === 'high'
        ).length,
        mediumCount: validRecommendations.filter(
          r => r.priority?.toLowerCase() === 'medium'
        ).length,
        lowCount: validRecommendations.filter(
          r => r.priority?.toLowerCase() === 'low'
        ).length,
        pendingCount: validRecommendations.filter(
          r => !r.status || r.status === 'pending'
        ).length,
        'in-progressCount': validRecommendations.filter(
          r => r.status === 'in-progress'
        ).length,
        completedCount: validRecommendations.filter(
          r => r.status === 'completed'
        ).length,
        dismissedCount: validRecommendations.filter(
          r => r.status === 'dismissed'
        ).length,
      };
      return stats;
    } catch (error) {
      console.error('[AnalysisResults] Error calculating filter stats:', error);
      // Return empty stats on error
      return {
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        pendingCount: 0,
        'in-progressCount': 0,
        completedCount: 0,
        dismissedCount: 0,
      };
    }
  };

  const getUniqueCategories = (): string[] => {
    try {
      // Validate recommendations before extracting categories
      const validRecommendations = recommendations.filter(
        isValidRecommendation
      );

      const categories = new Set(
        validRecommendations
          .map(r => r.category)
          .filter(
            category => category && typeof category === 'string'
          ) as string[]
      );
      return Array.from(categories);
    } catch (error) {
      console.error(
        '[AnalysisResults] Error getting unique categories:',
        error
      );
      return []; // Return empty array on error
    }
  };

  // Show loading state for initial analysis load
  if (isLoading.analysis) {
    return (
      <div className="results-loading">
        <div className="loading-spinner"></div>
        <p>Loading analysis results...</p>
      </div>
    );
  }

  // Show error state for critical errors (analysis not found, etc.)
  if (error && error.type === 'analysis') {
    return (
      <div className="results-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Analysis</h3>
        <p>{error.message}</p>
        {error.details && (
          <details className="error-details">
            <summary>Technical Details</summary>
            <pre>{error.details}</pre>
          </details>
        )}
        <div className="error-actions">
          {error.retryable && (
            <Button variant="secondary" onClick={handleRetry}>
              Retry
            </Button>
          )}
          <Button variant="primary" onClick={onBack}>
            Go Back
          </Button>
        </div>
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
      {/* Error notification for non-critical errors */}
      {error && error.type !== 'analysis' && (
        <div className="error-notification">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <div className="error-text">
              <strong>Error loading {error.type}:</strong> {error.message}
            </div>
            {error.retryable && (
              <Button variant="ghost" size="small" onClick={handleRetry}>
                Retry
              </Button>
            )}
            <Button variant="ghost" size="small" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

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

            {isLoading.quickwins ? (
              <Card className="quick-wins-card">
                <h3 className="card-title">🚀 Quick Wins</h3>
                <div className="loading-content">
                  <div className="loading-spinner small"></div>
                  <p>Loading quick wins...</p>
                </div>
              </Card>
            ) : quickWins.length > 0 ? (
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
            ) : error?.type === 'quickwins' ? (
              <Card className="quick-wins-card">
                <h3 className="card-title">🚀 Quick Wins</h3>
                <div className="error-content">
                  <p>Failed to load quick wins: {error.message}</p>
                  {error.retryable && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handleRetry}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </Card>
            ) : null}
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
                  {isLoading.recommendations ? (
                    <div className="loading-badge">
                      <div className="loading-spinner small"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <Badge variant="info">
                      {filteredRecommendations.length} of{' '}
                      {recommendations.length}
                    </Badge>
                  )}
                </div>

                {isLoading.recommendations ? (
                  <div className="recommendations-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading recommendations...</p>
                  </div>
                ) : error?.type === 'recommendations' ? (
                  <div className="recommendations-error">
                    <div className="error-icon">⚠️</div>
                    <h4>Failed to Load Recommendations</h4>
                    <p>{error.message}</p>
                    {error.retryable && (
                      <Button variant="secondary" onClick={handleRetry}>
                        Retry Loading Recommendations
                      </Button>
                    )}
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="recommendations-empty">
                    <div className="empty-icon">💡</div>
                    <h4>No Recommendations Available</h4>
                    <p>
                      This analysis does not have any recommendations to
                      display.
                    </p>
                  </div>
                ) : (
                  <RecommendationsList
                    recommendations={filteredRecommendations as any}
                    onUpdateStatus={handleUpdateRecommendationStatus}
                  />
                )}
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
                {isLoading.comparison ? (
                  <Card className="comparison-loading-state">
                    <div className="loading-content">
                      <div className="loading-spinner"></div>
                      <p>Loading comparison data...</p>
                    </div>
                  </Card>
                ) : error?.type === 'comparison' ? (
                  <Card className="comparison-error-state">
                    <div className="error-content">
                      <div className="error-icon">⚠️</div>
                      <h3>Error Loading Comparison</h3>
                      <p>{error.message}</p>
                      {error.retryable && (
                        <Button variant="secondary" onClick={handleRetry}>
                          Retry Loading Comparison
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : comparisonAnalysis ? (
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
