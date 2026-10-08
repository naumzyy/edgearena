# Пульс Спорта — лендинг (фрибет до 15 000 ₽ без депозита)

Статический сайт: `index.html`, `styles.css`, `app.js`, `config.js`. Сборка не нужна.

## Что менять в config.js
- `offerUrl` — партнёрская ссылка (уже вставлена). UTM/yclid/gclid трафика дописываются автоматически.
- `advertiser`, `erid`, `operatorName`, `licenseText` — юридические данные из условий оффера. Заполнить до запуска рекламы.
- `bonus.*` — тексты оффера (должны совпадать с условиями).
- `yandexMetrikaId` — ID Метрики или `null`. Цель: `offer_click`.

## Render
Static Site, Build Command пустой, Publish Directory `.` (или Blueprint через `render.yaml`).
