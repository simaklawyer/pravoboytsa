"""
ПравоБойца — Telegram-бот (aiogram 3.x).

Локально: long polling.
Render Free (Web Service): webhook на PORT — без платного Worker.

Переменные:
  BOT_TOKEN       — токен BotFather
  WEBAPP_URL      — https://pravoboytsa.vercel.app
  LAWYER_URL      — опционально, ссылка «Спросить юриста»
  WEBHOOK_BASE    — https://ваш-сервис.onrender.com  (на Render можно не задавать,
                    подставится RENDER_EXTERNAL_URL)
  PORT            — задаёт Render сам

Локально:
  export BOT_TOKEN=...
  export WEBAPP_URL=https://pravoboytsa.vercel.app
  python main.py
"""

from __future__ import annotations

import asyncio
import logging
import os
import re

from aiohttp import web
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("pravoboytsa-bot")

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
WEBAPP_URL = os.environ.get("WEBAPP_URL", "").rstrip("/")
LAWYER_URL = os.environ.get("LAWYER_URL", "").strip()
WEBHOOK_PATH = "/webhook"

HINTS: list[tuple[list[str], str]] = [
    (
        ["ранен", "увечь", "травм", "контуз"],
        "По ранениям и выплатам откройте в приложении раздел «Деньги и выплаты» → «Выплаты при ранении».",
    ),
    (
        ["пропал", "без вести", "связь пропал", "не выходит на связь"],
        "Если боец не на связи — раздел «Экстренные ситуации» → «Пропал без вести»: первые шаги и куда писать.",
    ),
    (
        ["ввк", "военно-врачеб", "категори.*годност", "медкомисс"],
        "ВВК и годность — раздел «Здоровье и ВВК». Соберите выписки до комиссии.",
    ),
    (
        ["ипотек", "нис", "жиль", "квартир"],
        "Жильё и НИС — раздел «Жильё и ипотека».",
    ),
    (
        ["рапорт", "входящ", "командир"],
        "Как писать рапорт и что делать, если номер не ставят — «Правовая защита» → материалы про рапорт. В приложении есть конструктор черновика.",
    ),
    (
        ["прокур", "жалоб"],
        "Жалоба военному прокурору — раздел «Правовая защита». Удобно идти по ступеням в «Где я в деле».",
    ),
    (
        ["детск", "сад", "алимент", "семья", "жен", "вдов"],
        "Семья: пособия, дети, жильё после утраты — разделы «Семья» и «Экстренные ситуации».",
    ),
    (
        ["ветеран", "льгот", "увольн"],
        "Статус и льготы после службы — раздел «После службы».",
    ),
    (
        ["довольств", "оклад", "не плат", "зарплат", "денежн"],
        "Денежное довольствие и перерасчёт — «Деньги и выплаты».",
    ),
]


def main_keyboard() -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    if WEBAPP_URL:
        rows.append(
            [
                InlineKeyboardButton(
                    text="Открыть ПравоБойца",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        )
    if LAWYER_URL:
        rows.append(
            [InlineKeyboardButton(text="Спросить юриста", url=LAWYER_URL)]
        )
    else:
        rows.append(
            [
                InlineKeyboardButton(
                    text="Спросить юриста",
                    callback_data="ask_lawyer",
                )
            ]
        )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def start_text(first_name: str | None) -> str:
    name = (first_name or "").strip() or "друг"
    return (
        f"Здравствуйте, {name}.\n\n"
        "Вы в «ПравоБойце» — навигаторе по правам военнослужащих, "
        "военнообязанных и их близких.\n\n"
        "Внутри — пошаговые маршруты: выплаты, ВВК, жильё, льготы, "
        "рапорты и защита. Тексты простым языком, без канцелярита.\n\n"
        "Напишите вопрос своими словами — подскажу, куда смотреть. "
        "Например: «не приходит довольствие», «как пройти ВВК», "
        "«муж не на связи».\n\n"
        "Сложная ситуация — кнопка «Спросить юриста»: разберём по вашему случаю.\n\n"
        "Материалы справочные и не заменяют очную консультацию."
    )


def match_hint(text: str) -> str | None:
    low = text.lower()
    for keys, answer in HINTS:
        for k in keys:
            if re.search(k, low):
                return answer
    return None


def build_dispatcher() -> Dispatcher:
    dp = Dispatcher()

    async def cmd_start(message: Message) -> None:
        user = message.from_user
        name = user.first_name if user else None
        text = start_text(name)
        if not WEBAPP_URL:
            text += "\n\n⚠️ Администратору: задайте WEBAPP_URL."
        await message.answer(text, reply_markup=main_keyboard())

    async def on_ask_lawyer(callback: CallbackQuery) -> None:
        await callback.answer()
        if callback.message:
            await callback.message.answer(
                "Напишите кратко: кто вы (военный / родственник), суть проблемы "
                "и что уже пробовали сделать. Передадим запрос юристу.\n\n"
                "Либо задайте LAWYER_URL в окружении — кнопка откроет ссылку сразу."
            )

    async def on_text(message: Message) -> None:
        body = (message.text or "").strip()
        if not body:
            return
        hint = match_hint(body)
        if hint:
            await message.answer(
                f"{hint}\n\nПолный текст и чек-листы — в приложении.",
                reply_markup=main_keyboard(),
            )
            return
        await message.answer(
            "Пока не нашёл точное совпадение. Откройте «ПравоБойца» и воспользуйтесь "
            "поиском внутри приложения — или переформулируйте вопрос короче "
            "(выплата, ВВК, жильё, рапорт, пропал).",
            reply_markup=main_keyboard(),
        )

    dp.message.register(cmd_start, CommandStart())
    dp.callback_query.register(on_ask_lawyer, F.data == "ask_lawyer")
    dp.message.register(on_text, F.text)
    return dp


def webhook_base() -> str:
    base = (
        os.environ.get("WEBHOOK_BASE", "").strip()
        or os.environ.get("RENDER_EXTERNAL_URL", "").strip()
    )
    return base.rstrip("/")


async def run_polling(bot: Bot, dp: Dispatcher) -> None:
    log.info("Mode: long polling")
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


def run_webhook(bot: Bot, dp: Dispatcher) -> None:
    base = webhook_base()
    if not base:
        raise SystemExit(
            "Для webhook задайте WEBHOOK_BASE=https://ваш-сервис.onrender.com "
            "или дождитесь RENDER_EXTERNAL_URL на Render."
        )
    port = int(os.environ.get("PORT", "10000"))
    webhook_url = f"{base}{WEBHOOK_PATH}"

    async def on_startup(app: web.Application) -> None:
        await bot.set_webhook(webhook_url, drop_pending_updates=True)
        log.info("Webhook set: %s", webhook_url)

    async def on_shutdown(app: web.Application) -> None:
        await bot.delete_webhook()
        log.info("Webhook removed")

    async def health(_request: web.Request) -> web.Response:
        return web.Response(text="ok")

    app = web.Application()
    app.router.add_get("/", health)
    app.router.add_get("/health", health)
    SimpleRequestHandler(dispatcher=dp, bot=bot).register(app, path=WEBHOOK_PATH)
    setup_application(app, dp, bot=bot)
    app.on_startup.append(on_startup)
    app.on_shutdown.append(on_shutdown)

    log.info("Mode: webhook on 0.0.0.0:%s path=%s", port, WEBHOOK_PATH)
    web.run_app(app, host="0.0.0.0", port=port)


def main() -> None:
    if not BOT_TOKEN:
        raise SystemExit("Задайте BOT_TOKEN")
    bot = Bot(BOT_TOKEN)
    dp = build_dispatcher()

    # Render / любой PaaS с PORT → webhook (бесплатный Web Service).
    # Локально без PORT → polling.
    use_webhook = bool(os.environ.get("PORT")) or bool(webhook_base())
    if use_webhook and (os.environ.get("PORT") or webhook_base()):
        # На Render всегда есть PORT; если WEBHOOK_BASE ещё пуст при старте —
        # RENDER_EXTERNAL_URL обычно уже есть.
        if not webhook_base() and not os.environ.get("PORT"):
            asyncio.run(run_polling(bot, dp))
            return
        if not webhook_base():
            log.warning(
                "PORT задан, но нет WEBHOOK_BASE/RENDER_EXTERNAL_URL — "
                "задайте WEBHOOK_BASE вручную после первого деплоя."
            )
            raise SystemExit(
                "Задайте WEBHOOK_BASE=https://<имя>.onrender.com "
                "(URL сервиса из Dashboard Render)."
            )
        run_webhook(bot, dp)
    else:
        asyncio.run(run_polling(bot, dp))


if __name__ == "__main__":
    main()
