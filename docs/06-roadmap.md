# 06 — Roadmap (2–4 недели)

## Неделя 1 — Скелет

| День | Задача | Результат | Файлы |
|------|--------|-----------|-------|
| **1** | Инициализация проекта: `npm create electron-vite@latest` с React+TS. Настройка Tailwind. Пустой проект запускается. | `npm run dev` → окно Electron | `package.json`, `vite.config.ts`, `tailwind.config.ts` |
| **2** | Main process: `BrowserWindow` с `transparent: true`, `frame: false`. Overlay открывается по кнопке в окне. | Прозрачное окно по центру | `electron/main.ts`, `electron/windows/overlay.ts` |
| **3** | Overlay UI: `CommandInput`, базовая вёрстка. Escape → закрыть, клик вне → закрыть. | Можно ввести текст, окно закрывается | `src/overlay/App.tsx`, `src/overlay/components/CommandInput.tsx` |
| **4** | Глобальный хоткей: `globalShortcut.register('Alt+Space', ...)`. Overlay открывается/закрывается из любого приложения. | Alt+Space работает везде | `electron/services/hotkey.ts` |
| **5** | Системный трей: иконка, контекстное меню (Show/Hide/Quit). | Приложение висит в трее, не умирает при закрытии окон | `electron/main.ts` (Tray) |

**Контрольная точка:** Оверлей открывается по Alt+Space из любого приложения, закрывается по Escape, приложение висит в трее.

---

## Неделя 2 — LLM и виджет

| День | Задача | Результат | Файлы |
|------|--------|-----------|-------|
| **6** | LLM Client: HTTP-клиент к DeepSeek API с SSE-стримингом. Тест через консоль. | `for await (const token of streamChat(...))` работает | `electron/services/llm-client.ts` |
| **7** | IPC bridge: overlay → main process → LLM API. Стриминг приходит в main, логируется. | Полный цикл без UI для ответа | `electron/ipc/handlers.ts`, `electron/preload.ts` |
| **8** | Response Widget: второе BrowserWindow, позиция right-bottom. Статический текст. | Виджет появляется в углу | `electron/windows/response.ts`, `src/widget/App.tsx` |
| **9** | Widget + Streaming: виджет получает streaming-ответ через IPC, рендерит Markdown по мере поступления. | Полный цикл: запрос → стриминг-ответ в виджете | `src/widget/components/StreamingText.tsx` |
| **10** | Кнопки Copy/Retry/Close в виджете. | Виджет полностью функциональный | `src/widget/components/ActionBar.tsx` |

**Контрольная точка:** Alt+Space → ввод → Enter → ответ стримится в виджет в правом нижнем углу. Можно скопировать, повторить, закрыть.

---

## Неделя 3 — Полировка и настройки

| День | Задача | Результат | Файлы |
|------|--------|-----------|-------|
| **11** | Model Selector: выпадающий список в оверлее. Сохранение выбора в electron-store. | Можно переключать модели | `src/overlay/components/ModelSelector.tsx` |
| **12** | Quick Actions: кнопки «Explain», «Translate», «Summarize» с преднастроенными промптами. | Быстрые действия работают | `src/overlay/components/QuickActions.tsx` |
| **13** | Settings window: настройка хоткея, модели по умолчанию, автозапуск. | Окно настроек | `electron/windows/settings.ts`, `src/settings/` |
| **14** | История: хранение последних 50 запросов/ответов в electron-store. Отображение в оверлее (↓). | История доступна | `src/overlay/components/HistoryList.tsx`, `electron/store/settings.ts` |
| **15** | Буфер обмена: авто-вставка выделенного текста в оверлей (опционально, настройка). | Контекст из буфера | `electron/services/clipboard.ts` |

**Контрольная точка:** Переключение моделей, быстрые действия, история, настройки — всё работает.

---

## Неделя 4 — Стабилизация и сборка

| День | Задача | Результат |
|------|--------|-----------|
| **16** | Обработка ошибок: API недоступен, нет интернета, rate limit. Fallback на GPT-4o-mini. | Graceful degradation |
| **17** | Тестирование на второй OS (Windows → macOS, или наоборот). | Кросс-платформенность подтверждена |
| **18** | Сборка: `electron-builder`, `.exe`/`.dmg`. Проверка установки и первого запуска. | Готовый инсталлятор |
| **19** | Автообновление: `electron-updater`, GitHub Releases. | Автообновление работает |
| **20** | Документация: README, инструкция по сборке из исходников. | Репозиторий готов к использованию |

**Контрольная точка:** Собранный .exe/.dmg, установка, автообновление, документация.

---

## Риски и митигации

| Риск | Вероятность | Влияние | Митигация |
|------|-----------|---------|-----------|
| **DeepSeek API нестабилен** | Medium | High | Fallback на GPT-4o-mini, retry logic (3 попытки) |
| **Глобальный хоткей конфликтует** | Medium | Medium | Настраиваемый хоткей в settings; запасной дефолт `Ctrl+Shift+A` |
| **Прозрачные окна на Linux** работают иначе (X11 vs Wayland) | Medium | Low | Отдельная ветка логики; на Wayland — менее прозрачный фон |
| **Electron «тяжёлый»** (~150 MB RAM в покое) | High | Medium | Приемлемо для десктопного ассистента; оптимизация в V2 |
| **API-ключи в открытом виде** | Medium | Critical | `electron.safeStorage` для шифрования; запрос ключа при первом запуске |
| **Streaming через IPC тормозит** | Low | Medium | Буферизация на стороне main, отправка чанками по 50ms |
