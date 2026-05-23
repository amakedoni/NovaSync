# NovaSync Full Redesign — Design Specification

**Date:** 2026-05-23
**Status:** Approved

## Overview

Complete visual and UX redesign of NovaSync — a desktop AI assistant (Electron + React + TypeScript + Tailwind CSS 4 + framer-motion). The current design is a generic Apple-like dark theme. The redesign moves to a distinctive "Soft/Organic" aesthetic with warm purple/lavender tones.

### Goals
- Unique visual identity — not an Apple clone
- Unified interaction model — single chat window instead of separate overlay + widget
- Full chat history with searchable archive
- Auto dark/light mode based on system preference
- Better usability: clearer states, smoother transitions, more intuitive layout

---

## Design Tokens

### Dark Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0d0820` | Window background |
| `--bg-secondary` | `#1a1035` | Card/surface background |
| `--bg-tertiary` | `#251845` | Hover/active states |
| `--text-primary` | `#f0e8ff` | Body text, input text |
| `--text-secondary` | `#b8a0d8` | Labels, descriptions |
| `--text-tertiary` | `#6b5b8a` | Hints, timestamps |
| `--accent` | `#a78bfa` | Buttons, links, active states |
| `--accent-strong` | `#7c3aed` | Gradient stops, primary buttons |
| `--accent-glow` | `rgba(167,139,250,0.3)` | Button shadows, focus rings |
| `--border-subtle` | `rgba(140,100,220,0.06)` | Separators |
| `--border-input` | `rgba(140,100,220,0.10)` | Input borders |
| `--border-focus` | `rgba(167,139,250,0.30)` | Focused input glow |
| `--surface-hover` | `rgba(140,100,220,0.08)` | Button/chip hover |
| `--surface-active` | `rgba(140,100,220,0.12)` | Button/chip active |
| `--error` | `#f87171` | Error text (warm red, not harsh) |
| `--error-bg` | `rgba(255,130,130,0.10)` | Error backgrounds |

### Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#faf8ff` | Window background |
| `--bg-secondary` | `#f0eaf8` | Card/surface background |
| `--bg-tertiary` | `#e5daf5` | Hover/active states |
| `--text-primary` | `#1a0d2e` | Body text |
| `--text-secondary` | `#5a4080` | Labels, descriptions |
| `--text-tertiary` | `#8a70b0` | Hints, timestamps |
| `--border-subtle` | `rgba(124,58,237,0.06)` | Separators |
| `--border-input` | `rgba(124,58,237,0.10)` | Input borders |

Accent colors (`--accent`, `--accent-strong`, gradient) remain the same in both modes.

### Typography
- Font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif` (system native)
- Monospace: `'SF Mono', 'Fira Code', 'Cascadia Code', monospace`
- **No webfonts** — keep it fast and native

### Border Radius
- Window: `24px`
- Cards/panels: `16px`
- Inputs: `12px` (pill: `16px`)
- Buttons (primary): `14px`
- Chips/pills: `20px` (fully rounded)
- Send button: `50%` (circle)
- User message bubbles: `16px 16px 4px 16px`
- Nova message bubbles: `4px 16px 16px 16px`

### Shadows
- Window: `0 25px 60px rgba(80,40,160,0.20)` — soft purple glow
- Send button: `0 0 12px rgba(167,139,250,0.30)` — lavender glow
- Focused input: `0 0 16px rgba(167,139,250,0.08)` — subtle halo
- Dropdown menu: `0 12px 32px rgba(0,0,0,0.50)` — deep elevation
- Light mode: shadows use lavender tint with lower opacity and larger blur

---

## Architecture

### Window Model
- **Main window (Chat Bubble):** ~380x480px default, resizable. Single unified chat interface.
- **History window:** Separate BrowserWindow, opened via "H" icon in main window header. ~340x500px.
- No more overlay/widget split. One window with state-driven behavior.

### Component Tree
```
App
├── ChatBubble (main window)
│   ├── Header (hidden when no conversation)
│   │   ├── LogoDot
│   │   ├── Title ("NovaSync")
│   │   ├── HistoryButton
│   │   └── CloseButton
│   ├── MessageList
│   │   ├── UserMessage (right-aligned, gradient bubble)
│   │   ├── NovaMessage (left-aligned, markdown, avatar)
│   │   └── StreamingCursor (blinking block)
│   ├── EmptyState (no header, just input + actions + model)
│   │   ├── SearchIcon
│   │   ├── CommandInput
│   │   ├── SendButton (gradient circle)
│   │   ├── QuickActions (chip row)
│   │   └── ModelSelector (pill)
│   ├── InputBar (during conversation)
│   │   ├── TextInput (pill)
│   │   └── SendButton
│   ├── ActionBar (after response complete)
│   │   ├── CopyButton
│   │   ├── RetryButton
│   │   ├── FollowUpInput
│   │   └── SendButton
│   ├── StreamingBar (collapsed during streaming)
│   └── ErrorState (centered error + retry)
│
├── HistoryWindow (separate BrowserWindow)
│   ├── Header
│   ├── SearchInput
│   ├── ChatList
│   │   └── ChatItem (title, preview, timestamp)
│   └── EmptyHistory
│
└── SettingsView (shown when no API key configured)
    ├── ProviderTabs
    ├── ApiKeyInput
    ├── GetKeyLink
    └── SaveButton
```

---

## Main Chat Bubble — States

### State 1: Empty (no conversation)
- **No header.** Just the input area.
- Input: pill-shaped, search icon left, placeholder "Ask anything...", send button right (gradient circle).
- Footer row: quick action chips (Explain, Summarize, Translate, Fix Code) + model selector pill.
- Send button glow intensifies when text is entered.
- Input border transitions from subtle → lavender glow on focus/has-text.

### State 2: Streaming
- Header appears: logo dot + "NovaSync" + streaming indicator + [H] [×].
- User message bubble visible above, Nova response streaming below.
- Nova message: small "N" avatar + markdown content + blinking cursor.
- Input bar collapses to thin "generating…" strip.
- Auto-scroll follows new content.

### State 3: Done
- Blinking cursor disappears.
- Action bar: Copy + Retry buttons left, follow-up input (compact pill) right.
- Click Copy → "Copied!" feedback with checkmark icon.
- History icon available to open history window.

### State 4: Error
- Centered: error icon (warm red circle with "!"), message, Retry button.
- Error colors are warm (not harsh red): `#f87171` text, `rgba(255,130,130,0.1)` background.
- Header still visible (conversation exists).

### User Messages (bubbles)
- Right-aligned, max-width 85%.
- Gradient background: `rgba(167,139,250,0.20)` → `rgba(124,58,237,0.12)`.
- Border-radius: `16px 16px 4px 16px` (small tail bottom-right).
- Font-size: 12px, color: `#d4c8ea`.

### Nova Messages (bubbles)
- Left-aligned, with 22px avatar circle.
- Avatar: "N" on gradient circle.
- Content rendered via react-markdown.
- Code blocks: dark inset background, monospace, syntax highlighting not required.
- Inline code: subtle background highlight, monospace.
- Font-size: 12px, line-height: 1.6, color: `#d4c8ea`.

---

## History Window

### Structure
- Header: "History" title + close button.
- Search input: pill with search icon.
- Scrollable chat list: each item shows title, preview text, relative timestamp.
- Active chat highlighted with accent background.
- Footer: conversation count + "Clear all" button (subtle danger style).
- Empty state: centered icon + "No conversations yet" message.

### Chat Item
- Padding: 10px 12px, border-radius: 12px.
- Title: 12px, weight 600, `#d4c8ea`.
- Preview: 10px, truncated, `#6b5b8a`.
- Timestamp: 9px, `#4a3a5a`.
- Active: `rgba(140,100,220,0.10)` background + accent border.

---

## Settings / API Key

### Provider Selection
- Three tabs/pills: DeepSeek, OpenAI, Anthropic.
- Active: accent background + border.
- Inactive: subtle background.

### API Key Input
- Password type, monospace font.
- Placeholder shows key prefix (e.g., `sk-...`).
- Dark inset background (`rgba(0,0,0,0.2)`).

### Save Button
- Full width, gradient (`#a78bfa` → `#7c3aed`).
- Lavender glow shadow.
- Text: "Save & Start".
- Privacy note below: "Key is stored locally..."

---

## Animations (framer-motion)

### Window open
- Scale: 0.92 → 1.0
- Opacity: 0 → 1
- Y offset: 12px → 0
- Duration: 0.2s, ease-out
- Custom spring for organic feel: `{ type: "spring", stiffness: 400, damping: 30 }`

### Window close
- Reverse of open, 0.15s.

### Message appear
- Each new message: fade in + slight slide up (y: 8 → 0), opacity 0 → 1.
- Duration: 0.2s.

### State transitions (empty → chatting)
- Header slides in from top.
- Duration: 0.2s, ease-out.

### Quick action chip hover
- Scale: 1.0 → 1.04
- Background brightens, border strengthens.
- Duration: 0.12s.

### Send button
- Glow pulse on idle (subtle, ~3s cycle).
- Glow intensifies on text entered.
- Hover: scale 1.08.

### Copy feedback
- Button text changes to "Copied!" with checkmark.
- Color shifts to success green briefly.
- Resets after 2s.

### Model dropdown
- Fade + slide down, 0.12s.
- Click outside to close.

### Streaming cursor
- Blink animation: 1s step-end infinite.
- Color: accent lavender, 6px wide.

---

## File Changes

### Files to Modify
| File | Changes |
|------|---------|
| `src/styles/globals.css` | Replace all design tokens with new palette. Add light mode variables via `@media (prefers-color-scheme: light)`. |
| `src/renderer/App.tsx` | Remove overlay/widget mode split. Simplify to single ChatBubble + optional HistoryWindow. |
| `src/renderer/overlay/App.tsx` | **Delete** — replaced by ChatBubble. |
| `src/renderer/widget/App.tsx` | **Delete** — replaced by ChatBubble. |
| `src/renderer/overlay/styles/overlay.css` | **Delete** — styles move to new component. |
| `src/renderer/widget/styles/widget.css` | **Delete** — styles move to new component. |
| `src/renderer/overlay/components/CommandInput.tsx` | Refactor into shared `TextInput` component. |
| `src/renderer/overlay/components/QuickActions.tsx` | Refactor — new style (rounded pills instead of flat chips). |
| `src/renderer/overlay/components/ModelSelector.tsx` | Refactor — pill trigger, dropdown opens upward. |
| `src/renderer/widget/components/StreamingText.tsx` | Refactor into `MessageList` + `NovaMessage` — add avatar, new bubble style. |
| `src/renderer/widget/components/ActionBar.tsx` | Refactor — add follow-up input, new button style. |
| `src/renderer/widget/components/ApiKeyForm.tsx` | Refactor — new visual style for provider tabs, input, save button. |
| `src/main/windows/overlay.ts` | Rename/refactor to main chat window manager. |
| `src/main/windows/response.ts` | Refactor to history window manager. |
| `package.json` | No dependency changes needed (already has framer-motion, tailwindcss, react-markdown). |

### New Files
| File | Purpose |
|------|---------|
| `src/renderer/components/ChatBubble.tsx` | Main chat window — state machine, layout, all states. |
| `src/renderer/components/Header.tsx` | Chat header bar (logo, title, buttons). |
| `src/renderer/components/MessageList.tsx` | Scrollable message container with auto-scroll. |
| `src/renderer/components/UserMessage.tsx` | User message bubble component. |
| `src/renderer/components/NovaMessage.tsx` | AI response bubble with markdown rendering. |
| `src/renderer/components/InputBar.tsx` | Pill-shaped input with send button. |
| `src/renderer/components/ErrorState.tsx` | Error display with retry button. |
| `src/renderer/components/HistoryWindow.tsx` | History window — chat list with search. |
| `src/renderer/components/SettingsView.tsx` | API key configuration. |
| `src/renderer/styles/chat.css` | All new component styles (can also use Tailwind utilities). |

### Approach to Styles
Tailwind CSS 4 is already configured. Use Tailwind utility classes where possible, falling back to CSS custom properties for design tokens. Inline `<style>` tags that currently exist in components should migrate to either Tailwind classes or the shared CSS file.

---

## Interaction Summary

1. **Global shortcut** (e.g., Alt+Space) opens the Chat Bubble.
2. **Empty state** — input focused, ready to type. No header.
3. **Type query** → Enter or click send → state changes to Streaming.
4. **Header appears**, user message bubble shown, Nova response streams.
5. **During streaming**: input collapses to "generating…" strip. Can't type until done.
6. **Response complete**: Copy/Retry buttons appear, follow-up input available.
7. **Follow-up query**: new messages appended above, conversation scrolls up.
8. **Click History (H)**: opens separate window with searchable chat archive.
9. **Click chat in history**: loads that conversation in the main window.
10. **Close button (×)**: hides window, preserves conversation.
11. **Escape**: same as close (hides window).

---

## Spec Self-Review

- [x] No placeholders or TBDs — all states, colors, components defined.
- [x] Architecture consistent — single window model throughout.
- [x] Scope focused — visual redesign, no new features beyond history search.
- [x] All states covered: empty, typing, streaming, done, error, history-empty.
- [x] Dark and light modes defined with specific token values.
- [x] File migration plan clear — which files to delete, modify, create.
