# 03 — Модели и API

## Сравнительная таблица (цены на май 2026)

| Модель | $/1M input | $/1M output | Latency | Качество | Multimodal | Вердикт MVP |
|--------|-----------|-------------|---------|----------|------------|-------------|
| **DeepSeek Chat (v3)** | $0.14 | $0.28 | 5–20s | ★★★★☆ | Нет | ⭐ Основная |
| **GPT-4o-mini** | $0.15 | $0.60 | 2–6s | ★★★★☆ | Да | Fallback |
| **Claude Haiku 4.5** | $1.00 | $5.00 | 1–3s | ★★★★★ | Да | Для кода |
| **Gemini 2.5 Flash** | $0.15 | $0.60 | 2–5s | ★★★★☆ | Да | Для зрения |
| **Groq + Llama 4 Maverick** | Бесплатно* | — | 0.5–2s | ★★★☆☆ | Нет | Для latency |
| **Groq + Llama 4 Vision** | Бесплатно* | — | 1–3s | ★★★☆☆ | Да | Зрение + скорость |

*\* В пределах бесплатных лимитов*

---

## Стратегия моделей для MVP

```
┌─────────────────────────────────────────────────────┐
│  СТРАТЕГИЯ МОДЕЛЕЙ                                   │
│                                                       │
│  Основная (все текстовые запросы):                     │
│  → DeepSeek Chat (deepseek-chat)                      │
│    Причина: лучшее цена/качество, OpenAI-совместимый    │
│    API, 128K контекст, хороший русский язык             │
│                                                       │
│  Резервная (если DeepSeek лежит):                      │
│  → GPT-4o-mini                                        │
│    Причина: быстрее, стабильнее, multimodal на будущее  │
│                                                       │
│  Vision-модель (анализ экрана):                        │
│  → Gemini 2.5 Flash (бесплатный тир) или GPT-4o-mini  │
│                                                       │
│  Бесплатный вариант (dev/тесты):                       │
│  → Groq + Llama 4 Maverick                            │
└─────────────────────────────────────────────────────┘
```

---

## Почему DeepSeek Chat — хороший выбор для MVP

1. **Цена:** ~50 запросов в день = меньше $1/месяц
2. **OpenAI-совместимый API:** обычный `fetch` на `https://api.deepseek.com/v1/chat/completions`
3. **Стриминг:** SSE, работает идентично OpenAI
4. **Русский язык:** отличное качество

### Главный минус DeepSeek — latency

В пиковые часы ответ может идти 15–20 секунд.

**Решение без смены модели:**
- Стриминг токен за токеном (первый токен за 1–3 секунды — приемлемо)
- Если первый токен не пришёл за 5 секунд → fallback на GPT-4o-mini
- Пользователь видит текст сразу, даже если полный ответ идёт долго

> Стриминг — это не «приятная фича», а архитектурное требование для ассистента.

---

## LLM Client — реализация (main process)

```typescript
// electron/services/llm-client.ts
export async function* streamChat(
  model: string,
  messages: { role: string; content: string }[],
  apiKey: string
): AsyncGenerator<string> {
  const endpoints: Record<string, string> = {
    'deepseek-chat': 'https://api.deepseek.com/v1/chat/completions',
    'gpt-4o-mini': 'https://api.openai.com/v1/chat/completions',
    'claude-haiku': 'https://api.anthropic.com/v1/messages',
  };

  const response = await fetch(endpoints[model], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // skip malformed JSON
        }
      }
    }
  }
}
```

**Почему AsyncGenerator:**
- Чистый, тестируемый паттерн, не привязан к фреймворку
- В main process: `for await (const token of streamChat(...))` → `webContents.send()`
- В renderer: useState накапливает токены, рендерит Markdown

---

## Стоимость использования (оценка)

| Сценарий | Запросов/день | Токенов/запрос | Модель | $/месяц |
|----------|--------------|----------------|--------|---------|
| Лёгкое использование | 20 | ~1000 | DeepSeek | ~$0.10 |
| Активное использование | 50 | ~1500 | DeepSeek | ~$0.30 |
| С vision (скриншоты) | 10 | ~3000 | GPT-4o-mini | ~$0.50 |
| **Реалистичный микс** | **50 текста + 10 vision** | — | **Микс** | **~$0.80** |

**Вывод:** даже активное использование стоит меньше $1/месяц.
