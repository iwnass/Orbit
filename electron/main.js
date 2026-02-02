const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { autoUpdater } = require('electron-updater');

let mainWindow;
let discordRPC = null;

// Configure auto-updater
autoUpdater.autoDownload = true; // Auto download updates
autoUpdater.autoInstallOnAppQuit = true; // Auto install on quit

// Auto-updater events for logging
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info);
});

autoUpdater.on('error', (err) => {
  console.error('Update error:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log('Download progress:', Math.round(progressObj.percent) + '%');
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info);
  // Electron will show a notification automatically
});

// Enable Discord RPC if available
try {
  const DiscordRPC = require('discord-rpc');
  const clientId = '1466265180953645243'; // Replace with your Discord app client ID
  discordRPC = new DiscordRPC.Client({ transport: 'ipc' });
  
  discordRPC.on('ready', () => {
    console.log('Discord RPC connected');
    setDiscordActivity('Using Orbit');
  });

  discordRPC.login({ clientId }).catch(console.error);
} catch (error) {
  console.log('Discord RPC not available:', error.message);
}

function setDiscordActivity(details) {
  if (discordRPC) {
    discordRPC.setActivity({
      details: details,
      state: 'Journaling and Planning',
      startTimestamp: Date.now(),
      largeImageKey: 'orbit_logo',
      largeImageText: 'Orbit App',
      instance: false,
    }).catch(console.error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true, // Hide menu bar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
  });

  // Remove menu bar completely
  mainWindow.setMenuBarVisibility(false);

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools(); // Open in dev mode
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    // Dev tools available via Ctrl+Shift+I but won't open automatically
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Check for updates when app is ready (only in production)
  if (!app.isPackaged) {
    console.log('Development mode - skipping update check');
  } else {
    console.log('Checking for updates...');
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 3000); // Wait 3 seconds after app loads
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  if (discordRPC) {
    discordRPC.destroy();
  }
});

// Get user data path
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

// File system operations
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('copy-file', async (event, sourcePath, destPath) => {
  try {
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(sourcePath, destPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-file', async (event, filePath) => {
  try {
    await fs.unlink(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-files', async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath);
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Update Discord RPC activity
ipcMain.on('discord-activity', (event, details) => {
  setDiscordActivity(details);
});

// Auto-updater handlers
ipcMain.on('check-for-updates', () => {
  console.log('Manual check for updates requested');
  autoUpdater.checkForUpdates();
});

ipcMain.on('download-update', () => {
  console.log('Download update requested');
  autoUpdater.downloadUpdate();
});

ipcMain.on('install-update', () => {
  console.log('Install update requested - restarting app');
  autoUpdater.quitAndInstall();
});