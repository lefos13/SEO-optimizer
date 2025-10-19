# Code Style and Conventions

## JavaScript/React Conventions

- **ES6+ Features**: Arrow functions, destructuring, template literals, async/await
- **React**: Functional components with hooks, automatic JSX runtime
- **Imports**: ES6 modules, no CommonJS in renderer process
- **Naming**: camelCase for variables/functions, PascalCase for components
- **File Extensions**: `.js` for JavaScript, `.jsx` for React components

## Code Quality Standards

- **ESLint**: Strict rules with React and React Hooks plugins
- **Prettier**: Code formatting with consistent style
- **PropTypes**: Warn level validation for React props
- **Unused Variables**: Error level, with underscore prefix for ignored vars
- **Console**: Allowed only for warn/error in production code

## File Organization

- **Components**: One component per file, named after the component
- **Styles**: Modular SASS with underscore prefixes (\_variables.scss, \_mixins.scss)
- **Utilities**: Pure functions in utils directories
- **Constants**: Defined in appropriate module files

## Documentation

- **JSDoc**: Comprehensive comments for complex functions
- **README**: Detailed project documentation
- **Inline Comments**: For complex business logic
- **Component Comments**: Purpose and props documentation

## Security Practices

- **Context Isolation**: Enabled in Electron
- **Node Integration**: Disabled in renderer
- **IPC Communication**: Secure preload scripts only
- **Content Security Policy**: Configured for security

## Database Patterns

- **Prepared Statements**: All SQL queries use prepared statements
- **Async Operations**: All database operations are async
- **Connection Management**: Proper initialization and cleanup
- **Error Handling**: Comprehensive error handling for DB operations
