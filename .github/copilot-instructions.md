## General Copilot Instructions (Use for entire project)

You are helping to build a desktop SEO analysis tool using Electron, React, and SQLite. This tool analyzes content for SEO optimization and provides recommendations. Keep these guidelines in mind throughout development:

FIRST AND MOST IMPORTANT RULE: NEVER generate extra doc files unless explicitly instructed to do so. Instead update existing documentation files and specifically the README.md when necessary.

### Code Style & Standards

- Use modern JavaScript/TypeScript with ES6+ features
- Follow React functional components with hooks
- Use async/await for asynchronous operations
- Implement proper error handling and validation
- Add comprehensive comments for complex logic
- Follow security best practices for Electron apps
- **Keep files under 400 lines of code** - Break large files into smaller, focused modules for maintainability

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

### Documentation Practices

- Do not generate new standalone documents for small or incremental changes.
- Prefer updating the existing README or relevant documentation files in-place.
- Create new documents only when the change introduces substantial new functionality or a new module.
- Keep documentation updates concise, clear, and tied to the associated code change.
