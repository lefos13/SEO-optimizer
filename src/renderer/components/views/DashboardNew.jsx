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
import Input from '../ui/Input';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalAnalyses: 0,
    avgScore: 0,
    recentAnalyses: [],
  });

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    url: '',
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load projects
      const projectsData = await window.electronAPI.projects.getAll({
        limit: 10,
      });
      setProjects(projectsData || []);

      // Load database stats
      const dbStats = await window.electronAPI.database.getStats();

      // Calculate average score from recent analyses
      let recentAnalyses = [];
      if (projectsData && projectsData.length > 0) {
        // Get analyses for all projects (only for projects with valid IDs)
        const validProjects = projectsData.filter(
          project => project && project.id
        );
        if (validProjects.length > 0) {
          const analysesPromises = validProjects.map(project =>
            window.electronAPI.analyses.getByProject(project.id, { limit: 10 })
          );
          const analysesResults = await Promise.all(analysesPromises);
          recentAnalyses = analysesResults
            .flat()
            .map(analysis => ({
              ...analysis,
              project_id: analysis.project_id || analysis.projectId,
            }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
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
        totalAnalyses: dbStats?.totalAnalyses || 0,
        avgScore: Math.round(avgScore),
        recentAnalyses,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      alert('Please enter a project name');
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
      alert('Failed to create project');
    }
  };

  const handleDeleteProject = async projectId => {
    if (
      !confirm(
        'Are you sure you want to delete this project? All analyses will be deleted.'
      )
    ) {
      return;
    }

    try {
      await window.electronAPI.projects.delete(projectId);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const handleStartAnalysis = () => {
    // Check if there are any projects
    if (projects.length === 0) {
      // No projects, prompt user to create one first
      alert('Please create a project first before starting an analysis.');
      setShowNewProjectModal(true);
    } else {
      // Has projects, navigate to analysis page
      window.location.hash = '#/analysis';
    }
  };

  const getGradeVariant = percentage => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'info';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  const getGradeLetter = percentage => {
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
        <StatCard
          title="Quick Actions"
          value="Ready"
          subtitle="Start analyzing"
          icon="⚡"
          variant="success"
          onClick={handleStartAnalysis}
        />
      </div>

      {/* Recent Activity */}
      <div className="dashboard-content-grid">
        <Card title="Recent Analyses" className="recent-analyses-card">
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <h3>No analyses yet</h3>
              <p>
                Create a project and start analyzing content to see activity
                here.
              </p>
              <Button variant="primary" onClick={handleStartAnalysis}>
                {projects.length === 0
                  ? 'Create Project First'
                  : 'Start First Analysis'}
              </Button>
            </div>
          ) : stats.recentAnalyses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <h3>No analyses yet</h3>
              <p>Run an analysis to see results here.</p>
              <Button variant="primary" onClick={handleStartAnalysis}>
                Start First Analysis
              </Button>
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
                      <Badge variant="info">{projectAnalyses.length}</Badge>
                    </div>

                    <div className="project-analyses-list">
                      {projectAnalyses.map(analysis => (
                        <div key={analysis.id} className="analysis-item">
                          <div className="analysis-item-header">
                            <div className="analysis-item-title">
                              <h5>{analysis.title || 'Untitled Analysis'}</h5>
                              <span className="analysis-item-date">
                                {new Date(
                                  analysis.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <Badge
                              variant={getGradeVariant(
                                analysis.overall_score || 0
                              )}
                            >
                              {getGradeLetter(analysis.overall_score || 0)}
                            </Badge>
                          </div>
                          <ProgressBar
                            value={
                              analysis.percentage ||
                              Math.round(
                                (analysis.overall_score / analysis.max_score) *
                                  100
                              ) ||
                              0
                            }
                            max={100}
                            label="SEO Score"
                          />
                          <div className="analysis-item-meta">
                            <span>
                              Score:{' '}
                              {analysis.percentage ||
                                Math.round(
                                  (analysis.overall_score /
                                    analysis.max_score) *
                                    100
                                ) ||
                                0}
                              %
                            </span>
                            {analysis.language && (
                              <span>
                                Language: {analysis.language.toUpperCase()}
                              </span>
                            )}
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

        {/* Projects List */}
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
            <div className="project-list">
              {projects.map(project => (
                <div key={project.id} className="project-item">
                  <div className="project-item-header">
                    <div>
                      <h4 className="project-item-title">{project.name}</h4>
                      {project.description && (
                        <p className="project-item-description">
                          {project.description}
                        </p>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          className="project-item-url"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {project.url}
                        </a>
                      )}
                    </div>
                    <button
                      className="project-item-delete"
                      onClick={() => handleDeleteProject(project.id)}
                      aria-label="Delete project"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="project-item-meta">
                    <span>
                      Created{' '}
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
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
    </div>
  );
};

export default Dashboard;
