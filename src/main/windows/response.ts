import { BrowserWindow } from 'electron';
import path from 'path';

let historyWindow: BrowserWindow | null = null;

function getUrl(): string {
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (devUrl) return `${devUrl}?window=history`;
  return `file://${path.join(__dirname, '../renderer/index.html')}?window=history`;
}

export function createHistoryWindow(): BrowserWindow {
  historyWindow = new BrowserWindow({
    width: 360,
    height: 520,
    minWidth: 300,
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

  historyWindow.loadURL(getUrl());

  historyWindow.on('close', (e) => {
    e.preventDefault();
    historyWindow?.hide();
  });

  return historyWindow;
}

export function getHistoryWindow(): BrowserWindow | null {
  return historyWindow;
}

export function showHistoryWindow(): void {
  if (historyWindow) {
    historyWindow.show();
    historyWindow.focus();
  }
}

export function hideHistoryWindow(): void {
  historyWindow?.hide();
}
