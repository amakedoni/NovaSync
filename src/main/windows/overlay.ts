import { BrowserWindow } from 'electron';
import path from 'path';

let chatWindow: BrowserWindow | null = null;

function getUrl(): string {
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (devUrl) return devUrl;
  return `file://${path.join(__dirname, '../renderer/index.html')}`;
}

export function createChatWindow(): BrowserWindow {
  chatWindow = new BrowserWindow({
    width: 480,
    height: 85,
    minWidth: 360,
    minHeight: 80,
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

  chatWindow.loadURL(getUrl());

  chatWindow.on('close', (e) => {
    e.preventDefault();
    chatWindow?.hide();
  });

  return chatWindow;
}

export function getChatWindow(): BrowserWindow | null {
  return chatWindow;
}

export function showChatWindow(): void {
  if (chatWindow) {
    chatWindow.show();
    chatWindow.focus();
    chatWindow.webContents.send('chat:opened');
  }
}

export function hideChatWindow(): void {
  chatWindow?.hide();
}

export function resizeChatWindow(width: number, height: number): void {
  if (chatWindow && !chatWindow.isDestroyed()) {
    chatWindow.setBounds({ width, height });
  }
}
