import { ipcMain, clipboard, shell } from 'electron';
import { getChatWindow, showChatWindow, hideChatWindow } from '../windows/overlay';
import { showHistoryWindow, hideHistoryWindow } from '../windows/response';
import { streamChat } from '../services/llm-client';
import {
  getSetting,
  getApiKey,
  saveApiKey,
  getHistory,
  addToHistory,
  clearHistory,
  loadSettings,
  saveSettings,
} from '../store/settings';

export function registerIpcHandlers(): void {
  // ── Chat controls ─────────────────────────────
  ipcMain.on('chat:hide', () => hideChatWindow());

  ipcMain.on('chat:ready', () => {
    // Chat window is loaded and ready
  });

  // ── Query submission ──────────────────────────
  ipcMain.on('chat:query', async (_event, data: { query: string; model: string }) => {
    const model = data.model || getSetting('defaultModel') || 'deepseek-chat';
    const provider = model.startsWith('claude') ? 'anthropic' : model.startsWith('gpt') ? 'openai' : 'deepseek';
    const apiKey = getApiKey(provider);

    if (!apiKey) {
      const chat = getChatWindow();
      if (chat) {
        chat.webContents.send('chat:error', 'No API key configured.');
        chat.webContents.send('chat:need-api-key');
      }
      showChatWindow();
      return;
    }

    const chat = getChatWindow();
    if (chat) {
      chat.webContents.send('chat:reset');
    }
    showChatWindow();

    let fullText = '';

    try {
      const messages = [
        { role: 'system' as const, content: getSystemPrompt() },
        { role: 'user' as const, content: data.query },
      ];

      for await (const chunk of streamChat(model, messages, apiKey)) {
        fullText += chunk;
        chat?.webContents.send('chat:chunk', chunk);
      }

      chat?.webContents.send('chat:done', fullText);
      addToHistory({ query: data.query, model, response: fullText });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      chat?.webContents.send('chat:error', message);
    }
  });

  // ── History ───────────────────────────────────
  ipcMain.on('history:open', () => showHistoryWindow());

  ipcMain.on('history:close', () => hideHistoryWindow());

  ipcMain.handle('history:get', () => getHistory());

  ipcMain.handle('history:clear', () => {
    clearHistory();
    return true;
  });

  // ── API Key ───────────────────────────────────
  ipcMain.on('api-key:save', (_event, data: { provider: string; key: string }) => {
    saveApiKey(data.provider, data.key);
    const chat = getChatWindow();
    if (chat) chat.webContents.send('chat:api-key-saved');
  });

  // ── URL opener ────────────────────────────────
  ipcMain.on('url:open', (_event, url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
  });

  // ── Clipboard ─────────────────────────────────
  ipcMain.on('clipboard:write', (_event, text: string) => {
    clipboard.writeText(text);
  });

  // ── Settings ──────────────────────────────────
  ipcMain.handle('settings:get', () => loadSettings());
  ipcMain.handle('settings:save', (_event, s: Record<string, unknown>) => {
    saveSettings(s as any);
    return true;
  });
}

function getSystemPrompt(): string {
  return `You are NovaSync — a fast, minimal, always-available desktop AI assistant for a technical power user.

## IDENTITY
- You are concise, direct, and practical
- The user summoned you with a hotkey — they want quick answers, not essays
- Default to short, actionable responses
- Never apologize or use filler phrases ("Certainly!", "Great question!")

## RESPONSE FORMAT
- For factual questions: 2-5 sentences max, then bullet points if needed
- For code: always use \`\`\`language blocks, explain key decisions in 1 line
- For "how to" questions: numbered steps, 1 line each
- For definitions: 1 sentence + 1 example

## CONSTRAINTS
- You cannot browse the web, access files, or execute system commands
- Be brief. Be useful.`;
}
