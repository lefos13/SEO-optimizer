# Hot Reload Configuration

## 🔥 Hot Reload is Now Enabled!

The project now supports automatic reloading during development, making your workflow much faster.

## How It Works

### Main Process Hot Reload

**Package**: `electron-reload`

Watches for changes in:

- `src/main.js` and any main process files
- `src/preload/preload.js`

**Behavior**: Restarts the entire Electron application when these files change.

### Renderer Process Hot Reload

**Package**: `chokidar` (file watcher)

Watches for changes in:

- `src/renderer/**/*` (all renderer files)
- `public/**/*` (HTML, CSS, static assets)

**Behavior**: Automatically reloads the window content without restarting the app.

## Usage

Simply run the dev script:

```bash
yarn dev
```

This will:

1. Start Electron with the `--dev` flag
2. Enable DevTools automatically
3. Activate hot reload for both main and renderer processes

## Testing Hot Reload

### Test Renderer Reload

1. Run `yarn dev`
2. Open `src/renderer/index.js`
3. Change any text in the HTML template
4. Save the file
5. **Result**: Window content reloads automatically in ~1 second

### Test Main Process Reload

1. Run `yarn dev`
2. Open `src/main.js`
3. Change the window dimensions (width/height)
4. Save the file
5. **Result**: Entire app restarts with new window size

### Test CSS Changes

1. Run `yarn dev`
2. Open `src/renderer/styles/main.css`
3. Change any color or style
4. Save the file
5. **Result**: Styles update instantly

## Configuration Details

### Main Process (src/main.js)

```javascript
// Hot reload is enabled when --dev flag is present
const isDev = process.argv.includes('--dev');

if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit',
    ignored: /node_modules|[/\\]\\.|dist|build/,
  });
}
```

### Renderer Watcher (src/main.js)

```javascript
// Watches renderer and public folders
const chokidar = require('chokidar');
const rendererWatcher = chokidar.watch([
  path.join(__dirname, 'renderer', '**', '*'),
  path.join(__dirname, '..', 'public', '**', '*'),
]);

rendererWatcher.on('change', () => {
  win.webContents.reload(); // Reload window on change
});
```

## Performance Considerations

### Ignored Paths

The following are excluded from watching to improve performance:

- `node_modules/`
- `.git/`
- `dist/`
- `build/`
- Hidden files (starting with `.`)

### Debouncing

File watchers have built-in debouncing to prevent multiple reloads from rapid successive changes.

## Future Enhancements

When you add a bundler (Webpack/Vite), you'll get even better HMR:

### With Webpack

- **Hot Module Replacement (HMR)**: Updates modules without full page reload
- **Preserve state**: React component state persists across updates
- **Faster updates**: Only changed modules are updated

### With Vite

- **Lightning-fast HMR**: Near-instant updates
- **No bundling in dev**: Native ESM for speed
- **Better error overlay**: Visual errors in the browser

## Troubleshooting

### Reload Not Working

**Problem**: Changes don't trigger reload
**Solutions**:

1. Make sure you're running `yarn dev` (not `yarn start`)
2. Check that the file is not ignored (not in `node_modules`, etc.)
3. Verify file is being saved (check editor auto-save settings)

### App Restarts Instead of Reloading

**Problem**: Renderer changes cause full app restart
**Solution**: This happens if changes are detected by `electron-reload` instead of the renderer watcher. Check that file patterns are correct.

### Multiple Reloads

**Problem**: Page reloads multiple times for one change
**Solution**: This can happen with auto-formatters. Debouncing is built-in, but if it persists, check that only one file watcher is active.

### DevTools Not Opening

**Problem**: DevTools don't open automatically
**Solution**: Ensure you're using `yarn dev` (which passes the `--dev` flag).

## Development Workflow

### Recommended Setup

1. **Terminal 1**: Run `yarn dev`
2. **VS Code**: Edit your files
3. **Electron Window**: Watch changes appear instantly

### Tips

- **Keep DevTools open**: Useful for debugging and seeing console output
- **Use console.log**: In renderer files, logs appear in DevTools console
- **Watch the terminal**: Main process logs appear in the terminal
- **Format on save**: Auto-formatting works perfectly with hot reload

## Commands Summary

```bash
# Development with hot reload
yarn dev

# Production-like (no hot reload)
yarn start

# Manual linting
yarn lint

# Manual formatting
yarn format
```

## Dependencies

```json
{
  "electron-reload": "^2.0.0-alpha.1", // Main process hot reload
  "chokidar": "^4.0.3" // File watcher for renderer
}
```

## Learn More

- [electron-reload on GitHub](https://github.com/yan-foto/electron-reload)
- [chokidar on GitHub](https://github.com/paulmillr/chokidar)
- [Electron DevTools](https://www.electronjs.org/docs/latest/tutorial/devtools)

---

**Status**: ✅ Hot Reload Configured and Ready!

Try it now: Run `yarn dev` and start editing files to see instant updates! 🚀
