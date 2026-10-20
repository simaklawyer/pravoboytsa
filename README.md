# ПравоБойца

Премиальный навигатор по правам военнослужащих и их семей.  
Telegram Mini App.

Репозиторий: [simaklawyer/pravoboytsa](https://github.com/simaklawyer/pravoboytsa) (может быть **private** — открывайте под аккаунтом `simaklawyer`).

## Стек

- React 18 + TypeScript + Vite
- Tailwind CSS · Framer Motion · Zustand · React Router
- Бот: aiogram 3 (`/bot`) — **не** на Vercel (long polling)

## Локально

```bash
npm install
npm run dev
```

## Деплой Mini App на Vercel

В корне лежит `vercel.json` в режиме **Services**:

| Сервис | Имя | Публичный | Путь |
|--------|-----|-----------|------|
| Mini App (Vite) | `app` | да | `/*` |
| Бот | — | нет | отдельно (VPS / свой хост) |

Биндингов между сервисами нет: фронт не вызывает бота по HTTP.

### Шаги

1. [vercel.com/new](https://vercel.com/new) → Import **`simaklawyer/pravoboytsa`**  
   (если репо private — дайте Vercel доступ к private repos)
2. Deploy (framework/root подхватит service `app`)
3. Скопируйте URL: `https://….vercel.app`

### BotFather + бот

1. `@BotFather` → Menu Button / Web App → URL = ваш Vercel-домен  
2. Локально или на VPS:

```bash
export BOT_TOKEN=...
export WEBAPP_URL=https://ваш-домен.vercel.app
cd bot && pip install -r requirements.txt && python main.py
```

Позже можно добавить webhook-сервис `bot` на Vercel (`/api/telegram`) — сейчас polling на serverless не подходит.

## Cloudflare Pages (альтернатива)

Build: `npm run build` · Output: `dist`

## Цвета

Фон `#0B0F0C` · карточки `#141A16` · акцент `#3D8B6E`

## Важно

Материалы справочные, не юридическая консультация.
