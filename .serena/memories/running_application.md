# Running the Application

## Development Mode

```bash
# Full development environment with hot reload
yarn dev

# Development with clean database reset
yarn dev:clean

# Just webpack watch mode
yarn webpack:watch
```

## Production Mode

```bash
# Build and run production version
yarn start
```

## Build Process

```bash
# Build webpack bundle
yarn webpack:build

# Build distributable packages
yarn build          # All platforms
yarn build:win      # Windows only
yarn build:mac      # macOS only
yarn build:linux    # Linux only
```

## Application Entry Points

### Main Entry Point

- **File**: `src/main.js`
- **Purpose**: Electron main process initialization
- **Responsibilities**:
  - Create BrowserWindow
  - Initialize database
  - Register IPC handlers
  - Handle app lifecycle

### Renderer Entry Point

- **File**: `src/renderer/index.js`
- **Purpose**: React application bootstrap
- **Responsibilities**:
  - Render React app to DOM
  - Initialize routing
  - Load styles

### Preload Script

- **File**: `src/preload/preload.js`
- **Purpose**: Secure IPC bridge
- **Responsibilities**:
  - Expose safe APIs to renderer
  - Context isolation security

## Development Features

- **Hot Reload**: Automatic page refresh on file changes
- **DevTools**: Automatically opened in development
- **Database Reset**: `yarn db:reset` for clean development state
- **Live Reload**: Renderer process watches for changes

## Production Features

- **Optimized Build**: Minified webpack bundle
- **Cross-platform**: Windows, macOS, Linux executables
- **Standalone**: No external dependencies required
- **Secure**: Context isolation and CSP enabled

## Database Initialization

- **Automatic**: Runs on app startup
- **Async**: Waits for database ready before creating window
- **Error Handling**: App quits if database fails to initialize
- **Reset**: `yarn db:reset` recreates database from scratch

## IPC Communication

- **Secure**: Only through preload scripts
- **Async**: All operations return promises
- **Error Handling**: Comprehensive error propagation
- **Typed**: Consistent data structures across processes
