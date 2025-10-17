const { app, BrowserWindow } = require('electron/main');
const path = require('node:path');

// Import database manager and IPC handlers
const dbManager = require('./main/dbManager');
const IPCHandlers = require('./main/ipcHandlers');

// Enable hot reload in development mode
const isDev = process.argv.includes('--dev');
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
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
const createWindow = () => {
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

  // Load the main HTML file
  const htmlPath = isDev
    ? path.join(__dirname, '..', 'dist', 'index.html')
    : path.join(__dirname, '..', 'dist', 'index.html');

  win.loadFile(htmlPath);

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

    rendererWatcher.on('change', filePath => {
      // eslint-disable-next-line no-console
      console.log('Renderer files changed, reloading...', filePath);
      win.webContents.reload();
    });
  }
};

// Initialize the application when Electron is ready
// Using .then() pattern as we're using CommonJS (not ES modules)
app.whenReady().then(async () => {
  try {
    // Initialize database (async operation)
    // eslint-disable-next-line no-unused-expressions
    await dbManager.initialize();

    // Register IPC handlers
    IPCHandlers.registerHandlers();

    // eslint-disable-next-line no-console
    console.log('[APP] Application initialized successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
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
  dbManager.close();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
