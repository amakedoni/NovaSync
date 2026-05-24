# NovaSync Premium Monochrome — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace glassmorphism with premium monochrome design (black/white/gray + terracotta orange accent, Inter font) across all 15 renderer files.

**Architecture:** Backend-agnostic visual redesign. All CSS tokens in `globals.css` define the palette; components consume tokens via inline styles. No main-process, IPC, or Zustand changes.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS 4, Framer Motion 12, Inter font

---

### Task 1: Replace CSS Design Tokens in globals.css

**Files:**
- Modify: `src/styles/globals.css`

**Goal:** Replace all `:root` and `@media (prefers-color-scheme: light)` tokens. Remove glassmorphism-related animations. Update scrollbar, selection, focus, animations to new palette.

- [ ] **Step 1: Replace `:root` tokens**

Replace lines 3–49 (the entire `:root` block) with:

```css
:root {
  /* ── Premium Monochrome palette ── */
  --bg-deep: #1a1a1c;
  --bg-primary: #1a1a1c;
  --bg-secondary: #222226;
  --bg-tertiary: #28282c;
  --text-primary: #e4e4e6;
  --text-secondary: #c0c0c6;
  --text-tertiary: #909098;
  --text-muted: #606068;
  --text-faint: #505058;
  --accent: #e8784a;
  --accent-strong: #d0683a;
  --accent-subtle: rgba(232, 120, 74, 0.10);
  --warm-amber: transparent;
  --warm-amber-hover: transparent;
  --border-subtle: #242428;
  --border-input: #2a2a2e;
  --border-focus: rgba(232, 120, 74, 0.30);
  --surface-subtle: #222226;
  --surface-hover: #252528;
  --surface-active: #28282c;
  --error: #ff453a;
  --error-bg: rgba(255, 69, 58, 0.08);
  --success: #30d158;
  --success-bg: rgba(48, 209, 88, 0.08);

  /* ── Radius scale ── */
  --radius-sm: 5px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-window: 12px;
  --radius-input: 6px;
  --radius-pill: 5px;
  --radius-button: 6px;

  /* ── Shadows ── */
  --shadow-window: 0 20px 50px rgba(0, 0, 0, 0.7);
  --shadow-button: none;
  --shadow-input-focus: 0 0 0 2px rgba(232, 120, 74, 0.15);
  --shadow-dropdown: 0 12px 32px rgba(0, 0, 0, 0.6);
  --shadow-card: none;
}
```

- [ ] **Step 2: Replace `@media (prefers-color-scheme: light)` block**

Replace lines 52–88 (the entire light-mode block) with:

```css
@media (prefers-color-scheme: light) {
  :root {
    --bg-deep: #f5f5f7;
    --bg-primary: #f5f5f7;
    --bg-secondary: #eeeef0;
    --bg-tertiary: #e4e4e6;
    --text-primary: #1c1c1e;
    --text-secondary: #636366;
    --text-tertiary: #8e8e93;
    --text-muted: #98989d;
    --text-faint: #aeaeb2;
    --accent: #d0683a;
    --accent-strong: #c0582a;
    --accent-subtle: rgba(208, 104, 58, 0.08);
    --border-subtle: #e4e4e8;
    --border-input: #dcdce0;
    --border-focus: rgba(208, 104, 58, 0.25);
    --surface-subtle: #eeeef0;
    --surface-hover: #e4e4e8;
    --surface-active: #dcdce0;
    --error-bg: rgba(255, 69, 58, 0.06);
    --success-bg: rgba(48, 209, 88, 0.06);
    --shadow-window: 0 8px 30px rgba(0, 0, 0, 0.12);
    --shadow-dropdown: 0 8px 24px rgba(0, 0, 0, 0.10);
  }
}
```

- [ ] **Step 3: Update body font**

Replace line 103 (`font-family`) with:

```css
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

- [ ] **Step 4: Update scrollbar**

Replace lines 111–131 with:

```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--surface-active); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-faint); }
* { scrollbar-width: thin; scrollbar-color: var(--surface-active) transparent; }
```

- [ ] **Step 5: Update selection color**

Replace line 136 with:

```css
  background: var(--accent-subtle);
```

- [ ] **Step 6: Update focus**

Replace line 147 with:

```css
  outline: 2px solid var(--accent);
```

- [ ] **Step 7: Remove `ambient-shift` animation (unused since WindowShell goes opaque)**

Delete lines 221–226 (the entire `@keyframes ambient-shift` block).

- [ ] **Step 8: Update streaming cursor**

Replace lines 242–252 with:

```css
.streaming-cursor {
  display: inline-block;
  width: 8px;
  height: 15px;
  background: var(--accent);
  animation: breathe-cursor 0.8s ease-in-out infinite;
  vertical-align: text-bottom;
  margin-left: 2px;
  border-radius: 1px;
}
```

- [ ] **Step 9: Update loading dots**

Replace line 264 (`background: var(--accent);`) — it's already correct. Replace line 267 (`background: var(--accent);`) — already correct. No change needed.

- [ ] **Step 10: Commit**

```bash
git add src/styles/globals.css
git commit -m "style: premium monochrome design tokens — replace glassmorphism palette"
```

---

### Task 2: Add Inter Font to HTML

**Files:**
- Modify: `src/renderer/index.html`

- [ ] **Step 1: Add Inter font link in `<head>`**

Replace the file content with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NovaSync</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/index.html
git commit -m "style: add Inter font (weights 400-700)"
```

---

### Task 3: Redesign WindowShell — Opaque Solid Surface

**Files:**
- Modify: `src/renderer/components/WindowShell.tsx`

**Goal:** Remove glassmorphism (backdrop-filter, ambient gradients, light spots). Replace with solid `#1a1a1c` surface, single border, clean shadow.

- [ ] **Step 1: Replace WindowShell component**

Replace the entire file content with:

```tsx
import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  visible: boolean;
  style?: React.CSSProperties;
  shimmerKey?: number;
}

const spring = { type: 'spring' as const, stiffness: 260, damping: 26 };

export default function WindowShell({ children, visible, style }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.94, y: 8 }}
      transition={{ ...spring, duration: undefined }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 'var(--radius-window)',
        overflow: 'hidden',
        background: 'var(--bg-deep)',
        border: '1px solid var(--border-input)',
        boxShadow: 'var(--shadow-window)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/WindowShell.tsx
git commit -m "style: WindowShell — opaque solid surface, remove glassmorphism"
```

---

### Task 4: Redesign IdleView — One-Line Layout, No Paste Button

**Files:**
- Modify: `src/renderer/components/IdleView.tsx`

**Goal:** Single-row layout: Logo → Input → Model → Mode. Remove clipboard paste button and clipboard reading logic. Remove InputBar wrapper div's backdrop-blur.

- [ ] **Step 1: Replace IdleView component**

Replace the entire file content with:

```tsx
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
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 20px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Logo mark */}
      <div style={{
        width: 26,
        height: 26,
        background: 'var(--accent)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--bg-deep)',
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
      }}>
        N
      </div>

      {/* Input */}
      <InputBar
        value={query}
        onChange={onQueryChange}
        onSubmit={onSubmit}
        autoFocus
        placeholder="Ask anything..."
      />

      {/* Model pill */}
      <ModelSelector models={models} selected={model} onSelect={onModelSelect} />

      {/* Mode pill */}
      <ModeSelector selected={mode} onSelect={onModeSelect} />
    </div>
  );
}
```

Remove imports that are no longer used: `useState`, `useEffect` from react.

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit`
Expected: No errors in IdleView.tsx

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/IdleView.tsx
git commit -m "style: IdleView — one-line layout, remove paste button"
```

---

### Task 5: Redesign HeaderBar — Monochrome Premium

**Files:**
- Modify: `src/renderer/components/HeaderBar.tsx`

**Goal:** Smaller logo (20px, orange filled), clean monochrome labels, no animated gradient dot.

- [ ] **Step 1: Replace HeaderBar component**

Replace the entire file content with:

```tsx
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  state: 'idle' | 'streaming' | 'done' | 'error';
  modelLabel?: string;
  modeLabel?: string;
  onNewChat?: () => void;
  onOpenHistory: () => void;
  onOpenSettings?: () => void;
  onClose: () => void;
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 26 };

const btnBase: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: 'pointer',
  background: 'transparent',
  color: 'var(--text-faint)',
  fontFamily: 'inherit',
  flexShrink: 0,
  transition: 'background 0.15s ease, color 0.15s ease',
};

export default function HeaderBar({ state, modelLabel, modeLabel, onNewChat, onOpenHistory, onOpenSettings, onClose }: Props) {
  const showBranding = state !== 'idle';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: showBranding ? 'space-between' : 'center',
        padding: showBranding ? '10px 16px' : '6px 16px 0',
        borderBottom: showBranding ? '1px solid var(--border-subtle)' : 'none',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
        minHeight: showBranding ? 46 : 20,
      }}
    >
      {/* Drag handle — idle only */}
      {!showBranding && (
        <div style={{ width: 22, height: 3, borderRadius: 2, background: 'var(--surface-active)' }} />
      )}

      {/* Branding */}
      <AnimatePresence>
        {showBranding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {/* Logo — orange filled */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={spring}
              style={{
                width: 20,
                height: 20,
                borderRadius: 5,
                flexShrink: 0,
                background: 'var(--accent)',
                color: 'var(--bg-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 700,
              }}
            >
              N
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ ...spring, delay: 0.06 }}
              style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}
            >
              NovaSync
            </motion.span>
            {modeLabel && modeLabel !== 'Chat' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.08 }}
                style={{
                  fontSize: 9, fontWeight: 500, color: 'var(--text-tertiary)',
                  background: 'var(--surface-subtle)', padding: '2px 7px', borderRadius: 3,
                }}
              >
                {modeLabel}
              </motion.span>
            )}
            {state === 'streaming' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--accent)', fontWeight: 500 }}
              >
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)',
                  animation: 'breathe-cursor 1.5s ease-in-out infinite',
                }} />
                streaming
              </motion.span>
            )}
            {modelLabel && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.14 }}
                style={{ fontSize: 9, color: 'var(--text-muted)' }}
              >
                {modelLabel}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      {showBranding && (
        <div style={{ display: 'flex', gap: 2 }}>
          {onNewChat && (
            <button onClick={onNewChat} title="New chat" aria-label="New chat" style={btnBase}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)'; }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <button onClick={onOpenHistory} title="History" aria-label="History" style={btnBase}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.1" />
              <path d="M6 3.5v2.5l1.5 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {onOpenSettings && (
            <button onClick={onOpenSettings} title="Settings" aria-label="Settings" style={btnBase}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)'; }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.1" />
                <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M3.05 3.05l1.06 1.06M9.9 9.9l1.06 1.06M3.05 10.95l1.06-1.06M9.9 4.1l1.06-1.06" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <button onClick={onClose} title="Close (Esc)" aria-label="Close" style={btnBase}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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
git commit -m "style: HeaderBar — smaller orange logo, monochrome labels, clean header"
```

---

### Task 6: Redesign UserMessage — Neutral Gray Bubble

**Files:**
- Modify: `src/renderer/components/UserMessage.tsx`

**Goal:** Replace blue-tinted gradient bubble with solid `#252528` gray. Clean rounded corners, no glow.

- [ ] **Step 1: Replace the bubble styling**

Replace lines 29–41 (the inner div with the bubble and timestamp) with:

```tsx
      <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        <div style={{
          padding: '10px 14px', fontSize: 13, lineHeight: 1.5,
          background: 'var(--surface-hover)',
          color: 'var(--text-primary)',
          borderRadius: '10px 10px 2px 10px',
          wordBreak: 'break-word',
        }}>
          {content}
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 9, padding: '0 4px' }}>
          {formatTime(timestamp)}
        </span>
      </div>
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/UserMessage.tsx
git commit -m "style: UserMessage — neutral gray bubble, clean corners"
```

---

### Task 7: Redesign NovaMessage — Outlined Avatar, Monochrome Markdown

**Files:**
- Modify: `src/renderer/components/NovaMessage.tsx`

**Goal:** Outlined logo avatar (orange border, no fill). New code block and inline code colors. Orange streaming cursor only.

- [ ] **Step 1: Replace the avatar styling**

Replace lines 21–33 (the avatar div) with:

```tsx
      <div style={{
        width: 22, height: 22, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 10, fontWeight: 700,
        background: 'var(--bg-deep)',
        border: '1px solid var(--accent)',
        color: 'var(--accent)',
    }}>
        N
      </div>
```

- [ ] **Step 2: Update markdown component styles**

Replace lines 46–76 (the `ReactMarkdown` and its `components`) with:

```tsx
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ marginBottom: 8, marginTop: 0 }}>{children}</p>,
              strong: ({ children }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{children}</strong>,
              code: ({ className, children }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code style={{
                      padding: '1px 5px', borderRadius: 3, fontSize: '0.9em',
                      background: 'var(--surface-subtle)', color: 'var(--text-secondary)',
                      fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                    }}>{children}</code>
                  );
                }
                return (
                  <pre style={{
                    margin: '12px 0', padding: '14px 16px', borderRadius: 6, overflowX: 'auto',
                    fontSize: 11, lineHeight: 1.55,
                    background: 'var(--surface-subtle)', border: '1px solid var(--border-input)',
                    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                  }}>
                    <code className={className}>{children}</code>
                  </pre>
                );
              },
              a: ({ children, href }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '1px solid var(--accent-subtle)' }}>{children}</a>
              ),
              ul: ({ children }) => <ul style={{ paddingLeft: 18, marginBottom: 8, color: 'var(--text-secondary)' }}>{children}</ul>,
              ol: ({ children }) => <ol style={{ paddingLeft: 18, marginBottom: 8, color: 'var(--text-secondary)' }}>{children}</ol>,
              li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
            }}
          >
```

- [ ] **Step 3: Update streaming cursor**

Replace `{isStreaming && <span className="streaming-cursor" />}` (line 82) — it already uses the CSS class, which was updated in Task 1. No code change needed.

- [ ] **Step 4: Update message body font size**

On line 39, change `fontSize: 12.5` to `fontSize: 13`, change `color: 'var(--text-primary)'` to `color: 'var(--text-secondary)'`:

```tsx
          flex: 1, minWidth: 0, color: 'var(--text-secondary)', fontSize: 13,
```

- [ ] **Step 5: Commit**

```bash
git add src/renderer/components/NovaMessage.tsx
git commit -m "style: NovaMessage — outlined avatar, monochrome markdown colors"
```

---

### Task 8: Redesign ActionBar — Orange Send Button

**Files:**
- Modify: `src/renderer/components/ActionBar.tsx`

**Goal:** Gray pills for Copy/Retry. Follow-up input with clean border. Orange Send button (the ONLY colored interactive element). Pill radius changed from 20px to 5px.

- [ ] **Step 1: Replace ActionBar component**

Replace the entire file content with:

```tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onCopy: () => void;
  onRetry: () => void;
  onFollowUp: (text: string) => void;
  hasContent: boolean;
}

const btnBase: React.CSSProperties = {
  padding: '5px 10px',
  borderRadius: 5,
  fontSize: 10,
  fontWeight: 500,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  transition: 'all 0.15s ease',
};

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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--border-subtle)' }}>
      {/* Copy button */}
      <button onClick={handleCopy} disabled={!hasContent} title="Copy last response"
        style={{
          ...btnBase, minWidth: 64, justifyContent: 'center',
          background: copied ? 'var(--success-bg)' : 'var(--surface-subtle)',
          color: copied ? 'var(--success)' : 'var(--text-tertiary)',
        }}>
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="copied"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Copied
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" /><path d="M2 10V3C2 2.44772 2.44772 2 3 2H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
              Copy
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Retry button */}
      <button onClick={onRetry} title="Retry last query"
        style={{ ...btnBase, background: 'var(--surface-subtle)', color: 'var(--text-tertiary)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-subtle)'; }}
      >
        Retry
      </button>

      {/* Follow-up input */}
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 10px', borderRadius: 5,
        background: 'var(--surface-subtle)',
        border: '1px solid var(--border-input)',
      }}>
        <input type="text" value={followUp} onChange={(e) => setFollowUp(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && followUp.trim()) handleFollowUpSubmit(); }}
          placeholder="Follow up..."
          style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: 11, color: 'var(--text-primary)', fontFamily: 'inherit', padding: 0 }} />
        <button onClick={handleFollowUpSubmit} disabled={!followUp.trim()} aria-label="Send follow-up"
          style={{
            width: 24, height: 24, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: 'none', cursor: followUp.trim() ? 'pointer' : 'default',
            background: followUp.trim() ? 'var(--accent)' : 'var(--surface-active)',
            opacity: followUp.trim() ? 1 : 0.35,
            color: followUp.trim() ? 'var(--bg-deep)' : 'var(--text-tertiary)',
            transition: 'all 0.2s ease',
          }}>
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/ActionBar.tsx
git commit -m "style: ActionBar — orange Send button, gray pills, clean borders"
```

---

### Task 9: Redesign ErrorState — Orange Accent Error

**Files:**
- Modify: `src/renderer/components/ErrorState.tsx`

**Goal:** Orange-bordered error icon. Solid buttons (orange primary, gray secondary). Monochrome text.

- [ ] **Step 1: Replace ErrorState component**

Replace the entire file content with:

```tsx
interface Props {
  message: string;
  onRetry: () => void;
  onSettings?: () => void;
}

export default function ErrorState({ message, onRetry, onSettings }: Props) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
      {/* Error icon */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        border: '2px solid var(--accent)', color: 'var(--accent)',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 5v3.5M8 11v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>Something went wrong</span>
      {message && (
        <span style={{ color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
          {message}
        </span>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {onSettings && (
          <button onClick={onSettings} style={{
            padding: '7px 16px', borderRadius: 6, fontSize: 11, fontWeight: 500,
            border: 'none', background: 'var(--surface-subtle)', color: 'var(--text-tertiary)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Settings
          </button>
        )}
        <button onClick={onRetry} style={{
          padding: '7px 16px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          border: 'none', background: 'var(--accent)', color: 'var(--bg-deep)',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Retry
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/ErrorState.tsx
git commit -m "style: ErrorState — orange border icon, solid buttons"
```

---

### Task 10: Redesign Dropdown — Monochrome Menu

**Files:**
- Modify: `src/renderer/components/Dropdown.tsx`

**Goal:** Replace glassmorphism menu with opaque solid surface. Orange accent for selected items. Clean borders.

- [ ] **Step 1: Update trigger style (around line 69-90)**

Replace the `triggerStyle` object:

```tsx
  const triggerStyle: React.CSSProperties = useMemo(() => ({
    height: 26,
    padding: '0 8px',
    borderRadius: 'var(--radius-pill)',
    background: open ? 'var(--surface-active)' : 'var(--surface-subtle)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 10,
    fontWeight: 500,
    color: isAccent ? 'var(--accent)' : (open ? 'var(--text-secondary)' : 'var(--text-tertiary)'),
    whiteSpace: 'nowrap',
    transition: 'background 0.15s ease, color 0.15s ease',
    flexShrink: 0,
  }), [open, isAccent]);
```

- [ ] **Step 2: Update menu style (around line 92-105)**

Replace the `menuStyle` object:

```tsx
  const menuStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    top: 'calc(100% + 6px)',
    ...(side === 'right' ? { right: 0 } : { left: 0 }),
    minWidth: 155,
    borderRadius: 8,
    padding: 4,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-input)',
    boxShadow: 'var(--shadow-dropdown)',
    zIndex: 9999,
  }), [side]);
```

Note: remove `backdropFilter`, `WebkitBackdropFilter`, and `inset` shadow from menuStyle.

- [ ] **Step 3: Update item base style**

Replace the `itemBase` radius:

```tsx
    borderRadius: 6,
```

- [ ] **Step 4: Update item background color references**

In the item render (around lines 197-203), update:
- `'var(--surface-hover)'` stays
- `'var(--accent-subtle)'` stays
- `'var(--accent)'` stays for selected color

No code change needed — these already use CSS variables that were updated.

- [ ] **Step 5: Update item selected dot (around line 211-219)**

Replace the selected dot with:

```tsx
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'var(--accent)',
```

(Remove `boxShadow: '0 0 4px var(--accent-glow)'` since `--accent-glow` no longer exists)

- [ ] **Step 6: Commit**

```bash
git add src/renderer/components/Dropdown.tsx
git commit -m "style: Dropdown — opaque menu, orange accent, clean borders"
```

---

### Task 11: Update ConversationView — Minor Style Adjustments

**Files:**
- Modify: `src/renderer/components/ConversationView.tsx`

**Goal:** Update border colors, disabled input styling, generating label.

- [ ] **Step 1: Update generating indicator**

Change line 27 from `'0.5px solid var(--border-subtle)'` to `'1px solid var(--border-subtle)'`.
Change line 32 `fontSize` from `9` to `10`, color stays `var(--text-tertiary)`.

- [ ] **Step 2: Update thinking disabled input**

Change line 39 from `'0.5px solid var(--border-subtle)'` to `'1px solid var(--border-subtle)'`.
Replace lines 42-52 (the disabled input div) with:

```tsx
          <div style={{
            height: 38,
            borderRadius: 6,
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border-input)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Waiting for response...</span>
          </div>
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/ConversationView.tsx
git commit -m "style: ConversationView — clean borders, monochrome disabled input"
```

---

### Task 12: Update GlassCanvasApp — Error Bar and Update Banner

**Files:**
- Modify: `src/renderer/components/GlassCanvasApp.tsx`

**Goal:** Update the update banner and error retry bar to use new tokens.

- [ ] **Step 1: Update update banner styling**

Replace lines 192-213 (the update banner div) with:

```tsx
          {updateReady && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                margin: '0 16px', padding: '8px 14px', borderRadius: 6,
                background: 'var(--accent-subtle)', border: '1px solid rgba(232,120,74,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 10.5, color: 'var(--accent)', fontWeight: 600 }}>Update ready — restart to install</span>
              <button
                onClick={() => window.electronAPI?.installUpdate?.()}
                style={{
                  padding: '4px 14px', borderRadius: 6, fontSize: 10.5, fontWeight: 600,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: 'var(--accent)', color: 'var(--bg-deep)',
                }}
              >
                Restart
              </button>
            </motion.div>
          )}
```

- [ ] **Step 2: Update error-with-conversation bar**

Replace lines 273-289 (the retry/new chat bar) with:

```tsx
          {showError && hasConversation && (
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 8,
              padding: '10px 14px', borderTop: '1px solid var(--border-subtle)',
            }}>
              <button onClick={retry} style={{
                padding: '7px 16px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                border: 'none', background: 'var(--accent)', color: 'var(--bg-deep)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Retry</button>
              <button onClick={newChat} style={{
                padding: '7px 16px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                border: 'none', background: 'var(--surface-subtle)', color: 'var(--text-tertiary)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>New Chat</button>
            </div>
          )}
```

- [ ] **Step 3: Update ErrorState usage**

On line 266, ErrorState now accepts an optional `onSettings` prop. Add it:

```tsx
                <ErrorState message={errorMessage} onRetry={retry} onSettings={() => window.electronAPI?.openSettings?.()} />
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/components/GlassCanvasApp.tsx
git commit -m "style: GlassCanvasApp — orange update banner, solid error bar buttons"
```

---

### Task 13: Final Verification — Build Check

**Files:**
- Verify: all modified files

- [ ] **Step 1: Type check**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 2: Build check**

```bash
npx electron-vite build
```
Expected: Build succeeds without errors.

- [ ] **Step 3: Visual review**

Run: `npm run dev`
Expected: App opens with new monochrome design. Idle view shows logo → input → model → mode in one line. No glassmorphism. Inter font active. Orange only on logo, cursor, primary buttons.

- [ ] **Step 4: Commit any remaining changes**

```bash
git status
```
If any files need staging, add and commit them.

---

## Summary of Changes

| # | File | Change |
|---|------|--------|
| 1 | `src/styles/globals.css` | Replace all design tokens, remove glassmorphism animations |
| 2 | `src/renderer/index.html` | Add Inter font link |
| 3 | `src/renderer/components/WindowShell.tsx` | Remove glass layers, opaque solid surface |
| 4 | `src/renderer/components/IdleView.tsx` | One-line layout, remove paste button |
| 5 | `src/renderer/components/HeaderBar.tsx` | Smaller orange logo, clean labels, no gradient dot |
| 6 | `src/renderer/components/UserMessage.tsx` | Gray bubble, clean corners |
| 7 | `src/renderer/components/NovaMessage.tsx` | Outlined avatar, monochrome markdown |
| 8 | `src/renderer/components/ActionBar.tsx` | Orange Send, gray pills |
| 9 | `src/renderer/components/ErrorState.tsx` | Orange border icon, solid buttons |
| 10 | `src/renderer/components/Dropdown.tsx` | Opaque menu, orange accent |
| 11 | `src/renderer/components/ConversationView.tsx` | Clean borders, monochrome input |
| 12 | `src/renderer/components/GlassCanvasApp.tsx` | Orange update banner, solid error bar |
| 13 | Verification | Type check, build, visual review |

**No files in `src/main/`, `src/preload/`, or `src/renderer/store/` are modified.**
