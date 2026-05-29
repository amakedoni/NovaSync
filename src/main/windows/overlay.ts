import { BrowserWindow, app, screen } from 'electron';
import path from 'path';
import { loadSettings, saveSettings } from '../store/settings';

let chatWindow: BrowserWindow | null = null;

const WINDOW_WIDTH = 520;
const WINDOW_MARGIN = 20;

function getIconPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'icon.png')
    : path.join(__dirname, '../../../resources/icon.png');
}

function getUrl(): string {
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (devUrl) return devUrl;
  return `file://${path.join(__dirname, '../renderer/index.html')}`;
}

function getBottomRightPosition(windowWidth: number, windowHeight: number): { x: number; y: number } {
  const { workArea } = screen.getPrimaryDisplay();
  return {
    x: workArea.x + workArea.width - windowWidth - WINDOW_MARGIN,
    y: workArea.y + workArea.height - windowHeight - WINDOW_MARGIN,
  };
}

export function createChatWindow(): BrowserWindow {
  const { x, y } = getBottomRightPosition(WINDOW_WIDTH, 80);

  chatWindow = new BrowserWindow({
    x,
    y,
    width: WINDOW_WIDTH,
    height: 80,
    icon: getIconPath(),
    minWidth: 360,
    minHeight: 80,
    transparent: false,
    frame: false,
    roundedCorners: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    hasShadow: true,
    backgroundColor: '#1a1a1c',
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

  chatWindow.on('blur', () => {
    chatWindow?.hide();
  });

  chatWindow.on('moved', () => {
    if (!chatWindow || chatWindow.isDestroyed()) return;
    const [wx, wy] = chatWindow.getPosition();
    saveSettings({ windowX: wx, windowY: wy });
  });

  return chatWindow;
}

export function getChatWindow(): BrowserWindow | null {
  return chatWindow;
}

export function showChatWindow(): void {
  if (!chatWindow) return;

  const s = loadSettings();
  if (s.rememberPosition) {
    chatWindow.setPosition(s.windowX, s.windowY);
  } else {
    const [w, h] = chatWindow.getSize();
    const { x, y } = getBottomRightPosition(w, h);
    chatWindow.setPosition(x, y);
  }

  chatWindow.show();
  chatWindow.focus();
  chatWindow.webContents.send('chat:opened');
}

export function hideChatWindow(): void {
  chatWindow?.hide();
}

export function resizeChatWindow(width: number, height: number): void {
  if (chatWindow && !chatWindow.isDestroyed()) {
    chatWindow.setSize(width, height);
  }
}
