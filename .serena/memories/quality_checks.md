# Testing, Formatting, and Linting

## Linting (ESLint)

- **Command**: `yarn lint`
- **Configuration**: `eslint.config.mjs`
- **Rules**: React, React Hooks, and custom rules
- **Auto-fix**: `yarn lint:fix`
- **Ignores**: node_modules, dist, build, coverage

## Code Formatting (Prettier)

- **Command**: `yarn format`
- **Check only**: `yarn format:check`
- **Configuration**: Default Prettier settings
- **File types**: .js, .jsx, .json, .css, .scss, .md
- **Integration**: ESLint config avoids conflicts

## Testing

- **Command**: `yarn test`
- **Framework**: Currently placeholder (no tests implemented)
- **Test files**: Not yet established
- **Coverage**: Not configured

## Git Hooks (Husky + lint-staged)

- **Pre-commit**: Runs linting and formatting
- **Configuration**: `lint-staged` in package.json
- **Setup**: `yarn prepare` (runs automatically)

## Quality Gates

Before committing code:

1. Run `yarn lint:fix` - Fix linting issues
2. Run `yarn format` - Format code
3. Test functionality manually
4. Run `yarn build` - Ensure build succeeds

## Code Quality Standards

- **ESLint**: Strict rules, no console in production
- **Prettier**: Consistent formatting across team
- **React**: Proper hooks usage, prop validation
- **Security**: Context isolation, no node integration in renderer
- **Performance**: Efficient React patterns, minimal re-renders
