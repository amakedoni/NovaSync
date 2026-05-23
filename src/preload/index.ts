import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Chat ──────────────────────────────────────
  sendQuery: (data: { query: string; model: string }) =>
    ipcRenderer.send('chat:query', data),

  hideChat: () => ipcRenderer.send('chat:hide'),

  chatReady: () => ipcRenderer.send('chat:ready'),

  // ── Response events ───────────────────────────
  onResponseChunk: (callback: (chunk: string) => void) => {
    ipcRenderer.on('chat:chunk', (_event, chunk) => callback(chunk));
    return () => { ipcRenderer.removeListener('chat:chunk', callback); };
  },

  onResponseDone: (callback: (fullText: string) => void) => {
    ipcRenderer.on('chat:done', (_event, fullText) => callback(fullText));
    return () => { ipcRenderer.removeListener('chat:done', callback); };
  },

  onResponseError: (callback: (error: string) => void) => {
    ipcRenderer.on('chat:error', (_event, error) => callback(error));
    return () => { ipcRenderer.removeListener('chat:error', callback); };
  },

  onNeedApiKey: (callback: () => void) => {
    ipcRenderer.on('chat:need-api-key', () => callback());
    return () => { ipcRenderer.removeListener('chat:need-api-key', callback); };
  },

  onApiKeySaved: (callback: () => void) => {
    ipcRenderer.on('chat:api-key-saved', () => callback());
    return () => { ipcRenderer.removeListener('chat:api-key-saved', callback); };
  },

  onResponseReset: (callback: () => void) => {
    ipcRenderer.on('chat:reset', () => callback());
    return () => { ipcRenderer.removeListener('chat:reset', callback); };
  },

  // ── API Key ───────────────────────────────────
  saveApiKey: (provider: string, key: string) =>
    ipcRenderer.send('api-key:save', { provider, key }),

  openUrl: (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      ipcRenderer.send('url:open', url);
    }
  },

  copyToClipboard: (text: string) => ipcRenderer.send('clipboard:write', text),

  // ── History ───────────────────────────────────
  openHistory: () => ipcRenderer.send('history:open'),
  closeHistory: () => ipcRenderer.send('history:close'),
  getHistory: () => ipcRenderer.invoke('history:get'),
  clearHistory: () => ipcRenderer.invoke('history:clear'),

  // ── Settings ──────────────────────────────────
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: Record<string, unknown>) =>
    ipcRenderer.invoke('settings:save', settings),
});
