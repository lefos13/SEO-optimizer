const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script for secure IPC communication
 * Exposes specific APIs to the renderer process through contextBridge
 */

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Projects
  projects: {
    create: projectData => ipcRenderer.invoke('db:project:create', projectData),
    get: projectId => ipcRenderer.invoke('db:project:get', projectId),
    getAll: options => ipcRenderer.invoke('db:project:getAll', options),
    update: (projectId, updates) =>
      ipcRenderer.invoke('db:project:update', projectId, updates),
    delete: projectId => ipcRenderer.invoke('db:project:delete', projectId),
  },

  // Analyses
  analyses: {
    create: analysisData =>
      ipcRenderer.invoke('db:analysis:create', analysisData),
    get: analysisId => ipcRenderer.invoke('db:analysis:get', analysisId),
    getByProject: (projectId, options) =>
      ipcRenderer.invoke('db:analysis:getByProject', projectId, options),
    update: (analysisId, updates) =>
      ipcRenderer.invoke('db:analysis:update', analysisId, updates),
    delete: analysisId => ipcRenderer.invoke('db:analysis:delete', analysisId),
  },

  // SEO Rules
  rules: {
    create: ruleData => ipcRenderer.invoke('db:rule:create', ruleData),
    get: ruleId => ipcRenderer.invoke('db:rule:get', ruleId),
    getAll: options => ipcRenderer.invoke('db:rule:getAll', options),
    getByCategory: category =>
      ipcRenderer.invoke('db:rule:getByCategory', category),
    update: (ruleId, updates) =>
      ipcRenderer.invoke('db:rule:update', ruleId, updates),
    delete: ruleId => ipcRenderer.invoke('db:rule:delete', ruleId),
  },

  // Analysis Results
  results: {
    create: resultData => ipcRenderer.invoke('db:result:create', resultData),
    get: resultId => ipcRenderer.invoke('db:result:get', resultId),
    getByAnalysis: analysisId =>
      ipcRenderer.invoke('db:result:getByAnalysis', analysisId),
    update: (resultId, updates) =>
      ipcRenderer.invoke('db:result:update', resultId, updates),
    delete: resultId => ipcRenderer.invoke('db:result:delete', resultId),
    deleteByAnalysis: analysisId =>
      ipcRenderer.invoke('db:result:deleteByAnalysis', analysisId),
  },

  // Database stats
  database: {
    getStats: () => ipcRenderer.invoke('db:stats'),
  },

  // SEO Analyzer
  seo: {
    analyze: content => ipcRenderer.invoke('seo:analyze', content),
    getRecommendations: analysisId =>
      ipcRenderer.invoke('seo:recommendations:get', analysisId),
    updateRecommendationStatus: (recId, status, notes) =>
      ipcRenderer.invoke(
        'seo:recommendations:updateStatus',
        recId,
        status,
        notes
      ),
    getQuickWins: analysisId =>
      ipcRenderer.invoke('seo:recommendations:quickWins', analysisId),
    calculateDensity: (text, keyword) =>
      ipcRenderer.invoke('seo:calculateDensity', text, keyword),
    calculateDensities: (text, keywords) =>
      ipcRenderer.invoke('seo:calculateDensities', text, keywords),
    suggestKeywords: (html, maxSuggestions = 10) =>
      ipcRenderer.invoke('seo:suggestKeywords', html, maxSuggestions),
    saveRecommendations: (analysisId, enhancedRecommendations) =>
      ipcRenderer.invoke(
        'seo:recommendations:save',
        analysisId,
        enhancedRecommendations
      ),
    fetchUrl: (url, options) =>
      ipcRenderer.invoke('seo:fetchUrl', url, options),
  },

  // Keyword Services
  keyword: {
    analyzeDensity: (content, keywords) =>
      ipcRenderer.invoke('keyword:analyzeDensity', content, keywords),
    generateLongTail: (content, seedKeywords, maxSuggestions) =>
      ipcRenderer.invoke(
        'keyword:generateLongTail',
        content,
        seedKeywords,
        maxSuggestions
      ),
    estimateDifficulty: (keywords, content) =>
      ipcRenderer.invoke('keyword:estimateDifficulty', keywords, content),
    cluster: (keywords, content) =>
      ipcRenderer.invoke('keyword:cluster', keywords, content),
    generateLSI: (content, mainKeywords, maxSuggestions) =>
      ipcRenderer.invoke(
        'keyword:generateLSI',
        content,
        mainKeywords,
        maxSuggestions
      ),
  },

  // Readability Services
  readability: {
    analyze: (content, options) =>
      ipcRenderer.invoke('readability:analyze', content, options),
    analyzeOverview: (content, options) =>
      ipcRenderer.invoke('readability:analyzeOverview', content, options),
    analyzeStructure: (content, options) =>
      ipcRenderer.invoke('readability:analyzeStructure', content, options),
    analyzeReadingLevels: (content, options) =>
      ipcRenderer.invoke('readability:analyzeReadingLevels', content, options),
    analyzeImprovements: (content, options) =>
      ipcRenderer.invoke('readability:analyzeImprovements', content, options),
    analyzeLanguageGuidance: (content, options) =>
      ipcRenderer.invoke(
        'readability:analyzeLanguageGuidance',
        content,
        options
      ),
    analyzeLiveScore: (content, options) =>
      ipcRenderer.invoke('readability:analyzeLiveScore', content, options),
  },

  // Content Optimization Services
  content: {
    analyzeStructure: (content, options) =>
      ipcRenderer.invoke('content:analyzeStructure', content, options),
    optimizeHeadings: (content, keywords) =>
      ipcRenderer.invoke('content:optimizeHeadings', content, keywords),
    recommendInternalLinks: (content, existingPages) =>
      ipcRenderer.invoke(
        'content:recommendInternalLinks',
        content,
        existingPages
      ),
    optimizeLength: (content, options) =>
      ipcRenderer.invoke('content:optimizeLength', content, options),
    analyzeGaps: (content, topics) =>
      ipcRenderer.invoke('content:analyzeGaps', content, topics),
    analyzeCompetitive: (content, competitors) =>
      ipcRenderer.invoke('content:analyzeCompetitive', content, competitors),
  },
});
