const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script for secure IPC communication
 * Exposes specific APIs to the renderer process through contextBridge
 */

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  database: {
    analyze: content => ipcRenderer.invoke('db:analyze', content),
    getHistory: () => ipcRenderer.invoke('db:getHistory'),
    saveAnalysis: data => ipcRenderer.invoke('db:saveAnalysis', data),
  },

  // File operations
  file: {
    selectFile: () => ipcRenderer.invoke('file:select'),
    readFile: filePath => ipcRenderer.invoke('file:read', filePath),
  },

  // System information
  system: {
    getVersion: () => ipcRenderer.invoke('system:version'),
  },
});
