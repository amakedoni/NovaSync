# NovaSync Redesign — Premium Monochrome

**Date:** 2026-05-24
**Status:** Approved

## Summary

Complete visual redesign of NovaSync. Preserves all existing layout structure, component hierarchy, and business logic. Replaces glassmorphism with a premium monochrome palette — black/white/gray with a single terracotta orange accent. Uses Inter font throughout.

## Design Direction

Premium Monochrome — restrained luxury aesthetic inspired by high-end audio equipment, fashion brands, and professional creative tools. Everything is grayscale except the logo and key interactive moments. The design communicates confidence through restraint.

## Design Tokens

### Colors

```
Base (window background):    #1a1a1c
Surface (cards, inputs):     #222226
Surface hover:               #252528
Surface active:              #28282c
Border primary:              #2a2a2e
Border subtle:               #242428

Text primary:                #e4e4e6
Text secondary:              #c0c0c6
Text muted:                  #909098
Text subtle:                 #606068
Text faint:                  #505058

Accent (terracotta orange):  #e8784a
Accent surface:              rgba(232, 120, 74, 0.10)
Accent border:               rgba(232, 120, 74, 0.25)
```

### Typography

| Role | Size | Weight |
|------|------|--------|
| Input text | 14px | 400 |
| Body text | 13px | 400 |
| Strong text | 13px | 600 |
| Labels | 11px | 500 |
| Small labels | 10px | 400-600 |
| Timestamps | 9px | 400 |
| Code | 11px | 400 |

Font: **Inter** (weights: 400, 500, 600, 700)
Fallback: `-apple-system, 'Segoe UI', sans-serif`

### Spacing & Radius

```
Window border-radius:   12px
Card/input radius:      5-6px
Message bubble radius:  10px (user: 10px 10px 2px 10px)
Pill radius:            5px
Logo radius:            5-6px
Toggle radius:          9px (18px height)

Input padding:          16px 20px
Message padding:        10px 14px
Header padding:         10px 16px
Content padding:        16px
```

### Shadows

```
Window:    0 20px 50px rgba(0, 0, 0, 0.7)
```

No inner shadows, no glow effects. Clean solid depth.

## Component Specifications

### WindowShell

- Background: `#1a1a1c`
- Border: `1px solid #2a2a2e`
- Border-radius: `12px`
- Shadow: `0 20px 50px rgba(0, 0, 0, 0.7)`
- No transparency, no blur. Opaque solid surface.
- Remove: ambient gradients, light spot overlays, glassmorphism backdrop-filter

### Idle State (IdleView)

One-line horizontal layout:

```
[Logo 26×26] [Input flex-1] [Model pill] [Mode pill]
```

- Logo: `26×26px`, background `#e8784a`, border-radius `6px`, "N" letter in `#1a1a1c`, weight `700`
- Input: transparent background, `14px` Inter, `#e4e4e6` text, placeholder `#606068`
- Model pill: `#222226` background, `10px` text, `#909098` color, chevron
- Mode pill: `#222226` background, `10px` text, `#c0c0c6` (active) or `#909098` (inactive)
- No Paste button — clipboard paste via keyboard shortcut only
- Layout uses `display: flex; align-items: center; gap: 12px; padding: 16px 20px`

### HeaderBar (Conversation Mode)

```
[Logo 20×20] NovaSync [Mode badge] [Streaming dot + "streaming"] ... [Model] [+] [×]
```

- Logo: smaller at `20×20px`, same orange fill
- App name: `11px`, `500`, `#c0c0c6`
- Mode badge: `9px`, `#909098`, `#222226` bg, `3px` radius
- Streaming indicator: `5px` orange dot (`#e8784a`) with pulse animation + "streaming" text in `#e8784a`
- Model label: `9px`, `#606068`
- Action buttons: `14px`, `#505058`, hover `#909098`
- Border-bottom: `1px solid #242428`

### UserMessage

```
[Message bubble right-aligned] [Timestamp]
```

- Bubble: `#252528` background, `10px 10px 2px 10px` radius (right-bottom corner tighter)
- Max-width: `80%`
- Text: `13px`, `#e0e0e4`, line-height `1.5`
- Timestamp: `9px`, `#606068`, right-aligned below bubble

### NovaMessage

```
[Outlined logo avatar] [Message body]
```

- Avatar: `22×22px`, `#1a1a1c` background, `1px solid #e8784a` border, `5px` radius, "N" in `#e8784a`
- Body: `13px`, `#d0d0d6`, line-height `1.65`
- Strong text: `600`, `#e8e8ec`
- Code inline: `#222226` background, `3px` radius, `11px` mono
- Code block: `#222226` background, `1px solid #2a2a2e` border, padding, mono font
- Lists: `#b0b0b8`, `18px` indent

### Streaming Cursor

- `8px × 15px`, `#e8784a`, `1px` radius
- Pulse animation (`opacity: 1 → 0.3 → 1`, `800ms`)

### ActionBar

```
[Copy] [Retry]  [Follow-up input........] [Send]
```

- Copy, Retry: `#222226` bg, `5px` radius, `10px` text, `#909098`
- Follow-up input: `#222226` bg, `1px solid #2a2a2e` border, `5px` radius, `11px` text
- Send: `#e8784a` background, `5px` radius, `10px` text, `#1a1a1c`, `600` weight
- Send is the ONLY colored interactive element in the bar

### ErrorState

- Centered layout within window
- Icon: `40px` circle, `2px solid #e8784a` border, "!" in `#e8784a`
- Title: `14px`, `600`, `#d0d0d6`
- Description: `12px`, `#808088`, max-width `300px`
- Retry button: `#e8784a` background (primary action)
- Settings button: `#222226` background (secondary)
- Buttons: `7px 16px` padding, `6px` radius, `11px` text

### Settings Window

- Tab bar: `border-bottom: 1px solid #242428`
- Active tab: `2px solid #e8784a` underline, `#e0e0e4` text
- Inactive tab: `#707078` text
- Form fields: `#222226` bg, `1px solid #2a2a2e` border, `6px` radius
- Hotkey display: individual key pills (`#1a1a1c` bg, `3px` radius)
- Toggle switch: `18px` height, `9px` radius
  - On: `#e8784a` background, white knob right-aligned
  - Off: `#3a3a3e` background, `#909098` knob left-aligned
- Section labels: `10px`, uppercase, `#808088`, `0.5px` letter-spacing

### History Window

- Search bar: `#222226` bg, `1px solid #2a2a2e`, `6px` radius, magnifying glass icon
- Conversation cards: `10px` padding, `6px` radius
- Active card: `#222226` background
- Card title: `11px`, `500`, `#d0d0d6` (active) / `#b0b0b8` (inactive)
- Card preview: `9px`, `#707078` / `#606068`, 2-line clamp
- Card timestamp: `8px`, `#505058`
- Clear all: `10px`, `#606068`, centered, border-top separator

## Orange Accent Rule

Only these elements use `#e8784a`:

1. Logo mark (background)
2. Streaming cursor
3. Primary action buttons (Send, Retry)
4. Active tab underline
5. Toggle switch (on state)
6. Error icon border
7. Focus/selection indicators

Everything else stays in grayscale (`#1a1a1c` → `#e4e4e6` range).

## What Does NOT Change

- Component hierarchy and tree structure
- Window management (overlay/history/settings windows)
- IPC communication layer
- Zustand state management and logic
- LLM client and streaming
- Auto-updater, clipboard, system-info services
- Settings persistence
- Hotkey registration
- Electron main process entirely
- Preload script API surface

## Implementation Scope

### Files to modify

1. `src/styles/globals.css` — Replace all design tokens, remove glassmorphism
2. `src/renderer/components/WindowShell.tsx` — Remove transparency/blur/gradients
3. `src/renderer/components/HeaderBar.tsx` — New header design
4. `src/renderer/components/IdleView.tsx` — One-line layout, no Paste button
5. `src/renderer/components/UserMessage.tsx` — New bubble style
6. `src/renderer/components/NovaMessage.tsx` — Outlined avatar, new markdown colors
7. `src/renderer/components/ActionBar.tsx` — Orange Send button
8. `src/renderer/components/ErrorState.tsx` — New error layout
9. `src/renderer/components/Dropdown.tsx` — Monochrome styling
10. `src/renderer/components/SettingsPanel.tsx` — Monochrome styling, orange toggles
11. `src/renderer/components/HistoryWindow.tsx` — Monochrome styling
12. `src/renderer/components/ConversationView.tsx` — Minor layout adjustments
13. `src/renderer/components/GlassCanvasApp.tsx` — Minor adjustments
14. `src/renderer/components/InputBar.tsx` — Styling
15. `src/renderer/index.html` — Add Inter font link

### Files NOT to modify

- All files in `src/main/`
- All files in `src/preload/`
- `src/renderer/store/chat.ts`
- `src/renderer/App.tsx`
- `src/renderer/main.tsx`
- Build config files
