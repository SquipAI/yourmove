# Статьи с таблицами

Источник: `blogTasks.md` (пометки по статьям) + сводка `blogFixPlan.md`.
Таблицы лежат как `htmlEmbed`-блоки внутри тел статей. План: структурный блок `table` в Sanity (`rows[]{cells: text[]}`, первая строка всегда шапка) + `TableBlock.astro` + стили в `global.css`; миграция по общим `_key` в 3 локалях (ES/DE — с переводом). В ячейках допустима только конвенция `*звёздочки*` = акцент (рендерится `<span class="accent">`, вид задаёт CSS; как в pageTitle). Авторские `<strong>/<em>` при миграции раздеваются до чистого текста.

Аудит Sanity 2026-07-07: фактически 17 блоков (не ~22); у `reviews` реальные индексы [38, 42, 48]. `_key` идентичны в EN/ES/DE, контент таблиц в ES/DE — английский.

## Чеклист

**МИГРАЦИЯ ЗАВЕРШЕНА 2026-07-07**: все 15 таблиц конвертированы в блок `table` (45 замен × 18 документов, published), ES/DE переведены, инлайн-стили/классы/strong/em выброшены. В `htmlEmbed` таблиц больше нет. Сборка проверена: stack — 4 таблицы (bumble ×3, insights), остальные — сетка.

- [x] `hinge-conversation-starters` — ~~таблица [110]~~ не-таблица, переверстана в 2 h4 + списки, 3 локали (2026-07-07); заодно `[100]`→h2, `[34]`/`[39]`→h3
- [x] `how-to-make-a-good-tinder-profile` — ~~[87] Tool/What it does~~ удалена как промо-сирота; [23, 75] мигрированы
- [x] `tinder-opening-lines` — [132, 137] мигрированы; CTA `[157]` h4→h2 сделано
- [x] `reviews` — [38, 42, 48] мигрированы; колонки Pro/Free → Free/Pro поменяны
- [x] `pros-and-cons-of-dating-me-answers` — [13, 18, 21] мигрированы
- [x] `is-tinder-gold-worth-it` — [29, 48] мигрированы
- [x] `what-to-say-on-bumble` — [95, 99, 104] мигрированы

## Инвентарь оставшихся 15

Итого: 7×2 кол., 6×3 кол., 1×5, 1×6. Шапка есть у всех. «Мобайл» — раскладка ниже брейкпоинта: **обычная** (влезает как есть), **scroll** (сетка + overflow-x), **stack** (строки → карточки; длинные ячейки >~60 симв.).

| Пост | Идx | `_key` | Кол×строк | Разметка в ячейках | Мобайл |
|---|---|---|---|---|---|
| `how-to-make-a-good-tinder-profile` | 23 | `c79801ec4748` | 2×6 | — | обычная |
| `how-to-make-a-good-tinder-profile` | 75 | `89186599844a` | 2×9 | — | обычная |
| `pros-and-cons-of-dating-me-answers` | 13 | `c907b118a89b` | 2×8 | ✓/× в шапке | обычная |
| `pros-and-cons-of-dating-me-answers` | 18 | `b4bc8714856c` | 2×7 | ✓/× в шапке | обычная |
| `pros-and-cons-of-dating-me-answers` | 21 | `2ad36ee8705c` | 2×7 | ✓/× в шапке | обычная |
| `reviews` | 38 | `cb3acabf1480` | 2×5 | — | обычная |
| `tinder-opening-lines` | 137 | `cc37d6356d86` | 2×6 | ✅/❌ в шапке | обычная |
| `is-tinder-gold-worth-it` | 29 | `897c4b9165cb` | 3×3 | — | обычная (короткие ячейки) |
| `reviews` | 42 | `462f3a34fe75` | 3×6 | **strong** (Unlimited…) | обычная (короткие ячейки) |
| `tinder-opening-lines` | 132 | `770fad9446b7` | 3×5 | **strong** (колонка Found) | stack (длинная 3-я колонка) |
| `what-to-say-on-bumble` | 95 | `ce3473ea1c05` | 3×3 | *em* (колонка Example) | stack |
| `what-to-say-on-bumble` | 99 | `d01337598f94` | 3×3 | *em* (колонка Example) | stack |
| `what-to-say-on-bumble` | 104 | `a6f67ef58fb3` | 3×8 | *em* (колонка Example) | stack |
| `is-tinder-gold-worth-it` | 48 | `b8751c88c058` | 5×8 | ✓/× в данных | scroll |
| `reviews` | 48 | `d8b6bc001806` | 6×8 | ✓/—, **strong** (300,000+; WSJ…) | scroll |

## Удалено/переверстано

- `hinge-conversation-starters` [110] `15bff8007ef5` → 2 h4 + bullet-списки (новые `_key` `15bff8-l1/-i1..4/-l2/-j1..4`, ES/DE переведены)
- `how-to-make-a-good-tinder-profile` [87] `514db173866a` → удалена (промо-сирота, дублировала финальную CTA-секцию)
