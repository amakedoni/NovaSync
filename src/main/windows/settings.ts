import { BrowserWindow } from 'electron';
import path from 'path';

let settingsWindow: BrowserWindow | null = null;

function getUrl(): string {
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (devUrl) return `${devUrl}?window=settings`;
  return `file://${path.join(__dirname, '../renderer/index.html')}?window=settings`;
}

export function createSettingsWindow(): BrowserWindow {
  settingsWindow = new BrowserWindow({
    width: 420,
    height: 480,
    minWidth: 360,
    minHeight: 400,
    transparent: true,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  settingsWindow.loadURL(getUrl());

  settingsWindow.on('close', (e) => {
    e.preventDefault();
    settingsWindow?.hide();
  });

  return settingsWindow;
}

export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow;
}

export function showSettingsWindow(): void {
  if (settingsWindow) {
    settingsWindow.show();
    settingsWindow.focus();
  }
}

export function hideSettingsWindow(): void {
  settingsWindow?.hide();
}
