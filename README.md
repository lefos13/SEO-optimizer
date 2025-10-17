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
- 🔄 Content analysis (coming soon)
- 🔄 SEO scoring engine (coming soon)
- 🔄 Multi-language support (EN/GR) (coming soon)

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
└── main.js                  # Electron main entry
```

## 🎨 UI Components

**Views:** Dashboard, Analysis, Reports, Settings  
**UI Components:** Button, Input, Card  
**Styling:** Dark theme with SASS modules

## 🔒 Security

- Context isolation enabled
- Node integration disabled
- Secure IPC via preload scripts
- Content Security Policy configured

## 📄 License

MIT

---

**Status**: React Frontend Complete ✅ | Backend Integration In Progress 🔄
