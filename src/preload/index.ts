import type { IpcRendererEvent } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Chat ──────────────────────────────────────
  sendQuery: (data: { query: string; model: string }) =>
    ipcRenderer.send('chat:query', data),

  hideChat: () => ipcRenderer.send('chat:hide'),

  resizeChat: (width: number, height: number) =>
    ipcRenderer.send('chat:resize', { width, height }),

  chatReady: () => ipcRenderer.send('chat:ready'),

  onChatOpened: (callback: () => void) => {
    const handler = (_event: IpcRendererEvent) => callback();
    ipcRenderer.on('chat:opened', handler);
    return () => { ipcRenderer.removeListener('chat:opened', handler); };
  },

  // ── Response events ───────────────────────────
  onResponseChunk: (callback: (chunk: string) => void) => {
    const handler = (_event: IpcRendererEvent, chunk: string) => callback(chunk);
    ipcRenderer.on('chat:chunk', handler);
    return () => { ipcRenderer.removeListener('chat:chunk', handler); };
  },

  onResponseDone: (callback: (fullText: string) => void) => {
    const handler = (_event: IpcRendererEvent, fullText: string) => callback(fullText);
    ipcRenderer.on('chat:done', handler);
    return () => { ipcRenderer.removeListener('chat:done', handler); };
  },

  onResponseError: (callback: (error: string) => void) => {
    const handler = (_event: IpcRendererEvent, error: string) => callback(error);
    ipcRenderer.on('chat:error', handler);
    return () => { ipcRenderer.removeListener('chat:error', handler); };
  },

  onNeedApiKey: (callback: () => void) => {
    const handler = (_event: IpcRendererEvent) => callback();
    ipcRenderer.on('chat:need-api-key', handler);
    return () => { ipcRenderer.removeListener('chat:need-api-key', handler); };
  },

  onApiKeySaved: (callback: () => void) => {
    const handler = (_event: IpcRendererEvent) => callback();
    ipcRenderer.on('chat:api-key-saved', handler);
    return () => { ipcRenderer.removeListener('chat:api-key-saved', handler); };
  },

  onResponseReset: (callback: () => void) => {
    const handler = (_event: IpcRendererEvent) => callback();
    ipcRenderer.on('chat:reset', handler);
    return () => { ipcRenderer.removeListener('chat:reset', handler); };
  },

  // ── API Key ───────────────────────────────────
  saveApiKey: (provider: string, key: string) =>
    ipcRenderer.send('api-key:save', { provider, key }),

  getApiKeys: () => ipcRenderer.invoke('api-keys:get'),

  openUrl: (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      ipcRenderer.send('url:open', url);
    }
  },

  copyToClipboard: (text: string) => ipcRenderer.send('clipboard:write', text),

  readClipboard: () => ipcRenderer.invoke('clipboard:read'),

  // ── History ───────────────────────────────────
  openHistory: () => ipcRenderer.send('history:open'),
  closeHistory: () => ipcRenderer.send('history:close'),
  getHistory: () => ipcRenderer.invoke('history:get'),
  clearHistory: () => ipcRenderer.invoke('history:clear'),

  // ── Settings ──────────────────────────────────
  openSettings: () => ipcRenderer.send('settings:open'),
  closeSettings: () => ipcRenderer.send('settings:close'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: Record<string, unknown>) =>
    ipcRenderer.invoke('settings:save', settings),

  // ── Auto-update ───────────────────────────────
  installUpdate: () => ipcRenderer.send('update:install'),

  onUpdateReady: (callback: () => void) => {
    const handler = (_event: IpcRendererEvent) => callback();
    ipcRenderer.on('chat:update-ready', handler);
    return () => { ipcRenderer.removeListener('chat:update-ready', handler); };
  },
});
