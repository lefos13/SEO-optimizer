# Quick Start Guide - Development Mode

## Starting the Application

### Option 1: Automated Development Mode (Recommended)

Run the development environment with automatic Electron launch:

```powershell
npm run dev
```

This command will:

1. ✅ Build the main process
2. ✅ Build the preload script
3. ✅ Start the renderer dev server
4. ✅ Automatically launch Electron
5. ✅ Watch for changes and rebuild

**Expected Output:**

```
📦 Starting webpack for main process...
📦 Starting webpack for preload script...
📦 Starting webpack dev server for renderer...

🚀 Development environment starting...

✅ Main process ready
✅ Preload script ready
✅ Renderer ready
✅ All builds complete, starting Electron...
```

The Electron window should open automatically showing the SEO Optimizer welcome screen.

---

### Option 2: Manual Start (If Automated Doesn't Work)

If the automated script doesn't work, you can start components manually:

#### Step 1: Build initial files

```powershell
npm run build:main
npm run build:preload
```

#### Step 2: Start the dev server (in a new terminal)

```powershell
npm run dev:renderer
```

Wait for "webpack compiled successfully" message.

#### Step 3: Start Electron (in another new terminal)

```powershell
npx electron .
```

---

## What You Should See

### Electron Window

- **Title**: SEO Optimizer
- **Size**: 1200x800 pixels
- **Content**: Welcome screen with 4 feature cards:
  - 🔍 Content Analysis
  - 🌐 Multi-language
  - 🛠️ Mini-services
  - 💾 Local Storage

### Browser DevTools

DevTools should be open automatically in development mode showing:

- Console tab with "IPC test: pong" message
- No errors in the console

---

## Troubleshooting

### Problem: No Window Opens

**Solution 1**: Check if builds completed successfully

```powershell
# Look for these messages:
# webpack 5.x compiled successfully
```

**Solution 2**: Check if port 3000 is available

```powershell
# If port 3000 is in use, kill the process or change the port
# in webpack.renderer.config.js (devServer.port)
```

**Solution 3**: Manually start Electron

```powershell
npx electron .
```

### Problem: Window Opens but Shows Blank/Error

**Check 1**: Verify dev server is running

- Open http://localhost:3000 in your browser
- You should see the React app

**Check 2**: Check Electron console

- Look for errors in the DevTools console
- Common issues:
  - CSP violations
  - Failed to load resources
  - React rendering errors

**Fix**: Restart the development environment

```powershell
# Stop current process (Ctrl+C)
npm run dev
```

### Problem: "Cannot find module" Errors

**Solution**: Rebuild the project

```powershell
# Clean and rebuild
rm -r dist
npm run build
npm run dev
```

### Problem: Changes Not Reflecting

**Renderer changes** should hot-reload automatically.

**Main/Preload changes** require Electron restart:

1. Close the Electron window
2. Wait for webpack to finish rebuilding
3. Start Electron again: `npx electron .`

---

## Development Workflow

### Making Changes

#### Renderer Process (React Components)

1. Edit files in `src/renderer/`
2. Save the file
3. Changes appear automatically (hot reload)

#### Main Process (Electron)

1. Edit files in `src/main/`
2. Save the file
3. Close and restart Electron window

#### Styles (CSS)

1. Edit files in `src/renderer/styles/`
2. Save the file
3. Styles update automatically

#### Shared Code

1. Edit files in `src/shared/`
2. May need to restart depending on usage

---

## Keyboard Shortcuts

In the Electron window (development mode):

- **Ctrl+R** (Cmd+R): Reload the renderer
- **Ctrl+Shift+I** (Cmd+Option+I): Toggle DevTools
- **Ctrl+C** in terminal: Stop all processes

---

## Stopping Development Mode

**From Terminal:**

```powershell
Ctrl+C
```

This will stop:

- ✅ Webpack watchers
- ✅ Dev server
- ✅ Electron application

---

## Next Steps After Starting

Once the application is running:

1. **Explore the UI**: Check that all components render correctly
2. **Test IPC**: Open DevTools and verify "IPC test: pong" appears
3. **Make a change**: Edit `src/renderer/App.tsx` and see it hot reload
4. **Check the structure**: Explore the codebase organization

---

## Production Build

When ready to test production build:

```powershell
# Build for production
npm run build

# Run production version
npm start
```

---

## Getting Help

If you continue to have issues:

1. Check the terminal output for error messages
2. Check the Electron DevTools console
3. Review the error logs
4. See **SETUP_COMPLETE.md** for detailed setup information
5. See **PHASE_1_COMPLETE.md** for complete project overview

---

**Happy Developing! 🚀**
