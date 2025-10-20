import { app, BrowserWindow } from 'electron/main';
import path from 'node:path';
import DatabaseManager from './main/dbManager';
import { registerHandlers } from './main/ipcHandlers';

// Enable hot reload in development mode
const isDev = process.argv.includes('--dev');
if (isDev) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const electronReload = require('electron-reload');
    electronReload(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit',
      // Watch these paths for changes
      ignored: /node_modules|[/\\]\.|dist|build/,
    });
  } catch (err) {
    console.error('Error loading electron-reload:', err);
  }
}

/**
 * Create the main application window
 */
const createWindow = (): void => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload', 'preload.js'),
    },
    show: false, // Don't show until ready
  });

  // Load the main HTML file regardless of dev or packaged env
  const htmlPath = path.resolve(__dirname, '..', 'dist', 'index.html');

  console.log('[MAIN] Loading HTML from:', htmlPath);
  console.log('[MAIN] __dirname:', __dirname);
  console.log('[MAIN] isDev:', isDev);

  win.loadFile(htmlPath).catch((err: Error) => {
    console.error('[MAIN] Failed to load HTML:', err);
  });

  // Show window when ready to prevent flickering
  win.once('ready-to-show', () => {
    win.show();
  });

  // Open DevTools in development mode
  if (isDev) {
    win.webContents.openDevTools();
  }

  // Enable live reload for renderer process in development
  if (isDev) {
    // Watch for changes in renderer files
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const chokidar = require('chokidar');
    const rendererWatcher = chokidar.watch(
      [
        path.join(__dirname, 'renderer', '**', '*'),
        path.join(__dirname, '..', 'public', '**', '*'),
      ],
      {
        ignoreInitial: true,
        ignored: /node_modules|[/\\]\./,
      }
    );

    rendererWatcher.on('change', (filePath: string) => {
      console.log('Renderer files changed, reloading...', filePath);
      win.webContents.reload();
    });
  }
};

// Initialize the application when Electron is ready
app.whenReady().then(async () => {
  try {
    // Initialize database (async operation)
    await DatabaseManager.initialize();

    // Register IPC handlers
    registerHandlers();

    console.log('[APP] Application initialized successfully');
  } catch (error) {
    console.error('[APP] Failed to initialize application:', error);
    app.quit();
    return;
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Clean up database connection
  DatabaseManager.close();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
