import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script for secure IPC communication
 * Exposes a limited API to the renderer process via contextBridge
 */

// Define the API interface
export interface ElectronAPI {
  // System operations
  ping: () => Promise<string>;

  // Database operations (to be implemented)
  database: {
    // Methods will be added as features are implemented
  };

  // SEO analysis operations (to be implemented)
  seoAnalysis: {
    // Methods will be added as features are implemented
  };

  // File operations (to be implemented)
  file: {
    // Methods will be added as features are implemented
  };

  // Settings operations (to be implemented)
  settings: {
    // Methods will be added as features are implemented
  };
}

// Expose protected methods to renderer
const electronAPI: ElectronAPI = {
  // System operations
  ping: () => ipcRenderer.invoke('ping'),

  // Placeholder for future implementations
  database: {},
  seoAnalysis: {},
  file: {},
  settings: {},
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for TypeScript support in renderer
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
