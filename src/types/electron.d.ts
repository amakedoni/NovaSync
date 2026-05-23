type Unsubscriber = () => void;

interface ElectronAPI {
  sendQuery: (data: { query: string; model: string }) => void;
  hideChat: () => void;
  resizeChat: (width: number, height: number) => void;
  chatReady: () => void;
  onChatOpened: (callback: () => void) => Unsubscriber;
  onResponseChunk: (callback: (chunk: string) => void) => Unsubscriber;
  onResponseDone: (callback: (fullText: string) => void) => Unsubscriber;
  onResponseError: (callback: (error: string) => void) => Unsubscriber;
  onNeedApiKey: (callback: () => void) => Unsubscriber;
  onApiKeySaved: (callback: () => void) => Unsubscriber;
  onResponseReset: (callback: () => void) => Unsubscriber;
  saveApiKey: (provider: string, key: string) => void;
  openUrl: (url: string) => void;
  copyToClipboard: (text: string) => void;
  openHistory: () => void;
  closeHistory: () => void;
  getHistory: () => Promise<{ id: string; query: string; model: string; response: string; timestamp: number }[]>;
  clearHistory: () => Promise<boolean>;
  getSettings: () => Promise<Record<string, unknown>>;
  saveSettings: (settings: Record<string, unknown>) => Promise<boolean>;
}

interface Window {
  electronAPI?: ElectronAPI;
}
