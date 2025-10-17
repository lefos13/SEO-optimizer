@echo off
echo Building initial files...
call npm run build:main
call npm run build:preload

echo.
echo Starting development environment...
echo This will start:
echo - Webpack watchers for main and preload processes
echo - Webpack dev server for renderer process
echo - Electron application
echo.

start "Webpack Main" cmd /c "npm run dev:main"
timeout /t 2 /nobreak >nul

start "Webpack Preload" cmd /c "npm run dev:preload"
timeout /t 2 /nobreak >nul

start "Webpack Renderer" cmd /c "npm run dev:renderer"
timeout /t 5 /nobreak >nul

echo Launching Electron...
electron .
