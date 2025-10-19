# System Utilities and Guidelines

## Windows Command Line (PowerShell/cmd)

```powershell
# Navigation
cd <path>              # Change directory
dir                   # List directory contents
ls                    # Alternative list (if available)

# File operations
copy <src> <dest>     # Copy files
move <src> <dest>     # Move/rename files
del <file>           # Delete file
rmdir <dir>          # Remove directory

# Text search
findstr /s /i "pattern" *    # Search text in files
findstr /s /n "text" *.js    # Search with line numbers

# Process management
tasklist              # List running processes
taskkill /PID <pid>   # Kill process by ID
taskkill /IM <name>   # Kill process by name
```

## File System Operations

```powershell
# Create directory structure
mkdir -p <path>       # Create nested directories
New-Item -ItemType Directory -Path <path>  # PowerShell

# Find files recursively
dir /s /b *.js        # Find all JS files
Get-ChildItem -Recurse -Filter *.jsx  # PowerShell

# File permissions (limited on Windows)
icacls <file>         # Check permissions
```

## Git Operations

```bash
# Basic workflow
git status
git add .
git commit -m "message"
git push origin main
git pull origin main

# Branching
git checkout -b feature-branch
git merge feature-branch
git branch -d feature-branch

# History
git log --oneline
git diff HEAD~1
git blame <file>
```

## Development Guidelines

### Code Organization

- **One responsibility per file**: Each file should have a single purpose
- **Consistent naming**: camelCase for functions, PascalCase for components
- **Clear exports**: Use named exports for better tree-shaking
- **Import grouping**: Group imports by type (React, third-party, local)

### Error Handling

- **Try-catch blocks**: Wrap async operations
- **User feedback**: Show meaningful error messages
- **Logging**: Use console.warn/error appropriately
- **Graceful degradation**: Handle failures without crashing

### Performance Considerations

- **React optimization**: Use React.memo, useMemo, useCallback
- **Bundle size**: Minimize dependencies, tree-shake unused code
- **Database queries**: Use prepared statements, limit result sets
- **Memory management**: Clean up event listeners and timers

### Security Best Practices

- **Input validation**: Validate all user inputs
- **XSS prevention**: Sanitize HTML content
- **Secure IPC**: Only expose necessary APIs in preload
- **Content Security Policy**: Restrict resource loading

### Testing Approach

- **Manual testing**: Test all user interactions
- **Cross-platform**: Test on Windows, macOS, Linux
- **Database integrity**: Test with various data states
- **Error scenarios**: Test failure conditions

### Documentation Standards

- **README updates**: Update for new features
- **Code comments**: Document complex logic
- **API documentation**: Document IPC interfaces
- **Changelog**: Track changes and fixes

### Commit Message Conventions

```
feat: add new mini-service component
fix: resolve database connection issue
docs: update API documentation
style: format code with prettier
refactor: simplify analysis logic
test: add unit tests for utils
```

### Environment Setup

- **Node.js**: Version compatible with Electron
- **Yarn**: Use yarn instead of npm
- **Git**: Configure user name and email
- **Editor**: Configure for ESLint and Prettier
- **DevTools**: Enable React DevTools extension
