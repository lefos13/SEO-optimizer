# Development Commands

## Core Development Commands

```bash
# Install dependencies
yarn install

# Development mode with hot reload and DevTools
yarn dev

# Development mode with clean database reset
yarn dev:clean

# Production build and run
yarn start
```

## Build Commands

```bash
# Build webpack bundle only
yarn webpack:build

# Watch mode for development (webpack only)
yarn webpack:watch

# Build for all platforms
yarn build

# Platform-specific builds
yarn build:win    # Windows
yarn build:mac    # macOS
yarn build:linux  # Linux
```

## Code Quality Commands

```bash
# Run ESLint
yarn lint

# Fix ESLint errors automatically
yarn lint:fix

# Format code with Prettier
yarn format

# Check Prettier formatting
yarn format:check
```

## Database Commands

```bash
# Reset database (development)
yarn db:reset
```

## Testing Commands

```bash
# Run tests (currently placeholder)
yarn test
```

## Windows-Specific Commands

```powershell
# List directory contents
dir
ls

# Change directory
cd <path>

# Create directory
mkdir <dirname>

# Remove file/directory
rm <file>
del <file>
rmdir <dirname>

# Copy files
copy <source> <destination>
cp <source> <destination>

# Find files
dir /s /b <pattern>
findstr /s /i <pattern> *

# Git commands (same as Unix)
git status
git add .
git commit -m "message"
git push
git pull
```

## Development Workflow

1. `yarn install` - Install dependencies
2. `yarn dev` - Start development with hot reload
3. Make changes to code
4. `yarn lint:fix` - Fix any linting issues
5. `yarn format` - Format code
6. Test functionality
7. `yarn build` - Create production build

## When Task is Completed

1. Run `yarn lint:fix` to fix any linting errors
2. Run `yarn format` to format code consistently
3. Test the functionality thoroughly
4. If database changes were made, consider `yarn db:reset` for testing
5. Run `yarn build` to ensure production build works
6. Commit changes with descriptive message
