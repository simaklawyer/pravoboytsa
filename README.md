# ПравоБойца

Премиальный навигатор по правам военнослужащих и их семей.  
Telegram Mini App.

## Стек

- React 18 + TypeScript + Vite
- Tailwind CSS · Framer Motion · Zustand · React Router
- Бот: aiogram 3 (`/bot`)

## Локально

```bash
npm install
npm run dev
```

## Деплой Mini App (HTTPS)

Нужен **HTTPS**-URL. Рекомендация: **Vercel** (1–2 минуты).

### 1. Vercel (предпочтительно)

1. Зайдите на [vercel.com](https://vercel.com) → **Add New Project**
2. Import GitHub-репозиторий **`simaklawyer/pravoboytsa`**
3. Framework Preset: **Vite** (определится сам)
4. Build Command: `npm run build` · Output: `dist`
5. Deploy → получите URL вида `https://pravoboytsa-xxx.vercel.app`

В репозитории уже есть `vercel.json` (SPA-роутинг + заголовки под Telegram iframe).

### 2. Cloudflare Pages

1. [pages.cloudflare.com](https://pages.cloudflare.com) → Create → connect GitHub
2. Build command: `npm run build` · Output directory: `dist`
3. Deploy

### 3. После деплоя — BotFather

1. `@BotFather` → ваш бот → **Bot Settings** → **Menu Button** → **Configure menu button**  
   или **Web App** / **Direct Link**
2. URL: `https://ваш-домен` (без слэша в конце или со — оба обычно работают)
3. В окружении бота:

```bash
export BOT_TOKEN=...
export WEBAPP_URL=https://ваш-домен
cd bot && pip install -r requirements.txt && python main.py
```

Кнопка «Открыть ПравоБойца» в `/start` откроет Mini App.

## Бот

См. папку `bot/` — минимальный aiogram 3 с WebApp-кнопкой.

## Цвета

- Фон `#0B0F0C` · карточки `#141A16` · акцент `#3D8B6E`

## Важно

Материалы справочные, не юридическая консультация. Не копируйте чужой контент один в один.
