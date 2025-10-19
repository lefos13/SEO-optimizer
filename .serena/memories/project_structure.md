# Project Structure

## Root Level

```
SEO-optimizer/
├── package.json          # Dependencies and scripts
├── webpack.config.js     # Webpack configuration
├── eslint.config.mjs     # ESLint configuration
├── README.md            # Project documentation
├── public/              # Static assets
│   └── index.html       # HTML template
├── src/                 # Source code
├── dist/                # Build output (generated)
├── build/               # Distribution builds (generated)
├── scripts/             # Utility scripts
└── docs/                # Documentation (referenced in README)
```

## Source Code Structure (`src/`)

### Main Process (`src/main/`)

- `dbManager.js` - Database initialization and connection
- `dbOperations.js` - Database CRUD operations
- `ipcHandlers.js` - IPC communication handlers

### Renderer Process (`src/renderer/`)

- `index.js` - React application entry point
- `components/` - React components
  - `App.jsx` - Main router component
  - `Layout.jsx` - Application layout
  - `Navigation.jsx` - Sidebar navigation
  - `views/` - Page components (Dashboard, Analysis, etc.)
  - `ui/` - Reusable UI components (Button, Card, etc.)
  - `miniservices/` - Specialized SEO tools
  - `analysis/` - Analysis-specific components
  - `results/` - Results display components
- `styles/` - SASS stylesheets
  - `main.scss` - Main stylesheet entry
  - `_variables.scss` - Design tokens
  - `_mixins.scss` - SASS mixins
  - `_components.scss` - Component styles
  - `_layout.scss` - Layout styles
  - `_views.scss` - View-specific styles
  - `_miniservices.scss` - Mini-services styles
- `utils/` - Utility functions
  - `dateUtils.js` - Date formatting utilities
  - `scoreCalculator.js` - Score calculation logic

### Shared Modules

- `preload/preload.js` - Secure IPC bridge
- `database/dbManager.js` - Database management (shared)
- `analyzers/` - SEO analysis logic
  - `seoAnalyzer.js` - Core analysis engine
  - `seoRules.js` - SEO rule definitions
  - `htmlParser.js` - HTML content parsing
  - `keywordServices.js` - Keyword analysis tools
  - `readabilityServices.js` - Readability analysis
  - `contentServices.js` - Content optimization
  - `recommendationEngine.js` - Recommendation generation
- `utils/dbExamples.js` - Database examples

## Key Architecture Patterns

### Electron Architecture

- **Main Process**: Node.js environment, handles system operations
- **Renderer Process**: Browser environment, React application
- **Preload Scripts**: Secure bridge between processes

### Component Organization

- **Views**: Page-level components with routing
- **UI Components**: Reusable, stateless components
- **Mini-Services**: Specialized feature components
- **Analysis Components**: Analysis-specific UI elements

### Styling Architecture

- **Modular SASS**: Separate files for different concerns
- **Variables**: Centralized design tokens
- **Mixins**: Reusable SASS functions
- **Component-specific**: Styles co-located with components

### Database Layer

- **Manager**: Connection and initialization
- **Operations**: CRUD operations
- **Persistence**: Data persistence logic

### Analysis Engine

- **Core Analyzer**: Main analysis orchestration
- **Rules**: Individual SEO rules and scoring
- **Services**: Specialized analysis tools
- **Parser**: HTML content extraction
