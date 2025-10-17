# Project Structure Documentation

## Overview

This document provides a detailed overview of the SEO Optimizer project structure and explains the purpose of each directory and key file.

## Root Directory

```
SEO-optimizer/
├── .github/              # GitHub specific files
├── .husky/              # Git hooks configuration
├── .vscode/             # VS Code workspace settings
├── .yarn/               # Yarn package manager cache
├── public/              # Static assets and entry HTML
├── src/                 # Source code
├── tests/               # Test files
└── Configuration files
```

## Directory Details

### `.github/`

Contains GitHub-specific configuration files:

- `copilot-instructions.md` - Instructions for GitHub Copilot to maintain code quality and consistency

### `.husky/`

Git hooks configuration:

- `pre-commit` - Runs lint-staged before each commit to ensure code quality

### `.vscode/`

VS Code workspace configuration:

- `settings.json` - Editor settings (format on save, ESLint integration)
- `extensions.json` - Recommended extensions for the project

### `public/`

Static assets served to the renderer process:

- `index.html` - Main HTML entry point for the Electron app
- Future: Application icons for different platforms

### `src/`

Main source code directory with subdirectories for different concerns:

#### `src/main/`

**Purpose**: Electron main process code
**Future contents**:

- IPC handlers for database operations
- File system operations
- Window management utilities
- System tray integration

#### `src/renderer/`

**Purpose**: React-based user interface
**Contents**:

- `components/` - React components
- `styles/` - CSS stylesheets
- `index.js` - Renderer process entry point

**Future components**:

- `App.jsx` - Main application component
- `ContentAnalyzer.jsx` - SEO analysis interface
- `ResultsDisplay.jsx` - Analysis results component
- `History.jsx` - Analysis history viewer

#### `src/preload/`

**Purpose**: Secure bridge between main and renderer processes
**Contents**:

- `preload.js` - Context bridge setup and API exposure

**Security**: Uses contextBridge to safely expose specific APIs to renderer process

#### `src/database/`

**Purpose**: Database operations and schema management
**Future contents**:

- `schema.js` - SQLite database schema
- `operations.js` - CRUD operations
- `migrations.js` - Database version migrations

#### `src/analyzers/`

**Purpose**: SEO analysis logic
**Future contents**:

- `contentAnalyzer.js` - Main analysis orchestrator
- `keywordDensity.js` - Keyword density calculator
- `readability.js` - Readability score calculator
- `metaAnalyzer.js` - Meta tags analysis
- `headingStructure.js` - Heading hierarchy analyzer

#### `src/utils/`

**Purpose**: Shared utility functions
**Future contents**:

- `textProcessing.js` - Text manipulation utilities
- `scoring.js` - Score calculation helpers
- `validators.js` - Input validation functions

### `tests/`

**Purpose**: Automated tests
**Future contents**:

- Unit tests for analyzers
- Integration tests for database operations
- E2E tests for the application

## Configuration Files

### Code Quality

- `.eslintrc.json` - ESLint rules for JavaScript/React
- `.eslintignore` - Files to exclude from linting
- `.prettierrc` - Prettier code formatting rules
- `.prettierignore` - Files to exclude from formatting
- `.lintstagedrc.json` - Lint-staged configuration for pre-commit hooks

### Package Management

- `package.json` - Project dependencies and scripts
- `.yarnrc.yml` - Yarn configuration (if using Yarn v2+)

### Version Control

- `.gitignore` - Files to exclude from version control

### Documentation

- `README.md` - Project overview and setup instructions
- `PROJECT_STRUCTURE.md` - This file

## File Naming Conventions

### JavaScript Files

- **PascalCase** for React components: `ContentAnalyzer.jsx`
- **camelCase** for utilities and non-component files: `textProcessing.js`
- **kebab-case** for CSS files: `main.css`, `component-name.css`

### Directories

- **lowercase with hyphens** for multi-word directories
- **singular** for directories containing one type of thing
- **plural** for directories containing multiple items

## Import Paths

The project uses absolute paths from the `src/` directory. Examples:

```javascript
// Main process
const { operations } = require('./database/operations');

// Renderer process (with bundler)
import ContentAnalyzer from '@/renderer/components/ContentAnalyzer';
import { analyzeContent } from '@/analyzers/contentAnalyzer';
```

## Build Output

When building the application:

- `dist/` - Electron-builder output (platform-specific installers)
- `build/` - Intermediate build files (if using a bundler)

## Development Workflow

1. Make changes to source files
2. Git pre-commit hook runs automatically:
   - Prettier formats changed files
   - ESLint checks for code quality issues
3. Fix any issues reported by ESLint
4. Commit proceeds if all checks pass

## Next Steps

As development progresses, this structure will be populated with:

- React components in `src/renderer/components/`
- Database operations in `src/database/`
- SEO analysis algorithms in `src/analyzers/`
- Utility functions in `src/utils/`
- IPC handlers in `src/main/`

## Questions?

Refer to the main README.md for setup instructions and the .github/copilot-instructions.md for code style guidelines.
