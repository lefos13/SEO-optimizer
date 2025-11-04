/**
 * Settings Hook
 * Custom hook for managing application settings
 */
import { useState, useEffect, useCallback } from 'react';
import type {
  AllSettings,
  AppInfo,
  ExportData,
  ImportResult,
} from '../../types/settings.types';
import { DEFAULT_SETTINGS } from '../../types/settings.types';

interface UseSettingsReturn {
  settings: AllSettings;
  appInfo: AppInfo | null;
  loading: boolean;
  error: string | null;

  // Settings management
  updateSettings: (newSettings: Partial<AllSettings>) => void;
  resetSettings: () => void;

  // Database operations
  clearDatabase: () => Promise<void>;
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<ImportResult>;

  // App info
  refreshAppInfo: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<AllSettings>(DEFAULT_SETTINGS);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('seo-optimizer-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (err) {
      console.warn('Failed to load settings from localStorage:', err);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('seo-optimizer-settings', JSON.stringify(settings));
    } catch (err) {
      console.warn('Failed to save settings to localStorage:', err);
    }
  }, [settings]);

  // Load app info on mount
  useEffect(() => {
    refreshAppInfo();
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AllSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      // Deep merge for nested objects
      analysis: { ...prev.analysis, ...newSettings.analysis },
      database: { ...prev.database, ...newSettings.database },
      app: { ...prev.app, ...newSettings.app },
      performance: { ...prev.performance, ...newSettings.performance },
      seoRules: { ...prev.seoRules, ...newSettings.seoRules },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('seo-optimizer-settings');
  }, []);

  const clearDatabase = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await window.electronAPI.settings.clearDatabase();

      if (!result.success) {
        throw new Error(result.message || 'Failed to clear database');
      }

      // Refresh app info after clearing
      await refreshAppInfo();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear database';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const exportData =
        (await window.electronAPI.settings.exportData()) as ExportData;

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `seo-optimizer-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const importData = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      const text = await file.text();
      const importData = JSON.parse(text) as ExportData;

      const result = (await window.electronAPI.settings.importData(
        importData
      )) as ImportResult;

      if (!result.success) {
        throw new Error('Failed to import data');
      }

      // Refresh app info after import
      await refreshAppInfo();

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to import data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAppInfo = useCallback(async () => {
    try {
      const info = (await window.electronAPI.settings.getAppInfo()) as AppInfo;
      setAppInfo(info);
    } catch (err) {
      console.warn('Failed to load app info:', err);
    }
  }, []);

  return {
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
  };
};

export default useSettings;
