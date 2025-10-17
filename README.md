# SEO Optimizer

A desktop SEO analysis tool built with Electron, React, and SQLite for content optimization and SEO recommendations.

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

- ✅ React 18 with React Router
- ✅ Modern dark desktop UI theme
- ✅ SASS styling with modular architecture
- ✅ Webpack bundling for JSX and SASS
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
- 🔄 Database Integration for analysis history (coming soon)
- 🔄 React UI connection via IPC (coming soon)

## �️ Available Scripts

- `yarn dev` - Development mode with DevTools and hot reload
- `yarn start` - Production build and run
- `yarn webpack:build` - Build webpack bundle
- `yarn webpack:watch` - Watch mode for development
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn format` - Format code with Prettier
- `yarn build` - Build for all platforms
- `yarn build:win` - Build for Windows
- `yarn build:mac` - Build for macOS
- `yarn build:linux` - Build for Linux

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
│   └── examples.js         # Usage examples
└── main.js                  # Electron main entry
```

## 🎨 UI Components

**Views:** Dashboard, Analysis, Reports, Settings  
**UI Components:** Button, Input, Card  
**Styling:** Dark theme with SASS modules

## � SEO Analysis Engine

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

## 📄 License

MIT

---

**Status:** Phase 2.3 Complete ✅ | SEO Analysis Engine with Technical SEO Operational 🔍
