import { ipcMain, clipboard, shell, app } from 'electron';
import { getChatWindow, showChatWindow, hideChatWindow, resizeChatWindow } from '../windows/overlay';
import { showHistoryWindow, hideHistoryWindow } from '../windows/response';
import { showSettingsWindow, hideSettingsWindow } from '../windows/settings';
import { quitAndInstall } from '../services/auto-updater';
import { streamChat } from '../services/llm-client';
import {
  getSetting,
  getApiKey,
  getApiKeys,
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

  ipcMain.on('chat:resize', (_event, size: { width: number; height: number }) => {
    resizeChatWindow(size.width, size.height);
  });

  ipcMain.on('chat:ready', () => {
    // Chat window is loaded and ready
  });

  // ── Query submission ──────────────────────────
  ipcMain.on('chat:query', async (_event, data: { query: string; model: string }) => {
    const chat = getChatWindow();
    const model = data.model || getSetting('defaultModel') || 'deepseek-chat';
    const fallbackModel = 'gpt-4o-mini';
    const MAX_RETRIES = 2;

    if (chat) chat.webContents.send('chat:reset');
    showChatWindow();

    const result = await tryQuery(model, data.query, MAX_RETRIES);

    if (result.type === 'ok') {
      chat?.webContents.send('chat:done', result.text);
      addToHistory({ query: data.query, model: result.modelUsed, response: result.text });
      return;
    }

    // Non-retryable auth error — no fallback attempt
    if (result.type === 'auth') {
      chat?.webContents.send('chat:error', result.message);
      chat?.webContents.send('chat:need-api-key');
      return;
    }

    // Try fallback model if different
    if (model !== fallbackModel) {
      const fallbackResult = await tryQuery(fallbackModel, data.query, 0);
      if (fallbackResult.type === 'ok') {
        chat?.webContents.send('chat:done', fallbackResult.text);
        addToHistory({ query: data.query, model: fallbackResult.modelUsed, response: fallbackResult.text });
        return;
      }
    }

    chat?.webContents.send('chat:error', result.message);
  });

  // ── History ───────────────────────────────────
  ipcMain.on('history:open', () => showHistoryWindow());
  ipcMain.on('history:close', () => hideHistoryWindow());
  ipcMain.handle('history:get', () => getHistory());
  ipcMain.handle('history:clear', () => {
    clearHistory();
    return true;
  });

  // ── Settings ──────────────────────────────────
  ipcMain.on('settings:open', () => showSettingsWindow());
  ipcMain.on('settings:close', () => hideSettingsWindow());
  ipcMain.handle('settings:get', () => loadSettings());
  ipcMain.handle('settings:save', (_event, s: Record<string, unknown>) => {
    saveSettings(s as any);
    // Apply auto-startup setting
    if (typeof s.launchOnStartup === 'boolean') {
      app.setLoginItemSettings({ openAtLogin: s.launchOnStartup });
    }
    return loadSettings();
  });

  // ── API Key ───────────────────────────────────
  ipcMain.on('api-key:save', (_event, data: { provider: string; key: string }) => {
    saveApiKey(data.provider, data.key);
    const chat = getChatWindow();
    if (chat) chat.webContents.send('chat:api-key-saved');
  });

  ipcMain.handle('api-keys:get', () => {
    return getApiKeys();
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

  ipcMain.handle('clipboard:read', () => {
    return clipboard.readText();
  });

  // ── Auto-update ───────────────────────────────
  ipcMain.on('update:install', () => quitAndInstall());
}

type QueryResult =
  | { type: 'ok'; text: string; modelUsed: string }
  | { type: 'auth'; message: string }
  | { type: 'error'; message: string };

async function tryQuery(
  model: string,
  query: string,
  maxRetries: number,
): Promise<QueryResult> {
  const provider = model.startsWith('claude') ? 'anthropic' : model.startsWith('gpt') ? 'openai' : 'deepseek';
  const apiKey = getApiKey(provider);

  if (!apiKey) {
    return { type: 'auth', message: `No API key configured for ${provider}. Open Settings to add one.` };
  }

  let lastError = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const chat = getChatWindow();
    let fullText = '';

    try {
      const messages = [
        { role: 'system' as const, content: getSystemPrompt() },
        { role: 'user' as const, content: query },
      ];

      for await (const chunk of streamChat(model, messages, apiKey)) {
        fullText += chunk;
        chat?.webContents.send('chat:chunk', chunk);
      }

      return { type: 'ok', text: fullText, modelUsed: model };
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';

      // Auth errors: don't retry
      if (isAuthError(lastError)) {
        return { type: 'auth', message: formatError(lastError, model) };
      }

      // Rate limit: wait longer
      if (isRateLimitError(lastError) && attempt < maxRetries) {
        await sleep((attempt + 1) * 3000);
        continue;
      }

      // Network errors: exponential backoff
      if (isNetworkError(lastError) && attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }

      // On last attempt, don't retry
      if (attempt >= maxRetries) break;
    }
  }

  return { type: 'error', message: formatError(lastError, model) };
}

function isAuthError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return lower.includes('401') || lower.includes('unauthorized') || lower.includes('invalid api key') || lower.includes('incorrect api key') || lower.includes('authentication');
}

function isRateLimitError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return lower.includes('429') || lower.includes('rate limit') || lower.includes('too many requests');
}

function isNetworkError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return lower.includes('econnrefused') || lower.includes('etimedout') || lower.includes('enotfound') || lower.includes('fetch failed') || lower.includes('network') || lower.includes('dns');
}

function formatError(msg: string, model: string): string {
  if (isAuthError(msg)) return `Auth failed for ${model}. Check your API key in Settings.`;
  if (isRateLimitError(msg)) return `${model} rate limited. Wait a moment and try again.`;
  if (isNetworkError(msg)) return `Network error — check your internet connection.`;
  // Trim long API error responses
  const short = msg.slice(0, 200);
  return `${model}: ${short}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
