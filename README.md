# SEO Optimizer

A standalone desktop SEO analysis and optimization tool built with Electron, React, and SQLite.

## Features

- 🔍 **Comprehensive SEO Analysis**: Analyze content for technical SEO, content quality, and user experience
- 🌐 **Multi-language Support**: English and Greek language analysis
- 💾 **Local Storage**: All data stored securely using SQLite
- 🛠️ **Mini-services**: Keyword generator, readability analyzer, and more
- 📊 **Detailed Reports**: Get actionable recommendations with priority levels
- 🔒 **Privacy-focused**: No external dependencies, all processing done locally

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **React**: Modern UI library with TypeScript
- **SQLite**: Local database for data persistence
- **better-sqlite3**: Fast SQLite3 bindings for Node.js
- **i18next**: Internationalization framework
- **Webpack**: Module bundler for optimized builds

## Project Structure

```
seo-optimizer/
├── src/
│   ├── main/              # Electron main process
│   │   ├── database/      # Database management
│   │   ├── services/      # Business logic services
│   │   └── utils/         # Utility functions
│   ├── renderer/          # React renderer process
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS styles
│   ├── shared/            # Shared code between processes
│   │   ├── constants/     # Constants
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── locales/           # Internationalization files
├── assets/                # Static assets (icons, images)
├── database/              # SQLite database files
└── build/                 # Build resources

```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd seo-optimizer
```

2. Install dependencies:

```bash
npm install
```

3. Initialize Husky (for git hooks):

```bash
npm run prepare
```

### Development

Start the application in development mode with hot reload:

```bash
npm run dev
```

This will:

- Start the webpack dev server for the renderer process on port 3000
- Watch and rebuild the main process on changes
- Launch the Electron application

### Building

Build the application for production:

```bash
npm run build
```

Package the application for distribution:

```bash
# Package for all platforms
npm run package

# Package for specific platform
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
```

### Scripts

- `npm start` - Start the production build
- `npm run dev` - Start development mode
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Code Quality

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for pre-commit hooks
- **lint-staged** for staged files linting

Pre-commit hooks will automatically:

- Lint and fix TypeScript/JavaScript files
- Format all staged files
- Run type checking

## Security

This application follows Electron security best practices:

- Context isolation enabled
- Node integration disabled in renderer
- Sandbox mode enabled
- Preload script for secure IPC communication
- Content Security Policy configured

## License

MIT

## Contributing

Contributions are welcome! Please follow the code style guidelines and ensure all tests pass before submitting a pull request.
