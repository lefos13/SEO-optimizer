const { app, BrowserWindow } = require('electron/main');
const path = require('node:path');

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
  win.loadFile(path.join(__dirname, '..', 'public', 'index.html'));

  // Show window when ready to prevent flickering
  win.once('ready-to-show', () => {
    win.show();
  });

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    win.webContents.openDevTools();
  }
};

// Initialize the application when Electron is ready
// Using .then() pattern as we're using CommonJS (not ES modules)
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
