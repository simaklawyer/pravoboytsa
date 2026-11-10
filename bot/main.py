"""
ПравоБойца — Telegram-бот (aiogram 3.x).

Локально: long polling.
Render Free (Web Service): long polling + /health на PORT.
Опционально USE_WEBHOOK=1 для webhook-режима.

Переменные:
  BOT_TOKEN, WEBAPP_URL
  ADMIN_CHAT_ID (опц.)
  LAWYER_URL (опц.)
  USE_WEBHOOK=1 (опц.)
  WEBHOOK_BASE=https://pravoboytsa-bot.onrender.com
"""

from __future__ import annotations

import asyncio
import logging
import os
import re

from aiohttp import web
from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command, CommandObject, CommandStart
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
log = logging.getLogger("pravoboytsa-bot")

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
WEBAPP_URL = os.environ.get("WEBAPP_URL", "").strip().rstrip("/") or "https://pravoboytsa.vercel.app"
COMPANY_PHONE = "8 (800) 600 02 13"
COMPANY_TG = "https://t.me/pravoboitsa"
COMPANY_SITE = "https://xn----7sbbdd8b6acdk7e.xn--p1ai"
COMPANY_SITE_LABEL = "право-бойца.рф"
COMPANY_EMAIL = "1000@pboitsa.ru"
LAWYER_URL = os.environ.get("LAWYER_URL", "").strip() or "https://t.me/pravoboitsames"


def _int_env(name: str) -> int:
    try:
        return int(os.environ.get(name, "0").strip() or 0)
    except ValueError:
        return 0


ADMIN_CHAT_ID = _int_env("ADMIN_CHAT_ID")
LEADS: dict[int, dict] = {}

ROLES = {
    "s": "Военнослужащий",
    "r": "Родственник",
    "v": "Ветеран / уволенный",
    "o": "Другое",
}

TOPICS = {
    "pay": ("Выплаты / довольствие", ["money-1", "money-2"], None),
    "vvk": ("ВВК / здоровье", ["health-1", "health-7"], None),
    "dis": ("Увольнение", ["service-8", "service-2"], None),
    "fam": ("Семья", ["family-1"], None),
    "mia": ("Пропал / гибель", ["emergency-1", "emergency-2"], None),
    "oth": ("Другое", [], None),
}

DOCS = {
    "none": "Документов нет",
    "report": "Есть рапорт / заявление",
    "refusal": "Есть отказ",
    "order": "Есть приказ / заключение",
}

URGENT = {
    "now": "Срочно (дни)",
    "soon": "На этой неделе",
    "later": "Не срочно",
}

HINTS: list[tuple[list[str], str]] = [
    (["ранен", "увечь", "травм", "контуз"], "По ранениям и выплатам откройте в приложении раздел «Деньги и выплаты» → «Выплаты при ранении»."),
    (["пропал", "без вести", "связь пропал", "не выходит на связь"], "Если боец не на связи — раздел «Экстренные ситуации» → «Пропал без вести»: первые шаги и куда писать."),
    (["ввк", "военно-врачеб", "категори.*годност", "медкомисс"], "ВВК и годность — раздел «Здоровье и комиссии». Соберите выписки до комиссии. Есть материалы по обжалованию."),
    (["ипотек", "нис", "жиль", "квартир"], "Жильё и НИС — раздел «Жильё и недвижимость»."),
    (["рапорт", "входящ", "командир"], "Как писать рапорт и что делать, если номер не ставят — «Защита прав» → материалы про рапорт."),
    (["прокур", "жалоб"], "Жалоба военному прокурору — раздел «Защита прав»."),
    (["детск", "сад", "алимент", "семья", "жен", "вдов"], "Семья: пособия, дети, жильё после утраты — разделы «Семья» и «Экстренные ситуации»."),
    (["ветеран", "льгот", "увольн"], "Статус и льготы после службы — раздел «После службы». Увольнение — «Служба»."),
    (["довольств", "оклад", "не плат", "зарплат", "денежн"], "Денежное довольствие и перерасчёт — «Деньги и выплаты»."),
]


def main_keyboard() -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    if WEBAPP_URL:
        rows.append([InlineKeyboardButton(text="Открыть ПравоБойца", web_app=WebAppInfo(url=WEBAPP_URL))])
    rows.append([
        # Telegram API не принимает tel: в inline URL-кнопках
        InlineKeyboardButton(text="Позвонить", callback_data="call_phone"),
        InlineKeyboardButton(text="Написать юристу", url=LAWYER_URL),
    ])
    rows.append([InlineKeyboardButton(text=COMPANY_SITE_LABEL, url=COMPANY_SITE)])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def contacts_text() -> str:
    return (
        "Связаться с нами:\n\n"
        f"📞 {COMPANY_PHONE}\n"
        f"✈️ {COMPANY_TG}\n"
        f"🌐 {COMPANY_SITE_LABEL}\n"
        f"✉️ {COMPANY_EMAIL}"
    )


def start_text(first_name: str | None) -> str:
    name = (first_name or "").strip() or "друг"
    return (
        f"Здравствуйте, {name}.\n\n"
        "«ПравоБойца» — навигатор по правам военнослужащих, военнообязанных и их близких.\n\n"
        "В приложении пошаговые маршруты: выплаты, ВВК, жильё, льготы, рапорты и защита прав. "
        "Тексты написаны простым языком, без канцелярита.\n\n"
        "Напишите вопрос своими словами, и я подскажу, где искать ответ. "
        "Например: «не приходит довольствие», «как пройти ВВК», «муж не на связи».\n\n"
        "Если ситуация сложная, позвоните нам или перейдите в Telegram-канал.\n\n"
        f"Телефон: {COMPANY_PHONE}\n"
        f"Telegram: {COMPANY_TG}\n\n"
        "Материалы справочные и не заменяют очную консультацию."
    )


def _kb(rows: list[list[tuple[str, str]]]) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text=t, callback_data=d) for t, d in row] for row in rows]
    )


def lead_question(step: str) -> tuple[str, InlineKeyboardMarkup]:
    if step == "role":
        return ("Вопрос 1 из 4. Кто обращается?", _kb([[(t, f"lf:role:{k}")] for k, t in ROLES.items()]))
    if step == "topic":
        return ("Вопрос 2 из 4. О чём вопрос?", _kb([[(v[0], f"lf:topic:{k}")] for k, v in TOPICS.items()]))
    if step == "docs":
        return ("Вопрос 3 из 4. Что у вас с документами?", _kb([[(t, f"lf:docs:{k}")] for k, t in DOCS.items()]))
    if step == "urgent":
        return ("Вопрос 4 из 4. Насколько срочно?", _kb([[(t, f"lf:urgent:{k}")] for k, t in URGENT.items()]))
    return (
        "Опишите ситуацию в одном-двух предложениях или нажмите «Пропустить».",
        _kb([[("Пропустить", "lf:text:skip")]]),
    )


def waiting_keyboard(topic: str, docs: str = "none") -> InlineKeyboardMarkup:
    _, article_ids, _template_id = TOPICS.get(topic, TOPICS["oth"])
    rows: list[list[InlineKeyboardButton]] = []
    if WEBAPP_URL:
        for aid in article_ids:
            rows.append([InlineKeyboardButton(text=f"Статья: {aid}", web_app=WebAppInfo(url=f"{WEBAPP_URL}/article/{aid}"))])
    rows.append([InlineKeyboardButton(text="Написать юристу", url=LAWYER_URL)])
    return InlineKeyboardMarkup(inline_keyboard=rows)


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
        log.info(
            "/start from id=%s username=%s",
            message.from_user.id if message.from_user else "?",
            getattr(message.from_user, "username", None),
        )
        user = message.from_user
        name = user.first_name if user else None
        text = start_text(name)
        if not WEBAPP_URL:
            text += "\n\n⚠️ Администратору: задайте WEBAPP_URL."
        await message.answer(text, reply_markup=main_keyboard())

    async def on_call_phone(callback: CallbackQuery) -> None:
        await callback.answer()
        if callback.message:
            await callback.message.answer(
                f"Телефон для звонка:\n\n📞 {COMPANY_PHONE}\n\n"
                "Нажмите на номер, чтобы скопировать, или наберите вручную."
            )

    async def on_ask_lawyer(callback: CallbackQuery) -> None:
        await callback.answer()
        if callback.message:
            await callback.message.answer(
                "Напишите кратко: кто вы (военный / родственник), суть проблемы.\n"
                f"Или сразу в Telegram: {COMPANY_TG}",
                reply_markup=InlineKeyboardMarkup(
                    inline_keyboard=[[InlineKeyboardButton(text="Написать юристу", url=LAWYER_URL)]]
                ),
            )

    async def on_lead_start(callback: CallbackQuery) -> None:
        await callback.answer()
        uid = callback.from_user.id if callback.from_user else 0
        LEADS[uid] = {"step": "role"}
        if callback.message:
            q, kb = lead_question("role")
            await callback.message.answer(q, reply_markup=kb)

    async def on_lead_flow(callback: CallbackQuery) -> None:
        await callback.answer()
        if not callback.data or not callback.from_user:
            return
        uid = callback.from_user.id
        parts = callback.data.split(":")
        if len(parts) < 3:
            return
        _, field, value = parts[0], parts[1], ":".join(parts[2:])
        state = LEADS.setdefault(uid, {})
        state[field] = value

        order = ["role", "topic", "docs", "urgent", "text"]
        try:
            idx = order.index(field)
        except ValueError:
            return
        next_step = order[idx + 1] if idx + 1 < len(order) else None

        if next_step == "text":
            state["step"] = "text"
            q, kb = lead_question("text")
            if callback.message:
                await callback.message.answer(q, reply_markup=kb)
            return

        if next_step:
            state["step"] = next_step
            q, kb = lead_question(next_step)
            if callback.message:
                await callback.message.answer(q, reply_markup=kb)
            return

        await _finish_lead(callback.message, uid, state, "")

    async def on_lead_text(message: Message) -> None:
        if not message.from_user:
            return
        uid = message.from_user.id
        state = LEADS.get(uid)
        if not state or state.get("step") != "text":
            hint = match_hint(message.text or "")
            if hint:
                await message.answer(hint, reply_markup=main_keyboard())
            else:
                await message.answer(
                    "Напишите вопрос своими словами или откройте приложение.\n"
                    f"Связь с юристом: {COMPANY_TG}",
                    reply_markup=main_keyboard(),
                )
            return
        await _finish_lead(message, uid, state, message.text or "")

    async def _finish_lead(message: Message | None, uid: int, state: dict, free_text: str) -> None:
        LEADS.pop(uid, None)
        role = ROLES.get(state.get("role", ""), state.get("role", "?"))
        topic_key = state.get("topic", "oth")
        topic_title = TOPICS.get(topic_key, TOPICS["oth"])[0]
        docs = DOCS.get(state.get("docs", ""), state.get("docs", "?"))
        urgent = URGENT.get(state.get("urgent", ""), state.get("urgent", "?"))
        summary = (
            f"Заявка\n"
            f"Роль: {role}\n"
            f"Тема: {topic_title}\n"
            f"Документы: {docs}\n"
            f"Срочность: {urgent}\n"
            f"Текст: {free_text or '—'}\n"
            f"User id: {uid}"
        )
        if message:
            if ADMIN_CHAT_ID:
                try:
                    b = message.bot
                    await b.send_message(ADMIN_CHAT_ID, summary)
                    head = "Заявка принята. Мы свяжемся с вами в Telegram."
                except Exception as e:
                    log.exception("admin notify failed: %s", e)
                    head = f"Сейчас приём заявок в боте не работает. Напишите в Telegram: {COMPANY_TG}"
            else:
                head = f"Сейчас приём заявок в боте не работает. Позвоните: {COMPANY_PHONE}, или напишите в Telegram."
            await message.answer(
                head,
                reply_markup=waiting_keyboard(topic_key, state.get("docs", "none")),
            )

    async def on_lf_text_skip(callback: CallbackQuery) -> None:
        await callback.answer()
        if not callback.from_user:
            return
        uid = callback.from_user.id
        state = LEADS.get(uid, {})
        await _finish_lead(callback.message, uid, state, "")

    dp.message.register(cmd_start, CommandStart())
    dp.callback_query.register(on_call_phone, F.data == "call_phone")
    dp.callback_query.register(on_ask_lawyer, F.data == "ask_lawyer")
    dp.callback_query.register(on_lead_start, F.data == "lead")
    dp.callback_query.register(on_lead_flow, F.data.startswith("lf:role:"))
    dp.callback_query.register(on_lead_flow, F.data.startswith("lf:topic:"))
    dp.callback_query.register(on_lead_flow, F.data.startswith("lf:docs:"))
    dp.callback_query.register(on_lead_flow, F.data.startswith("lf:urgent:"))
    dp.callback_query.register(on_lf_text_skip, F.data == "lf:text:skip")
    dp.message.register(on_lead_text, F.text)

    return dp


def webhook_base() -> str:
    base = (
        os.environ.get("WEBHOOK_BASE", "").strip()
        or os.environ.get("RENDER_EXTERNAL_URL", "").strip()
        or "https://pravoboytsa-bot.onrender.com"
    )
    return base.rstrip("/")


async def run_polling(bot: Bot, dp: Dispatcher) -> None:
    log.info("Mode: long polling")
    await bot.delete_webhook(drop_pending_updates=True)
    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()


WEBHOOK_PATH = "/webhook"


def run_webhook(bot: Bot, dp: Dispatcher) -> None:
    base = webhook_base()
    if not base:
        raise SystemExit("Задайте WEBHOOK_BASE=https://pravoboytsa-bot.onrender.com")
    port = int(os.environ.get("PORT", "10000"))
    webhook_url = f"{base}{WEBHOOK_PATH}"

    async def on_startup(app: web.Application) -> None:
        try:
            await bot.delete_webhook(drop_pending_updates=True)
            log.info("Old webhook deleted (pending dropped)")
        except Exception as e:
            log.warning("delete_webhook failed: %s", e)
        await bot.set_webhook(
            url=webhook_url,
            drop_pending_updates=True,
            allowed_updates=["message", "callback_query"],
        )
        info = await bot.get_webhook_info()
        log.info(
            "Webhook set: url=%s pending=%s last_error=%s",
            info.url,
            info.pending_update_count,
            getattr(info, "last_error_message", None),
        )
        me = await bot.get_me()
        log.info("Bot identity: @%s id=%s", me.username, me.id)

    async def on_shutdown(app: web.Application) -> None:
        log.info("Shutdown: closing bot session")
        await bot.session.close()

    async def health(_request: web.Request) -> web.Response:
        return web.Response(text="ok")

    async def webhook_info(_request: web.Request) -> web.Response:
        try:
            info = await bot.get_webhook_info()
            me = await bot.get_me()
            return web.json_response({
                "mode": "webhook",
                "bot": f"@{me.username}",
                "bot_id": me.id,
                "webhook_url": info.url,
                "pending": info.pending_update_count,
                "last_error_message": getattr(info, "last_error_message", None),
                "expected_url": webhook_url,
                "url_match": (info.url or "") == webhook_url,
            })
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)

    app = web.Application()
    app.router.add_get("/", health)
    app.router.add_get("/health", health)
    app.router.add_get("/webhook-info", webhook_info)
    SimpleRequestHandler(dispatcher=dp, bot=bot).register(app, path=WEBHOOK_PATH)
    setup_application(app, dp, bot=bot)
    app.on_startup.append(on_startup)
    app.on_shutdown.append(on_shutdown)
    log.info("Starting webhook server 0.0.0.0:%s url=%s", port, webhook_url)
    web.run_app(app, host="0.0.0.0", port=port, print=lambda *a, **k: None)


async def run_polling_with_health(bot: Bot, dp: Dispatcher) -> None:
    """Long polling + HTTP /health на PORT (чтобы Render не убивал сервис)."""
    port = int(os.environ.get("PORT", "10000"))

    async def health(_request: web.Request) -> web.Response:
        return web.Response(text="ok")

    async def status(_request: web.Request) -> web.Response:
        try:
            me = await bot.get_me()
            info = await bot.get_webhook_info()
            return web.json_response({
                "mode": "polling",
                "bot": f"@{me.username}",
                "bot_id": me.id,
                "webhook_url": info.url or "",
                "ok": True,
            })
        except Exception as e:
            return web.json_response({"ok": False, "error": str(e)}, status=500)

    app = web.Application()
    app.router.add_get("/", health)
    app.router.add_get("/health", health)
    app.router.add_get("/webhook-info", status)

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()
    log.info("Health server on 0.0.0.0:%s (mode=polling)", port)

    await bot.delete_webhook(drop_pending_updates=True)
    me = await bot.get_me()
    log.info("Bot identity: @%s id=%s — starting long polling", me.username, me.id)

    try:
        await dp.start_polling(bot, allowed_updates=["message", "callback_query"])
    finally:
        await bot.session.close()
        await runner.cleanup()


def main() -> None:
    if not BOT_TOKEN:
        raise SystemExit("Задайте BOT_TOKEN")
    bot = Bot(BOT_TOKEN)
    dp = build_dispatcher()

    use_webhook = os.environ.get("USE_WEBHOOK", "").strip().lower() in ("1", "true", "yes")

    if use_webhook:
        log.info("Mode: webhook (USE_WEBHOOK=1)")
        run_webhook(bot, dp)
    elif os.environ.get("PORT"):
        log.info("Mode: long polling + health (Render)")
        asyncio.run(run_polling_with_health(bot, dp))
    else:
        log.info("Mode: long polling (local)")
        asyncio.run(run_polling(bot, dp))


if __name__ == "__main__":
    main()
