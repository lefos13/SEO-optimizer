# Contributing to SEO Optimizer

Thank you for your interest in contributing to SEO Optimizer! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to foster an open and welcoming environment.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Setting Up

```bash
# Install dependencies
npm install

# Initialize git hooks
npm run prepare

# Start development mode
npm run dev
```

### Making Changes

1. Make your changes in a feature branch
2. Follow the code style guidelines (enforced by ESLint and Prettier)
3. Write clear, concise commit messages
4. Test your changes thoroughly

### Code Style

This project uses:

- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript** for type safety

Code style is automatically enforced through:

- Pre-commit hooks (Husky)
- Lint-staged for staged files

Run these commands to check your code:

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Format code
npm run format

# Type check
npm run type-check
```

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body

footer
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(analysis): add keyword density calculation
fix(database): resolve connection timeout issue
docs(readme): update installation instructions
```

### Testing

Before submitting a pull request:

1. Test the application in development mode
2. Build and test the production version
3. Test on the target platforms if possible
4. Verify all lint and type checks pass

```bash
# Build production version
npm run build

# Start production version
npm start
```

## Pull Request Process

1. Update the README.md or documentation if needed
2. Ensure all tests pass and code follows style guidelines
3. Update the CHANGELOG.md if applicable
4. Submit the pull request with a clear description of changes
5. Link any related issues

### Pull Request Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

Describe how you tested the changes

## Screenshots (if applicable)

Add screenshots to help explain the changes

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated if needed
```

## Project Structure

Understanding the project structure:

```
src/
├── main/           # Electron main process (Node.js)
│   ├── database/   # SQLite database operations
│   ├── services/   # Business logic
│   └── utils/      # Helper functions
├── renderer/       # React application (Browser)
│   ├── components/ # React components
│   ├── pages/      # Page-level components
│   ├── hooks/      # Custom React hooks
│   └── styles/     # CSS styles
└── shared/         # Code shared between processes
    ├── constants/  # Constants
    ├── types/      # TypeScript interfaces
    └── utils/      # Shared utilities
```

## Architecture Guidelines

### Main Process (Electron)

- Handle system-level operations
- Manage database connections
- Implement IPC handlers
- Never expose Node.js APIs directly to renderer

### Renderer Process (React)

- Build UI components
- Handle user interactions
- Communicate with main via IPC
- Follow React best practices

### Security

- Always use contextBridge for IPC
- Validate all user inputs
- Sanitize data before database operations
- Never disable security features

## Adding New Features

### New IPC Channel

1. Add channel constant to `src/shared/constants/index.ts`
2. Implement handler in `src/main/main.ts`
3. Add method to preload API in `src/main/preload.ts`
4. Use in renderer via `window.electronAPI`

### New SEO Rule

1. Define rule in `src/main/services/seoAnalyzer.ts`
2. Add to database schema if needed
3. Update UI to display results
4. Add translations for both languages

### New Component

1. Create component in appropriate directory
2. Follow functional component pattern
3. Use TypeScript for props
4. Add CSS module if needed
5. Export from index.ts if reusable

## Reporting Issues

When reporting bugs, include:

- Operating system and version
- Node.js and Electron versions
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Error messages or logs

## Feature Requests

For feature requests, describe:

- The problem it solves
- Proposed solution
- Alternative solutions considered
- Additional context

## Questions

If you have questions:

- Check existing documentation
- Search closed issues
- Open a new issue with the "question" label

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

## Thank You!

Your contributions make this project better. Thank you for taking the time to contribute!
