# SEO Optimizer

A desktop SEO analysis tool built with Electron, React, and SQLite for content optimization and SEO recommendations.

## 🚀 Features

- Content analysis for SEO optimization
- Real-time scoring and recommendations
- Support for English and Greek content
- SQLite database for analysis history
- Modern, responsive UI with React

## 📁 Project Structure

```
SEO-optimizer/
├── .github/
│   └── copilot-instructions.md    # GitHub Copilot configuration
├── .vscode/
│   ├── settings.json              # VS Code workspace settings
│   └── extensions.json            # Recommended extensions
├── public/
│   └── index.html                 # Main HTML file
├── src/
│   ├── main/                      # Electron main process files
│   │   └── (future IPC handlers)
│   ├── renderer/                  # React renderer process
│   │   ├── components/            # React components
│   │   ├── styles/                # CSS stylesheets
│   │   │   └── main.css          # Main stylesheet
│   │   └── index.js              # Renderer entry point
│   ├── preload/                   # Preload scripts
│   │   └── preload.js            # Context bridge setup
│   ├── database/                  # Database modules
│   ├── analyzers/                 # SEO analysis logic
│   ├── utils/                     # Utility functions
│   └── main.js                   # Electron main entry
├── tests/                         # Test files
├── .eslintrc.json                # ESLint configuration
├── .eslintignore                 # ESLint ignore patterns
├── .prettierrc                   # Prettier configuration
├── .prettierignore               # Prettier ignore patterns
├── .lintstagedrc.json           # Lint-staged configuration
├── .gitignore                    # Git ignore patterns
├── package.json                  # Project dependencies and scripts
└── README.md                     # This file
```

## 🛠️ Development Setup

### Prerequisites

- Node.js (v18 or higher)
- Yarn (v4.5.2 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/lefos13/SEO-optimizer.git
   cd SEO-optimizer
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Initialize Husky (if not already done):
   ```bash
   yarn prepare
   ```

### Available Scripts

- `yarn start` - Start the Electron application
- `yarn dev` - Start with DevTools enabled
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors automatically
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting
- `yarn build` - Build for all platforms
- `yarn build:win` - Build for Windows
- `yarn build:mac` - Build for macOS
- `yarn build:linux` - Build for Linux

## 🧰 Code Quality Tools

### ESLint

The project uses ESLint with React-specific rules. Configuration in `.eslintrc.json`.

### Prettier

Code formatting is handled by Prettier. Configuration in `.prettierrc`.

### Husky & lint-staged

Pre-commit hooks automatically format and lint staged files before commits.

## 🏗️ Architecture

### Main Process (src/main.js)

- Manages application lifecycle
- Creates and controls browser windows
- Handles system-level operations

### Renderer Process (src/renderer/)

- React-based UI
- Communicates with main process via IPC
- Handles user interactions

### Preload Scripts (src/preload/)

- Secure bridge between main and renderer processes
- Exposes specific APIs via contextBridge

### Database (src/database/)

- SQLite integration
- Analysis history storage
- Data persistence

## 📝 Code Style Guidelines

- Use modern ES6+ JavaScript features
- Follow functional React patterns with hooks
- Implement async/await for asynchronous operations
- Add comprehensive comments for complex logic
- Follow security best practices for Electron apps

## 🔒 Security

- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication via preload scripts
- Content Security Policy in HTML

## 📄 License

MIT

## 👤 Author

Your Name

---

**Status**: Phase 1 - Project Foundation Complete ✅
