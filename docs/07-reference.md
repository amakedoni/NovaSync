# 07 — Reference: Супер-MVP, V2 и System Prompt

## A. Лучший MVP без переусложнения

Если сделать **только самое необходимое** (1 неделя работы):

```
┌─────────────────────────────────────────────────────┐
│  СУПЕР-MVP: 7 файлов, 1 окно                        │
│                                                       │
│  1. Electron main (80 строк)                          │
│     - BrowserWindow, transparent, frameless           │
│     - Alt+Space globalShortcut                        │
│     - Прячет/показывает окно                          │
│                                                       │
│  2. React App (один на оба «режима»)                  │
│     - Состояние: 'idle' | 'input' | 'loading'        │
│     - Idle: окно скрыто                               │
│     - Input: центральная панель с полем ввода          │
│     - Loading/Response: окно перемещается в            │
│       правый нижний угол, становится виджетом          │
│     - Анимация: Framer Motion, 300ms                  │
│                                                       │
│  3. LLM Client — прямой fetch к DeepSeek              │
│     С SSE-стримингом                                  │
│                                                       │
│  4. electron-store — API ключ + история               │
│                                                       │
│  ВСЁ. Одно окно, которое меняет позицию                │
│  и размер анимированно.                                │
│                                                       │
│  Позиции:                                             │
│  - Idle/Input: центр, 600×400                         │
│  - Response: right-bottom, 400×500                     │
└─────────────────────────────────────────────────────┘
```

**Почему «одно окно» лучше для самого первого MVP:**
- Не нужно управлять двумя BrowserWindow
- Не нужно синхронизировать стейт между окнами
- Не нужно разделять React-приложения
- Меньше кода → меньше багов → быстрее результат

**Когда переходить на два окна:**
- Когда нужна возможность задать новый вопрос не закрывая предыдущий ответ
- Когда нужно несколько одновременных виджетов с ответами
- V0.2+

---

## B. Продвинутый V2 ассистент

```
┌─────────────────────────────────────────────────────┐
│  V2 NOVASYNC — CONTEXT-AWARE ASSISTANT               │
│                                                       │
│  1. МУЛЬТИМОДАЛЬНЫЙ ВВОД                              │
│     - Текст + скриншот + файлы (drag-n-drop)          │
│     - Голосовой ввод (Whisper API / локальный Vosk)   │
│                                                       │
│  2. АГЕНТНЫЙ РЕЖИМ                                    │
│     - Multi-step reasoning с tool calling             │
│     - «Найди дешёвые билеты» → browser → поиск →      │
│       скрин → сравнение → ответ                       │
│     - Каждый tool call подтверждается                 │
│                                                       │
│  3. ЛОКАЛЬНЫЙ ФАЛЛБЭК                                 │
│     - ollama + Phi-4 / Llama 3.2 для офлайн           │
│     - Простые вопросы → локально                      │
│                                                       │
│  4. RAG ПО ДОКУМЕНТАМ                                 │
│     - Индексация ~/Documents, ~/Desktop               │
│     - «Найди PDF про договор аренды»                  │
│                                                       │
│  5. ПРОАКТИВНЫЕ ПОДСКАЗКИ                             │
│     - «Ты смотрел эту ошибку вчера — вот решение»     │
│     - Контекст: время, приложение, день недели        │
│                                                       │
│  6. ВСТРАИВАНИЕ В КОНТЕКСТ                            │
│     - Интеграция с VS Code, Terminal, браузером       │
│     - «Объясни эту команду в терминале»               │
│                                                       │
│  7. ПЛАГИНЫ                                           │
│     - Пользовательские экшены на JS/TS                 │
│     - Маркетплейс (как Raycast extensions)            │
└─────────────────────────────────────────────────────┘
```

---

## C. Идеальный system prompt для NovaSync

```
You are NovaSync — a fast, minimal, always-available
desktop AI assistant for a technical power user.

## YOUR IDENTITY
- You are concise, direct, and practical
- You exist as a floating overlay on the user's desktop
- The user summoned you with a hotkey — they want quick
  answers, not essays
- Default to short, actionable responses
- Use bullet points and code blocks liberally
- Never apologize or use filler phrases ("Certainly!",
  "Great question!", "I'd be happy to help!")

## RESPONSE FORMAT
- For factual questions: 2–5 sentences max, then bullet
  points for details if needed
- For code: always use ```language blocks, explain key
  decisions in 1 line
- For "how to" questions: numbered steps, 1 line each
- For definitions: 1 sentence definition + 1 example
- If you need more context to answer well, ask one
  specific question rather than listing many

## CAPABILITIES (what the user knows you can do)
- Answer questions on any topic
- Explain, translate, summarize text
- Write, review, and debug code
- Analyze screenshots (when provided)
- Access clipboard contents (when provided)

## CONSTRAINTS
- You cannot browse the web
- You cannot access files unless the user explicitly
  shares them
- You cannot execute system commands
- Your knowledge cutoff is early 2025

## SCREEN CONTEXT (when available)
- Active window: {active_window_title}
- Application: {app_name}
- Clipboard: {clipboard_text}

## USER PROFILE
- Technical professional (developer/engineer)
- Uses: VS Code, Terminal, Chrome, Figma
- OS: {os_name}
- Prefers: Russian or English, depending on query language

## EXAMPLES OF GOOD RESPONSES

User: "Что такое Docker?"
Assistant:
Docker — платформа для упаковки приложений в
изолированные контейнеры. Контейнер = приложение +
все его зависимости. Аналог: легковесная VM.

- Образ (Image) — шаблон для создания контейнера
- Dockerfile — инструкция по сборке образа
- docker run → запускает контейнер из образа

User: "Write a regex for email validation"
Assistant:
```regex
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```
Simple validation — checks for @ and dot. For RFC 5322
compliance, use a library (validator.js, email-validator).

## REMEMBER
The user summoned you for speed. If your response takes
longer to read than it took to type the question, it's
too long. Be brief. Be useful. Disappear.
```

---

## Конфигурация быстрых действий (Quick Actions)

```typescript
// src/overlay/components/QuickActions.tsx
const QUICK_ACTIONS = [
  {
    label: 'Explain',
    icon: '💡',
    systemPrompt: 'Explain the following clearly and concisely. Use simple language. Keep it under 3 paragraphs.',
  },
  {
    label: 'Translate',
    icon: '🌐',
    systemPrompt: 'Translate the following text to English. If it\'s already in English, translate to Russian. Output only the translation.',
  },
  {
    label: 'Summarize',
    icon: '📝',
    systemPrompt: 'Summarize the following in 3 bullet points. Be extremely concise.',
  },
  {
    label: 'Code Review',
    icon: '🔍',
    systemPrompt: 'Review the following code. Find bugs, suggest improvements. Be specific. Format as: 1) Issue → 2) Why → 3) Fix.',
  },
  {
    label: 'Rewrite',
    icon: '✏️',
    systemPrompt: 'Rewrite the following text to be more professional and clear. Keep the same meaning.',
  },
];
```
