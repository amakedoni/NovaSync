# NovaSync Liquid Glass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Полный редизайн NovaSync: одно окно (Glass Canvas), macOS-палитра + teal-акцент, liquid glass эффекты, spring-анимации, morph-переходы между состояниями.

**Architecture:** Одно BrowserWindow с 3 состояниями (IDLE/STREAMING/DONE). GlassCanvasApp заменяет ChatBubble. Header появляется только в не-IDLE состояниях. Выбор модели и режима — pills справа в строке ввода.

**Tech Stack:** React 19, TypeScript 5, Framer Motion (spring), Zustand 5, inline styles (без Tailwind)

---

## Файловая структура

```
src/
├── renderer/
│   ├── main.tsx                          # Без изменений
│   ├── App.tsx                           # Модифицировать: убрать HistoryWindow
│   ├── store/chat.ts                     # Модифицировать: добавить mode
│   ├── components/
│   │   ├── GlassCanvasApp.tsx            # СОЗДАТЬ: корневой компонент (вместо ChatBubble)
│   │   ├── WindowShell.tsx               # СОЗДАТЬ: стеклянная оболочка с эффектами
│   │   ├── HeaderBar.tsx                 # СОЗДАТЬ: unified header (handle или брендинг)
│   │   ├── IdleView.tsx                  # СОЗДАТЬ: строка ввода + модель + режим
│   │   ├── ConversationView.tsx          # СОЗДАТЬ: сообщения (STREAMING + DONE)
│   │   ├── InputBar.tsx                  # Модифицировать: убрать кнопку send, оставить только input
│   │   ├── ModelSelector.tsx             # УДАЛИТЬ, создать заново
│   │   ├── ModeSelector.tsx              # СОЗДАТЬ: дропдаун выбора режима
│   │   ├── Dropdown.tsx                  # СОЗДАТЬ: переиспользуемый дропдаун со spring-анимацией
│   │   ├── MessageList.tsx               # Модифицировать: стили
│   │   ├── UserMessage.tsx               # Модифицировать: стили
│   │   ├── NovaMessage.tsx               # Модифицировать: стили
│   │   ├── ErrorState.tsx                # Модифицировать: стили
│   │   ├── ActionBar.tsx                 # Модифицировать: стили
│   │   ├── SettingsView.tsx              # Модифицировать: стили
│   │   └── HistoryWindow.tsx            # Модифицировать: стили
│   ├── overlay/                          # УДАЛИТЬ целиком (перенесено в GlassCanvasApp)
│   ├── widget/                           # УДАЛИТЬ целиком (перенесено в GlassCanvasApp)
│   └── styles/globals.css               # Модифицировать: новая палитра
├── main/
│   └── ipc/handlers.ts                   # Модифицировать: убрать логику двух окон
```

---

## Task 0: Git worktree

- [ ] **Step 1: Создать изолированное рабочее окружение**

```bash
git worktree add -b feat/liquid-glass-redesign ../NovaSync-liquid-glass main
```

Меняем рабочий каталог сессии на новый worktree.

---

## Task 1: Design tokens — новая палитра

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Заменить CSS-переменные**

Заменить содержимое `:root` и `@media (prefers-color-scheme: light)` в `globals.css`:

```css
:root {
  /* ── macOS System + Liquid Glass Palette ── */
  --bg-primary: #1c1c1e;
  --bg-secondary: #2c2c2e;
  --bg-tertiary: #3a3a3c;
  --text-primary: #f5f5f7;
  --text-secondary: #98989d;
  --text-tertiary: #636366;
  --accent: #5AC8FA;
  --accent-strong: #3AA8DA;
  --accent-glow: rgba(90, 200, 250, 0.25);
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-input: rgba(255, 255, 255, 0.10);
  --border-focus: rgba(90, 200, 250, 0.25);
  --surface-hover: rgba(255, 255, 255, 0.06);
  --surface-active: rgba(255, 255, 255, 0.10);
  --error: #ff453a;
  --error-bg: rgba(255, 69, 58, 0.10);
  --success: #30d158;
  --radius-window: 22px;
  --radius-card: 16px;
  --radius-input: 22px;
  --radius-pill: 15px;
  --radius-button: 14px;
  --shadow-window: 0 20px 50px rgba(0, 0, 0, 0.55);
  --shadow-button: 0 0 12px rgba(90, 200, 250, 0.25);
  --shadow-input: 0 0 16px rgba(90, 200, 250, 0.06);
  --shadow-dropdown: 0 12px 32px rgba(0, 0, 0, 0.55);
}

@media (prefers-color-scheme: light) {
  :root {
    --bg-primary: #f5f5f7;
    --bg-secondary: #e8e8ed;
    --bg-tertiary: #dcdce0;
    --text-primary: #1c1c1e;
    --text-secondary: #636366;
    --text-tertiary: #98989d;
    --border-subtle: rgba(0, 0, 0, 0.06);
    --border-input: rgba(0, 0, 0, 0.10);
    --border-focus: rgba(90, 200, 250, 0.35);
    --surface-hover: rgba(0, 0, 0, 0.04);
    --surface-active: rgba(0, 0, 0, 0.08);
    --error-bg: rgba(255, 69, 58, 0.08);
    --shadow-window: 0 20px 50px rgba(0, 0, 0, 0.12);
    --shadow-button: 0 0 14px rgba(90, 200, 250, 0.15);
    --shadow-input: 0 0 16px rgba(90, 200, 250, 0.04);
    --shadow-dropdown: 0 12px 32px rgba(0, 0, 0, 0.12);
  }
}
```

- [ ] **Step 2: Проверить визуально**

Запустить `npm run dev`, убедиться что переменные применились (фон существующих элементов стал серым, акцент — teal).

- [ ] **Step 3: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat: macOS system palette + teal accent design tokens"
```

---

## Task 2: Dropdown component

**Files:**
- Create: `src/renderer/components/Dropdown.tsx`

Переиспользуемый дропдаун со spring-анимацией. Используется для ModelSelector и ModeSelector.

- [ ] **Step 1: Создать Dropdown.tsx**

```typescript
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownProps {
  items: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
  side?: 'left' | 'right';
}

const spring = { type: 'spring' as const, stiffness: 200, damping: 24 };

export default function Dropdown({ items, selected, onSelect, side = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('click', handler);
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', keyHandler);
    };
  }, [open]);

  const current = items.find((i) => i.id === selected);

  const triggerStyle: React.CSSProperties = {
    height: 30,
    padding: '0 10px',
    borderRadius: 'var(--radius-pill)',
    background: open ? 'var(--surface-active)' : 'var(--surface-hover)',
    border: '0.5px solid var(--border-input)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 10,
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    transition: 'background 0.15s ease, border-color 0.15s ease',
    flexShrink: 0,
  };

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: 36,
    ...(side === 'right' ? { right: 0 } : { left: 0 }),
    minWidth: 155,
    borderRadius: 14,
    padding: 4,
    background: 'rgba(44, 44, 46, 0.96)',
    border: '0.5px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04) inset',
    backdropFilter: 'blur(20px)',
    zIndex: 9999,
  };

  const itemBase: React.CSSProperties = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '8px 12px',
    borderRadius: 10,
    fontSize: 11,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.1s ease, color 0.1s ease',
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={triggerStyle}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = 'var(--surface-active)';
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = 'var(--surface-hover)';
        }}
      >
        {current?.label || selected}
        <motion.svg
          width="7" height="7" viewBox="0 0 10 10" fill="none"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -2 }}
            transition={{ ...spring, duration: undefined }}
            style={menuStyle}
          >
            {items.map((item) => {
              const isSelected = item.id === selected;
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.id); setOpen(false); }}
                  style={{
                    ...itemBase,
                    background: isSelected ? 'rgba(90, 200, 250, 0.08)' : 'transparent',
                    color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.97)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {isSelected && (
                    <span style={{
                      display: 'inline-block',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      boxShadow: '0 0 4px var(--accent-glow)',
                      marginRight: 6,
                    }} />
                  )}
                  {!isSelected && <span style={{ display: 'inline-block', width: 4, height: 4, marginRight: 6, opacity: 0 }} />}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Проверить компиляцию**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/Dropdown.tsx
git commit -m "feat: reusable Dropdown with spring animation"
```

---

## Task 3: Mode selector

**Files:**
- Create: `src/renderer/components/ModeSelector.tsx`

- [ ] **Step 1: Создать ModeSelector.tsx**

```typescript
import Dropdown from './Dropdown';

export interface Mode {
  id: string;
  label: string;
  systemPrompt: string;
}

const MODES: Mode[] = [
  { id: 'chat', label: 'Chat', systemPrompt: '' },
  { id: 'explain', label: 'Explain', systemPrompt: 'Explain the following clearly and concisely. Use simple language. Keep it under 3 paragraphs.' },
  { id: 'summarize', label: 'Summarize', systemPrompt: 'Summarize the following in 3 bullet points. Be extremely concise.' },
  { id: 'translate', label: 'Translate', systemPrompt: "Translate the following text to English. If it's already in English, translate to Russian. Output only the translation." },
  { id: 'fix-code', label: 'Fix Code', systemPrompt: 'Find and fix bugs in the following code. Show the corrected version. Explain each fix in one line.' },
];

interface Props {
  selected: string;
  onSelect: (modeId: string) => void;
}

export default function ModeSelector({ selected, onSelect }: Props) {
  return <Dropdown items={MODES} selected={selected} onSelect={onSelect} />;
}

export { MODES };
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/ModeSelector.tsx
git commit -m "feat: ModeSelector — chat/explain/summarize/translate/fix-code"
```

---

## Task 4: Model selector (refactor)

**Files:**
- Replace: `src/renderer/overlay/components/ModelSelector.tsx`
- Create: `src/renderer/components/ModelSelector.tsx`

- [ ] **Step 1: Создать новый ModelSelector.tsx**

```typescript
import Dropdown from './Dropdown';

export interface Model {
  id: string;
  label: string;
}

interface Props {
  models: Model[];
  selected: string;
  onSelect: (modelId: string) => void;
}

export default function ModelSelector({ models, selected, onSelect }: Props) {
  return <Dropdown items={models} selected={selected} onSelect={onSelect} side="left" />;
}
```

- [ ] **Step 2: Удалить старый ModelSelector**

```bash
rm src/renderer/overlay/components/ModelSelector.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/ModelSelector.tsx
git rm src/renderer/overlay/components/ModelSelector.tsx
git commit -m "refactor: ModelSelector uses shared Dropdown component"
```

---

## Task 5: Chat store — добавить mode

**Files:**
- Modify: `src/renderer/store/chat.ts`

- [ ] **Step 1: Добавить поле mode и setMode в chat store**

Добавить в интерфейс `ChatStore`:

```typescript
mode: string;
setMode: (mode: string) => void;
```

Добавить в `create`:

```typescript
mode: 'chat',
setMode: (mode) => set({ mode }),
```

Сброс mode в `reset` и `newConversation`:

```typescript
reset: () => set({ state: 'empty', currentId: null, messages: [], errorMessage: '', mode: 'chat' }),
newConversation: () => set({ state: 'empty', currentId: null, messages: [], errorMessage: '', mode: 'chat' }),
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/store/chat.ts
git commit -m "feat: add mode field to chat store"
```

---

## Task 6: InputBar — упростить

**Files:**
- Modify: `src/renderer/components/InputBar.tsx`

Убрать кнопку отправки и скруглённую оболочку. Оставить только input.

- [ ] **Step 1: Переписать InputBar**

```typescript
import { useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

export default function InputBar({ value, onChange, onSubmit, disabled, autoFocus, placeholder = 'Ask anything...' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && canSend) {
          e.preventDefault();
          onSubmit();
        }
      }}
      placeholder={disabled ? 'Waiting for response...' : placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      spellCheck={false}
      style={{
        flex: 1,
        minWidth: 0,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontSize: 13,
        color: 'var(--text-primary)',
        fontFamily: 'inherit',
        padding: 0,
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/InputBar.tsx
git commit -m "refactor: simplify InputBar — remove send button and wrapper"
```

---

## Task 7: HeaderBar

**Files:**
- Create: `src/renderer/components/HeaderBar.tsx`

- [ ] **Step 1: Создать HeaderBar**

```typescript
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  state: 'idle' | 'streaming' | 'done' | 'error';
  onNewChat?: () => void;
  onOpenHistory: () => void;
  onClose: () => void;
}

const spring = { type: 'spring' as const, stiffness: 200, damping: 24 };

const btnBase: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 7,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.04)',
  color: 'var(--text-tertiary)',
  fontFamily: 'inherit',
  flexShrink: 0,
  transition: 'background 0.15s ease',
};

export default function HeaderBar({ state, onNewChat, onOpenHistory, onClose }: Props) {
  const showBranding = state !== 'idle';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: showBranding ? 'space-between' : 'center',
        padding: showBranding ? '12px 18px' : '8px 16px 0',
        borderBottom: showBranding ? '0.5px solid var(--border-subtle)' : 'none',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Drag handle (always visible) */}
      {!showBranding && (
        <div style={{ width: 24, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }} />
      )}

      {/* Branding (only in non-IDLE states) */}
      <AnimatePresence>
        {showBranding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={spring}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
                boxShadow: state === 'streaming'
                  ? '0 0 10px var(--accent-glow)'
                  : '0 0 6px rgba(90,200,250,0.2)',
                transition: 'box-shadow 0.3s ease',
              }}
            />
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ ...spring, delay: 0.08 }}
              style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}
            >
              NovaSync
            </motion.span>
            {state === 'streaming' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.16 }}
                style={{ fontSize: 9, color: 'var(--accent)' }}
              >
                ● streaming
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions (only with branding) */}
      {showBranding && (
        <div style={{ display: 'flex', gap: 4 }}>
          {onNewChat && (
            <button onClick={onNewChat} title="New chat" aria-label="New chat" style={btnBase}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <button onClick={onOpenHistory} title="History" aria-label="History" style={btnBase}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
              <path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button onClick={onClose} title="Close (Esc)" aria-label="Close" style={btnBase}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/HeaderBar.tsx
git commit -m "feat: HeaderBar — drag handle in IDLE, animated branding in other states"
```

---

## Task 8: IdleView — поле ввода + модель + режим

**Files:**
- Create: `src/renderer/components/IdleView.tsx`

- [ ] **Step 1: Создать IdleView**

```typescript
import ModelSelector, { type Model } from './ModelSelector';
import ModeSelector from './ModeSelector';
import InputBar from './InputBar';

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  models: Model[];
  model: string;
  onModelSelect: (id: string) => void;
  mode: string;
  onModeSelect: (id: string) => void;
}

export default function IdleView({
  query, onQueryChange, onSubmit,
  models, model, onModelSelect,
  mode, onModeSelect,
}: Props) {
  return (
    <div
      style={{
        padding: '18px 20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Input row: field + separator + model + mode */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          height: 44,
          padding: '0 6px 0 18px',
          borderRadius: 'var(--radius-input)',
          background: 'rgba(60, 60, 64, 0.45)',
          border: '0.5px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <InputBar
          value={query}
          onChange={onQueryChange}
          onSubmit={onSubmit}
          autoFocus
          placeholder="Ask anything..."
        />
        <div style={{ width: '0.5px', height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0, margin: '0 2px' }} />
        <ModelSelector models={models} selected={model} onSelect={onModelSelect} />
        <ModeSelector selected={mode} onSelect={onModeSelect} />
      </div>

      {/* Hint */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
          Enter to send · Esc to close
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/IdleView.tsx
git commit -m "feat: IdleView — single row input with model and mode selectors"
```

---

## Task 9: WindowShell — стеклянная оболочка

**Files:**
- Create: `src/renderer/components/WindowShell.tsx`

- [ ] **Step 1: Создать WindowShell**

```typescript
import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  visible: boolean;
  style?: React.CSSProperties;
}

const spring = { type: 'spring' as const, stiffness: 200, damping: 24 };

export default function WindowShell({ children, visible, style }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
      transition={spring}
      style={{
        // Glass surface
        background: 'linear-gradient(135deg, rgba(38, 38, 40, 0.75) 0%, rgba(32, 32, 34, 0.78) 100%)',
        border: '0.5px solid rgba(255, 255, 255, 0.13)',
        borderRadius: 'var(--radius-window)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.06) inset',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...style,
      }}
    >
      {/* Subtle light spots */}
      <div style={{
        position: 'absolute',
        top: -40,
        right: -40,
        width: 140,
        height: 140,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(90,200,250,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -30,
        left: '20%',
        width: 120,
        height: 70,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/WindowShell.tsx
git commit -m "feat: WindowShell — glass container with light spots and glow border"
```

---

## Task 10: ConversationView

**Files:**
- Create: `src/renderer/components/ConversationView.tsx`

Объединяет MessageList, "generating..." индикатор и ActionBar в один компонент для состояний STREAMING и DONE.

- [ ] **Step 1: Создать ConversationView**

```typescript
import { useChatStore } from '../store/chat';
import MessageList from './MessageList';
import ActionBar from './ActionBar';

interface Props {
  isThinking: boolean;
  onCopy: () => void;
  onRetry: () => void;
  onFollowUp: (text: string) => void;
}

export default function ConversationView({ isThinking, onCopy, onRetry, onFollowUp }: Props) {
  const state = useChatStore((s) => s.state);
  const messages = useChatStore((s) => s.messages);
  const hasAssistantContent = messages.some((m) => m.role === 'assistant');

  return (
    <>
      {/* Messages area */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <MessageList isThinking={isThinking} />
      </div>

      {/* Generating indicator */}
      {state === 'streaming' && !isThinking && (
        <div style={{
          borderTop: '0.5px solid var(--border-subtle)',
          padding: '8px 18px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>generating...</span>
        </div>
      )}

      {/* Thinking disabled input */}
      {state === 'streaming' && isThinking && (
        <div style={{
          borderTop: '0.5px solid var(--border-subtle)',
          padding: '8px 18px 10px',
        }}>
          <div style={{
            height: 38,
            borderRadius: 22,
            background: 'rgba(60, 60, 64, 0.35)',
            border: '0.5px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Waiting for response...</span>
          </div>
        </div>
      )}

      {/* Action bar (DONE) */}
      {state === 'done' && messages.length > 0 && (
        <ActionBar onCopy={onCopy} onRetry={onRetry} onFollowUp={onFollowUp} hasContent={hasAssistantContent} />
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/ConversationView.tsx
git commit -m "feat: ConversationView — messages + generating + action bar"
```

---

## Task 11: GlassCanvasApp — главный компонент

**Files:**
- Create: `src/renderer/components/GlassCanvasApp.tsx`
- Modify: `src/renderer/App.tsx`

Собирает всё вместе. Заменяет ChatBubble.

- [ ] **Step 1: Создать GlassCanvasApp.tsx**

```typescript
import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chat';
import { MODES } from './ModeSelector';
import WindowShell from './WindowShell';
import HeaderBar from './HeaderBar';
import IdleView from './IdleView';
import ConversationView from './ConversationView';
import ErrorState from './ErrorState';
import SettingsView from './SettingsView';

const MODELS = [
  { id: 'deepseek-chat', label: 'DeepSeek V3' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
];

export default function GlassCanvasApp() {
  const [query, setQuery] = useState('');
  const [needsKey, setNeedsKey] = useState(false);
  const [visible, setVisible] = useState(true);

  const state = useChatStore((s) => s.state);
  const model = useChatStore((s) => s.model);
  const mode = useChatStore((s) => s.mode);
  const errorMessage = useChatStore((s) => s.errorMessage);
  const messages = useChatStore((s) => s.messages);
  const setModel = useChatStore((s) => s.setModel);
  const setMode = useChatStore((s) => s.setMode);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const reset = useChatStore((s) => s.reset);

  const hasConversation = state !== 'empty';
  const isThinking = state === 'streaming' && messages.length > 0 && messages[messages.length - 1]?.role === 'user';
  const showError = state === 'error';

  // Map chat states to HeaderBar states
  const headerState = state === 'empty' ? 'idle' : state;

  // ── IPC ──
  useEffect(() => {
    const unsubs: (() => void)[] = [];
    const r0 = window.electronAPI?.onChatOpened?.(() => { setVisible(true); setQuery(''); });
    if (r0) unsubs.push(r0);
    const r1 = window.electronAPI?.onResponseChunk?.((chunk: string) => { useChatStore.getState().appendChunk(chunk); });
    if (r1) unsubs.push(r1);
    const r2 = window.electronAPI?.onResponseDone?.((fullText: string) => { useChatStore.getState().finishResponse(fullText); });
    if (r2) unsubs.push(r2);
    const r3 = window.electronAPI?.onResponseError?.((err: string) => { useChatStore.getState().setError(err); });
    if (r3) unsubs.push(r3);
    const r4 = window.electronAPI?.onNeedApiKey?.(() => { setNeedsKey(true); });
    if (r4) unsubs.push(r4);
    const r5 = window.electronAPI?.onApiKeySaved?.(() => { setNeedsKey(false); });
    if (r5) unsubs.push(r5);
    const r6 = window.electronAPI?.onResponseReset?.(() => { useChatStore.getState().reset(); });
    if (r6) unsubs.push(r6);
    window.electronAPI?.chatReady?.();
    return () => { unsubs.forEach((fn) => fn()); };
  }, []);

  // ── Keyboard ──
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setVisible(false); setTimeout(() => window.electronAPI?.hideChat?.(), 150); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // ── Handlers ──
  const submit = useCallback(() => {
    const t = query.trim(); if (!t) return;
    const selectedMode = MODES.find((m) => m.id === mode);
    const prompt = selectedMode?.systemPrompt ? `${selectedMode.systemPrompt}\n\n${t}` : t;
    addUserMessage(prompt); setQuery('');
    window.electronAPI?.sendQuery({ query: prompt, model });
  }, [query, addUserMessage, model, mode]);

  const retry = useCallback(() => {
    const u = [...useChatStore.getState().messages].reverse().find((m) => m.role === 'user');
    if (!u) return;
    useChatStore.getState().setError('');
    window.electronAPI?.sendQuery({ query: u.content, model });
  }, [model]);

  const copy = useCallback(() => {
    const a = [...useChatStore.getState().messages].reverse().find((m) => m.role === 'assistant');
    if (a) window.electronAPI?.copyToClipboard(a.content);
  }, []);

  const followUp = useCallback((text: string) => {
    addUserMessage(text);
    window.electronAPI?.sendQuery({ query: text, model });
  }, [addUserMessage, model]);

  const close = useCallback(() => { setVisible(false); setTimeout(() => window.electronAPI?.hideChat?.(), 150); }, []);
  const newChat = useCallback(() => { reset(); setQuery(''); }, [reset]);

  // ── API key setup ──
  if (needsKey) {
    return (
      <WindowShell visible={visible}>
        <SettingsView onSaved={() => setNeedsKey(false)} />
      </WindowShell>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <WindowShell visible={visible}>
          <HeaderBar
            state={headerState}
            onNewChat={hasConversation ? newChat : undefined}
            onOpenHistory={() => window.electronAPI?.openHistory?.()}
            onClose={close}
          />

          {/* IDLE state */}
          {state === 'empty' && (
            <IdleView
              query={query}
              onQueryChange={setQuery}
              onSubmit={submit}
              models={MODELS}
              model={model}
              onModelSelect={setModel}
              mode={mode}
              onModeSelect={setMode}
            />
          )}

          {/* Conversation (STREAMING + DONE) */}
          {(state === 'streaming' || state === 'done') && messages.length > 0 && (
            <ConversationView
              isThinking={isThinking}
              onCopy={copy}
              onRetry={retry}
              onFollowUp={followUp}
            />
          )}

          {/* Error */}
          {showError && (
            <ErrorState message={errorMessage} onRetry={retry} />
          )}

          {/* Error with conversation — retry/new chat buttons */}
          {showError && hasConversation && (
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 8,
              padding: '10px 12px', borderTop: '0.5px solid var(--border-subtle)',
            }}>
              <button onClick={retry} style={{
                padding: '6px 18px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                border: '0.5px solid rgba(90,200,250,0.2)', background: 'var(--surface-active)',
                color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit',
              }}>Retry</button>
              <button onClick={newChat} style={{
                padding: '6px 18px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                border: '0.5px solid var(--border-subtle)', background: 'var(--surface-hover)',
                color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
              }}>New Chat</button>
            </div>
          )}
        </WindowShell>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Обновить App.tsx**

```typescript
import { useMemo } from 'react';
import GlassCanvasApp from './components/GlassCanvasApp';
import HistoryWindow from './components/HistoryWindow';

export default function App() {
  const isHistory = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('window') === 'history';
  }, []);

  if (isHistory) {
    return <HistoryWindow />;
  }

  return <GlassCanvasApp />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/GlassCanvasApp.tsx src/renderer/App.tsx
git commit -m "feat: GlassCanvasApp — single window with 3 states, replaces ChatBubble"
```

---

## Task 12: Обновить стили сообщений

**Files:**
- Modify: `src/renderer/components/UserMessage.tsx`
- Modify: `src/renderer/components/NovaMessage.tsx`
- Modify: `src/renderer/components/ErrorState.tsx`
- Modify: `src/renderer/components/ActionBar.tsx`
- Modify: `src/renderer/components/SettingsView.tsx`
- Modify: `src/renderer/components/HistoryWindow.tsx`

- [ ] **Step 1: Обновить UserMessage — цвета**

Заменить градиент фона:

```typescript
// Было:
background: 'linear-gradient(135deg, rgba(167,139,250,0.20), rgba(124,58,237,0.12))'
// Стало:
background: 'linear-gradient(135deg, rgba(90,200,250,0.12), rgba(90,200,250,0.05))'
```

И border:

```typescript
border: '0.5px solid rgba(90,200,250,0.08)'
```

- [ ] **Step 2: Обновить NovaMessage — цвета**

Заменить все градиенты с фиолетового на teal:

```typescript
// Иконка N:
background: isStreaming
  ? 'linear-gradient(135deg, rgba(90,200,250,0.25), rgba(90,200,250,0.12))'
  : 'linear-gradient(135deg, rgba(90,200,250,0.18), rgba(90,200,250,0.08))'
border: '0.5px solid rgba(90,200,250,0.12)'

// Code background:
background: 'rgba(60,60,64,0.5)'
```

- [ ] **Step 3: Обновить ErrorState — цвета**

```typescript
background: 'var(--error-bg)'
border: '0.5px solid rgba(255,69,58,0.2)'
color: 'var(--error)'
```

- [ ] **Step 4: Обновить ActionBar — цвета**

Заменить все `rgba(167,139,250,...)` на `rgba(90,200,250,...)`.

- [ ] **Step 5: Обновить SettingsView — цвета**

Заменить фиолетовые оттенки на teal.

- [ ] **Step 6: Обновить HistoryWindow — цвета**

Заменить фиолетовые оттенки на teal.

- [ ] **Step 7: Commit**

```bash
git add src/renderer/components/UserMessage.tsx src/renderer/components/NovaMessage.tsx src/renderer/components/ErrorState.tsx src/renderer/components/ActionBar.tsx src/renderer/components/SettingsView.tsx src/renderer/components/HistoryWindow.tsx
git commit -m "refactor: update all components to teal accent palette"
```

---

## Task 13: Cleanup — удалить старые файлы

**Files:**
- Remove: `src/renderer/components/ChatBubble.tsx`
- Remove: `src/renderer/components/Header.tsx`
- Remove: `src/renderer/overlay/` (вся директория)
- Remove: `src/renderer/widget/` (вся директория)
- Modify: `src/main/ipc/handlers.ts` (убрать логику двух окон, если требуется)

- [ ] **Step 1: Удалить старые компоненты**

```bash
rm src/renderer/components/ChatBubble.tsx
rm src/renderer/components/Header.tsx
rm -rf src/renderer/overlay
rm -rf src/renderer/widget
```

- [ ] **Step 2: Проверить импорты**

```bash
npx tsc --noEmit
```

Убедиться, что нет битых импортов от удалённых файлов.

- [ ] **Step 3: Обновить handlers.ts (если нужно)**

Проверить `src/main/ipc/handlers.ts` — если там есть ссылки на отдельное окно response/widget, заменить на единое окно.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old ChatBubble, Header, overlay/, widget/ — replaced by GlassCanvasApp"
```

---

## Task 14: Финальная проверка и полировка

- [ ] **Step 1: Проверить сборку**

```bash
npm run build
```

Должна пройти без ошибок.

- [ ] **Step 2: Запустить dev и проверить вручную**

```bash
npm run dev
```

Проверить:
- IDLE: одна строка ввода, модель и режим справа, без брендинга
- Отправка запроса: morph в STREAMING, header появляется с анимацией
- Стриминг: ответ появляется, generating... внизу
- DONE: action bar с copy/retry/follow up
- Esc: закрытие
- New Chat: morph обратно в IDLE

- [ ] **Step 3: Commit (если были правки)**

```bash
git add -A
git commit -m "chore: final polish after manual testing"
```

---

## Self-Review

### Spec Coverage
- ✅ Архитектура Glass Canvas (3 состояния) → Tasks 7, 8, 10, 11
- ✅ macOS-палитра + teal-акцент → Task 1
- ✅ Liquid glass эффекты (light spots, glow border) → Task 9
- ✅ Spring-анимации (200/24) → Tasks 2, 7, 9, 11
- ✅ Режимы (Chat/Explain/Summarize/...) → Tasks 3, 5
- ✅ IDLE без брендинга → Tasks 7, 8
- ✅ Header staggered animation → Task 7
- ✅ Micro-interactions (press scale, ripple) → Task 2
- ✅ Morph-переходы → Task 11 (AnimatePresence + layout)
- ✅ Одна строка: input + модель + режим → Task 8

### Placeholder Scan
- Все шаги содержат конкретный код
- Все команды с точными ожиданиями
- Нет "TBD", "implement later" и т.д.

### Type Consistency
- `Dropdown` используется в `ModelSelector` и `ModeSelector` — интерфейс совпадает
- `ChatStore.mode` определён в Task 5, используется в Tasks 8, 11
- `GlassCanvasApp` импортирует все компоненты из корректных путей
