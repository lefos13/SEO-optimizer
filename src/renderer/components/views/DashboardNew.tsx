/**
 * Dashboard View - Main Application Dashboard
 * Features:
 * - Project management (create, list, delete)
 * - Analysis history display
 * - SEO score visualization
 * - Quick analysis entry
 * - Statistics overview
 */
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatCard from '../ui/StatCard';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import AlertModal from '../ui/AlertModal';
import Input from '../ui/Input';

interface Project {
  id: number;
  name: string;
  description?: string;
  url?: string;
  created_at: string;
}

interface Analysis {
  id: number;
  project_id: number;
  projectId?: number;
  title?: string;
  created_at: string;
  language?: string;
  overall_score?: number;
  max_score?: number;
  percentage?: number;
}

interface DashboardStats {
  totalProjects: number;
  totalAnalyses: number;
  avgScore: number;
  recentAnalyses: Analysis[];
}

interface DatabaseStats {
  analysisCount?: number;
}

interface NewProject {
  name: string;
  description: string;
  url: string;
}

interface AlertModalState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: 'info' | 'warning' | 'danger' | 'success';
  onConfirm: (() => Promise<void>) | null;
  confirmText: string;
  cancelText?: string;
  isDangerous?: boolean;
}

type TabType = 'recent' | 'projects';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalAnalyses: 0,
    avgScore: 0,
    recentAnalyses: [],
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('recent');
  const [showNewProjectModal, setShowNewProjectModal] =
    useState<boolean>(false);
  const [newProject, setNewProject] = useState<NewProject>({
    name: '',
    description: '',
    url: '',
  });
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    isDangerous: false,
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Load projects
      const projectsData = (await window.electronAPI.projects.getAll({
        limit: 10,
      })) as Project[];
      setProjects(projectsData || []);

      // Load database stats
      const dbStats =
        (await window.electronAPI.database.getStats()) as DatabaseStats;
      console.log('Database stats received:', dbStats);

      // Calculate average score from recent analyses
      let recentAnalyses: Analysis[] = [];
      if (projectsData && projectsData.length > 0) {
        // Get analyses for all projects (only for projects with valid IDs)
        const validProjects = projectsData.filter(
          project => project && project.id
        );
        if (validProjects.length > 0) {
          const analysesPromises = validProjects.map(project =>
            window.electronAPI.analyses.getByProject(project.id, { limit: 10 })
          );
          const analysesResults = (await Promise.all(
            analysesPromises
          )) as Analysis[][];
          recentAnalyses = analysesResults
            .flat()
            .map(analysis => ({
              ...analysis,
              project_id: analysis.project_id || analysis.projectId || 0,
            }))
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 20); // Get more to ensure we have enough per project
        }
      }

      // Calculate average score from percentage field (0-100 range)
      const avgScore =
        recentAnalyses.length > 0
          ? recentAnalyses.reduce((sum, a) => sum + (a.percentage || 0), 0) /
            recentAnalyses.length
          : 0;

      setStats({
        totalProjects: projectsData?.length || 0,
        totalAnalyses: dbStats?.analysisCount || 0,
        avgScore: Math.round(avgScore),
        recentAnalyses,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (): Promise<void> => {
    if (!newProject.name.trim()) {
      setAlertModal({
        isOpen: true,
        title: 'Project Name Required',
        message: 'Please enter a project name to create a new project.',
        variant: 'warning',
        onConfirm: null,
        confirmText: 'OK',
      });
      return;
    }

    try {
      await window.electronAPI.projects.create({
        name: newProject.name,
        description: newProject.description,
        url: newProject.url,
      });

      setNewProject({ name: '', description: '', url: '' });
      setShowNewProjectModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to create project:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setAlertModal({
        isOpen: true,
        title: 'Failed to Create Project',
        message:
          errorMessage || 'An error occurred while creating the project.',
        variant: 'danger',
        onConfirm: null,
        confirmText: 'OK',
      });
    }
  };

  const handleDeleteProject = async (projectId: number): Promise<void> => {
    setAlertModal({
      isOpen: true,
      title: 'Delete Project?',
      message:
        'Are you sure you want to delete this project? All analyses will be permanently deleted. This action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await window.electronAPI.projects.delete(projectId);
          setAlertModal({ ...alertModal, isOpen: false });
          loadDashboardData();
        } catch (error) {
          console.error('Failed to delete project:', error);
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          setAlertModal({
            isOpen: true,
            title: 'Failed to Delete Project',
            message:
              errorMessage || 'An error occurred while deleting the project.',
            variant: 'danger',
            onConfirm: null,
            confirmText: 'OK',
          });
        }
      },
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true,
    });
  };

  const handleStartAnalysis = (): void => {
    // Check if there are any projects
    if (projects.length === 0) {
      setShowNewProjectModal(true);
    } else {
      // Has projects, navigate to analysis page
      window.location.hash = '#/analysis';
    }
  };

  const getGradeVariant = (
    percentage: number
  ): 'success' | 'info' | 'warning' | 'danger' => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'info';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  const getGradeLetter = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  if (isLoading) {
    return (
      <div className="view-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Dashboard</h1>
          <p className="view-subtitle">
            SEO Analysis Overview and Quick Actions
          </p>
        </div>
        <div className="view-header-actions">
          <Button
            variant="secondary"
            onClick={() => setShowNewProjectModal(true)}
          >
            + New Project
          </Button>
          <Button variant="primary" onClick={handleStartAnalysis}>
            🔍 Start Analysis
          </Button>
        </div>
      </div>

      {/* No Projects Notice */}
      {projects.length === 0 && (
        <Card className="notice-card notice-info">
          <div className="notice-content">
            <div className="notice-icon">ℹ️</div>
            <div className="notice-text">
              <h3>Get Started</h3>
              <p>
                Create your first project to organize your SEO analyses. Each
                project can track multiple analyses over time, helping you
                monitor improvements.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowNewProjectModal(true)}
            >
              Create First Project
            </Button>
          </div>
        </Card>
      )}

      {/* Statistics Overview */}
      <div className="dashboard-stats-grid">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          subtitle="Active projects"
          icon="📁"
          variant="primary"
        />
        <StatCard
          title="Analyses Performed"
          value={stats.totalAnalyses}
          subtitle="Content pieces analyzed"
          icon="📊"
          variant="info"
        />
        <StatCard
          title="Average SEO Score"
          value={stats.avgScore > 0 ? `${stats.avgScore}%` : '--'}
          subtitle={
            stats.avgScore > 0
              ? `Grade ${getGradeLetter(stats.avgScore)}`
              : 'No data yet'
          }
          icon="⭐"
          variant={getGradeVariant(stats.avgScore)}
        />
      </div>

      {/* Tab Navigation */}
      {projects.length > 0 && (
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            <span className="tab-icon">📊</span> Recent Analyses
          </button>
          <button
            className={`dashboard-tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <span className="tab-icon">📁</span> Your Projects
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Recent Analyses Tab */}
        {(activeTab === 'recent' || projects.length === 0) && (
          <Card title="Recent Analyses" className="recent-analyses-card">
            {projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <h3>No projects or analyses yet</h3>
                <p>
                  Create your first project and start analyzing content to track
                  SEO performance.
                </p>
                <div className="empty-state-actions">
                  <Button
                    variant="primary"
                    onClick={() => setShowNewProjectModal(true)}
                  >
                    Create Your First Project
                  </Button>
                </div>
              </div>
            ) : stats.recentAnalyses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <h3>No analyses performed yet</h3>
                <p>
                  Run your first SEO analysis to get insights and improvement
                  recommendations for your content.
                </p>
                <div className="empty-state-actions">
                  <Button variant="primary" onClick={handleStartAnalysis}>
                    Start Your First Analysis
                  </Button>
                </div>
              </div>
            ) : (
              <div className="analysis-by-project">
                {projects.map(project => {
                  const projectAnalyses = stats.recentAnalyses.filter(
                    a => a.project_id === project.id
                  );

                  if (projectAnalyses.length === 0) {
                    return null; // Skip projects with no analyses
                  }

                  return (
                    <div key={project.id} className="project-analysis-section">
                      <div className="project-section-header">
                        <h4 className="project-section-title">
                          📁 {project.name}
                        </h4>
                        <div className="project-section-meta">
                          <Badge variant="info">{projectAnalyses.length}</Badge>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() =>
                              (window.location.hash = '#/analysis')
                            }
                          >
                            New Analysis
                          </Button>
                        </div>
                      </div>

                      <div className="project-analyses-list">
                        {projectAnalyses.map(analysis => (
                          <div key={analysis.id} className="analysis-item">
                            <div className="analysis-item-header">
                              <div className="analysis-item-title">
                                <h5>{analysis.title || 'Untitled Analysis'}</h5>
                                <div className="analysis-item-details">
                                  <span className="analysis-item-date">
                                    <span className="detail-icon">📅</span>
                                    {new Date(
                                      analysis.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                  {analysis.language && (
                                    <span className="analysis-item-language">
                                      <span className="detail-icon">🌐</span>
                                      {analysis.language.toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge
                                variant={getGradeVariant(
                                  analysis.percentage ||
                                    (analysis.overall_score &&
                                    analysis.max_score
                                      ? Math.round(
                                          (analysis.overall_score /
                                            analysis.max_score) *
                                            100
                                        )
                                      : 0)
                                )}
                                size="large"
                              >
                                {getGradeLetter(
                                  analysis.percentage ||
                                    (analysis.overall_score &&
                                    analysis.max_score
                                      ? Math.round(
                                          (analysis.overall_score /
                                            analysis.max_score) *
                                            100
                                        )
                                      : 0)
                                )}
                              </Badge>
                            </div>
                            <ProgressBar
                              value={
                                analysis.percentage ||
                                (analysis.overall_score && analysis.max_score
                                  ? Math.round(
                                      (analysis.overall_score /
                                        analysis.max_score) *
                                        100
                                    )
                                  : 0) ||
                                0
                              }
                              max={100}
                              label="SEO Score"
                            />
                            <div className="analysis-item-meta">
                              <span className="score-value">
                                Score:{' '}
                                <strong>
                                  {analysis.percentage ||
                                    (analysis.overall_score &&
                                    analysis.max_score
                                      ? Math.round(
                                          (analysis.overall_score /
                                            analysis.max_score) *
                                            100
                                        )
                                      : 0) ||
                                    0}
                                  %
                                </strong>
                              </span>
                            </div>
                            <div className="analysis-item-actions">
                              <Button
                                variant="primary"
                                size="small"
                                onClick={() =>
                                  (window.location.hash = `#/analysis/results/${analysis.id}`)
                                }
                              >
                                📊 View Results
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <Card title="Your Projects" className="projects-card">
            {projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📁</div>
                <h3>No projects yet</h3>
                <p>Create your first project to organize your SEO analyses.</p>
                <Button
                  variant="primary"
                  onClick={() => setShowNewProjectModal(true)}
                >
                  Create First Project
                </Button>
              </div>
            ) : (
              <>
                <div className="projects-header">
                  <div className="projects-count">
                    <Badge variant="primary" size="large">
                      {projects.length}{' '}
                      {projects.length === 1 ? 'Project' : 'Projects'}
                    </Badge>
                  </div>
                  <div className="projects-actions">
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => setShowNewProjectModal(true)}
                    >
                      + Add Project
                    </Button>
                  </div>
                </div>

                <div className="project-grid">
                  {projects.map(project => {
                    // Find analyses for this project
                    const projectAnalyses = stats.recentAnalyses.filter(
                      a => a.project_id === project.id
                    );

                    // Calculate project score if available
                    let projectScore = 0;
                    let scoreLabel = '--';

                    if (projectAnalyses.length > 0) {
                      const totalScore = projectAnalyses.reduce(
                        (sum, analysis) =>
                          sum +
                          (analysis.percentage ||
                            (analysis.overall_score && analysis.max_score
                              ? (analysis.overall_score / analysis.max_score) *
                                100
                              : 0)),
                        0
                      );
                      projectScore = Math.round(
                        totalScore / projectAnalyses.length
                      );
                      scoreLabel = `${projectScore}%`;
                    }

                    return (
                      <div key={project.id} className="project-card">
                        <div className="project-card-header">
                          <div className="project-info">
                            <h3 className="project-title">{project.name}</h3>
                            {projectAnalyses.length > 0 ? (
                              <Badge variant={getGradeVariant(projectScore)}>
                                Grade {getGradeLetter(projectScore)}
                              </Badge>
                            ) : (
                              <Badge variant="default">No Analyses</Badge>
                            )}
                          </div>
                          <div className="project-actions">
                            <button
                              className="icon-button edit-button"
                              aria-label="Edit project"
                              onClick={() => {
                                setNewProject({
                                  name: project.name,
                                  description: project.description || '',
                                  url: project.url || '',
                                });
                                setShowNewProjectModal(true);
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              className="icon-button delete-button"
                              onClick={() => handleDeleteProject(project.id)}
                              aria-label="Delete project"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div className="project-card-body">
                          {project.description && (
                            <p className="project-description">
                              {project.description}
                            </p>
                          )}

                          {project.url && (
                            <a
                              href={project.url}
                              className="project-url"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              🔗 {project.url}
                            </a>
                          )}

                          <div className="project-stats">
                            <div className="project-stat">
                              <span className="stat-label">Analyses</span>
                              <span className="stat-value">
                                {projectAnalyses.length}
                              </span>
                            </div>
                            <div className="project-stat">
                              <span className="stat-label">Avg. Score</span>
                              <span className="stat-value">{scoreLabel}</span>
                            </div>
                            <div className="project-stat">
                              <span className="stat-label">Created</span>
                              <span className="stat-value">
                                {new Date(
                                  project.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="project-card-footer">
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => {
                              window.location.hash = '#/analysis';
                            }}
                          >
                            Analyze Content
                          </Button>

                          {projectAnalyses.length > 0 && (
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => {
                                setActiveTab('recent');
                              }}
                            >
                              View Analyses
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
        )}
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        closeOnOverlayClick={false}
        title="Create New Project"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowNewProjectModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateProject}>
              Create Project
            </Button>
          </>
        }
      >
        <div className="modal-form">
          <Input
            label="Project Name"
            value={newProject.name}
            onChange={e =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            placeholder="My Website SEO"
            required
          />
          <Input
            label="Description (Optional)"
            value={newProject.description}
            onChange={e =>
              setNewProject({ ...newProject, description: e.target.value })
            }
            placeholder="Brief description of this project"
          />
          <Input
            label="Website URL (Optional)"
            value={newProject.url}
            onChange={e =>
              setNewProject({ ...newProject, url: e.target.value })
            }
            placeholder="https://example.com"
            type="url"
          />
        </div>
      </Modal>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        onConfirm={
          alertModal.onConfirm
            ? () => {
                alertModal.onConfirm?.();
              }
            : undefined
        }
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
        isDangerous={alertModal.isDangerous}
      />
    </div>
  );
};

export default Dashboard;
