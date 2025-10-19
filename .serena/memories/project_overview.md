# SEO Optimizer Project Overview

## Project Purpose

SEO Optimizer is a desktop application built with Electron that provides comprehensive SEO analysis and content optimization tools. It analyzes web content for SEO optimization, provides actionable recommendations, and includes specialized mini-services for various SEO tasks.

## Tech Stack

- **Frontend**: React 19.2.0 with React Router DOM 7.9.4
- **Backend**: Electron 38.3.0 (main process) + Node.js
- **Database**: SQLite via sql.js 1.13.0
- **Styling**: SASS 1.93.2 with modular architecture
- **Build Tools**: Webpack 5.102.1, Babel 7.x, Electron Builder 25.1.8
- **Development Tools**: ESLint 9.38.0, Prettier 3.6.2, Husky 9.1.7
- **Package Manager**: Yarn 4.5.2

## Key Features

- SEO Analysis Engine with 13 rules across 4 categories
- Mini-Services Collection (Keyword, Readability, Content optimization tools)
- React-based UI with dark theme
- SQLite database integration
- Multi-language support (English & Greek)
- Hot reload in development
- Cross-platform builds (Windows, macOS, Linux)

## Architecture

- **Main Process**: Electron main window, IPC handlers, database management
- **Renderer Process**: React frontend with routing and components
- **Preload Scripts**: Secure IPC bridge between processes
- **Database Layer**: SQLite operations and persistence
- **Analyzers**: SEO analysis logic and recommendation engine
