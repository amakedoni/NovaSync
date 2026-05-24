import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage } from 'electron';
import { createChatWindow, getChatWindow, showChatWindow } from './windows/overlay';
import { createHistoryWindow } from './windows/response';
import { createSettingsWindow } from './windows/settings';
import { registerIpcHandlers } from './ipc/handlers';
import { loadSettings, saveSettings } from './store/settings';
import { initAutoUpdater, stopAutoUpdater } from './services/auto-updater';
import path from 'path';

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

let tray: Tray | null = null;

app.on('second-instance', () => {
  const chat = getChatWindow();
  if (chat) {
    if (chat.isVisible()) {
      chat.hide();
    } else {
      chat.show();
      chat.focus();
    }
  }
});

function createTray() {
  const iconPath = path.join(__dirname, '../resources/icon.png');
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) throw new Error('Icon is empty');
  } catch {
    trayIcon = nativeImage.createEmpty();
  }
  tray = new Tray(trayIcon);
  tray.setToolTip('NovaSync');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide NovaSync',
      click: () => {
        const chat = getChatWindow();
        if (chat?.isVisible()) {
          chat.hide();
        } else {
          showChatWindow();
        }
      },
    },
    { type: 'separator' },
    { label: 'Quit NovaSync', click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => showChatWindow());
}

function tryRegisterHotkey(): string | null {
  const settings = loadSettings();
  const preferred = settings.hotkey || 'Alt+Space';
  const candidates = [preferred, 'Alt+Space', 'Ctrl+Shift+A', 'Ctrl+Shift+Space', 'Alt+Shift+Space'];
  const unique = [...new Set(candidates)];

  for (const hotkey of unique) {
    try {
      const ok = globalShortcut.register(hotkey, () => {
        const chat = getChatWindow();
        if (!chat) return;
        if (chat.isVisible()) {
          chat.hide();
        } else {
          showChatWindow();
        }
      });
      if (ok) {
        console.log(`Hotkey registered: ${hotkey}`);
        return hotkey;
      }
    } catch { /* try next */ }
  }
  return null;
}

app.whenReady().then(() => {
  createChatWindow();
  createHistoryWindow();
  createSettingsWindow();
  registerIpcHandlers();

  // Apply auto-startup setting
  const settings = loadSettings();
  if (typeof settings.launchOnStartup === 'boolean') {
    app.setLoginItemSettings({ openAtLogin: settings.launchOnStartup });
  }

  const registeredHotkey = tryRegisterHotkey();
  if (!registeredHotkey) {
    showChatWindow();
  } else {
    saveSettings({ hotkey: registeredHotkey });
    showChatWindow();
  }

  createTray();

  // Auto-updater (only in packaged app)
  if (app.isPackaged) {
    initAutoUpdater(getChatWindow);
  }

  if (process.platform === 'darwin') {
    app.dock?.hide();
  }
});

app.on('will-quit', () => globalShortcut.unregisterAll());
