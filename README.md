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

## Контакты компании и заявки из бота

- Контакты хранятся в `src/data/company.ts` (приложение) и в константах `COMPANY_*` в `bot/main.py`. При смене телефона, почты или адреса правьте оба места.
- Бот принимает заявки: кнопка «Оставить заявку» → 4 вопроса (кто, тема, документы, срочность) → описание ситуации (можно пропустить) → заявка уходит в чат из переменной `ADMIN_CHAT_ID` с пометкой срочности. Пока человек ждёт, бот присылает статьи по теме и шаблон документа. Состояние воронки хранится в памяти процесса и ничего не сохраняет на диск. Узнать id чата можно у бота @userinfobot (для группы добавьте бота в группу и используйте отрицательный id). Без `ADMIN_CHAT_ID` бот показывает контакты вместо приёма заявок.
- Кнопка «Написать юристу» по умолчанию ведёт на https://t.me/pravoboitsa; переопределяется переменной `LAWYER_URL`.
- Команды для меню бота (BotFather → `/setcommands`): `contacts — Контакты`, `cancel — Отменить заявку`.
- Ссылки на статьи для канала и рекламы: `https://t.me/<бот>?start=art_<id статьи>`, например `art_money-8`. Часть после `start=` попадает в заявку как источник.
