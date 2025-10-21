# Webpack Build System for Electron + TypeScript

**Date**: October 21, 2025  
**Status**: ✅ Fully Implemented and Working

---

## Overview

This project uses **three separate Webpack configurations** for building the Electron application - one for each process:

1. **Main Process** (`webpack.main.config.js`) - Electron main process
2. **Preload Script** (`webpack.preload.config.js`) - Context bridge
3. **Renderer Process** (`webpack.renderer.config.js`) - React UI

This is the **industry standard** approach for Electron + TypeScript projects.

---

## Why Webpack for All Processes?

### Previous Approach (❌ Didn't Work)

- Used `tsc` (TypeScript compiler) for main process
- Used Webpack for renderer process
- **Problem**: Preload script not found, incorrect output structure

### Current Approach (✅ Working)

- **Webpack for everything** - consistent build tool
- Proper output structure that Electron expects
- Simplified hot reload configuration
- Better bundling and optimization

---

## Build Configuration Files

### 1. webpack.main.config.js

```javascript
module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/main.ts',
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    clean: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.main.json',
            transpileOnly: true,
          },
        },
      },
    ],
  },
  externals: {
    electron: 'commonjs2 electron',
    'electron-reload': 'commonjs2 electron-reload',
    chokidar: 'commonjs2 chokidar',
    'sql.js': 'commonjs2 sql.js',
  },
};
```

**Key Points:**

- `target: 'electron-main'` - Optimizes for Node.js environment
- `externals` - Keeps native modules external (not bundled)
- `ts-loader` with `transpileOnly` for faster compilation
- Output: `dist/main.js`

### 2. webpack.preload.config.js

```javascript
module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/preload/preload.ts',
  target: 'electron-preload',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'preload.js',
    clean: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.main.json',
            transpileOnly: true,
          },
        },
      },
    ],
  },
  externals: {
    electron: 'commonjs2 electron',
  },
};
```

**Key Points:**

- `target: 'electron-preload'` - Special target for preload scripts
- Minimal externals (only electron)
- Output: `dist/preload.js`

### 3. webpack.renderer.config.js

```javascript
module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/renderer/index.tsx',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js',
    clean: false,
  },
  module: {
    rules: [
      // TypeScript
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.renderer.json',
            transpileOnly: true,
          },
        },
      },
      // SASS
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
    }),
  ],
};
```

**Key Points:**

- `target: 'electron-renderer'` - Browser-like environment
- Handles React, TypeScript, and SASS
- `HtmlWebpackPlugin` generates HTML entry point
- Output: `dist/renderer.js` and `dist/index.html`

---

## Output Structure

After building, the `dist/` directory contains:

```
dist/
├── main.js              # Main process bundle (168 KB)
├── main.js.map          # Source map for debugging
├── preload.js           # Preload script bundle (3.6 KB)
├── preload.js.map       # Source map
├── renderer.js          # Renderer bundle (1 MB in dev, 1 MB minified)
├── renderer.js.map      # Source map
├── index.html           # HTML entry point
└── renderer.js.LICENSE.txt  # Third-party licenses
```

**All files in one directory** - exactly what Electron expects!

---

## Build Scripts (package.json)

### Development Mode

```bash
yarn dev
```

Runs:

1. `webpack:main:watch` - Watches and compiles main process
2. `webpack:preload:watch` - Watches and compiles preload
3. `webpack:renderer:watch` - Watches and compiles renderer
4. `wait-on` - Waits for all outputs to exist
5. `electron:dev` - Starts Electron with `--dev` flag

**Result**: Hot reload for all three processes!

### Production Build

```bash
yarn build:all
```

Runs:

1. `clean` - Cleans dist folder
2. `webpack:main` - Builds main process (production mode)
3. `webpack:preload` - Builds preload script (production mode)
4. `webpack:renderer` - Builds renderer (production mode, minified)

### Full Distributable

```bash
yarn build
```

Runs `build:all` then `electron-builder` to create installers.

---

## File Paths in main.ts

With webpack, `__dirname` points to `dist/` (where main.js is), so paths are simple:

```typescript
const win = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'), // ← dist/preload.js
  },
});

const htmlPath = path.join(__dirname, 'index.html'); // ← dist/index.html

// For hot reload (watching source files)
const srcPath = path.join(__dirname, '..', 'src'); // ← src/
```

---

## Hot Reload Configuration

### Main Process Hot Reload

Uses `electron-reload` to watch the `src/` directory:

```typescript
if (isDev) {
  const electronReload = require('electron-reload');
  const srcPath = path.join(__dirname, '..', 'src');
  electronReload(srcPath, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit',
    ignored: /node_modules|[/\\]\.|dist|build/,
  });
}
```

**Result**: Changes to main process TypeScript → webpack recompiles → electron-reload restarts app

### Renderer Process Hot Reload

Uses `chokidar` to watch renderer source files:

```typescript
if (isDev) {
  const chokidar = require('chokidar');
  const srcDir = path.join(__dirname, '..');
  const rendererWatcher = chokidar.watch([
    path.join(srcDir, 'src', 'renderer', '**', '*'),
    path.join(srcDir, 'public', '**', '*'),
  ]);

  rendererWatcher.on('change', filePath => {
    win.webContents.reload();
  });
}
```

**Result**: Changes to renderer files → webpack recompiles → window reloads (no restart)

---

## Benefits of This Approach

1. ✅ **Consistent Build Tool** - Webpack for everything
2. ✅ **Simple Output Structure** - All files in `dist/`
3. ✅ **Proper TypeScript Support** - ts-loader in all configs
4. ✅ **Fast Compilation** - `transpileOnly: true` for speed
5. ✅ **Source Maps** - Debugging works perfectly
6. ✅ **Hot Reload** - Works for all processes
7. ✅ **External Modules** - Native modules not bundled
8. ✅ **Industry Standard** - How professional Electron apps are built

---

## Common Issues Solved

### ❌ "Unable to load preload script"

**Cause**: Preload script not compiled or wrong path  
**Solution**: Webpack compiles preload.ts → dist/preload.js, path.join(\_\_dirname, 'preload.js')

### ❌ "Cannot read properties of undefined (reading 'projects')"

**Cause**: electronAPI not exposed properly  
**Solution**: Preload script correctly compiled and loaded

### ❌ Files not found after build

**Cause**: Webpack `clean: true` removes previous outputs  
**Solution**: Set `clean: false` in all configs, use explicit `yarn clean` script

---

## Verification

### Check Output Files

```bash
ls dist/
# Should show: main.js, preload.js, renderer.js, index.html
```

### Test Development Mode

```bash
yarn dev
# Should show:
# - [webpack 5.102.1 compiled successfully] (3 times)
# - [DB] Database initialized successfully
# - [APP] Application initialized successfully
```

### Test Production Build

```bash
yarn build:all
# Should create optimized bundles without errors
```

---

## TypeScript Configuration

### tsconfig.main.json (Main & Preload)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node"
    // ⚠️ outDir not used (webpack handles output)
    // ⚠️ noEmit not used (ts-loader compiles)
  }
}
```

### tsconfig.renderer.json (Renderer)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
    // ⚠️ noEmit: true (webpack handles output)
  }
}
```

**Note**: TypeScript configs are for type checking only. Webpack + ts-loader handles actual compilation.

---

## Migration from tsc to Webpack

| Aspect              | Old (tsc)                          | New (Webpack)                             |
| ------------------- | ---------------------------------- | ----------------------------------------- |
| Main compilation    | `tsc --project tsconfig.main.json` | `webpack --config webpack.main.config.js` |
| Preload compilation | `tsc` (included in main)           | Separate webpack config                   |
| Output structure    | `dist/main/**/*.js`                | `dist/*.js` (flat)                        |
| Entry point         | `dist/main/main.js`                | `dist/main.js`                            |
| Preload path        | `dist/main/preload/preload.js`     | `dist/preload.js`                         |
| Watch mode          | `tsc --watch`                      | `webpack --watch`                         |
| Hot reload          | Complex paths                      | Simple paths                              |

---

## Best Practices

1. **Always use `yarn clean` before production builds** - Ensures no stale files
2. **Run `yarn typecheck` separately** - Webpack uses `transpileOnly: true`
3. **Keep webpack configs simple** - Don't over-optimize in development
4. **Use externals for native modules** - Don't bundle electron, sql.js, etc.
5. **Test both dev and production modes** - They use different webpack modes

---

## Further Reading

- [Electron Forge + Webpack](https://www.electronforge.io/config/plugins/webpack)
- [Electron Webpack Official](https://webpack.electron.build/)
- [TypeScript + Webpack](https://webpack.js.org/guides/typescript/)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
