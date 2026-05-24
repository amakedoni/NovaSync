import { autoUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';

let updateCheckTimer: ReturnType<typeof setInterval> | null = null;

export function initAutoUpdater(getChatWindow: () => BrowserWindow | null): void {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    console.log(`Update available: ${info.version}`);
    // Auto-download since the user likely wants the latest
    autoUpdater.downloadUpdate().catch(() => {});
  });

  autoUpdater.on('update-not-available', () => {
    // No update available — quiet
  });

  autoUpdater.on('update-downloaded', () => {
    const chat = getChatWindow();
    if (chat) {
      chat.webContents.send('chat:update-ready', '');
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err.message);
  });

  // Check for updates on startup (after 10s delay)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 10000);

  // Check every 4 hours
  updateCheckTimer = setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 4 * 60 * 60 * 1000);
}

export function quitAndInstall(): void {
  autoUpdater.quitAndInstall();
}

export function stopAutoUpdater(): void {
  if (updateCheckTimer) {
    clearInterval(updateCheckTimer);
    updateCheckTimer = null;
  }
}
