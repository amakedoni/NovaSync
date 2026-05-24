/**
 * LLM Client with SSE streaming support.
 * Uses AsyncGenerator pattern — clean, testable, framework-agnostic.
 *
 * Supported providers:
 * - DeepSeek (OpenAI-compatible endpoint)
 * - OpenAI (GPT-4o-mini, etc.)
 * - Anthropic (Claude Haiku, etc.)
 */

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ProviderConfig {
  endpoint: string;
  headers: (apiKey: string) => Record<string, string>;
  body: (model: string, messages: Message[]) => unknown;
  parseChunk: (data: Record<string, unknown>) => string | null;
}

const providers: Record<string, ProviderConfig> = {
  deepseek: {
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
    body: (model, messages) => ({
      model: model || 'deepseek-chat',
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
    parseChunk: (data: Record<string, unknown>) => {
      // OpenAI-compatible SSE format
      const choices = data.choices as Array<{ delta?: { content?: string } }> | undefined;
      return choices?.[0]?.delta?.content || null;
    },
  },

  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
    body: (model, messages) => ({
      model: model || 'gpt-4o-mini',
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
    parseChunk: (data: Record<string, unknown>) => {
      const choices = data.choices as Array<{ delta?: { content?: string } }> | undefined;
      return choices?.[0]?.delta?.content || null;
    },
  },

  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
    body: (_model, messages) => {
      // Extract system message if present
      const systemMsg = messages.find((m) => m.role === 'system');
      const otherMsgs = messages.filter((m) => m.role !== 'system');

      return {
        model: 'claude-haiku-4-5',
        max_tokens: 4096,
        system: systemMsg?.content || '',
        messages: otherMsgs.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      };
    },
    parseChunk: (data: Record<string, unknown>) => {
      // Anthropic SSE format
      if (data.type === 'content_block_delta') {
        const delta = data.delta as { text?: string } | undefined;
        return delta?.text || null;
      }
      return null;
    },
  },
};

/**
 * Map model name to provider. Uses simple heuristics.
 */
function detectProvider(model: string): string {
  const m = model.toLowerCase();
  if (m.includes('claude') || m.includes('anthropic')) return 'anthropic';
  if (m.includes('gpt') || m.includes('openai')) return 'openai';
  return 'deepseek'; // default
}

/**
 * Stream chat completion tokens from the LLM.
 * @returns AsyncGenerator yielding content tokens one at a time.
 */
export async function* streamChat(
  model: string,
  messages: Message[],
  apiKey: string
): AsyncGenerator<string> {
  const provider = detectProvider(model);
  const config = providers[provider];

  if (!config) {
    throw new Error(`Unknown provider for model: ${model}`);
  }

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify(config.body(model, messages)),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(
      `API error (${response.status}): ${errorText.slice(0, 200)}`
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body — streaming not supported');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();

      // OpenAI/DeepSeek format: "data: {...}"
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = config.parseChunk(parsed);
          if (content) yield content;
        } catch {
          // Skip malformed JSON lines
        }
      }

      // Anthropic format: "event: ..." / "data: {...}"
      if (provider === 'anthropic' && trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        try {
          const parsed = JSON.parse(data);
          const content = config.parseChunk(parsed);
          if (content) yield content;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
}

/**
 * Non-streaming chat completion (for simple one-shot queries).
 */
export async function chat(
  model: string,
  messages: Message[],
  apiKey: string
): Promise<string> {
  const provider = detectProvider(model);
  const config = providers[provider];

  if (!config) {
    throw new Error(`Unknown provider for model: ${model}`);
  }

  const body = config.body(model, messages) as Record<string, unknown>;
  const nonStreamBody = { ...body, stream: false };

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify(nonStreamBody),
  });

  if (!response.ok) {
    throw new Error(`API error (${response.status})`);
  }

  const data = await response.json();

  // OpenAI-compatible response format
  return data.choices?.[0]?.message?.content || '';
}
