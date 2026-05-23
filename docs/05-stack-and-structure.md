# 05 — Стек и структура проекта

## Рекомендуемый стек

### Desktop shell
```
Electron 33+        — десктопная оболочка
  ├─ globalShortcut  — глобальные хоткеи
  ├─ BrowserWindow   — оверлей + виджет
  ├─ desktopCapturer — скриншоты
  └─ Tray            — иконка в трее
```

### Frontend (оба окна)
```
React 19            — UI-фреймворк
TypeScript 5        — типизация
Tailwind CSS 4      — стили (тёмная тема из коробки)
Zustand 5           — стейт-менеджмент
Framer Motion       — анимации (только лёгкие: fade in/out)
Vite                — сборка
```

### Инструменты
```
electron-builder    — сборка в .exe/.dmg/.AppImage
electron-store      — хранение настроек и истории
better-sqlite3      — если истории станет >1000 записей
```

---

## Почему НЕ Python для UI

Python-десктоп (PyQt/PySide/tkinter) проигрывает Electron по трём критичным параметрам:

1. **Прозрачные окна:** `transparent: true, frame: false` в Electron против сложной борьбы в PyQt.
2. **Глобальные хоткеи:** `globalShortcut.register` из коробки против `pynput`/`keyboard` с проблемами прав.
3. **Дистрибуция:** Electron Builder → один .exe. Python → PyInstaller, 200+ MB, медленный старт.

**Python может использоваться для backend-обработки в будущем**, но для MVP это overengineering.

---

## Структура проекта

```
novasync/
├── package.json                    # зависимости, скрипты
├── tsconfig.json                   # общий TS-конфиг
├── electron-builder.yml            # конфиг сборки
├── tailwind.config.ts              # Tailwind (тёмная тема)
├── vite.config.ts                  # Vite (renderer)
├── vite.config.electron.ts         # Vite (main process)
│
├── electron/                       # ⚡ Main process
│   ├── main.ts                     # Точка входа
│   ├── preload.ts                  # contextBridge API
│   ├── windows/
│   │   ├── overlay.ts              # Управление окном оверлея
│   │   └── response.ts             # Управление окном виджета
│   ├── services/
│   │   ├── hotkey.ts               # Регистрация глобального хоткея
│   │   ├── llm-client.ts           # HTTP-клиент к LLM API (streaming)
│   │   ├── screenshot.ts           # Захват экрана
│   │   ├── clipboard.ts            # Чтение/запись буфера
│   │   └── system-info.ts          # Активное окно, OS info
│   ├── store/
│   │   └── settings.ts             # electron-store (настройки, история)
│   └── ipc/
│       └── handlers.ts             # Регистрация IPC-обработчиков
│
├── src/                            # 🎨 Renderer (React)
│   ├── overlay/                    # Приложение оверлея
│   │   ├── main.tsx                # React entry (overlay)
│   │   ├── App.tsx                 # Корневой компонент
│   │   ├── components/
│   │   │   ├── CommandInput.tsx    # Строка ввода
│   │   │   ├── QuickActions.tsx    # Быстрые действия
│   │   │   ├── ModelSelector.tsx   # Выбор модели
│   │   │   └── HistoryList.tsx     # История запросов
│   │   └── styles/
│   │       └── overlay.css
│   │
│   ├── widget/                     # Приложение виджета
│   │   ├── main.tsx                # React entry (widget)
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ResponseCard.tsx    # Карточка ответа
│   │   │   ├── StreamingText.tsx   # Стриминг текста (Markdown)
│   │   │   ├── WidgetHeader.tsx    # Заголовок с кнопками
│   │   │   └── ActionBar.tsx       # Кнопки Copy/Retry/Close
│   │   └── styles/
│   │       └── widget.css
│   │
│   ├── shared/                     # Общие компоненты
│   │   ├── Spinner.tsx
│   │   ├── Icon.tsx
│   │   └── Markdown.tsx
│   │
│   ├── hooks/
│   │   ├── useElectron.ts          # Доступ к IPC API
│   │   ├── useStreamingResponse.ts # Стриминг ответа
│   │   └── useHotKey.ts            # Локальные хоткеи в оверлее
│   │
│   ├── lib/
│   │   ├── api.ts                  # Типы для LLM API
│   │   └── utils.ts
│   │
│   └── types/
│       └── electron.d.ts           # Типы для window.electronAPI
│
├── resources/
│   ├── icon.ico                    # Windows
│   ├── icon.icns                   # macOS
│   └── icon.png                    # Linux + общее
│
└── docs/                           # Документация
    ├── 00-README.md
    ├── 01-product-concept.md
    ├── 02-architecture.md
    ├── 03-models-and-api.md
    ├── 04-ux-scenarios.md
    ├── 05-stack-and-structure.md
    ├── 06-roadmap.md
    └── 07-reference.md
```

---

## Tailwind-тема (тёмная)

```css
/* src/styles/globals.css */
@import "tailwindcss";

:root {
  --color-bg-overlay: rgba(0, 0, 0, 0.65);
  --color-bg-panel: rgba(28, 28, 30, 0.95);
  --color-bg-widget: rgba(28, 28, 30, 0.95);
  --color-accent: #0A84FF;
  --color-text-primary: #F5F5F7;
  --color-text-secondary: #98989D;
  --color-border: rgba(255, 255, 255, 0.08);
}
```
