"""
ПравоБойца — Telegram-бот (aiogram 3.x).

Локально: long polling.
Render Free (Web Service): webhook на PORT.

Переменные:
  BOT_TOKEN, WEBAPP_URL
  ADMIN_CHAT_ID (опц.) — чат/пользователь, куда приходят заявки из бота
  LAWYER_URL (опц.) — если не задан, кнопка ведёт в Telegram компании
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
WEBAPP_URL = os.environ.get("WEBAPP_URL", "").rstrip("/")
COMPANY_PHONE = "8 (800) 600 02 13"
COMPANY_TG = "https://t.me/pravoboitsa"
COMPANY_SITE = "http://xn----7sbbdd8b6acdk7e.xn--p1ai"  # Право-бойца.рф
COMPANY_SITE_LABEL = "Право-бойца.рф"
COMPANY_EMAIL = "1000@pboitsa.ru"
LAWYER_URL = os.environ.get("LAWYER_URL", "").strip() or COMPANY_TG


def _int_env(name: str) -> int:
    try:
        return int(os.environ.get(name, "0").strip() or 0)
    except ValueError:
        return 0


ADMIN_CHAT_ID = _int_env("ADMIN_CHAT_ID")

# Состояние воронки заявки и источник перехода (deep link).
# Хранится в памяти процесса: при перезапуске сервиса сбрасывается, ничего лишнего не копим.
LEADS: dict[int, dict] = {}
USER_SOURCE: dict[int, str] = {}

ROLES = {"mil": "Военнослужащий", "rel": "Родственник военнослужащего", "vet": "Ветеран или бывший военнослужащий", "oth": "Другое"}
TOPICS = {
    "wound": ("Ранение и выплаты", ["money-8", "money-4", "money-5"], "u98"),
    "vvk": ("ВВК и здоровье", ["health-1", "health-2", "health-4"], "vvk"),
    "fire": ("Увольнение и контракт", ["service-2", "service-4", "service-6"], "contract-end"),
    "pay": ("Довольствие и выплаты", ["money-1", "money-3", "money-9"], "pay"),
    "mia": ("Пропал без вести или гибель", ["emergency-1", "emergency-3", "emergency-2"], "dd-family"),
    "oth": ("Другое", ["legal-3", "legal-1"], None),
}
DOCS = {
    "none": "Документов нет",
    "report": "Рапорт подан, ответа нет",
    "refusal": "Получен отказ",
    "have": "Документы собраны",
}
DOCS_HINT = {
    "none": "Начните с рапорта: готовый шаблон есть в разделе «Документы». Подайте его под входящий номер или письмом с описью.",
    "report": "Если с подачи рапорта прошло 30 суток, переходите к жалобе военному прокурору (статья «Как подать жалобу военному прокурору»).",
    "refusal": "Сохраните отказ и требуйте письменное мотивированное решение: на нём строится жалоба и иск (статья «Лестница защиты»).",
    "have": "Проверьте, что в пакете есть подтверждение вручения: входящий номер или почтовая опись.",
}
URGENT = {"now": "Сегодня или завтра", "week": "На этой неделе", "calm": "Не срочно"}
URGENT_ICON = {"now": "🔴", "week": "🟡", "calm": "⚪"}
ARTICLE_TITLES = {
    "money-1": "Денежное довольствие", "money-3": "Выплаты при увольнении", "money-4": "Выплаты при ранении",
    "money-5": "Справки 100 и 98", "money-8": "Указ № 98: когда положена выплата", "money-9": "Порядок выплат по Указу № 98",
    "health-1": "ВВК: как проходить", "health-2": "Обжалование заключения ВВК", "health-4": "Независимая экспертиза",
    "service-2": "Контракт истёк, не увольняют", "service-4": "Основания увольнения в мобилизацию",
    "service-6": "Увольнение по здоровью: Д, В, Г", "emergency-1": "Пропал без вести: что делать семье",
    "emergency-2": "Гибель военнослужащего", "emergency-3": "Поиск и защита от мошенников",
    "legal-1": "Жалоба военному прокурору", "legal-3": "Лестница защиты",
}
TEMPLATE_TITLES = {
    "u98": "Шаблон: рапорт на выплату за ранение", "vvk": "Шаблон: рапорт на ВВК",
    "contract-end": "Шаблон: рапорт об увольнении", "pay": "Шаблон: рапорт о невыплате довольствия",
    "dd-family": "Шаблон: заявление о довольствии семье",
    "mia-pay": "Шаблон: жалоба прокурору о невыплате",
}
WEBHOOK_PATH = "/webhook"

# Шаблоны — регулярные выражения (границы слов, чтобы «нис» не находилось в «жизнь»).
HINTS: list[tuple[list[str], str]] = [
    (
        [r"ранен", r"увечь", r"травм", r"контуз"],
        "Выплаты при ранении — раздел «Деньги и выплаты»: статьи «Выплаты при ранении на СВО» и «Справки 100 и 98».",
    ),
    (
        [r"пропал", r"без вести", r"не выходит на связь", r"не на связи", r"нет связи"],
        "Если боец не на связи, откройте раздел «Экстренные ситуации» → «Военнослужащий пропал без вести»: первые шаги и куда писать.",
    ),
    (
        [r"\bввк\b", r"военно-врачеб", r"годност", r"медкомисс"],
        "ВВК и годность — раздел «Здоровье и комиссии». Соберите выписки до комиссии.",
    ),
    (
        [r"ипотек", r"\bнис\b", r"жиль", r"квартир"],
        "Жильё и НИС — раздел «Жильё и недвижимость».",
    ),
    (
        [r"рапорт", r"входящ", r"командир"],
        "Как написать рапорт и что делать, если номер не ставят, — раздел «Защита прав». В приложении есть готовые шаблоны рапортов и заявлений (раздел «Документы» на главной).",
    ),
    (
        [r"прокур", r"жалоб"],
        "Жалоба военному прокурору — раздел «Защита прав». Определить свой шаг поможет «Где вы сейчас» (кнопка «Ступени» на главной).",
    ),
    (
        [r"детск", r"\bсад\b", r"алимент", r"\bсемь", r"\bжен[аыуе]\b", r"вдов"],
        "Семья: пособия, дети, жильё после утраты — разделы «Семья и дети» и «Экстренные ситуации».",
    ),
    (
        [r"ветеран", r"льгот", r"увольн", r"контракт"],
        "Контракт и увольнение — раздел «Служба», статус и льготы — раздел «После службы».",
    ),
    (
        [r"довольств", r"оклад", r"не плат", r"зарплат", r"денежн"],
        "Денежное довольствие и перерасчёт — раздел «Деньги и выплаты».",
    ),
]


def main_keyboard() -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    if WEBAPP_URL:
        rows.append(
            [InlineKeyboardButton(text="Открыть ПравоБойца", web_app=WebAppInfo(url=WEBAPP_URL))]
        )
    rows.append(
        [
            InlineKeyboardButton(text="Оставить заявку", callback_data="lead"),
            InlineKeyboardButton(text="Написать юристу", url=LAWYER_URL),
        ]
    )
    rows.append([InlineKeyboardButton(text=COMPANY_SITE_LABEL, url=COMPANY_SITE)])
    rows.append([InlineKeyboardButton(text="Политика обработки данных", url=f"{WEBAPP_URL}/about" if WEBAPP_URL else COMPANY_SITE)])
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
        "«ПравоБоец» — навигатор по правам военнослужащих, военнообязанных и их близких.\n\n"
        "В приложении пошаговые маршруты: выплаты, ВВК, жильё, льготы, рапорты и защита прав. "
        "Тексты написаны простым языком, без канцелярита.\n\n"
        "Напишите вопрос своими словами, и я подскажу, где искать ответ. "
        "Например: «не приходит довольствие», «как пройти ВВК», «муж не на связи».\n\n"
        "Если ситуация сложная, нажмите «Оставить заявку»: четыре вопроса, и юрист свяжется с вами.\n\n"
        f"Телефон: {COMPANY_PHONE}\n\n"
        "Политика обработки данных: " + (f"{WEBAPP_URL}/about" if WEBAPP_URL else COMPANY_SITE) + "\n\n"
        "Материалы справочные и не заменяют очную консультацию."
    )


LEAD_CONSENT = (
    "Не присылайте паспортные данные, номера счетов и фото документов. "
    "Отправляя заявку, вы соглашаетесь, что мы обработаем её и ваш Telegram-контакт, "
    "чтобы ответить вам. Отменить: /cancel"
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
        "Опишите ситуацию в одном-двух предложениях или нажмите «Пропустить».\n\n" + LEAD_CONSENT,
        _kb([[("Пропустить", "lf:text:skip")]]),
    )


def waiting_keyboard(topic: str, docs: str = "none") -> InlineKeyboardMarkup:
    """Пока человек ждёт ответа: статьи по теме и шаблон документа."""
    _, article_ids, template_id = TOPICS.get(topic, TOPICS["oth"])
    # Семья пропавшего уже подала заявление в часть — полезнее жалоба прокурору.
    if topic == "mia" and docs in ("report", "refusal"):
        template_id = "mia-pay"
    rows: list[list[InlineKeyboardButton]] = []
    if WEBAPP_URL:
        for aid in article_ids:
            rows.append(
                [InlineKeyboardButton(text=ARTICLE_TITLES.get(aid, aid), web_app=WebAppInfo(url=f"{WEBAPP_URL}/article/{aid}"))]
            )
        if template_id:
            rows.append(
                [InlineKeyboardButton(text=TEMPLATE_TITLES.get(template_id, "Шаблон документа"), web_app=WebAppInfo(url=f"{WEBAPP_URL}/draft?t={template_id}"))]
            )
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

    async def cmd_start(message: Message, command: CommandObject) -> None:
        user = message.from_user
        payload = (command.args or "").strip()
        log.info("/start id=%s payload=%s", user.id if user else "?", payload[:40] or "-")
        if user and payload:
            USER_SOURCE[user.id] = payload[:64]

        # Глубокая ссылка на статью: t.me/<бот>?start=art_money-8
        m = re.fullmatch(r"art_([a-z]+-\d+)", payload)
        if m and WEBAPP_URL:
            await message.answer(
                "Открываю нужную статью. Если после чтения останутся вопросы, "
                "оставьте заявку или позвоните: " + COMPANY_PHONE,
                reply_markup=InlineKeyboardMarkup(
                    inline_keyboard=[
                        [
                            InlineKeyboardButton(
                                text="Читать статью",
                                web_app=WebAppInfo(url=f"{WEBAPP_URL}/article/{m.group(1)}"),
                            )
                        ],
                        [InlineKeyboardButton(text="Оставить заявку", callback_data="lead")],
                    ]
                ),
            )
            return

        text = start_text(user.first_name if user else None)
        if not WEBAPP_URL:
            text += "\n\n⚠️ Администратору: задайте переменную WEBAPP_URL."
        await message.answer(text, reply_markup=main_keyboard())

    async def cmd_contacts(message: Message) -> None:
        await message.answer(contacts_text(), reply_markup=main_keyboard())

    async def cmd_cancel(message: Message) -> None:
        if message.from_user:
            LEADS.pop(message.from_user.id, None)
        await message.answer("Отменил. Если понадобится помощь, нажмите «Оставить заявку».", reply_markup=main_keyboard())

    async def finish_lead(bot: Bot, user, text: str, reply_to: Message) -> None:
        data = LEADS.pop(user.id, {"a": {}})["a"]
        topic = data.get("topic", "oth")
        topic_title = TOPICS.get(topic, TOPICS["oth"])[0]
        urgent = data.get("urgent", "calm")
        docs_key = data.get("docs", "none")

        sent = False
        if ADMIN_CHAT_ID:
            username = f"@{user.username}" if user.username else "без username"
            try:
                await bot.send_message(
                    ADMIN_CHAT_ID,
                    f"{URGENT_ICON.get(urgent, '⚪')} Новая заявка из бота\n"
                    f"От: {user.full_name} ({username}), id {user.id}\n"
                    f"Кто: {ROLES.get(data.get('role', 'oth'), '-')}\n"
                    f"Тема: {topic_title}\n"
                    f"Документы: {DOCS.get(docs_key, '-')}\n"
                    f"Срочность: {URGENT.get(urgent, '-')}\n"
                    f"Источник: {USER_SOURCE.get(user.id, '-')}\n\n"
                    f"{text[:3000] or '(без описания)'}",
                )
                sent = True
            except Exception:
                log.exception("Failed to forward lead")
        else:
            log.warning("Lead received but ADMIN_CHAT_ID is not set")

        if sent:
            head = "Заявка принята. Мы свяжемся с вами в Telegram."
            if urgent == "now":
                head += f" Если вопрос срочный, позвоните: {COMPANY_PHONE}."
        else:
            head = f"Сейчас приём заявок в боте не работает. Позвоните нам: {COMPANY_PHONE}, или напишите в Telegram."
        await reply_to.answer(
            f"{head}\n\nПока ждёте ответа, вот что поможет прямо сейчас.\n\n{DOCS_HINT.get(docs_key, '')}",
            reply_markup=waiting_keyboard(topic, docs_key),
        )

    async def on_lead_button(call: CallbackQuery) -> None:
        await call.answer()
        LEADS[call.from_user.id] = {"step": "role", "a": {}}
        if call.message:
            q, kb = lead_question("role")
            await call.message.answer(q, reply_markup=kb)

    async def on_lead_answer(call: CallbackQuery) -> None:
        await call.answer()
        user = call.from_user
        parts = (call.data or "").split(":")
        if len(parts) != 3 or user.id not in LEADS or not call.message:
            return
        _, key, val = parts
        state = LEADS[user.id]
        if key == "text":
            await finish_lead(call.message.bot, user, "", call.message)
            return
        state["a"][key] = val
        order = ["role", "topic", "docs", "urgent", "text"]
        nxt = order[order.index(key) + 1] if key in order else "text"
        state["step"] = nxt
        q, kb = lead_question(nxt)
        await call.message.answer(q, reply_markup=kb)

    async def on_text(message: Message) -> None:
        body = (message.text or "").strip()
        user = message.from_user
        if not body or not user:
            return

        state = LEADS.get(user.id)
        if state and state.get("step") == "text":
            await finish_lead(message.bot, user, body, message)
            return
        if state:
            q, kb = lead_question(state["step"])
            await message.answer("Выберите вариант кнопкой.\n\n" + q, reply_markup=kb)
            return

        log.info("text hint query len=%s", len(body))
        hint = match_hint(body)
        if hint:
            await message.answer(
                f"{hint}\n\nПолный текст и чек-листы есть в приложении. "
                "Если нужен разбор вашей ситуации, нажмите «Оставить заявку».",
                reply_markup=main_keyboard(),
            )
            return
        await message.answer(
            "Точного совпадения не нашёл. Откройте «ПравоБойца» и воспользуйтесь поиском "
            "внутри приложения или задайте вопрос короче: выплата, ВВК, жильё, рапорт, пропал.\n\n"
            "Если нужен ответ юриста по вашему случаю, нажмите «Оставить заявку».",
            reply_markup=main_keyboard(),
        )

    dp.message.register(cmd_start, CommandStart())
    dp.message.register(cmd_contacts, Command("contacts"))
    dp.message.register(cmd_cancel, Command("cancel"))
    dp.callback_query.register(on_lead_button, F.data == "lead")
    dp.callback_query.register(on_lead_answer, F.data.startswith("lf:"))
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
    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()


def run_webhook(bot: Bot, dp: Dispatcher) -> None:
    base = webhook_base()
    if not base:
        raise SystemExit(
            "Задайте WEBHOOK_BASE=https://pravoboytsa-bot.onrender.com"
        )
    port = int(os.environ.get("PORT", "10000"))
    webhook_url = f"{base}{WEBHOOK_PATH}"

    async def on_startup(app: web.Application) -> None:
        # Не удаляем webhook при рестартах Render — иначе Telegram теряет доставку.
        await bot.set_webhook(
            url=webhook_url,
            drop_pending_updates=False,
            allowed_updates=["message", "callback_query"],
        )
        info = await bot.get_webhook_info()
        log.info("Webhook set: %s (pending=%s)", info.url, info.pending_update_count)

    async def on_shutdown(app: web.Application) -> None:
        # Важно: НЕ вызываем delete_webhook — при Timed Out/рестарте Render
        # webhook должен остаться, иначе бот «молчит» до следующего удачного старта.
        log.info("Shutdown: closing bot session (webhook kept)")
        await bot.session.close()

    async def health(_request: web.Request) -> web.Response:
        return web.Response(text="ok")

    app = web.Application()
    app.router.add_get("/", health)
    app.router.add_get("/health", health)
    SimpleRequestHandler(
        dispatcher=dp,
        bot=bot,
    ).register(app, path=WEBHOOK_PATH)
    setup_application(app, dp, bot=bot)
    app.on_startup.append(on_startup)
    app.on_shutdown.append(on_shutdown)

    log.info("Starting webhook server 0.0.0.0:%s url=%s", port, webhook_url)
    web.run_app(app, host="0.0.0.0", port=port, print=lambda *a, **k: None)


def main() -> None:
    if not BOT_TOKEN:
        raise SystemExit("Задайте BOT_TOKEN")
    bot = Bot(BOT_TOKEN)
    dp = build_dispatcher()

    if os.environ.get("PORT") or webhook_base():
        if not webhook_base():
            raise SystemExit(
                "Задайте WEBHOOK_BASE=https://pravoboytsa-bot.onrender.com"
            )
        run_webhook(bot, dp)
    else:
        asyncio.run(run_polling(bot, dp))


if __name__ == "__main__":
    main()
