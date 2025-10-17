const { spawn } = require('child_process');
const path = require('path');

/**
 * Development startup script
 * Builds initial files, starts watchers, dev server, and Electron
 */

let electronProcess = null;
let rendererReady = false;
let mainReady = false;
let preloadReady = false;

// Function to start Electron once everything is ready
function startElectron() {
  if (rendererReady && mainReady && preloadReady && !electronProcess) {
    console.log('\n✅ All builds complete, starting Electron...\n');

    electronProcess = spawn('electron', ['.'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' },
    });

    electronProcess.on('close', () => {
      process.exit(0);
    });
  }
}

// Start webpack for main process
console.log('📦 Starting webpack for main process...');
const mainProcess = spawn('npm', ['run', 'dev:main'], {
  shell: true,
  stdio: 'pipe',
});

mainProcess.stdout.on('data', data => {
  const output = data.toString();
  console.log(`[Main] ${output.trim()}`);

  if (output.includes('compiled successfully')) {
    if (!mainReady) {
      mainReady = true;
      console.log('✅ Main process ready');
      startElectron();
    }
  }
});

mainProcess.stderr.on('data', data => {
  const output = data.toString();
  console.error(`[Main Error] ${output.trim()}`);
  if (output.includes('compiled successfully')) {
    if (!mainReady) {
      mainReady = true;
      console.log('✅ Main process ready');
      startElectron();
    }
  }
});

// Start webpack for preload script
console.log('📦 Starting webpack for preload script...');
const preloadProcess = spawn('npm', ['run', 'dev:preload'], {
  shell: true,
  stdio: 'pipe',
});

preloadProcess.stdout.on('data', data => {
  const output = data.toString();
  console.log(`[Preload] ${output.trim()}`);

  if (output.includes('compiled successfully')) {
    if (!preloadReady) {
      preloadReady = true;
      console.log('✅ Preload script ready');
      startElectron();
    }
  }
});

preloadProcess.stderr.on('data', data => {
  const output = data.toString();
  console.error(`[Preload Error] ${output.trim()}`);
  if (output.includes('compiled successfully')) {
    if (!preloadReady) {
      preloadReady = true;
      console.log('✅ Preload script ready');
      startElectron();
    }
  }
});

// Start webpack dev server for renderer
console.log('📦 Starting webpack dev server for renderer...');
const rendererProcess = spawn('npm', ['run', 'dev:renderer'], {
  shell: true,
  stdio: 'pipe',
});

rendererProcess.stdout.on('data', data => {
  const output = data.toString();
  console.log(`[Renderer] ${output.trim()}`);

  if (output.includes('compiled successfully')) {
    if (!rendererReady) {
      rendererReady = true;
      console.log('✅ Renderer ready');
      startElectron();
    }
  }
});

rendererProcess.stderr.on('data', data => {
  const output = data.toString();
  // Dev server info goes to stderr, so check there too
  if (output.includes('[webpack-dev-server]') || output.includes('<i>')) {
    console.log(`[Renderer Info] ${output.trim()}`);
  } else {
    console.error(`[Renderer Error] ${output.trim()}`);
  }

  if (output.includes('compiled successfully')) {
    if (!rendererReady) {
      rendererReady = true;
      console.log('✅ Renderer ready');
      startElectron();
    }
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down development environment...');

  if (electronProcess) electronProcess.kill();
  mainProcess.kill();
  preloadProcess.kill();
  rendererProcess.kill();

  process.exit(0);
});

process.on('SIGTERM', () => {
  if (electronProcess) electronProcess.kill();
  mainProcess.kill();
  preloadProcess.kill();
  rendererProcess.kill();

  process.exit(0);
});

console.log('\n🚀 Development environment starting...\n');
console.log('Press Ctrl+C to stop all processes\n');
