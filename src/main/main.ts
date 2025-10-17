import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

/**
 * Main application class for the SEO Optimizer tool
 * Handles window creation, lifecycle, and main process logic
 */
class SEOOptimizerApp {
  private mainWindow: BrowserWindow | null = null;
  private isDevelopment = process.env.NODE_ENV === 'development';

  constructor() {
    this.initializeApp();
  }

  /**
   * Initialize the Electron application
   */
  private initializeApp(): void {
    // Handle app lifecycle events
    app.on('ready', () => this.onReady());
    app.on('window-all-closed', () => this.onWindowAllClosed());
    app.on('activate', () => this.onActivate());

    // Security: Disable navigation to external URLs
    app.on('web-contents-created', (_event, contents) => {
      contents.on('will-navigate', (event, _navigationUrl) => {
        event.preventDefault();
      });

      contents.setWindowOpenHandler(() => {
        return { action: 'deny' };
      });
    });
  }

  /**
   * Create the main application window
   */
  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false, // Don't show until ready-to-show
      webPreferences: {
        // Security settings
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        // Preload script for secure IPC communication
        preload: path.join(__dirname, 'preload.js'),
      },
      // Window appearance
      backgroundColor: '#ffffff',
      title: 'SEO Optimizer',
      icon: path.join(__dirname, '../../assets/icons/icon.png'),
    });

    // Load the renderer
    if (this.isDevelopment) {
      // Development: load from webpack dev server
      this.mainWindow.loadURL('http://localhost:3000');
      // Open DevTools in development
      this.mainWindow.webContents.openDevTools();
    } else {
      // Production: load from dist folder
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    // Handle window close
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Initialize IPC handlers
    this.initializeIpcHandlers();
  }

  /**
   * Initialize IPC handlers for renderer communication
   */
  private initializeIpcHandlers(): void {
    // Example: Ping-pong handler for testing IPC
    ipcMain.handle('ping', async () => {
      return 'pong';
    });

    // TODO: Add more IPC handlers as features are implemented
    // - Database operations
    // - SEO analysis requests
    // - File operations
    // - Settings management
  }

  /**
   * App ready event handler
   */
  private onReady(): void {
    this.createMainWindow();
  }

  /**
   * Window all closed event handler
   */
  private onWindowAllClosed(): void {
    // On macOS, apps typically stay active until explicitly quit
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  /**
   * Activate event handler (macOS)
   */
  private onActivate(): void {
    // On macOS, recreate window when dock icon is clicked
    if (this.mainWindow === null) {
      this.createMainWindow();
    }
  }
}

// Create and start the application
new SEOOptimizerApp();
