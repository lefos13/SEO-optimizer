/**
 * Settings View
 * Application configuration and preferences
 */
import React, { useState, useRef } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Toggle from '../ui/Toggle';
import Select from '../ui/Select';
import DiagnosticDashboard from '../ui/DiagnosticDashboard';
import useSettings from '../../hooks/useSettings';

const Settings: React.FC = () => {
  const {
    settings,
    appInfo,
    loading,
    error,
    updateSettings,
    resetSettings,
    clearDatabase,
    exportData,
    importData,
    refreshAppInfo,
  } = useSettings();

  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleClearDatabase = async () => {
    try {
      await clearDatabase();
      setShowConfirmClear(false);
      showNotification('success', 'Database cleared successfully');
    } catch (err) {
      showNotification(
        'error',
        err instanceof Error ? err.message : 'Failed to clear database'
      );
    }
  };

  const handleExportData = async () => {
    try {
      await exportData();
      showNotification('success', 'Data exported successfully');
    } catch (err) {
      showNotification(
        'error',
        err instanceof Error ? err.message : 'Failed to export data'
      );
    }
  };

  const handleImportData = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importData(file);
      showNotification('success', 'Data imported successfully');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      showNotification(
        'error',
        err instanceof Error ? err.message : 'Failed to import data'
      );
    }
  };

  const handleSaveSettings = () => {
    showNotification('success', 'Settings saved successfully');
  };

  const handleResetSettings = () => {
    resetSettings();
    showNotification('success', 'Settings reset to defaults');
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">Settings</h1>
        <p className="view-subtitle">
          Configure your SEO Optimizer preferences
        </p>
      </div>

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {error && <div className="notification notification-error">{error}</div>}

      <div className="settings-grid">
        <Card title="Application Settings">
          <div className="form-group">
            <Select
              label="Application Language"
              value={settings.app.language}
              onChange={value =>
                updateSettings({
                  app: { ...settings.app, language: value as 'en' | 'el' },
                })
              }
              options={[
                { value: 'en', label: 'English' },
                { value: 'el', label: 'Greek (Ελληνικά)' },
              ]}
              fullWidth
              description="Language for the application interface"
            />
          </div>

          <div className="form-group">
            <Select
              label="Theme"
              value={settings.app.theme}
              onChange={value =>
                updateSettings({
                  app: {
                    ...settings.app,
                    theme: value as 'dark' | 'light' | 'system',
                  },
                })
              }
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
                { value: 'system', label: 'System Default' },
              ]}
              fullWidth
              description="Choose your preferred color theme"
            />
          </div>

          <div className="form-group">
            <Toggle
              id="auto-updates"
              checked={settings.app.autoUpdates}
              onChange={checked =>
                updateSettings({
                  app: { ...settings.app, autoUpdates: checked },
                })
              }
              label="Enable automatic updates"
              description="Automatically download and install updates"
            />
          </div>

          <div className="form-group">
            <Toggle
              id="notifications"
              checked={settings.app.notifications}
              onChange={checked =>
                updateSettings({
                  app: { ...settings.app, notifications: checked },
                })
              }
              label="Enable notifications"
              description="Show notifications for analysis completion and other events"
            />
          </div>
        </Card>

        <Card title="Analysis Settings">
          <div className="form-group">
            <Select
              label="Default Analysis Language"
              value={settings.analysis.defaultLanguage}
              onChange={value =>
                updateSettings({
                  analysis: {
                    ...settings.analysis,
                    defaultLanguage: value as 'en' | 'el',
                  },
                })
              }
              options={[
                { value: 'en', label: 'English' },
                { value: 'el', label: 'Greek (Ελληνικά)' },
              ]}
              fullWidth
              description="Default language for SEO analysis"
            />
          </div>

          <div className="form-group">
            <Input
              label="Minimum Content Length"
              value={settings.analysis.minContentLength.toString()}
              onChange={e =>
                updateSettings({
                  analysis: {
                    ...settings.analysis,
                    minContentLength: parseInt(e.target.value) || 300,
                  },
                })
              }
              type="number"
              min="100"
              max="10000"
              fullWidth
              description="Minimum word count for content analysis warnings"
            />
          </div>

          <div className="form-group">
            <Input
              label="Target Keyword Density (%)"
              value={settings.analysis.targetKeywordDensity.toString()}
              onChange={e =>
                updateSettings({
                  analysis: {
                    ...settings.analysis,
                    targetKeywordDensity: parseFloat(e.target.value) || 2.5,
                  },
                })
              }
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              fullWidth
              description="Optimal keyword density percentage for SEO"
            />
          </div>

          <div className="form-group">
            <Input
              label="Analysis Timeout (seconds)"
              value={(settings.analysis.analysisTimeout / 1000).toString()}
              onChange={e =>
                updateSettings({
                  analysis: {
                    ...settings.analysis,
                    analysisTimeout: (parseInt(e.target.value) || 30) * 1000,
                  },
                })
              }
              type="number"
              min="5"
              max="300"
              fullWidth
              description="Maximum time to wait for URL fetching and analysis"
            />
          </div>

          <div className="form-group">
            <Toggle
              id="auto-save"
              checked={settings.analysis.autoSaveResults}
              onChange={checked =>
                updateSettings({
                  analysis: { ...settings.analysis, autoSaveResults: checked },
                })
              }
              label="Auto-save analysis results"
              description="Automatically save analysis results to database"
            />
          </div>

          <div className="form-group">
            <Toggle
              id="readability"
              checked={settings.analysis.includeReadability}
              onChange={checked =>
                updateSettings({
                  analysis: {
                    ...settings.analysis,
                    includeReadability: checked,
                  },
                })
              }
              label="Include readability analysis"
              description="Analyze content readability and provide improvement suggestions"
            />
          </div>

          <div className="form-group">
            <Toggle
              id="duplicate-content"
              checked={settings.analysis.checkDuplicateContent}
              onChange={checked =>
                updateSettings({
                  analysis: {
                    ...settings.analysis,
                    checkDuplicateContent: checked,
                  },
                })
              }
              label="Check for duplicate content"
              description="Detect and warn about duplicate content issues"
            />
          </div>
        </Card>

        <Card title="Database Management">
          <div className="form-group">
            <Input
              label="Database Location"
              value={settings.database.location}
              fullWidth
              readOnly
              description="Current database file location (read-only)"
            />
          </div>

          {appInfo && (
            <div className="database-stats">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Projects:</span>
                  <span className="stat-value">
                    {appInfo.database.projects}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Analyses:</span>
                  <span className="stat-value">
                    {appInfo.database.analyses}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Rules:</span>
                  <span className="stat-value">{appInfo.database.rules}</span>
                </div>
              </div>
            </div>
          )}

          <div className="button-group">
            <Button
              variant="secondary"
              onClick={handleExportData}
              disabled={loading}
            >
              📤 Export Data
            </Button>
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              📥 Import Data
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowConfirmClear(true)}
              disabled={loading}
            >
              🗑️ Clear Database
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportData}
            style={{ display: 'none' }}
          />

          {showConfirmClear && (
            <div className="confirm-dialog">
              <p>
                <strong>⚠️ Warning:</strong> This will permanently delete all
                your data including projects, analyses, and results. This action
                cannot be undone.
              </p>
              <div className="button-group">
                <Button
                  variant="danger"
                  onClick={handleClearDatabase}
                  disabled={loading}
                >
                  Yes, Clear Database
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirmClear(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card title="Performance Settings">
          <div className="form-group">
            <Input
              label="Cache Duration (minutes)"
              value={settings.performance.cacheDuration.toString()}
              onChange={e =>
                updateSettings({
                  performance: {
                    ...settings.performance,
                    cacheDuration: parseInt(e.target.value) || 60,
                  },
                })
              }
              type="number"
              min="1"
              max="1440"
              fullWidth
              description="How long to cache analysis results"
            />
          </div>

          <div className="form-group">
            <Input
              label="Max Concurrent Analyses"
              value={settings.performance.maxConcurrentAnalyses.toString()}
              onChange={e =>
                updateSettings({
                  performance: {
                    ...settings.performance,
                    maxConcurrentAnalyses: parseInt(e.target.value) || 3,
                  },
                })
              }
              type="number"
              min="1"
              max="10"
              fullWidth
              description="Maximum number of analyses to run simultaneously"
            />
          </div>

          <div className="form-group">
            <Input
              label="Memory Limit (MB)"
              value={settings.performance.memoryLimit.toString()}
              onChange={e =>
                updateSettings({
                  performance: {
                    ...settings.performance,
                    memoryLimit: parseInt(e.target.value) || 512,
                  },
                })
              }
              type="number"
              min="128"
              max="4096"
              fullWidth
              description="Maximum memory usage for analysis processes"
            />
          </div>
        </Card>

        <Card title="About">
          {appInfo && (
            <div className="about-info">
              <div className="about-item">
                <strong>Application:</strong> {appInfo.name} v{appInfo.version}
              </div>
              <div className="about-item">
                <strong>License:</strong> {appInfo.license}
              </div>
              <div className="about-item">
                <strong>Platform:</strong> {appInfo.platform.os} (
                {appInfo.platform.arch})
              </div>
              <div className="about-item">
                <strong>Node.js:</strong> {appInfo.platform.node}
              </div>
              <p className="text-muted mt-3">{appInfo.description}</p>
              <Button
                variant="secondary"
                size="small"
                onClick={refreshAppInfo}
                disabled={loading}
              >
                🔄 Refresh Info
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Diagnostic Dashboard */}
      <DiagnosticDashboard />

      <div className="settings-actions">
        <Button
          variant="primary"
          size="large"
          onClick={handleSaveSettings}
          disabled={loading}
        >
          💾 Save Settings
        </Button>
        <Button
          variant="secondary"
          size="large"
          onClick={handleResetSettings}
          disabled={loading}
        >
          ↩️ Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default Settings;
