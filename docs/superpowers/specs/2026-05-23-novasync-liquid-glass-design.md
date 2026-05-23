# NovaSync Liquid Glass — Дизайн-спек

**Дата:** 2026-05-23
**Статус:** Утверждён
**Стиль:** macOS System + visionOS Liquid Glass

---

## 1. Архитектура: Glass Canvas

Одно адаптивное окно вместо двух (оверлей + виджет). Окно живёт в трёх состояниях и morph-ится между ними.

```
IDLE ──(Enter)──▶ STREAMING ──(ответ готов)──▶ DONE
  ▲                                                │
  └──────────(New Chat / очистка)──────────────────┘
```

### Состояния

| Состояние | Размер | Позиция | Header |
|-----------|--------|---------|--------|
| IDLE | ~520×180 | Центр экрана | Только drag handle |
| STREAMING | ~520×520 | Центр экрана | Брендинг + статус |
| DONE | ~520×520 | Центр (можно перетащить) | Брендинг |

### IDLE (компактный)

- Header: только серый drag handle (pill), без брендинга
- Одна строка: поле ввода + разделитель + модель + режим
- Модель: компактный pill с названием (DeepSeek V3) и chevron
- Режим: компактный pill (Chat по умолчанию), teal-подсвечен
- Подсказка внизу: "Enter to send · Esc to close"

### STREAMING (расширенный)

- Header появляется с анимацией: точка-индикатор → "NovaSync" → статус "streaming"
- Область сообщений: вопрос → ответ (стриминг с курсором)
- Нижняя строка: "generating..."

### DONE (ответ готов)

- Header: точка (спокойная) + "NovaSync"
- Область сообщений: вопрос + полный ответ
- Action bar: Copy, Retry, Follow up input

### Переходы между состояниями

- IDLE → STREAMING: Morph. Окно расширяется, появляется header, контент внутри с fade-up.
- STREAMING → DONE: Статус "streaming" исчезает, точка тускнеет.
- DONE → IDLE: Morph обратно. Header схлопывается: название fadeOut → точка fadeOut → остаётся drag handle.
- New Chat: окно morph-ится обратно в IDLE.

---

## 2. Визуальный язык

### Палитра

| Токен | Значение | Использование |
|-------|----------|---------------|
| `--bg-primary` | `#1c1c1e` | Фон окна |
| `--bg-secondary` | `#2c2c2e` | Поверхности |
| `--bg-tertiary` | `#3a3a3c` | Приподнятые элементы |
| `--text-primary` | `#f5f5f7` | Основной текст |
| `--text-secondary` | `#98989d` | Вторичный текст |
| `--text-tertiary` | `#636366` | Подсказки |
| `--accent` | `#5AC8FA` | Акцент (teal) |
| `--accent-strong` | `#3AA8DA` | Акцент тёмный |
| `--accent-glow` | `rgba(90, 200, 250, 0.25)` | Свечение |
| `--border-subtle` | `rgba(255,255,255,0.06)` | Тонкая граница |
| `--border-input` | `rgba(255,255,255,0.10)` | Граница поля |
| `--border-focus` | `rgba(90,200,250,0.25)` | Граница в фокусе |

### Стекло

- **Уровень матовости:** Medium Frost, 55% opacity
- **Блюр:** backdrop-filter blur(20px) + saturate(1.2)
- **Освещение:** Subtle Glow — лёгкие радиальные градиенты (белые, без цвета) сверху и снизу
- **Рамка:** Glow Border — 0.5px hairline `rgba(255,255,255,0.12)` + внутреннее свечение `inset 0 1px 0 rgba(255,255,255,0.06)`
- **Тень:** `0 20px 50px rgba(0,0,0,0.55)`

### Скругления

| Элемент | Радиус |
|---------|--------|
| Окно | 22px |
| Поле ввода | 22px |
| Pills (модель, режим) | 15px |
| Дропдаун | 14px |
| Сообщения | 14px |
| Кнопки действий | 20px |

---

## 3. Анимации

### Spring-физика

Все анимации используют framer-motion `spring`:

```
type: 'spring'
stiffness: 200
damping: 24
```

### Длительности

| Действие | Длительность |
|----------|-------------|
| Появление окна | 250ms |
| Morph IDLE→STREAMING | 350ms |
| Появление дропдауна | 250ms |
| Исчезновение дропдауна | 180ms |
| Появление header | 300ms (staggered) |
| Появление сообщения | 200ms |

### Дропдаун

- **Появление:** spring opacity 0→1 + scale 0.92→1 + translateY -4px→0
- **Исчезновение:** spring opacity→0 + scale→0.95, 180ms
- **Стрелка:** rotate 0→180deg при открытии, spring 200ms
- **Пункты при наведении:** background glow + текст светлеет, fade 150ms

### Micro-interactions

1. **Press Scale** — при клике на кнопку/pill: scale(0.97), spring 150ms
2. **Light Ripple** — при клике по стеклянной поверхности: световая волна от точки касания
3. **Edge Shimmer** — при morph окна: блик пробегает по границе (0.5s)
4. **Typing Wave** — при стриминге: строки появляются с fade-up + blur-out

### Header Branding Animation (staggered)

```
1. Точка-индикатор: fade + scale (0→1), 200ms
2. "NovaSync": fade + slideRight (translateX -8px→0), 250ms, delay 80ms
3. Статус "streaming": fade, 200ms, delay 160ms
```

Обратное исчезновение — reverse order.

---

## 4. Режимы (Modes)

Режим — это системный промпт, добавляемый к запросу. Выбирается через дропдаун справа от поля ввода.

| Режим | Системный промпт |
|-------|-----------------|
| **Chat** | Нет промпта (обычный диалог) |
| **Explain** | "Explain the following clearly and concisely. Use simple language. Keep it under 3 paragraphs." |
| **Summarize** | "Summarize the following in 3 bullet points. Be extremely concise." |
| **Translate** | "Translate the following text to English. If it's already in English, translate to Russian. Output only the translation." |
| **Fix Code** | "Find and fix bugs in the following code. Show the corrected version. Explain each fix in one line." |

После отправки запроса режим отображается в header рядом с названием модели. При New Chat — сбрасывается на Chat.

---

## 5. Модели

Текущий список (MVP):

| ID | Лейбл |
|----|-------|
| `deepseek-chat` | DeepSeek V3 |
| `gpt-4o-mini` | GPT-4o Mini |
| `claude-haiku-4-5` | Claude Haiku 4.5 |

Отображаются в дропдауне слева от режима.

---

## 6. Компоненты (новое дерево)

```
GlassCanvasApp
├── WindowShell          # Общий контейнер с glass-эффектами
│   ├── HeaderBar        # IDLE: drag handle. STREAMING/DONE: брендинг
│   ├── ContentArea
│   │   ├── IdleView     # Поле ввода + модель + режим (одна строка)
│   │   ├── MessageList  # Вопросы и ответы (STREAMING + DONE)
│   │   └── ErrorState   # Ошибка
│   └── BottomBar
│       ├── IdleHint     # "Enter to send · Esc to close" (IDLE)
│       ├── Generating   # "generating..." (STREAMING)
│       └── ActionBar    # Copy, Retry, Follow up (DONE)
├── ModelSelector        # Дропдаун выбора модели
├── ModeSelector         # Дропдаун выбора режима
└── GlassOverlay         # Эффекты: ripple, shimmer, light spots
```

### Что удаляется

- Два отдельных окна (overlay.ts + response.ts окна Electron)
- QuickActions как сетка кнопок (заменены на ModeSelector)
- Двойной Header/InputBar в разных состояниях

---

## 7. Технические заметки

### Electron

- Одно BrowserWindow с `transparent: true, frame: false`
- Позиция: центр экрана (IDLE/STREAMING), пользователь может перетащить (DONE)
- Всегда поверх других окон: `alwaysOnTop: true`
- Глобальный хоткей: Alt+Space (без изменений)
- Закрытие: Esc (скрыть окно, сбросить состояние)

### CSS

- Tailwind v4 удаляется полностью
- Все стили — inline styles (текущий подход, зарекомендовал себя)
- CSS-переменные для design tokens
- `backdrop-filter: blur()` для стекла — проверить производительность на Windows
- Возможный фолбек: статичный фон если blur лагает

### Framer Motion

- `AnimatePresence` для morph между состояниями
- `layout` prop для автоматического morph размера
- `motion.div` для всех анимируемых элементов
- Кастомная spring-конфигурация

### Производительность

- `backdrop-filter` дорогой на Windows без GPU-ускорения
- Использовать `will-change: transform, opacity` на анимируемых элементах
- Тяжёлые эффекты (ripple, shimmer) опциональны — отключать при низкой производительности
- Избегать `backdrop-filter` на всём окне — только на стеклянных поверхностях
