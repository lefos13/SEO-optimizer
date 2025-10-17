# Windows Build Tools Setup

## Issue: better-sqlite3 Installation Failed

The `better-sqlite3` package requires native compilation on Windows. You have two options:

## Option 1: Install Windows Build Tools (Recommended for Production)

### Step 1: Install Visual Studio Build Tools

Download and install **Visual Studio 2022 Build Tools**:
https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

During installation, select:

- ✅ **Desktop development with C++**
- ✅ MSVC v143 - VS 2022 C++ x64/x86 build tools
- ✅ Windows 10/11 SDK

### Step 2: Retry Installation

After installing the build tools, retry:

```powershell
npm install
```

---

## Option 2: Use Prebuilt Binaries (Quick Start)

If you want to start quickly without installing build tools:

### Step 1: Use a Different SQLite Package

We can temporarily switch to `sql.js` which doesn't require native compilation:

```powershell
npm uninstall better-sqlite3
npm install sql.js --save
```

### Step 2: Update Database Manager

Update `src/main/database/dbManager.ts` to use sql.js instead. This will be a temporary solution until you set up build tools.

**Note**: `sql.js` runs SQLite in memory/WebAssembly and is slower than better-sqlite3, but works without build tools.

---

## Option 3: Use Pre-built better-sqlite3

Try installing a specific version with pre-built binaries:

```powershell
npm install better-sqlite3@8.7.0 --save
```

If this doesn't work, you'll need to install Visual Studio Build Tools (Option 1).

---

## Recommended Approach

For development and production use of this SEO Optimizer tool, **Option 1 is strongly recommended** because:

- ✅ Better performance (better-sqlite3 is ~10x faster than sql.js)
- ✅ Full SQLite feature support
- ✅ Synchronous API (easier to use)
- ✅ Production-ready

## Quick Start Without Native Modules

If you want to start developing immediately while you install build tools:

1. **Temporarily remove better-sqlite3**:

```powershell
# Edit package.json and comment out better-sqlite3 dependency
# Then run:
npm install
```

2. **Start development**:

```powershell
npm run dev
```

3. **Add database later**: Once Visual Studio Build Tools are installed, add better-sqlite3 back and complete the database integration.

---

## Verification

After installing Visual Studio Build Tools, verify the setup:

```powershell
# Check if node-gyp can find Visual Studio
npm install -g node-gyp
node-gyp configure
```

If successful, you should see:

```
gyp info ok
```

Then retry the full installation:

```powershell
npm install
```

---

## Alternative Database Options (If Build Tools Cannot Be Installed)

If you absolutely cannot install Visual Studio Build Tools, consider these alternatives:

1. **sql.js** - SQLite compiled to WebAssembly (slower but no build required)
2. **lowdb** - JSON-based database (simple but limited features)
3. **nedb** - Embedded database (MongoDB-like API)

However, for the best experience with this SEO tool, **better-sqlite3 is the recommended choice**.

---

## Next Steps

1. Choose your approach (Option 1, 2, or 3)
2. Complete the installation
3. Run `npm run dev` to start development
4. Refer to `SETUP_COMPLETE.md` for the development workflow

## Need Help?

If you continue to have issues:

- Ensure you're running PowerShell as Administrator
- Check that Python 3 is installed (required by node-gyp)
- Verify Node.js version compatibility (Node 18+ recommended)
- Review error logs in `C:\Users\[your-user]\AppData\Local\npm-cache\_logs\`
