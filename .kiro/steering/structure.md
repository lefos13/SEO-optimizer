# SEO Optimizer - Project Structure

## Root Directory Organization

```
├── src/                    # Source code
├── dist/                   # Webpack build output
├── build/                  # Electron-builder distributables
├── public/                 # Static assets (HTML template, icons)
├── tests/                  # Test files and setup
├── scripts/                # Utility scripts (database reset)
├── docs/                   # Documentation
└── [config files]          # Webpack, TypeScript, ESLint, etc.
```

## Source Code Structure (`src/`)

### Main Process (`src/main/`)

Electron main process - Node.js environment

- `main.ts` - Application entry point
- `dbManager.ts` - Database connection management
- `dbOperations.ts` - Database CRUD operations
- `ipcHandlers.ts` - IPC communication handlers

### Renderer Process (`src/renderer/`)

React frontend - Browser environment

```
renderer/
├── components/
│   ├── App.tsx              # Main router component
│   ├── Layout.tsx           # Application layout wrapper
│   ├── Navigation.tsx       # Sidebar navigation
│   ├── views/               # Page-level components
│   │   ├── Dashboard.tsx
│   │   ├── Analysis.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
├── styles/                  # SASS stylesheets
│   ├── _variables.scss      # Design tokens (colors, spacing, typography)
│   ├── _mixins.scss         # Utility mixins
│   ├── _layout.scss         # Layout-specific styles
│   ├── _components.scss     # Component styles
│   ├── _views.scss          # View-specific styles
│   └── main.scss            # Main stylesheet entry
└── index.tsx                # React application entry point
```

### Preload Scripts (`src/preload/`)

Secure IPC bridge between main and renderer

- `preload.ts` - Exposes safe APIs to renderer process

### Business Logic (`src/analyzers/`)

SEO analysis engine and services

- `seoAnalyzer.ts` - Core analysis engine (40+ rules)
- `seoRules.ts` - Rule definitions and scoring
- `htmlParser.ts` - HTML content parsing utilities
- `recommendationEngine.ts` - Generates actionable recommendations
- `keywordServices.ts` - Keyword analysis tools
- `readabilityServices.ts` - Readability scoring and analysis
- `contentServices.ts` - Content optimization services

### Database Layer (`src/database/`)

SQLite database operations and schema

- Database initialization and migration scripts
- Data access layer for analysis results

### Type Definitions (`src/types/`)

TypeScript type definitions

- `seo.types.ts` - SEO analysis interfaces
- `analyzer.types.ts` - HTML parser and analysis types
- `database.types.ts` - Database schema types

### Utilities (`src/utils/`)

Shared utility functions and helpers

## Styling Architecture

### SASS Structure

- **Variables** (`_variables.scss`): Design tokens for dark theme
- **Mixins** (`_mixins.scss`): Reusable style utilities
- **Modular CSS**: Component-specific stylesheets
- **Dark Theme**: Consistent color palette and spacing system

### Design System

- **Colors**: Dark theme with semantic color tokens
- **Typography**: System font stack with consistent sizing
- **Spacing**: 8px grid system (xs: 4px, sm: 8px, md: 16px, etc.)
- **Components**: Standardized button, input, and card components

## Configuration Files

### Build Configuration

- `webpack.main.config.js` - Main process bundling
- `webpack.renderer.config.js` - Renderer process bundling
- `webpack.preload.config.js` - Preload script bundling

### TypeScript Configuration

- `tsconfig.json` - Base TypeScript configuration
- `tsconfig.main.json` - Main process specific config
- `tsconfig.renderer.json` - Renderer process specific config

### Code Quality

- `eslint.config.mjs` - ESLint flat configuration
- `.prettierrc` - Prettier formatting rules
- `jest.config.cjs` - Jest testing configuration

## Development Patterns

### Component Architecture

- **Functional Components**: React hooks-based components
- **TypeScript**: Strict typing for props and state
- **SASS Modules**: Component-scoped styling
- **Path Aliases**: Use `@/` imports for clean module resolution

### IPC Communication

- **Secure Bridge**: All main-renderer communication via preload scripts
- **Type Safety**: Strongly typed IPC interfaces
- **Error Handling**: Consistent error propagation patterns

### Database Operations

- **Async/Await**: Promise-based database operations
- **Connection Management**: Centralized database connection handling
- **Migration Support**: Schema versioning and updates

## File Naming Conventions

- **Components**: PascalCase (e.g., `Dashboard.tsx`, `Button.tsx`)
- **Utilities**: camelCase (e.g., `htmlParser.ts`, `seoAnalyzer.ts`)
- **Styles**: kebab-case with underscore prefix (e.g., `_variables.scss`)
- **Types**: `.types.ts` suffix for type definition files
