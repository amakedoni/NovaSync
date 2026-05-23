# Реализация — Progress Log

## 2026-05-23: Неделя 1-2 завершены — код написан, собирается, запускается

### Что сделано

#### Скелет проекта (Неделя 1, Дни 1-5)

- [x] Инициализирован проект: Electron 33 + Vite 6 + React 19 + TypeScript 5 + Tailwind CSS 4
- [x] Настроен electron-vite 5.0 (build, dev, multi-window)
- [x] Созданы два BrowserWindow: Overlay (центр) и Response Widget (правый нижний угол)
- [x] Прозрачные, frameless окна с backdrop-filter blur
- [x] Глобальный хоткей Alt+Space (через globalShortcut)
- [x] Системный трей с иконкой и контекстным меню (Show/Hide/Quit)
- [x] Overlay UI: строка ввода, Escape/клик-вне для закрытия
- [x] Quick Actions: Explain, Translate, Summarize, Fix Code
- [x] Model Selector: DeepSeek V3 / GPT-4o Mini / Claude Haiku 4.5
- [x] Анимации: Framer Motion (fade in/out, scale)
- [x] Тёмная тема в Tailwind (design tokens)

#### LLM и виджет (Неделя 2, код написан, НЕ протестирован e2e)

- [x] LLM Client (AsyncGenerator, SSE streaming)
  - Поддержка: DeepSeek, OpenAI, Anthropic
  - Стриминг через SSE с парсингом чанков
  - Определение провайдера по имени модели
- [x] IPC bridge: overlay → main process → LLM API
  - query:submit, response:chunk, response:done, response:error
  - clipboard:write, settings:get/save, history:get/clear
- [x] Response Widget: заголовок, стриминг текста (Markdown через react-markdown)
  - Анимация появления, курсор-мигалка при стриминге
  - ActionBar: Copy (+ "Copied!" feedback), Close
  - Error state с иконкой и сообщением
  - Loading dots анимация
- [x] System prompt для NovaSync (вшит в main process)
- [x] Хранение: JSON-файл в userData (замена electron-store)
  - Настройки, API-ключи, история (последние 50)
- [x] Сервисы: clipboard.ts, screenshot.ts, system-info.ts
  - system-info: определение активного окна (Windows/macOS/Linux)

### Архитектурное решение

Одно React SPA с двумя режимами (?mode=overlay / ?mode=widget) вместо
двух отдельных сборок. Это упростило конфигурацию electron-vite
и избежало проблемы с mergeConfig для multi-page build.

### Структура проекта (финальная)

```
novasync/
├── electron-vite.config.ts
├── package.json
├── tsconfig.json
├── electron-builder.yml
├── src/
│   ├── main/                    # Main process (Electron)
│   │   ├── index.ts             # Точка входа
│   │   ├── windows/
│   │   │   ├── overlay.ts       # Окно оверлея
│   │   │   └── response.ts      # Окно виджета
│   │   ├── ipc/
│   │   │   └── handlers.ts      # IPC-обработчики
│   │   ├── services/
│   │   │   ├── llm-client.ts    # LLM API клиент
│   │   │   ├── clipboard.ts     # Буфер обмена
│   │   │   ├── screenshot.ts    # Захват экрана
│   │   │   └── system-info.ts   # Инфо о системе
│   │   └── store/
│   │       └── settings.ts      # JSON-хранилище
│   ├── preload/
│   │   └── index.ts             # contextBridge API
│   └── renderer/                # React SPA (2 режима)
│       ├── index.html           # Входная точка
│       ├── main.tsx             # React entry, парсинг ?mode=
│       ├── App.tsx              # Роутинг overlay/widget
│       ├── overlay/
│       │   ├── App.tsx
│       │   ├── components/      # CommandInput, QuickActions, ModelSelector
│       │   └── styles/
│       └── widget/
│           ├── App.tsx
│           ├── components/      # StreamingText, ActionBar
│           └── styles/
├── docs/                        # Документация
├── resources/                   # Иконки (нужно добавить)
└── out/                         # Build output (electron-vite)
```

### Что дальше (Неделя 3-4)

1. **Тестирование e2e LLM-цикла:**
   - Запустить приложение
   - Ввести запрос → получить ответ от API
   - Проверить стриминг в виджете

2. **Добавить настройки API-ключа:**
   - Диалог при первом запуске «Enter your DeepSeek API key»
   - Или Settings окно

3. **Полировка:**
   - Markdown-рендеринг в ответах (код, списки, таблицы)
   - История запросов в оверлее (стрелка вверх)
   - Индикатор загрузки при ожидании ответа

4. **Сборка и дистрибуция:**
   - electron-builder для Windows/macOS/Linux
   - Иконка приложения
   - Автообновление (electron-updater)

### Известные проблемы

1. **Только один виджет одновременно** — если отправить новый запрос
   пока виджет открыт, существующий ответ затирается. Нужно либо
   закрывать старый, либо создавать несколько виджетов.

2. **Нет окна настроек** — API-ключи нужно редактировать вручную
   в JSON-файле в userData.

3. **Overlay и widget на одном alwaysOnTop уровне** — могут
   перекрываться с другими always-on-top окнами (зум, etc.)

4. **Framer Motion «use client» warnings** — безвредны, но шумят.
   Можно подавить через build.rollupOptions.onwarn.

### Команды

```bash
npm run dev          # Запуск в dev-режиме
npm run build        # Production-сборка
npm run package:win  # Сборка .exe (Windows)
npm run package:mac  # Сборка .dmg (macOS)
```
