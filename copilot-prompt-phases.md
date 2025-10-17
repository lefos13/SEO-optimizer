# Copilot Implementation Prompts for SEO Optimizer Tool

## General Copilot Instructions (Use for entire project)

You are helping to build a desktop SEO analysis tool using Electron, React, and SQLite. This tool analyzes content for SEO optimization and provides recommendations. Keep these guidelines in mind throughout development:

### Code Style & Standards

- Use modern JavaScript/TypeScript with ES6+ features
- Follow React functional components with hooks
- Use async/await for asynchronous operations
- Implement proper error handling and validation
- Add comprehensive comments for complex logic
- Follow security best practices for Electron apps

### Architecture Principles

- Maintain clear separation between main and renderer processes
- Use IPC for secure communication between processes
- Implement proper database patterns with prepared statements
- Create modular, reusable components
- Follow the established project structure

### SEO Domain Knowledge

- Focus on practical, actionable SEO recommendations
- Consider both technical and content-based SEO factors
- Implement evidence-based scoring algorithms
- Support both English and Greek content analysis

---

## Phase 1: Project Foundation & Setup

### Prompt 1.1: Initialize Electron Project Structure

Create the basic Electron project structure with the following requirements:

- Initialize npm project with proper package.json
- Set up Electron with main.js and basic window configuration
- Create the folder structure as outlined in the development plan
- Configure webpack for both main and renderer processes
- Add scripts for development and building
- Include electron-builder configuration for packaging
- Set up basic HTML/CSS for the main window
- Ensure proper security settings (contextIsolation, nodeIntegration disabled)

### Prompt 1.2: SQLite Database Integration

Implement the SQLite database layer:

- Install and configure better-sqlite3 for Electron
- Create dbManager.js in the main process
- Implement the database schema (projects, analyses, seo_rules, mini_service_results tables)
- Add database initialization and migration system
- Create basic CRUD operations for each table
- Implement database connection management
- Add proper error handling and logging
- Create IPC handlers for database operations

### Prompt 1.3: Basic React Setup

Set up the React frontend:

- Configure React in the renderer process
- Set up webpack configuration for React
- Create basic component structure (App, Layout, Navigation)
- Implement basic routing (if needed)
- Add CSS framework or styling solution
- Create basic UI components (Button, Input, Card, etc.)
- Set up the development environment with hot reloading

---

## Phase 2: SEO Analysis Engine Core

### Prompt 2.1: SEO Rules Engine Foundation

Create the core SEO analysis engine:

- Implement seoAnalyzer.js with rule-based analysis system
- Create rule definitions for meta tags analysis (title, description, keywords)
- Implement HTML content parser
- Add keyword density calculation
- Create scoring algorithm for individual rules
- Implement overall SEO score calculation
- Add rule weighting system
- Include proper error handling for malformed content

### Prompt 2.2: Content Analysis Rules Implementation

Extend the SEO analyzer with comprehensive content analysis:

- Implement header tags analysis (H1, H2, H3 hierarchy)
- Add internal/external link analysis
- Create image analysis (alt tags, file names)
- Implement URL structure analysis
- Add content length analysis
- Create duplicate content detection
- Implement schema markup detection
- Add readability analysis (basic implementation)

### Prompt 2.3: Technical SEO Analysis

Add technical SEO analysis capabilities:

- Implement HTML validation checks
- Add canonical tag analysis
- Create meta robots tag analysis
- Implement SSL/HTTPS detection
- Add mobile-friendliness indicators
- Create page structure analysis
- Implement accessibility checks (basic)
- Add performance indicators (where possible offline)

### Prompt 2.4: Recommendation Engine

Create the recommendation system:

- Implement recommendation generation based on rule failures
- Create priority levels for recommendations (Critical, High, Medium, Low)
- Add specific, actionable improvement suggestions
- Implement before/after impact estimation
- Create recommendation categorization
- Add multi-language support for recommendations
- Implement recommendation persistence

---

## Phase 3: User Interface Development

### Prompt 3.1: Main Dashboard UI

Create the main application dashboard:

- Design and implement the main dashboard layout
- Create project management interface (create, list, delete projects)
- Add analysis history display
- Implement SEO score visualization (charts, progress bars)
- Create quick analysis entry form
- Add navigation between different sections
- Implement responsive design principles

### Prompt 3.2: Analysis Results Interface

Build the analysis results display:

- Create comprehensive results display component
- Implement score breakdown visualization
- Add detailed recommendations list with priorities
- Create before/after comparison views
- Implement filtering and sorting of results
- Add export functionality for results
- Create printable report layout

### Prompt 3.3: Content Input Interface

Develop content input and analysis trigger:

- Create multiple input methods (URL, direct text, file upload)
- Implement content preview functionality
- Add target keywords input interface
- Create analysis configuration options
- Implement progress indicators during analysis
- Add validation for different input types
- Create content type detection

---

## Phase 4: Mini-Services Implementation

### Prompt 4.1: Keyword Services

Implement keyword-related mini-services:

- Create keyword density analyzer with visualization
- Implement LSI keyword generator using local algorithms
- Add keyword difficulty estimation (basic scoring)
- Create long-tail keyword suggestions
- Implement keyword research based on content analysis
- Add keyword clustering functionality
- Create keyword tracking and monitoring

### Prompt 4.2: Readability Analyzer

Build comprehensive readability analysis:

- Implement multiple readability formulas (Flesch-Kincaid, Gunning Fog, SMOG, etc.)
- Create readability score visualization
- Add sentence and paragraph analysis
- Implement reading level recommendations
- Create readability improvement suggestions
- Add language-specific readability rules
- Implement real-time readability scoring

### Prompt 4.3: Content Optimization Tools

Develop content optimization utilities:

- Create content structure analyzer
- Implement heading optimization suggestions
- Add internal linking recommendations
- Create content length optimization
- Implement content gap analysis
- Add competitive content analysis features
- Create content improvement workflows

### Prompt 4.4: URL and Technical Tools

Build technical SEO mini-services:

- Create URL structure analyzer and optimizer
- Implement meta tag generator with templates
- Add schema markup generator for common types
- Create sitemap analyzer (basic)
- Implement redirect chain analyzer
- Add robots.txt analyzer
- Create technical SEO checklist generator

---

## Phase 5: Advanced Features

### Prompt 5.1: Multi-language Support

Implement internationalization:

- Set up i18next configuration for English and Greek
- Create language switching functionality
- Implement language-specific SEO rules
- Add localized content analysis
- Create translated UI elements
- Implement language detection for content
- Add cultural considerations for SEO rules

### Prompt 5.2: Data Export/Import System

Build data management features:

- Implement full database export functionality
- Create project-specific export options
- Add data import with validation
- Implement version compatibility checking
- Create report generation (PDF, HTML)
- Add data backup and restore functionality
- Implement data migration between versions

### Prompt 5.3: Settings and Configuration

Develop application settings:

- Create user preferences interface
- Implement SEO rule customization
- Add analysis configuration options
- Create language and regional settings
- Implement theme and appearance options
- Add performance and optimization settings
- Create backup and data management settings

---

## Phase 6: Testing and Polish

### Prompt 6.1: Comprehensive Testing Implementation

Add testing throughout the application:

- Create unit tests for SEO analysis functions
- Implement integration tests for database operations
- Add UI component testing
- Create end-to-end testing scenarios
- Implement performance testing
- Add error handling testing
- Create cross-platform compatibility tests

### Prompt 6.2: Performance Optimization

Optimize application performance:

- Implement lazy loading for large components
- Add database query optimization
- Create efficient memory management
- Implement caching strategies
- Add progress indicators for long-running operations
- Optimize bundle size
- Implement worker threads for heavy computations

### Prompt 6.3: Final Polish and Documentation

Complete the application:

- Create user documentation and help system
- Implement tooltips and user guidance
- Add error messages and user feedback
- Create application icons and branding
- Implement auto-updater configuration
- Add logging and debugging features
- Create installation and deployment guides

---

## Specialized Prompts for Complex Features

### Advanced Prompt A: SEO Rule Engine Architecture

Create a sophisticated, extensible SEO rule engine:

- Design a plugin-style architecture for SEO rules
- Implement rule chaining and dependencies
- Create rule conflict resolution
- Add rule performance monitoring
- Implement rule version management
- Create rule testing framework
- Add rule marketplace concept (for future)

### Advanced Prompt B: AI-Enhanced Recommendations

Implement smart recommendation features:

- Create content quality assessment algorithms
- Implement competitive analysis features
- Add trend analysis for keywords
- Create personalized recommendation learning
- Implement natural language processing for content analysis
- Add semantic analysis capabilities
- Create intent detection for queries

### Advanced Prompt C: Advanced Analytics Dashboard

Build comprehensive analytics features:

- Create SEO score trending over time
- Implement comparative analysis features
- Add benchmark scoring against industry standards
- Create detailed analytics dashboards
- Implement data visualization libraries
- Add custom report generation
- Create analytics export functionality

---

## Debugging and Troubleshooting Prompts

### Debug Prompt 1: Electron-specific Issues

Help debug Electron-specific problems:

- Troubleshoot IPC communication issues
- Debug security context problems
- Fix packaging and distribution issues
- Resolve cross-platform compatibility problems
- Debug performance issues in Electron apps
- Fix memory leaks and optimization problems

### Debug Prompt 2: SQLite Integration Issues

Resolve database-related problems:

- Debug SQLite connection issues
- Fix database migration problems
- Resolve query performance issues
- Debug data integrity problems
- Fix transaction handling issues
- Resolve database locking problems

### Debug Prompt 3: React and UI Issues

Address frontend-specific problems:

- Debug React component rendering issues
- Fix state management problems
- Resolve styling and layout issues
- Debug user interaction problems
- Fix responsive design issues
- Resolve accessibility problems

---

## Usage Instructions

1. **Start with Phase 1 prompts** in order to establish the foundation
2. **Use one prompt at a time** - don't combine multiple prompts
3. **Test each implementation** before moving to the next prompt
4. **Customize prompts** based on your specific preferences or issues encountered
5. **Use debugging prompts** when you encounter specific problems
6. **Reference the development plan** document for additional context

Each prompt is designed to be a manageable chunk of work that can be completed in 2-4 hours of focused development time.
