import { app } from 'electron';
import fs from 'fs';
import path from 'path';

interface Settings {
  hotkey: string;
  defaultModel: string;
  launchOnStartup: boolean;
  autoReadClipboard: boolean;
}

interface HistoryEntry {
  id: string;
  query: string;
  model: string;
  response: string;
  timestamp: number;
}

interface StoreData {
  settings: Settings;
  apiKeys: Record<string, string>;
  history: HistoryEntry[];
}

const defaults: StoreData = {
  settings: {
    hotkey: 'Alt+Space',
    defaultModel: 'deepseek-chat',
    launchOnStartup: false,
    autoReadClipboard: false,
  },
  apiKeys: {},
  history: [],
};

function getStorePath(): string {
  return path.join(app.getPath('userData'), 'novasync-store.json');
}

function readStore(): StoreData {
  try {
    const raw = fs.readFileSync(getStorePath(), 'utf-8');
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

function writeStore(data: StoreData): void {
  fs.writeFileSync(getStorePath(), JSON.stringify(data, null, 2), 'utf-8');
}

// ── Settings ────────────────────────────────────────

export function loadSettings(): Settings {
  return readStore().settings;
}

export function saveSettings(partial: Partial<Settings>): void {
  const store = readStore();
  store.settings = { ...store.settings, ...partial };
  writeStore(store);
}

export function getSetting<K extends keyof Settings>(key: K): Settings[K] {
  return readStore().settings[key];
}

// ── API Keys ────────────────────────────────────────

export function getApiKey(provider: string): string | undefined {
  return readStore().apiKeys[provider];
}

export function saveApiKey(provider: string, key: string): void {
  const store = readStore();
  store.apiKeys[provider] = key;
  writeStore(store);
}

// ── History ─────────────────────────────────────────

const MAX_HISTORY = 50;

export function getHistory(): HistoryEntry[] {
  return readStore().history;
}

export function addToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  const store = readStore();
  store.history.unshift({
    ...entry,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    timestamp: Date.now(),
  });

  if (store.history.length > MAX_HISTORY) {
    store.history.length = MAX_HISTORY;
  }

  writeStore(store);
}

export function clearHistory(): void {
  const store = readStore();
  store.history = [];
  writeStore(store);
}
