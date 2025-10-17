const { ipcMain } = require('electron');
const DatabaseOperations = require('./dbOperations');

/**
 * IPC Handlers for Database Operations
 * Sets up all electron IPC handlers for database communication
 */
class IPCHandlers {
  /**
   * Register all IPC handlers
   */
  static registerHandlers() {
    // ============ PROJECTS ============
    ipcMain.handle('db:project:create', (event, projectData) => {
      try {
        return DatabaseOperations.createProject(projectData);
      } catch (error) {
        throw new Error(`Create project failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:project:get', (event, projectId) => {
      try {
        return DatabaseOperations.getProject(projectId);
      } catch (error) {
        throw new Error(`Get project failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:project:getAll', (event, options) => {
      try {
        return DatabaseOperations.getAllProjects(options);
      } catch (error) {
        throw new Error(`Get all projects failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:project:update', (event, projectId, updates) => {
      try {
        return DatabaseOperations.updateProject(projectId, updates);
      } catch (error) {
        throw new Error(`Update project failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:project:delete', (event, projectId) => {
      try {
        return DatabaseOperations.deleteProject(projectId);
      } catch (error) {
        throw new Error(`Delete project failed: ${error.message}`);
      }
    });

    // ============ ANALYSES ============
    ipcMain.handle('db:analysis:create', (event, analysisData) => {
      try {
        return DatabaseOperations.createAnalysis(analysisData);
      } catch (error) {
        throw new Error(`Create analysis failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:analysis:get', (event, analysisId) => {
      try {
        return DatabaseOperations.getAnalysis(analysisId);
      } catch (error) {
        throw new Error(`Get analysis failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:analysis:getByProject', (event, projectId, options) => {
      try {
        return DatabaseOperations.getProjectAnalyses(projectId, options);
      } catch (error) {
        throw new Error(`Get project analyses failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:analysis:update', (event, analysisId, updates) => {
      try {
        return DatabaseOperations.updateAnalysis(analysisId, updates);
      } catch (error) {
        throw new Error(`Update analysis failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:analysis:delete', (event, analysisId) => {
      try {
        return DatabaseOperations.deleteAnalysis(analysisId);
      } catch (error) {
        throw new Error(`Delete analysis failed: ${error.message}`);
      }
    });

    // ============ SEO RULES ============
    ipcMain.handle('db:rule:create', (event, ruleData) => {
      try {
        return DatabaseOperations.createSeoRule(ruleData);
      } catch (error) {
        throw new Error(`Create rule failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:rule:get', (event, ruleId) => {
      try {
        return DatabaseOperations.getSeoRule(ruleId);
      } catch (error) {
        throw new Error(`Get rule failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:rule:getAll', (event, options) => {
      try {
        return DatabaseOperations.getAllSeoRules(options);
      } catch (error) {
        throw new Error(`Get all rules failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:rule:getByCategory', (event, category) => {
      try {
        return DatabaseOperations.getRulesByCategory(category);
      } catch (error) {
        throw new Error(`Get rules by category failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:rule:update', (event, ruleId, updates) => {
      try {
        return DatabaseOperations.updateSeoRule(ruleId, updates);
      } catch (error) {
        throw new Error(`Update rule failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:rule:delete', (event, ruleId) => {
      try {
        return DatabaseOperations.deleteSeoRule(ruleId);
      } catch (error) {
        throw new Error(`Delete rule failed: ${error.message}`);
      }
    });

    // ============ MINI SERVICE RESULTS ============
    ipcMain.handle('db:result:create', (event, resultData) => {
      try {
        return DatabaseOperations.createMiniServiceResult(resultData);
      } catch (error) {
        throw new Error(`Create result failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:result:get', (event, resultId) => {
      try {
        return DatabaseOperations.getMiniServiceResult(resultId);
      } catch (error) {
        throw new Error(`Get result failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:result:getByAnalysis', (event, analysisId) => {
      try {
        return DatabaseOperations.getAnalysisResults(analysisId);
      } catch (error) {
        throw new Error(`Get analysis results failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:result:update', (event, resultId, updates) => {
      try {
        return DatabaseOperations.updateMiniServiceResult(resultId, updates);
      } catch (error) {
        throw new Error(`Update result failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:result:delete', (event, resultId) => {
      try {
        return DatabaseOperations.deleteMiniServiceResult(resultId);
      } catch (error) {
        throw new Error(`Delete result failed: ${error.message}`);
      }
    });

    ipcMain.handle('db:result:deleteByAnalysis', (event, analysisId) => {
      try {
        return DatabaseOperations.deleteAnalysisResults(analysisId);
      } catch (error) {
        throw new Error(`Delete analysis results failed: ${error.message}`);
      }
    });

    // ============ GENERAL ============
    ipcMain.handle('db:stats', () => {
      try {
        const dbManager = require('./dbManager');
        return dbManager.getStats();
      } catch (error) {
        throw new Error(`Get database stats failed: ${error.message}`);
      }
    });
  }
}

module.exports = IPCHandlers;
