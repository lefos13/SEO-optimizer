# SEO Optimizer - Technology Stack

## Core Technologies

- **Runtime**: Electron 38.3.0 (Node.js + Chromium)
- **Frontend**: React 19.2.0 with React Router 7.9.4
- **Language**: TypeScript 5.9.3 with strict type checking
- **Styling**: SASS with modular architecture and dark theme
- **Database**: SQLite via sql.js 1.13.0
- **Package Manager**: Yarn 4.5.2

## Build System

### Webpack Multi-Process Architecture

- **Main Process**: `webpack.main.config.js` - Electron main process (Node.js target)
- **Renderer Process**: `webpack.renderer.config.js` - React frontend (Electron renderer target)
- **Preload Script**: `webpack.preload.config.js` - Secure IPC bridge

### TypeScript Configuration

- **Base**: `tsconfig.json` - Strict type checking with path aliases
- **Main Process**: `tsconfig.main.json` - Node.js environment
- **Renderer Process**: `tsconfig.renderer.json` - Browser environment

### Path Aliases (Available in all configs)

```typescript
"@/*": ["src/*"]
"@types/*": ["src/types/*"]
"@analyzers/*": ["src/analyzers/*"]
"@database/*": ["src/database/*"]
"@main/*": ["src/main/*"]
"@renderer/*": ["src/renderer/*"]
"@utils/*": ["src/utils/*"]
```

## Development Commands

### Primary Workflows

```bash
# Development with hot reload (all 3 webpack processes)
yarn dev

# Development with clean database
yarn dev:clean

# Production build and run
yarn start

# Build distributables
yarn build        # All platforms
yarn build:win    # Windows
yarn build:mac    # macOS
yarn build:linux  # Linux
```

### Individual Build Processes

```bash
# Main process
yarn webpack:main
yarn webpack:main:watch

# Preload script
yarn webpack:preload
yarn webpack:preload:watch

# Renderer process
yarn webpack:renderer
yarn webpack:renderer:watch
```

### Code Quality

```bash
# Linting
yarn lint
yarn lint:fix

# Formatting
yarn format
yarn format:check

# Type checking
yarn typecheck
yarn typecheck:main
yarn typecheck:renderer

# Testing
yarn test
```

### Database

```bash
# Reset database
yarn db:reset
```

## Code Quality Tools

- **ESLint**: Flat config with TypeScript, React, and React Hooks rules
- **Prettier**: Code formatting with consistent style
- **Husky**: Git hooks for pre-commit validation
- **lint-staged**: Run linters on staged files only
- **Jest**: Testing framework with jsdom environment

## Security Configuration

- **Context Isolation**: Enabled for security
- **Node Integration**: Disabled in renderer
- **Preload Scripts**: Secure IPC communication bridge
- **Content Security Policy**: Configured for Electron security best practices

## Development Notes

- Hot reload enabled in development mode with electron-reload and chokidar
- Source maps generated for debugging
- DevTools automatically opened in development
- Webpack watch mode for individual processes during development
