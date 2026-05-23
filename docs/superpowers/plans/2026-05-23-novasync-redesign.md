# NovaSync Full Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the split overlay/widget UI with a single unified chat bubble in Soft/Organic style (purple/lavender, dark+light modes, framer-motion animations).

**Architecture:** One main BrowserWindow (~380x480, resizable) serving as a unified chat interface, plus a separate HistoryWindow for chat archive. State managed via zustand store. Components styled with Tailwind CSS 4 utilities + CSS custom properties for design tokens. IPC channels unified under `chat:` and `history:` namespaces.

**Tech Stack:** Electron 33, React 19, TypeScript 5.7, Tailwind CSS 4, framer-motion 12, zustand 5, react-markdown 10.

---

## File Structure Map

```
Create:
  src/renderer/store/chat.ts           — zustand store: messages, state, history
  src/renderer/components/ChatBubble.tsx — main state machine
  src/renderer/components/Header.tsx     — chat header bar
  src/renderer/components/MessageList.tsx — scrollable message container
  src/renderer/components/UserMessage.tsx — user bubble
  src/renderer/components/NovaMessage.tsx — AI bubble with markdown
  src/renderer/components/InputBar.tsx    — pill input + send
  src/renderer/components/ErrorState.tsx  — error display
  src/renderer/components/HistoryWindow.tsx — history chat list
  src/renderer/components/SettingsView.tsx  — API key setup

Modify:
  src/styles/globals.css                — replace all tokens
  src/renderer/App.tsx                  — simplify, no mode split
  src/renderer/main.tsx                 — remove mode param
  src/renderer/overlay/components/QuickActions.tsx — restyle
  src/renderer/overlay/components/ModelSelector.tsx — restyle
  src/renderer/widget/components/ActionBar.tsx — add follow-up input
  src/renderer/widget/components/ApiKeyForm.tsx — restyle
  src/main/index.ts                     — single window + history
  src/main/windows/overlay.ts           — → refactor to chat window
  src/main/windows/response.ts          — → refactor to history window
  src/main/ipc/handlers.ts             — unified channels
  src/preload/index.ts                  — unified API
  src/types/electron.d.ts              — updated type defs

Delete:
  src/renderer/overlay/App.tsx
  src/renderer/overlay/components/CommandInput.tsx
  src/renderer/overlay/styles/overlay.css
  src/renderer/widget/App.tsx
  src/renderer/widget/components/StreamingText.tsx
  src/renderer/widget/styles/widget.css
```

---

### Task 1: Replace Design Tokens in globals.css

**Files:**
- Modify: `src/styles/globals.css` (full rewrite)

- [ ] **Step 1: Replace globals.css with new Soft/Organic tokens**

Write `src/styles/globals.css`:

```css
@import "tailwindcss";

/* ── NovaSync Design Tokens (Soft/Organic) ────────── */

:root {
  /* Dark mode (default) */
  --bg-primary: #0d0820;
  --bg-secondary: #1a1035;
  --bg-tertiary: #251845;
  --text-primary: #f0e8ff;
  --text-secondary: #b8a0d8;
  --text-tertiary: #6b5b8a;
  --accent: #a78bfa;
  --accent-strong: #7c3aed;
  --accent-glow: rgba(167, 139, 250, 0.3);
  --border-subtle: rgba(140, 100, 220, 0.06);
  --border-input: rgba(140, 100, 220, 0.10);
  --border-focus: rgba(167, 139, 250, 0.30);
  --surface-hover: rgba(140, 100, 220, 0.08);
  --surface-active: rgba(140, 100, 220, 0.12);
  --error: #f87171;
  --error-bg: rgba(255, 130, 130, 0.10);
  --success: #34d399;
  --radius-window: 24px;
  --radius-card: 16px;
  --radius-input: 12px;
  --radius-pill: 20px;
  --radius-button: 14px;
  --shadow-window: 0 25px 60px rgba(80, 40, 160, 0.20);
  --shadow-button: 0 0 12px rgba(167, 139, 250, 0.30);
  --shadow-input: 0 0 16px rgba(167, 139, 250, 0.08);
  --shadow-dropdown: 0 12px 32px rgba(0, 0, 0, 0.50);
}

/* Light mode override */
@media (prefers-color-scheme: light) {
  :root {
    --bg-primary: #faf8ff;
    --bg-secondary: #f0eaf8;
    --bg-tertiary: #e5daf5;
    --text-primary: #1a0d2e;
    --text-secondary: #5a4080;
    --text-tertiary: #8a70b0;
    --border-subtle: rgba(124, 58, 237, 0.06);
    --border-input: rgba(124, 58, 237, 0.10);
    --border-focus: rgba(124, 58, 237, 0.30);
    --surface-hover: rgba(124, 58, 237, 0.06);
    --surface-active: rgba(124, 58, 237, 0.10);
    --error-bg: rgba(255, 130, 130, 0.08);
    --shadow-window: 0 25px 60px rgba(80, 40, 160, 0.12);
    --shadow-button: 0 0 14px rgba(124, 58, 237, 0.20);
    --shadow-input: 0 0 16px rgba(124, 58, 237, 0.05);
    --shadow-dropdown: 0 12px 32px rgba(80, 40, 160, 0.15);
  }
}

/* ── Reset ───────────────────────────────────────── */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: transparent;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  user-select: none;
}

/* ── Scrollbar ───────────────────────────────────── */

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(167, 139, 250, 0.15);
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(167, 139, 250, 0.25);
}

/* ── Selection ───────────────────────────────────── */

::selection {
  background: rgba(167, 139, 250, 0.3);
  color: var(--text-primary);
}

/* ── Animations ──────────────────────────────────── */

@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(167, 139, 250, 0.2); }
  50% { box-shadow: 0 0 16px rgba(167, 139, 250, 0.4); }
}

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

@keyframes pulse-text {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.streaming-cursor {
  display: inline-block;
  width: 6px;
  height: 14px;
  background: var(--accent);
  border-radius: 1px;
  vertical-align: text-bottom;
  margin-left: 1px;
  animation: blink-cursor 1s step-end infinite;
}

.loading-dots {
  display: flex;
  gap: 5px;
}

.loading-dots span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--text-tertiary);
  animation: dot-bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: 0s; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat: replace design tokens with Soft/Organic palette, add light mode"
```

---

### Task 2: Create zustand Chat Store

**Files:**
- Create: `src/renderer/store/chat.ts`

- [ ] **Step 1: Create the chat store**

Write `src/renderer/store/chat.ts`:

```typescript
import { create } from 'zustand';

export type ChatState = 'empty' | 'streaming' | 'done' | 'error';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

interface ChatStore {
  // Current conversation
  state: ChatState;
  currentId: string | null;
  messages: Message[];
  model: string;
  errorMessage: string;

  // History
  conversations: Conversation[];

  // Actions
  setModel: (model: string) => void;
  addUserMessage: (content: string) => void;
  appendChunk: (chunk: string) => void;
  finishResponse: (fullText: string) => void;
  setError: (message: string) => void;
  reset: () => void;
  newConversation: () => void;
  loadConversation: (id: string) => void;
  setConversations: (convs: Conversation[]) => void;
  clearConversations: () => void;
  getTitle: () => string;
}

let msgId = 0;
function nextId(): string {
  return (++msgId).toString(36) + Date.now().toString(36);
}

export const useChatStore = create<ChatStore>((set, get) => ({
  state: 'empty',
  currentId: null,
  messages: [],
  model: 'deepseek-chat',
  errorMessage: '',
  conversations: [],

  setModel: (model) => set({ model }),

  addUserMessage: (content) => {
    const userMsg: Message = {
      id: nextId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    set((s) => ({
      messages: [...s.messages, userMsg],
      state: 'streaming',
      errorMessage: '',
      currentId: s.currentId || nextId(),
    }));
  },

  appendChunk: (chunk) => {
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
      } else {
        msgs.push({
          id: nextId(),
          role: 'assistant',
          content: chunk,
          timestamp: Date.now(),
        });
      }
      return { messages: msgs, state: 'streaming' as ChatState };
    });
  },

  finishResponse: (fullText) => {
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: fullText };
      }
      return { messages: msgs, state: 'done' as ChatState };
    });
  },

  setError: (message) => set({ errorMessage: message, state: 'error' }),

  reset: () => set({ state: 'empty', currentId: null, messages: [], errorMessage: '' }),

  newConversation: () => set({ state: 'empty', currentId: null, messages: [], errorMessage: '' }),

  loadConversation: (id) => {
    const conv = get().conversations.find((c) => c.id === id);
    if (conv) {
      set({
        currentId: conv.id,
        messages: conv.messages,
        model: conv.model,
        state: 'done',
        errorMessage: '',
      });
    }
  },

  setConversations: (convs) => set({ conversations: convs }),

  clearConversations: () => set({ conversations: [] }),

  getTitle: () => {
    const msgs = get().messages;
    const firstUser = msgs.find((m) => m.role === 'user');
    if (!firstUser) return 'New Chat';
    return firstUser.content.slice(0, 50) + (firstUser.content.length > 50 ? '…' : '');
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/store/chat.ts
git commit -m "feat: add zustand chat store with state machine and history"
```

---

### Task 3: InputBar Component

**Files:**
- Create: `src/renderer/components/InputBar.tsx`

- [ ] **Step 1: Create the InputBar component**

Write `src/renderer/components/InputBar.tsx`:

```typescript
import { useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function InputBar({ value, onChange, onSubmit, disabled, autoFocus }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 mx-4 my-2 rounded-2xl border"
      style={{
        background: 'var(--surface-hover)',
        borderColor: value ? 'var(--border-focus)' : 'var(--border-input)',
        boxShadow: value ? 'var(--shadow-input)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Search icon */}
      <svg
        width="15" height="15" viewBox="0 0 24 24"
        fill="none" stroke="var(--text-tertiary)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, opacity: value ? 1 : 0.6, transition: 'opacity 0.15s' }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !disabled && value.trim()) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Ask anything..."
        disabled={disabled}
        autoFocus={autoFocus}
        spellCheck={false}
        className="flex-1 bg-transparent border-none outline-none text-sm"
        style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
      />

      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Send"
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-none cursor-pointer"
        style={{
          background: value.trim()
            ? 'linear-gradient(135deg, var(--accent), var(--accent-strong))'
            : 'rgba(140,100,220,0.12)',
          boxShadow: value.trim() ? 'var(--shadow-button)' : 'none',
          opacity: value.trim() ? 1 : 0.4,
          transition: 'all 0.15s ease',
          color: '#fff',
          fontSize: '12px',
        }}
      >
        →
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/InputBar.tsx
git commit -m "feat: add InputBar component with pill design and gradient send button"
```

---

### Task 4: Restyle QuickActions

**Files:**
- Modify: `src/renderer/overlay/components/QuickActions.tsx`

- [ ] **Step 1: Rewrite QuickActions with new pill style**

Write `src/renderer/overlay/components/QuickActions.tsx`:

```typescript
interface QuickAction {
  label: string;
  systemPrompt: string;
}

const ACTIONS: QuickAction[] = [
  { label: 'Explain', systemPrompt: 'Explain the following clearly and concisely. Use simple language. Keep it under 3 paragraphs.' },
  { label: 'Summarize', systemPrompt: 'Summarize the following in 3 bullet points. Be extremely concise.' },
  { label: 'Translate', systemPrompt: "Translate the following text to English. If it's already in English, translate to Russian. Output only the translation." },
  { label: 'Fix Code', systemPrompt: 'Find and fix bugs in the following code. Show the corrected version. Explain each fix in one line.' },
];

interface Props {
  onAction: (action: QuickAction) => void;
}

export default function QuickActions({ onAction }: Props) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action)}
          className="px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer border-none transition-all duration-150"
          style={{
            background: 'var(--surface-hover)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-active)';
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.transform = 'scale(1.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--surface-hover)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/overlay/components/QuickActions.tsx
git commit -m "refactor: restyle QuickActions with rounded pill design"
```

---

### Task 5: Restyle ModelSelector

**Files:**
- Modify: `src/renderer/overlay/components/ModelSelector.tsx`

- [ ] **Step 1: Rewrite ModelSelector with pill trigger and upward dropdown**

Write `src/renderer/overlay/components/ModelSelector.tsx`:

```typescript
import { useState, useRef, useEffect } from 'react';

interface Model {
  id: string;
  label: string;
}

interface Props {
  models: Model[];
  selected: string;
  onSelect: (modelId: string) => void;
}

export default function ModelSelector({ models, selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = models.find((m) => m.id === selected);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [open]);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 cursor-pointer border-none transition-all duration-150"
        style={{
          background: 'var(--surface-hover)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'inherit',
        }}
      >
        {current?.label || selected}
        <svg
          width="7" height="7" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute rounded-xl p-1 min-w-[150px] z-50"
          style={{
            bottom: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-input)',
            boxShadow: 'var(--shadow-dropdown)',
          }}
        >
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => { onSelect(model.id); setOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-lg text-xs border-none cursor-pointer transition-colors"
              style={{
                background: model.id === selected ? 'var(--surface-active)' : 'transparent',
                color: model.id === selected ? 'var(--accent)' : 'var(--text-primary)',
                fontFamily: 'inherit',
              }}
            >
              {model.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/overlay/components/ModelSelector.tsx
git commit -m "refactor: restyle ModelSelector with pill trigger and upward dropdown"
```

---

### Task 6: UserMessage Component

**Files:**
- Create: `src/renderer/components/UserMessage.tsx`

- [ ] **Step 1: Create UserMessage component**

Write `src/renderer/components/UserMessage.tsx`:

```typescript
import { motion } from 'framer-motion';

interface Props {
  content: string;
}

export default function UserMessage({ content }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end"
    >
      <div
        className="max-w-[85%] px-3.5 py-2 text-xs leading-relaxed"
        style={{
          background: 'linear-gradient(135deg, rgba(167,139,250,0.20), rgba(124,58,237,0.12))',
          color: 'var(--text-primary)',
          borderRadius: '16px 16px 4px 16px',
          wordBreak: 'break-word',
        }}
      >
        {content}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/UserMessage.tsx
git commit -m "feat: add UserMessage component with gradient bubble"
```

---

### Task 7: NovaMessage Component

**Files:**
- Create: `src/renderer/components/NovaMessage.tsx`
- Modify: `src/shared/Markdown.tsx` (keep as-is, import directly)

- [ ] **Step 1: Create NovaMessage with markdown rendering**

Write `src/renderer/components/NovaMessage.tsx`:

```typescript
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
  isStreaming: boolean;
}

export default function NovaMessage({ content, isStreaming }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-2"
    >
      {/* Avatar */}
      <div
        className="w-[22px] h-[22px] rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
        style={{
          background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(124,58,237,0.1))',
          color: 'var(--accent)',
        }}
      >
        N
      </div>

      {/* Content */}
      <div
        className="flex-1 text-xs leading-relaxed min-w-0"
        style={{ color: 'var(--text-primary)', fontSize: '12px', lineHeight: 1.6, wordBreak: 'break-word' }}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            code: ({ className, children }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code
                    className="px-1 py-0.5 rounded text-[0.9em]"
                    style={{
                      background: 'rgba(140,100,220,0.12)',
                      fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                    }}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <pre
                  className="my-3 p-3.5 rounded-lg overflow-x-auto text-[11px] leading-relaxed"
                  style={{
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid var(--border-subtle)',
                    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                  }}
                >
                  <code className={className}>{children}</code>
                </pre>
              );
            },
            a: ({ children, href }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                {children}
              </a>
            ),
            ul: ({ children }) => <ul className="pl-5 mb-2 list-disc">{children}</ul>,
            ol: ({ children }) => <ol className="pl-5 mb-2 list-decimal">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
          }}
        >
          {content}
        </ReactMarkdown>

        {isStreaming && <span className="streaming-cursor" />}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/NovaMessage.tsx
git commit -m "feat: add NovaMessage component with markdown and avatar"
```

---

### Task 8: MessageList Component

**Files:**
- Create: `src/renderer/components/MessageList.tsx`

- [ ] **Step 1: Create MessageList with auto-scroll**

Write `src/renderer/components/MessageList.tsx`:

```typescript
import { useRef, useEffect } from 'react';
import { useChatStore, type Message } from '../store/chat';
import UserMessage from './UserMessage';
import NovaMessage from './NovaMessage';

export default function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const state = useChatStore((s) => s.state);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
    >
      {messages.map((msg: Message) =>
        msg.role === 'user' ? (
          <UserMessage key={msg.id} content={msg.content} />
        ) : (
          <NovaMessage
            key={msg.id}
            content={msg.content}
            isStreaming={state === 'streaming' && msg === messages[messages.length - 1]}
          />
        )
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/MessageList.tsx
git commit -m "feat: add MessageList component with auto-scroll"
```

---

### Task 9: Header Component

**Files:**
- Create: `src/renderer/components/Header.tsx`

- [ ] **Step 1: Create Header component**

Write `src/renderer/components/Header.tsx`:

```typescript
import { motion } from 'framer-motion';
import { useChatStore } from '../store/chat';

interface Props {
  onOpenHistory: () => void;
  onClose: () => void;
}

export default function Header({ onOpenHistory, onClose }: Props) {
  const state = useChatStore((s) => s.state);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center gap-2">
        {/* Logo dot */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
            boxShadow: '0 0 8px var(--accent-glow)',
          }}
        />
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
          NovaSync
        </span>
        {state === 'streaming' && (
          <span
            className="text-[10px] font-medium"
            style={{ color: 'var(--accent-strong)', animation: 'pulse-text 2s ease-in-out infinite' }}
          >
            streaming
          </span>
        )}
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={onOpenHistory}
          aria-label="History"
          className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer text-[10px] transition-colors"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-tertiary)', fontFamily: 'inherit' }}
        >
          H
        </button>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer text-[10px] transition-colors"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-tertiary)', fontFamily: 'inherit' }}
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/Header.tsx
git commit -m "feat: add Header component with logo, streaming indicator, history/close buttons"
```

---

### Task 10: ErrorState Component

**Files:**
- Create: `src/renderer/components/ErrorState.tsx`

- [ ] **Step 1: Create ErrorState component**

Write `src/renderer/components/ErrorState.tsx`:

```typescript
interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
        style={{
          background: 'var(--error-bg)',
          border: '1px solid rgba(255,130,130,0.2)',
          color: 'var(--error)',
        }}
      >
        !
      </div>
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Something went wrong
      </span>
      <span className="text-[11px] text-center max-w-[220px]" style={{ color: 'var(--text-tertiary)' }}>
        {message}
      </span>
      <button
        onClick={onRetry}
        className="mt-1 px-4 py-2 rounded-2xl text-[11px] font-semibold border-none cursor-pointer transition-all"
        style={{
          background: 'var(--surface-active)',
          border: '1px solid rgba(167,139,250,0.25)',
          color: 'var(--accent)',
          fontFamily: 'inherit',
        }}
      >
        Retry
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/ErrorState.tsx
git commit -m "feat: add ErrorState component with warm red styling"
```

---

### Task 11: Restyle ActionBar with Follow-up Input

**Files:**
- Modify: `src/renderer/widget/components/ActionBar.tsx`

- [ ] **Step 1: Rewrite ActionBar with follow-up input**

Write `src/renderer/widget/components/ActionBar.tsx`:

```typescript
import { useState, useCallback } from 'react';

interface Props {
  onCopy: () => void;
  onRetry: () => void;
  onFollowUp: (text: string) => void;
  hasContent: boolean;
}

export default function ActionBar({ onCopy, onRetry, onFollowUp, hasContent }: Props) {
  const [copied, setCopied] = useState(false);
  const [followUp, setFollowUp] = useState('');

  const handleCopy = useCallback(() => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [onCopy]);

  const handleFollowUpSubmit = () => {
    const trimmed = followUp.trim();
    if (!trimmed) return;
    onFollowUp(trimmed);
    setFollowUp('');
  };

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-2.5"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      <button
        onClick={handleCopy}
        disabled={!hasContent}
        className="px-3 py-1.5 rounded-2xl text-[10px] font-medium flex items-center gap-1.5 border-none cursor-pointer transition-all"
        style={{
          background: copied ? 'rgba(52,211,153,0.1)' : 'var(--surface-hover)',
          color: copied ? 'var(--success)' : 'var(--text-secondary)',
          border: `1px solid ${copied ? 'rgba(52,211,153,0.2)' : 'var(--border-subtle)'}`,
          fontFamily: 'inherit',
        }}
      >
        {copied ? (
          <>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2 10V3C2 2.44772 2.44772 2 3 2H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Copy
          </>
        )}
      </button>

      <button
        onClick={onRetry}
        className="px-3 py-1.5 rounded-2xl text-[10px] font-medium border-none cursor-pointer transition-all"
        style={{
          background: 'var(--surface-hover)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'inherit',
        }}
      >
        Retry
      </button>

      <div style={{ flex: 1 }} />

      {/* Follow-up input */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl"
        style={{
          background: 'var(--surface-hover)',
          border: '1px solid var(--border-input)',
          flex: '0 1 60%',
        }}
      >
        <input
          type="text"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && followUp.trim()) handleFollowUpSubmit();
          }}
          placeholder="Ask follow-up..."
          className="flex-1 bg-transparent border-none outline-none text-[11px]"
          style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
        />
        <button
          onClick={handleFollowUpSubmit}
          disabled={!followUp.trim()}
          aria-label="Send follow-up"
          className="w-[26px] h-[26px] rounded-full flex items-center justify-center border-none cursor-pointer flex-shrink-0 text-[10px]"
          style={{
            background: followUp.trim()
              ? 'linear-gradient(135deg, var(--accent), var(--accent-strong))'
              : 'rgba(140,100,220,0.12)',
            boxShadow: followUp.trim() ? 'var(--shadow-button)' : 'none',
            color: '#fff',
            opacity: followUp.trim() ? 1 : 0.4,
            transition: 'all 0.15s ease',
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/widget/components/ActionBar.tsx
git commit -m "refactor: restyle ActionBar with follow-up input and success feedback"
```

---

### Task 12: ChatBubble — Main State Machine

**Files:**
- Create: `src/renderer/components/ChatBubble.tsx`

- [ ] **Step 1: Create ChatBubble — the main chat window**

Write `src/renderer/components/ChatBubble.tsx`:

```typescript
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chat';
import Header from './Header';
import MessageList from './MessageList';
import InputBar from './InputBar';
import ErrorState from './ErrorState';
import QuickActions from '../overlay/components/QuickActions';
import ModelSelector from '../overlay/components/ModelSelector';
import ActionBar from '../widget/components/ActionBar';
import SettingsView from './SettingsView';

const MODELS = [
  { id: 'deepseek-chat', label: 'DeepSeek V3' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
];

export default function ChatBubble() {
  const [query, setQuery] = useState('');
  const [needsKey, setNeedsKey] = useState(false);
  const [visible, setVisible] = useState(true);

  const state = useChatStore((s) => s.state);
  const model = useChatStore((s) => s.model);
  const errorMessage = useChatStore((s) => s.errorMessage);
  const messages = useChatStore((s) => s.messages);
  const setModel = useChatStore((s) => s.setModel);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const setError = useChatStore((s) => s.setError);
  const reset = useChatStore((s) => s.reset);

  const hasConversation = state !== 'empty';

  // ── IPC listeners ──
  useEffect(() => {
    const unsubChunk = window.electronAPI?.onResponseChunk((chunk: string) => {
      useChatStore.getState().appendChunk(chunk);
    });
    const unsubDone = window.electronAPI?.onResponseDone((fullText: string) => {
      useChatStore.getState().finishResponse(fullText);
    });
    const unsubError = window.electronAPI?.onResponseError((err: string) => {
      useChatStore.getState().setError(err);
    });
    const unsubNeedKey = window.electronAPI?.onNeedApiKey(() => {
      setNeedsKey(true);
    });
    const unsubKeySaved = window.electronAPI?.onApiKeySaved(() => {
      setNeedsKey(false);
    });
    const unsubReset = window.electronAPI?.onResponseReset(() => {
      useChatStore.getState().reset();
    });

    // Notify main process we're ready
    window.electronAPI?.chatReady?.();

    return () => {
      unsubChunk?.();
      unsubDone?.();
      unsubError?.();
      unsubNeedKey?.();
      unsubKeySaved?.();
      unsubReset?.();
    };
  }, []);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
        setTimeout(() => window.electronAPI?.hideChat?.(), 150);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Submit handler ──
  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    addUserMessage(trimmed);
    setQuery('');
    window.electronAPI?.sendQuery({ query: trimmed, model });
  }, [query, model, addUserMessage]);

  const handleQuickAction = useCallback(
    (action: { label: string; systemPrompt: string }) => {
      const trimmed = query.trim();
      const prompt = trimmed
        ? `${action.systemPrompt}\n\nText: ${trimmed}`
        : action.systemPrompt;
      addUserMessage(prompt);
      setQuery('');
      window.electronAPI?.sendQuery({ query: prompt, model });
    },
    [query, model, addUserMessage]
  );

  const handleRetry = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      reset();
      window.electronAPI?.sendQuery({ query: lastUserMsg.content, model });
    }
  }, [messages, model, reset]);

  const handleCopy = useCallback(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant) {
      window.electronAPI?.copyToClipboard(lastAssistant.content);
    }
  }, [messages]);

  const handleFollowUp = useCallback(
    (text: string) => {
      addUserMessage(text);
      window.electronAPI?.sendQuery({ query: text, model });
    },
    [model, addUserMessage]
  );

  const handleOpenHistory = useCallback(() => {
    window.electronAPI?.openHistory?.();
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => window.electronAPI?.hideChat?.(), 150);
  }, []);

  // ── API Key setup state ──
  if (needsKey) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex flex-col h-full"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-input)',
              borderRadius: 'var(--radius-window)',
              boxShadow: 'var(--shadow-window)',
              overflow: 'hidden',
            }}
          >
            <SettingsView onSaved={() => setNeedsKey(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="flex flex-col h-full"
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-input)',
            borderRadius: 'var(--radius-window)',
            boxShadow: 'var(--shadow-window)',
            overflow: 'hidden',
          }}
        >
          {/* Header — only when conversation exists */}
          {hasConversation && (
            <Header onOpenHistory={handleOpenHistory} onClose={handleClose} />
          )}

          {/* Body */}
          {state === 'empty' && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex items-center">
                <div className="w-full px-4">
                  <InputBar
                    value={query}
                    onChange={setQuery}
                    onSubmit={handleSubmit}
                    autoFocus
                  />
                </div>
              </div>
              <div
                className="flex items-center justify-between px-4 pb-3 pt-2"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <QuickActions onAction={handleQuickAction} />
                <ModelSelector models={MODELS} selected={model} onSelect={setModel} />
              </div>
            </div>
          )}

          {state === 'streaming' && (
            <>
              <MessageList />
              <div
                className="py-1.5 text-center"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
                  generating...
                </span>
              </div>
            </>
          )}

          {state === 'done' && (
            <>
              <MessageList />
              <ActionBar
                onCopy={handleCopy}
                onRetry={handleRetry}
                onFollowUp={handleFollowUp}
                hasContent={messages.length > 0}
              />
            </>
          )}

          {state === 'error' && hasConversation && (
            <>
              <MessageList />
              <ErrorState message={errorMessage || 'Unknown error'} onRetry={handleRetry} />
            </>
          )}

          {state === 'error' && !hasConversation && (
            <ErrorState message={errorMessage || 'Unknown error'} onRetry={handleRetry} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/ChatBubble.tsx
git commit -m "feat: add ChatBubble state machine — all 4 states, quick actions, follow-up"
```

---

### Task 13: SettingsView Component

**Files:**
- Create: `src/renderer/components/SettingsView.tsx`

- [ ] **Step 1: Create SettingsView — API key setup**

Write `src/renderer/components/SettingsView.tsx`:

```typescript
import { useState } from 'react';

interface Props {
  onSaved: () => void;
}

const PROVIDERS = [
  { id: 'deepseek', label: 'DeepSeek', getUrl: 'https://platform.deepseek.com/api_keys', keyPrefix: 'sk-' },
  { id: 'openai', label: 'OpenAI', getUrl: 'https://platform.openai.com/api-keys', keyPrefix: 'sk-proj-' },
  { id: 'anthropic', label: 'Anthropic', getUrl: 'https://console.anthropic.com/settings/keys', keyPrefix: 'sk-ant-' },
];

export default function SettingsView({ onSaved }: Props) {
  const [provider, setProvider] = useState('deepseek');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;

  const handleSave = () => {
    const key = apiKey.trim();
    if (!key) return;
    setSaving(true);
    window.electronAPI?.saveApiKey(provider, key);
    setTimeout(() => {
      setSaving(false);
      onSaved();
    }, 300);
  };

  return (
    <div className="flex flex-col gap-3.5 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
            boxShadow: '0 0 8px var(--accent-glow)',
          }}
        />
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Setup</span>
      </div>

      {/* Provider tabs */}
      <div>
        <label
          className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          Provider
        </label>
        <div className="flex gap-1">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className="flex-1 py-1.5 rounded-xl text-[10px] font-semibold border cursor-pointer transition-all"
              style={{
                background: p.id === provider ? 'var(--surface-active)' : 'var(--surface-hover)',
                borderColor: p.id === provider ? 'var(--border-focus)' : 'var(--border-subtle)',
                color: p.id === provider ? 'var(--accent)' : 'var(--text-tertiary)',
                fontFamily: 'inherit',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* API Key input */}
      <div>
        <label
          className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder={currentProvider.keyPrefix + '...'}
          autoFocus
          className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--border-input)',
            color: 'var(--text-primary)',
            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
          }}
        />
        {apiKey.length > 0 && (
          <span className="block text-right text-[9px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {apiKey.length} characters
          </span>
        )}
      </div>

      {/* Get key link */}
      <div className="text-[10px] text-center" style={{ color: 'var(--text-tertiary)' }}>
        Get a key at{' '}
        <button
          onClick={() => window.electronAPI?.openUrl(currentProvider.getUrl)}
          className="bg-transparent border-none p-0 underline cursor-pointer text-[10px]"
          style={{ color: 'var(--accent)', fontFamily: 'inherit' }}
        >
          {currentProvider.label} →
        </button>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!apiKey.trim() || saving}
        className="w-full py-2.5 rounded-2xl text-[13px] font-semibold border-none cursor-pointer transition-all"
        style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
          boxShadow: '0 0 16px rgba(167,139,250,0.2)',
          color: '#fff',
          fontFamily: 'inherit',
          opacity: !apiKey.trim() || saving ? 0.4 : 1,
        }}
      >
        {saving ? 'Saving...' : 'Save & Start'}
      </button>

      <span className="text-[9px] text-center" style={{ color: 'var(--text-tertiary)' }}>
        Key is stored locally, sent only to the provider's API.
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/SettingsView.tsx
git commit -m "feat: add SettingsView with provider tabs and gradient save button"
```

---

### Task 14: HistoryWindow Component

**Files:**
- Create: `src/renderer/components/HistoryWindow.tsx`

- [ ] **Step 1: Create HistoryWindow — searchable chat archive**

Write `src/renderer/components/HistoryWindow.tsx`:

```typescript
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useChatStore, type Conversation } from '../store/chat';

export default function HistoryWindow() {
  const conversations = useChatStore((s) => s.conversations);
  const setConversations = useChatStore((s) => s.setConversations);
  const loadConversation = useChatStore((s) => s.loadConversation);
  const clearConversations = useChatStore((s) => s.clearConversations);
  const currentId = useChatStore((s) => s.currentId);
  const [search, setSearch] = useState('');

  // Load history from main process on mount
  useEffect(() => {
    window.electronAPI?.getHistory().then((entries: any[]) => {
      if (entries && entries.length > 0) {
        const convs: Conversation[] = entries.map((e: any) => ({
          id: e.id,
          title: e.query.slice(0, 50) + (e.query.length > 50 ? '...' : ''),
          messages: [
            { id: e.id + '-u', role: 'user' as const, content: e.query, timestamp: e.timestamp },
            { id: e.id + '-a', role: 'assistant' as const, content: e.response, timestamp: e.timestamp },
          ],
          model: e.model,
          createdAt: e.timestamp,
          updatedAt: e.timestamp,
        }));
        setConversations(convs);
      }
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, search]);

  const handleSelect = (id: string) => {
    loadConversation(id);
    window.electronAPI?.closeHistory?.();
  };

  const handleClear = () => {
    window.electronAPI?.clearHistory().then(() => {
      clearConversations();
    });
  };

  const formatTime = (ts: number): string => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex flex-col h-full"
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-input)',
        borderRadius: 'var(--radius-window)',
        boxShadow: 'var(--shadow-window)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>History</span>
        <button
          onClick={() => window.electronAPI?.closeHistory?.()}
          className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer text-[10px]"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-tertiary)', fontFamily: 'inherit' }}
        >
          ×
        </button>
      </div>

      {/* Search */}
      <div className="px-3.5 py-2.5">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border-input)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent border-none outline-none text-[11px]"
            style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-0.5">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-subtle)',
                opacity: 0.5,
              }}
            >
              H
            </div>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {search ? 'No matches' : 'No conversations yet'}
            </span>
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className="text-left px-3 py-2.5 rounded-xl border-none cursor-pointer transition-colors"
              style={{
                background: conv.id === currentId ? 'var(--surface-active)' : 'transparent',
                border: conv.id === currentId ? '1px solid var(--border-input)' : '1px solid transparent',
                fontFamily: 'inherit',
              }}
            >
              <div
                className="text-xs font-semibold mb-0.5 truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {conv.title}
              </div>
              <div className="flex justify-between items-center">
                <span
                  className="text-[10px] truncate max-w-[70%]"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {conv.messages[0]?.content.slice(0, 60)}
                </span>
                <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
                  {formatTime(conv.updatedAt)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      {conversations.length > 0 && (
        <div
          className="flex justify-between items-center px-3.5 py-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
            {conversations.length} conversations
          </span>
          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded-xl text-[9px] border-none cursor-pointer transition-colors"
            style={{
              background: 'var(--error-bg)',
              border: '1px solid rgba(255,130,130,0.1)',
              color: 'var(--text-tertiary)',
              fontFamily: 'inherit',
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/HistoryWindow.tsx
git commit -m "feat: add HistoryWindow with search, chat list, and empty state"
```

---

### Task 15: Update Preload API

**Files:**
- Modify: `src/preload/index.ts`
- Modify: `src/types/electron.d.ts`

- [ ] **Step 1: Rewrite preload with unified API**

Write `src/preload/index.ts`:

```typescript
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
```

- [ ] **Step 2: Update type definitions**

Write `src/types/electron.d.ts`:

```typescript
type Unsubscriber = () => void;

interface ElectronAPI {
  sendQuery: (data: { query: string; model: string }) => void;
  hideChat: () => void;
  chatReady: () => void;
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
```

- [ ] **Step 3: Commit**

```bash
git add src/preload/index.ts src/types/electron.d.ts
git commit -m "refactor: unify preload API under chat/history namespaces"
```

---

### Task 16: Update Main Process Windows

**Files:**
- Modify: `src/main/windows/overlay.ts` → refactor to chat window
- Modify: `src/main/windows/response.ts` → refactor to history window

- [ ] **Step 1: Refactor overlay.ts to chat.ts**

Write `src/main/windows/overlay.ts` (keep filename for now, or rename to `chat.ts`):

```typescript
import { BrowserWindow } from 'electron';
import path from 'path';

let chatWindow: BrowserWindow | null = null;

function getUrl(): string {
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (devUrl) return devUrl;
  return `file://${path.join(__dirname, '../renderer/index.html')}`;
}

export function createChatWindow(): BrowserWindow {
  chatWindow = new BrowserWindow({
    width: 400,
    height: 500,
    minWidth: 320,
    minHeight: 350,
    transparent: true,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    hasShadow: true,
    backgroundColor: '#00000000',
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

  return chatWindow;
}

export function getChatWindow(): BrowserWindow | null {
  return chatWindow;
}

export function showChatWindow(): void {
  if (chatWindow) {
    chatWindow.show();
    chatWindow.focus();
  }
}

export function hideChatWindow(): void {
  chatWindow?.hide();
}
```

- [ ] **Step 2: Refactor response.ts to history.ts**

Write `src/main/windows/response.ts` (keep filename or rename to `history.ts`):

```typescript
import { BrowserWindow } from 'electron';
import path from 'path';

let historyWindow: BrowserWindow | null = null;

function getUrl(): string {
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (devUrl) return `${devUrl}?window=history`;
  return `file://${path.join(__dirname, '../renderer/index.html')}?window=history`;
}

export function createHistoryWindow(): BrowserWindow {
  historyWindow = new BrowserWindow({
    width: 360,
    height: 520,
    minWidth: 300,
    minHeight: 400,
    transparent: true,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  historyWindow.loadURL(getUrl());

  historyWindow.on('close', (e) => {
    e.preventDefault();
    historyWindow?.hide();
  });

  return historyWindow;
}

export function getHistoryWindow(): BrowserWindow | null {
  return historyWindow;
}

export function showHistoryWindow(): void {
  if (historyWindow) {
    historyWindow.show();
    historyWindow.focus();
  }
}

export function hideHistoryWindow(): void {
  historyWindow?.hide();
}
```

- [ ] **Step 3: Commit**

```bash
git add src/main/windows/overlay.ts src/main/windows/response.ts
git commit -m "refactor: convert overlay to chat window, response to history window"
```

---

### Task 17: Update IPC Handlers

**Files:**
- Modify: `src/main/ipc/handlers.ts`

- [ ] **Step 1: Rewrite IPC handlers with unified channels**

Write `src/main/ipc/handlers.ts`:

```typescript
import { ipcMain, clipboard, shell } from 'electron';
import { getChatWindow, showChatWindow, hideChatWindow } from '../windows/overlay';
import { showHistoryWindow, hideHistoryWindow, getHistoryWindow } from '../windows/response';
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
```

- [ ] **Step 2: Commit**

```bash
git add src/main/ipc/handlers.ts
git commit -m "refactor: unify IPC handlers under chat/history namespaces"
```

---

### Task 18: Update main/index.ts

**Files:**
- Modify: `src/main/index.ts`

- [ ] **Step 1: Update main process to use new windows**

Replace `src/main/index.ts` with:

```typescript
import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage } from 'electron';
import { createChatWindow, getChatWindow, showChatWindow } from './windows/overlay';
import { createHistoryWindow } from './windows/response';
import { registerIpcHandlers } from './ipc/handlers';
import { loadSettings, saveSettings } from './store/settings';
import path from 'path';

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

let tray: Tray | null = null;

app.on('second-instance', () => {
  const chat = getChatWindow();
  if (chat) {
    if (chat.isVisible()) {
      chat.hide();
    } else {
      chat.show();
      chat.focus();
    }
  }
});

function createTray() {
  const iconPath = path.join(__dirname, '../resources/icon.png');
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) throw new Error('Icon is empty');
  } catch {
    trayIcon = nativeImage.createEmpty();
  }
  tray = new Tray(trayIcon);
  tray.setToolTip('NovaSync');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide NovaSync',
      click: () => {
        const chat = getChatWindow();
        if (chat?.isVisible()) {
          chat.hide();
        } else {
          showChatWindow();
        }
      },
    },
    { type: 'separator' },
    { label: 'Quit NovaSync', click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => showChatWindow());
}

function tryRegisterHotkey(): string | null {
  const settings = loadSettings();
  const preferred = settings.hotkey || 'Alt+Space';
  const candidates = [preferred, 'Alt+Space', 'Ctrl+Shift+A', 'Ctrl+Shift+Space', 'Alt+Shift+Space'];
  const unique = [...new Set(candidates)];

  for (const hotkey of unique) {
    try {
      const ok = globalShortcut.register(hotkey, () => {
        const chat = getChatWindow();
        if (!chat) return;
        if (chat.isVisible()) {
          chat.hide();
        } else {
          showChatWindow();
        }
      });
      if (ok) {
        console.log(`Hotkey registered: ${hotkey}`);
        return hotkey;
      }
    } catch { /* try next */ }
  }
  return null;
}

app.whenReady().then(() => {
  createChatWindow();
  createHistoryWindow();
  registerIpcHandlers();

  const registeredHotkey = tryRegisterHotkey();
  if (!registeredHotkey) {
    showChatWindow();
  } else {
    saveSettings({ hotkey: registeredHotkey });
    showChatWindow();
  }

  createTray();

  if (process.platform === 'darwin') {
    app.dock?.hide();
  }
});

app.on('will-quit', () => globalShortcut.unregisterAll());
```

- [ ] **Step 2: Commit**

```bash
git add src/main/index.ts
git commit -m "refactor: update main process for single chat window + history window"
```

---

### Task 19: Update App.tsx and main.tsx

**Files:**
- Modify: `src/renderer/App.tsx`
- Modify: `src/renderer/main.tsx`

- [ ] **Step 1: Simplify App.tsx**

Write `src/renderer/App.tsx`:

```typescript
import ChatBubble from './components/ChatBubble';
import HistoryWindow from './components/HistoryWindow';

export default function App() {
  // Check URL param for history window mode
  const params = new URLSearchParams(window.location.search);
  const isHistory = params.get('window') === 'history';

  if (isHistory) {
    return <HistoryWindow />;
  }

  return <ChatBubble />;
}
```

- [ ] **Step 2: Simplify main.tsx**

Write `src/renderer/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/App.tsx src/renderer/main.tsx
git commit -m "refactor: simplify App — no mode split, single ChatBubble + optional HistoryWindow"
```

---

### Task 20: Delete Old Files & Cleanup

**Files to delete:**
- `src/renderer/overlay/App.tsx`
- `src/renderer/overlay/components/CommandInput.tsx`
- `src/renderer/overlay/styles/overlay.css`
- `src/renderer/widget/App.tsx`
- `src/renderer/widget/components/StreamingText.tsx`
- `src/renderer/widget/styles/widget.css`

- [ ] **Step 1: Delete old files**

```bash
rm src/renderer/overlay/App.tsx
rm src/renderer/overlay/components/CommandInput.tsx
rm src/renderer/overlay/styles/overlay.css
rm src/renderer/widget/App.tsx
rm src/renderer/widget/components/StreamingText.tsx
rm src/renderer/widget/styles/widget.css
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove old overlay/widget split files"
```

---

### Task 21: Final Integration & Smoke Test

- [ ] **Step 1: Run dev build to check for compilation errors**

```bash
npm run dev
```

- [ ] **Step 2: Verify the app launches**

Check in terminal output for any TS or bundler errors. If the app opens, verify:
- Chat bubble window appears with empty state (no header, just input + quick actions)
- Type a query and submit — header appears, streaming works, response renders with markdown
- Copy button works, retry works, follow-up input works
- History window opens via 'H' button
- Escape closes the window
- No console errors in the Electron dev tools

- [ ] **Step 3: Fix any issues found during smoke test**

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final integration fixes from smoke test"
```

---

## Self-Review

- [x] Spec coverage: each component, state, animation, and token from the spec maps to a task.
- [x] No placeholders: every step has actual code, not "TBD" or "implement later".
- [x] Type consistency: `ChatStore`, `Message`, `Conversation` types defined in Task 2 and used consistently in Tasks 6-8, 12, 14. `ElectronAPI` defined in Task 15 and used in preload.
- [x] All new files created before they're referenced by later tasks.
- [x] Delete tasks come last — nothing references deleted files.
- [x] IPC channels consistent between preload (Task 15), handlers (Task 17), and components (Task 12).
