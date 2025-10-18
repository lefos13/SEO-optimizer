/**
 * Analysis View
 * Enhanced content analysis interface with multiple input methods
 * Features:
 * - Multiple input methods (URL, text, file)
 * - Target keywords management
 * - Analysis configuration
 * - Real-time progress tracking
 * - Results display
 * - Project selection
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ContentInput from '../analysis/ContentInput';
import KeywordsInput from '../analysis/KeywordsInput';
import AnalysisConfig from '../analysis/AnalysisConfig';
import AnalysisProgress from '../analysis/AnalysisProgress';

const Analysis = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [config, setConfig] = useState({
    language: 'en',
    contentType: 'article',
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState('init');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [resetKey, setResetKey] = useState(0); // Force component remount on reset

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await window.electronAPI.projects.getAll({
          limit: 100,
        });
        setProjects(projectsData || []);
        // Set first project as default
        if (projectsData && projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].id);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    loadProjects();
  }, []);

  const validateInputs = () => {
    if (!content || content.trim().length < 50) {
      setError('Please provide at least 50 characters of content to analyze.');
      return false;
    }

    setError('');
    return true;
  };

  const handleAnalyze = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsAnalyzing(true);
    setCurrentStage('init');
    setProgress(0);

    try {
      // Stage 1: Initialize

      console.log('🔍 [ANALYSIS] Stage 1: Initializing...');
      setCurrentStage('init');
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 2: Content Analysis

      console.log(
        '📝 [ANALYSIS] Stage 2: Content Analysis - Preparing data...'
      );
      setCurrentStage('content');
      setProgress(30);

      // Format data for backend analyzer
      // Wrap plain text content in basic HTML structure for proper parsing
      const htmlContent = content.startsWith('<')
        ? content // Already HTML
        : `<html><head><title></title></head><body><p>${content.replace(/\n/g, '</p><p>')}</p></body></html>`;

      console.log(
        '📝 [ANALYSIS] Content wrapped as HTML, length:',
        htmlContent.length
      );

      const analysisData = {
        html: htmlContent,
        keywords: keywords.join(','), // Backend expects comma-separated string
        language: config.language || 'en',
        url: url || '',
      };

      console.log('📝 [ANALYSIS] Analysis data prepared:', {
        htmlLength: analysisData.html.length,
        keywords: analysisData.keywords,
        language: analysisData.language,
        url: analysisData.url,
      });

      // Call the SEO analyzer via IPC

      console.log('📤 [ANALYSIS] Calling SEO analyzer via IPC...');
      const result = await window.electronAPI.seo.analyze(analysisData);

      console.log('✅ [ANALYSIS] SEO analyzer returned results:', {
        score: result.score,
        percentage: result.percentage,
        grade: result.grade,
        passedRules: result.passedRules,
        failedRules: result.failedRules,
        issuesCount: result.issues?.length || 0,
        recommendationsCount: result.recommendations?.length || 0,
        enhancedRecommendationsCount:
          result.enhancedRecommendations?.recommendations?.length || 0,
      });

      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Stage 3: Keywords

      console.log('🔤 [ANALYSIS] Stage 3: Keyword analysis...');
      setCurrentStage('keywords');
      setProgress(65);
      await new Promise(resolve => setTimeout(resolve, 400));

      // Stage 4: Technical

      console.log('⚙️ [ANALYSIS] Stage 4: Technical analysis...');
      setCurrentStage('technical');
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 400));

      // Stage 5: Recommendations

      console.log('💡 [ANALYSIS] Stage 5: Generating recommendations...');
      setCurrentStage('recommendations');
      setProgress(95);

      // Get the selected project ID for this analysis

      console.log('🔍 [ANALYSIS] Using selected project:', selectedProjectId);
      const projectId = selectedProjectId || 1; // Use selected or fallback to 1

      console.log('✅ [ANALYSIS] Project ID resolved:', projectId);

      // Save analysis to database with correct schema fields

      console.log('💾 [ANALYSIS] Creating analysis record in database...');
      const savedAnalysis = await window.electronAPI.analyses.create({
        project_id: projectId,
        content: htmlContent, // The HTML content we analyzed
        language: config.language || 'en',
        title: analysisData.title || url || 'Direct Input',
        meta_description: analysisData.description || '',
        keywords: keywords.join(','), // Comma-separated keywords
        url: url || '', // The URL that was analyzed (empty string if direct input)
      });

      console.log('✅ [ANALYSIS] Analysis record created:', {
        id: savedAnalysis?.id,
        projectId: savedAnalysis?.project_id,
        hasId: !!savedAnalysis?.id,
      });

      // Update the analysis with the calculated score and all analysis data
      if (savedAnalysis && savedAnalysis.id) {
        console.log('📊 [ANALYSIS] Updating analysis with full results:', {
          score: result.score,
          maxScore: result.maxScore,
          percentage: result.percentage,
          grade: result.grade,
          categoryScores: result.categoryScores,
        });

        // Prepare category scores for storage (as JSON string)
        const categoryScoresJson = result.categoryScores
          ? JSON.stringify(result.categoryScores)
          : null;

        await window.electronAPI.analyses.update(savedAnalysis.id, {
          overall_score: result.score || 0,
          max_score: result.maxScore || 0,
          percentage: result.percentage || 0,
          grade: result.grade || 'F',
          passed_rules: result.passedRules || 0,
          failed_rules: result.failedRules || 0,
          warnings: result.warnings || 0,
          category_scores: categoryScoresJson,
        });

        console.log('✅ [ANALYSIS] Full analysis data saved successfully');
      }

      // Save recommendations to database
      if (savedAnalysis && savedAnalysis.id && result.enhancedRecommendations) {
        console.log(
          '💾 [ANALYSIS] Saving recommendations to database, count:',
          result.enhancedRecommendations.recommendations?.length || 0
        );
        await window.electronAPI.seo.saveRecommendations(
          savedAnalysis.id,
          result.enhancedRecommendations
        );

        console.log('✅ [ANALYSIS] Recommendations saved successfully');
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      // Complete

      console.log('🎉 [ANALYSIS] Analysis complete!');
      setCurrentStage('complete');
      setProgress(100);

      // Navigate to results
      if (savedAnalysis && savedAnalysis.id) {
        console.log(
          '📍 [ANALYSIS] Navigating to results page, ID:',
          savedAnalysis.id
        );
        setTimeout(() => {
          navigate(`/analysis/results/${savedAnalysis.id}`);
        }, 500);
      } else {
        console.error('❌ [ANALYSIS] Analysis completed but no ID received');
        setError('Analysis completed but failed to save results.');
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error('❌ [ANALYSIS] Analysis error:', err);
      setError(
        err.message ||
          'Analysis failed. Please check your content and try again.'
      );
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = content && content.trim().length >= 50;

  const selectedProject =
    projects.find(project => project.id === selectedProjectId) || null;
  const projectCount = projects.length;

  return (
    <div className="view-container analysis-view">
      <div className="view-header">
        <h1 className="view-title">Content Analysis</h1>
        <p className="view-subtitle">
          Analyze your content for SEO optimization with AI-powered
          recommendations
        </p>
      </div>

      {/* Project Selector */}
      {!isAnalyzing && (
        <Card className="project-selector-card">
          <div className="project-selector-content">
            <div className="project-selector-header">
              <div className="project-selector-title">
                <span className="project-selector-icon">📁</span>
                <div className="project-selector-copy">
                  <h3>Current Project</h3>
                  <p>Choose where this analysis will be saved.</p>
                </div>
              </div>
              {projectCount > 0 && (
                <Badge variant="primary" size="large">
                  {projectCount} {projectCount === 1 ? 'Project' : 'Projects'}
                </Badge>
              )}
            </div>

            <div className="project-selector-body">
              {selectedProject ? (
                <div className="selected-project">
                  <h4 className="selected-project-name">
                    {selectedProject.name}
                  </h4>
                  {selectedProject.description ? (
                    <p className="selected-project-description">
                      {selectedProject.description}
                    </p>
                  ) : (
                    <p className="selected-project-hint">
                      All analyses on this page will be saved to this project.
                    </p>
                  )}
                </div>
              ) : (
                <div className="no-project-selected">
                  <span className="status-icon">⚠️</span>
                  <div>
                    <strong>No project selected</strong>
                    <p>
                      Please create a project first to organize your analyses.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="project-selector-footer">
              {projectCount > 1 && (
                <div className="project-switcher">
                  <label
                    htmlFor="project-select"
                    className="project-switcher-label"
                  >
                    Switch Project
                  </label>
                  <div className="project-select-wrapper">
                    <select
                      id="project-select"
                      value={selectedProjectId || ''}
                      onChange={e =>
                        setSelectedProjectId(Number(e.target.value))
                      }
                      className="project-select"
                    >
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {projectCount === 1 && (
                <p className="project-selector-empty">
                  You currently have a single project. Create additional
                  projects from the dashboard to organize analyses by client or
                  website.
                </p>
              )}
              {projectCount === 0 && (
                <p className="project-selector-empty">
                  You currently haven&apos;t created a project. Create projects
                  from the dashboard to organize analyses by client or website.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {isAnalyzing ? (
        <Card className="analysis-progress-card">
          <AnalysisProgress
            isAnalyzing={isAnalyzing}
            currentStage={currentStage}
            progress={progress}
          />
        </Card>
      ) : (
        <div className="analysis-layout">
          {/* Left Column - Input */}
          {projectCount > 0 && (
            <div className="analysis-input-column">
              <Card title="Content Input" className="input-card">
                <ContentInput
                  key={`content-${resetKey}`}
                  onContentChange={setContent}
                  onUrlChange={setUrl}
                  initialContent={content}
                  initialUrl={url}
                />
              </Card>

              <Card title="Target Keywords" className="keywords-card">
                <KeywordsInput
                  key={`keywords-${resetKey}`}
                  keywords={keywords}
                  onChange={setKeywords}
                  content={content}
                />
              </Card>
            </div>
          )}

          {/* Right Column - Config & Action */}
          {projectCount > 0 && (
            <div className="analysis-config-column">
              <Card title="Analysis Settings" className="config-card">
                <AnalysisConfig
                  config={config}
                  onChange={setConfig}
                  content={content}
                />
              </Card>

              {/* Error Display */}
              {error && (
                <div className="analysis-error">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{error}</span>
                </div>
              )}

              {/* Analyze Button */}
              <div className="analysis-actions">
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleAnalyze}
                  disabled={!canAnalyze || isAnalyzing}
                  fullWidth
                >
                  {isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze Content'}
                </Button>

                {content && (
                  <Button
                    variant="secondary"
                    size="large"
                    onClick={() => {
                      setContent('');
                      setUrl('');
                      setKeywords([]);
                      setError('');
                      setResetKey(prev => prev + 1); // Force remount of child components
                    }}
                    fullWidth
                  >
                    🔄 Reset
                  </Button>
                )}
              </div>

              {/* Quick Stats */}
              {content && (
                <div className="analysis-quick-stats">
                  <div className="stat-item">
                    <span className="stat-label">Content Length:</span>
                    <span className="stat-value">
                      {content.trim().split(/\s+/).length} words
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Keywords:</span>
                    <span className="stat-value">{keywords.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Language:</span>
                    <span className="stat-value">
                      {config.language?.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analysis;
