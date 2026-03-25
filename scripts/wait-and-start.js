import http from 'http';

const DEV_URL = 'http://localhost:5173';
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 1000;

function checkServer(retries = 0) {
  return new Promise((resolve, reject) => {
    if (retries >= MAX_RETRIES) {
      reject(new Error('Vite dev server did not start in time'));
      return;
    }

    http.get(DEV_URL, (res) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        setTimeout(() => checkServer(retries + 1).then(resolve).catch(reject), RETRY_INTERVAL);
      }
    }).on('error', () => {
      setTimeout(() => checkServer(retries + 1).then(resolve).catch(reject), RETRY_INTERVAL);
    });
  });
}

async function startElectron() {
  try {
    console.log('[Electron] Waiting for Vite dev server...');
    await checkServer();
    console.log('[Electron] Vite dev server is ready, starting Electron...');

    const { spawn } = await import('child_process');
    const electronPath = require('electron');
    const child = spawn(electronPath, ['.'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });

    child.on('close', (code) => {
      process.exit(code || 0);
    });
  } catch (error) {
    console.error('[Electron] Failed to start:', error.message);
    process.exit(1);
  }
}

startElectron();
