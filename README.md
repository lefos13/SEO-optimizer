# SEO Optimizer

A desktop SEO analysis tool built with Electron, React, TypeScript, and SQLite for content optimization and SEO recommendations.

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Development mode (with hot reload)
yarn dev

# Production mode
yarn start

# Build for distribution
yarn build
```

## 📋 Features

- ✅ **TypeScript** - Full type safety across main and renderer processes
- ✅ React 19 with React Router
- ✅ Modern dark desktop UI theme
- ✅ SASS styling with modular architecture
- ✅ Webpack + TypeScript bundling
- ✅ SQLite database integration
- ✅ Hot reload in development
- ✅ **SEO Analysis Engine** - Rule-based content analysis
- ✅ **Meta Tags Analysis** - Title, description, keywords validation
- ✅ **Content Analysis** - Word count, keyword density, readability
- ✅ **HTML Parser** - Extract headings, images, links
- ✅ **Scoring System** - Weighted rules with letter grades
- ✅ **Technical SEO** - HTTPS, viewport, canonical, robots meta
- ✅ **Accessibility Checks** - Basic WCAG validation
- ✅ **Semantic HTML5** - Structure and validation
- ✅ **Recommendation Engine** - Priority-based, actionable suggestions
- ✅ **Impact Estimation** - Before/after score projections
- ✅ **Multi-language Support** - English and Greek
- ✅ **Database Integration** - Full persistence with SQLite
- ✅ **React UI** - Complete dashboard, analysis, and results interface
- ✅ **Mini-Services** - Specialized SEO tools collection
  - **Keywords Services** - Density, long-tail, difficulty, clustering, LSI
  - **Readability Services** - Multi-formula scoring, structure, levels, improvements
  - **Content Services** - Structure, headings, links, length, gaps, competitive
- ⚠️ **Frontend-Backend Integration** - Partial (see [Integration Gaps](./docs/INTEGRATION_GAPS.md))

## 🛠️ Available Scripts

### Development

- `yarn dev` - Development mode with DevTools and hot reload (all 3 webpack processes)
- `yarn dev:clean` - Development mode with database reset

### Building

- `yarn clean` - Clean dist folder
- `yarn build:all` - Build all webpack bundles (main + preload + renderer)
- `yarn start` - Production build and run
- `yarn build` - Build distributable for all platforms
- `yarn build:win` - Build for Windows
- `yarn build:mac` - Build for macOS
- `yarn build:linux` - Build for Linux

### Webpack (Individual Processes)

- `yarn webpack:main` - Build main process bundle
- `yarn webpack:main:watch` - Watch main process
- `yarn webpack:preload` - Build preload script
- `yarn webpack:preload:watch` - Watch preload script
- `yarn webpack:renderer` - Build renderer process bundle
- `yarn webpack:renderer:watch` - Watch renderer process

### TypeScript

- `yarn typecheck` - Type check all TypeScript files
- `yarn typecheck:main` - Type check main process
- `yarn typecheck:renderer` - Type check renderer process

### Code Quality

- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn format` - Format code with Prettier

## 📁 Project Structure

```
src/
├── main/                      # Electron main process
│   ├── dbManager.js          # Database management
│   ├── dbOperations.js       # Database operations
│   └── ipcHandlers.js        # IPC communication
├── renderer/                  # React frontend
│   ├── components/
│   │   ├── App.jsx           # Main router
│   │   ├── Layout.jsx        # App layout
│   │   ├── Navigation.jsx    # Sidebar menu
│   │   ├── views/            # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analysis.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   └── ui/               # Reusable components
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       └── Card.jsx
│   ├── styles/               # SASS stylesheets
│   │   ├── _variables.scss  # Design tokens
│   │   ├── _mixins.scss     # Utilities
│   │   ├── _layout.scss     # Layout styles
│   │   ├── _components.scss # Component styles
│   │   ├── _views.scss      # View styles
│   │   └── main.scss        # Main entry
│   └── index.js             # React entry point
├── preload/
│   └── preload.js           # Secure IPC bridge
├── database/                # Database modules
├── analyzers/               # SEO analysis logic
│   ├── seoAnalyzer.js      # Core analysis engine
│   ├── seoRules.js         # Rule definitions
│   ├── htmlParser.js       # HTML content parser
│   ├── keywordServices.js  # Keyword analysis tools
│   ├── readabilityServices.js # Readability analysis
│   ├── contentServices.js  # Content optimization tools
│   └── examples.js         # Usage examples
└── main.js                  # Electron main entry
```

## 🎨 UI Components

**Views:** Dashboard, Analysis, Reports, Settings, Mini-Services  
**UI Components:** Button, Input, Card  
**Styling:** Dark theme with SASS modules

## 🛠️ Mini-Services Collection

**Keyword Services:**

- **Keyword Density Analyzer** - Real-time density analysis with visualization
- **Long-tail Keyword Generator** - Discover low-competition opportunities
- **Keyword Difficulty Estimator** - Assess competition levels
- **Keyword Clustering** - Group related keywords by theme
- **LSI Keyword Generator** - Find semantically related terms

**Readability Services:**

- **Overview Dashboard** - Composite scores from multiple formulas
- **Sentence & Paragraph Analyzer** - Structure and pacing analysis
- **Reading Level Guide** - Grade levels and audience fit
- **Improvement Suggestions** - Actionable readability tips
- **Language Guidance** - English and Greek specific rules
- **Live Score Calculator** - Real-time readability feedback

**Content Optimization Services:** ✨ NEW

- **Content Structure Analyzer** - Headings, paragraphs, lists, media analysis
- **Heading Optimizer** - Keyword usage and length optimization
- **Internal Link Recommender** - Linking opportunities and anchor text analysis
- **Content Length Optimizer** - Type-specific length recommendations
- **Content Gap Analyzer** - Topic coverage and depth analysis
- **Competitive Content Analyzer** - Compare against top-ranking pages

## 🎯 Architecture & Code Quality

**Recent Refactoring:**
All 17 mini-services have been refactored to use the new `MiniServiceContainer` wrapper component, reducing boilerplate code by **~1,255 lines** (~25-30% per service) while maintaining all functionality.

- ✅ Standardized component structure across all services
- ✅ Eliminated redundant button groups and state management
- ✅ Consistent error handling and loading states
- ✅ Unified info card presentation
- ✅ Full build verification with zero compilation errors

See [Migration Complete Documentation](./docs/MIGRATION_COMPLETE.md) for detailed migration metrics and testing checklist.

## 🔍 SEO Analysis Engine

**Core Features:**

- 13 SEO rules across 4 categories (meta, content, technical, readability)
- Weighted scoring system (0-100%)
- Letter grade assessment (A-F)
- Detailed issue reporting with severity levels
- Actionable recommendations per category

**Analysis Capabilities:**

- Meta tag validation (title, description length & keywords)
- Content quality (word count, keyword density)
- HTML structure (headings hierarchy, alt text)
- Link analysis (internal/external links)
- Keyword density calculation
- Multi-language support (English & Greek)

**Rule Categories:**

- **Meta Tags:** Title, description, keywords optimization
- **Content:** Length, density, structure, readability
- **Technical:** Links, images, HTML structure
- **Readability:** Flesch Reading Ease scoring

**Usage Example:**

```javascript
const SEOAnalyzer = require('./src/analyzers/seoAnalyzer');
const analyzer = new SEOAnalyzer();

const results = await analyzer.analyze({
  title: 'Your Page Title',
  description: 'Your meta description',
  keywords: 'keyword1, keyword2',
  html: '<h1>Content</h1><p>Your HTML content</p>',
  language: 'en',
});

console.log(`Score: ${results.percentage}%`);
console.log(`Grade: ${results.grade}`);
```

## �🔒 Security

- Context isolation enabled
- Node integration disabled
- Secure IPC via preload scripts
- Content Security Policy configured

## � Documentation

Comprehensive documentation for SEO analyzer services and integration:

- **[API Documentation](./docs/SEO_ANALYZER_API.md)** - Complete backend API reference
  - SEO Analyzer methods and data structures
  - Recommendation Engine output format
  - HTML Parser capabilities
  - IPC interface documentation
  - Usage examples and integration patterns

- **[Integration Gaps](./docs/INTEGRATION_GAPS.md)** - Gap analysis and action plan
  - Identified gaps between frontend and backend
  - Prioritized fixes with code examples
  - Implementation timeline (16 hours total)
  - Testing checklist

- **[Documentation Overview](./docs/README.md)** - Quick reference guide

## 📄 License

MIT

---

**Status:** Phase 4 In Progress 🚧 | Content Optimization Services Added ✅ | Mini-Services Collection Complete 🎯

## 🧰 Editor setup: make VS Code show the same eslint problems as `yarn lint`

If the ESLint extension reports different problems than `yarn lint`, follow these steps to align them:

1. Make sure dependencies are installed in the workspace root:

```powershell
yarn install
```

2. Reload VS Code window (Developer: Reload Window).

3. Ensure the ESLint extension is installed and enabled. The workspace contains recommended settings in `.vscode/settings.json` which:

- Uses workspace Node modules
- Validates JS/TS/JSX/TSX files
- Runs ESLint on save and applies auto-fixes

4. If you still see mismatches:

- Set `"eslint.debug": true` in `.vscode/settings.json` and check the "Output" panel > ESLint for how the extension locates config files.
- Confirm the ESLint extension is using the workspace version (not a globally bundled engine). The Output panel will show the path.
- Run `yarn lint --debug` in a terminal to compare the CLI resolver details.

5. Common causes:

- Missing node_modules in workspace
- Different ESLint versions between CLI and extension
- The extension not detecting the flat config; adjusting `eslint.workingDirectories` in `.vscode/settings.json` to the project root can help

If you want, I can enable `eslint.debug` and help interpret the extension logs.
