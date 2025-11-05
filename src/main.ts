import { app, BrowserWindow, Menu } from 'electron';
import path from 'node:path';
import DatabaseManager from './main/dbManager';
import { registerHandlers } from './main/ipcHandlers';

// Enable hot reload in development mode
const isDev = process.argv.includes('--dev');
if (isDev) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const electronReload = require('electron-reload');
    // Watch the src directory for changes (__dirname will be dist after webpack)
    const srcPath = path.join(__dirname, '..', 'src');
    electronReload(srcPath, {
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
    frame: false, // Remove default window frame
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // After webpack, both main.js and preload.js are in dist/
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // Don't show until ready
    backgroundColor: '#1a1a1a', // Match dark theme
  });

  // Load the main HTML file
  // After webpack, __dirname is dist, so HTML is at ./index.html
  const htmlPath = path.join(__dirname, 'index.html');

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
    // __dirname is dist after webpack, so src is at ../src
    const srcDir = path.join(__dirname, '..');
    const rendererWatcher = chokidar.watch(
      [
        path.join(srcDir, 'src', 'renderer', '**', '*'),
        path.join(srcDir, 'public', '**', '*'),
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
    // Remove menu bar completely
    Menu.setApplicationMenu(null);

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
