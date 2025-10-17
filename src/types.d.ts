/**
 * TypeScript declarations for global types and modules
 */

/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}

// Electron API types exposed via preload
interface ElectronAPI {
  ping: () => Promise<string>;
  database: Record<string, any>;
  seoAnalysis: Record<string, any>;
  file: Record<string, any>;
  settings: Record<string, any>;
}

interface Window {
  electronAPI: ElectronAPI;
}

// CSS modules
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Image imports
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.ico' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}
