"""
ПравоБойца — Telegram-бот (aiogram 3.x).

/start — приветствие с именем, две кнопки (Mini App + юрист).
Свободный текст — подсказки по ключевым словам к разделам приложения.

Запуск:
  export BOT_TOKEN=...
  export WEBAPP_URL=https://pravoboytsa.vercel.app
  export LAWYER_URL=https://t.me/username   # опционально: «Спросить юриста»
  pip install -r requirements.txt
  python main.py
"""

from __future__ import annotations

import asyncio
import os
import re

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
WEBAPP_URL = os.environ.get("WEBAPP_URL", "").rstrip("/")
LAWYER_URL = os.environ.get("LAWYER_URL", "").strip()

# Подсказки для свободного поиска (ключ → ответ). Не дублируют чужие формулировки.
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


async def cmd_start(message: Message) -> None:
    user = message.from_user
    name = user.first_name if user else None
    text = start_text(name)
    if not WEBAPP_URL:
        text += "\n\n⚠️ Администратору: задайте WEBAPP_URL."
    await message.answer(text, reply_markup=main_keyboard())


async def on_ask_lawyer(callback: CallbackQuery) -> None:
    await callback.answer()
    await callback.message.answer(
        "Напишите кратко: кто вы (военный / родственник), суть проблемы "
        "и что уже пробовали сделать. Передадим запрос юристу.\n\n"
        "Либо укажите в настройках бота LAWYER_URL (ссылка на чат/форму) — "
        "тогда кнопка откроет его сразу."
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


async def main() -> None:
    if not BOT_TOKEN:
        raise SystemExit("Задайте BOT_TOKEN")
    bot = Bot(BOT_TOKEN)
    dp = Dispatcher()
    dp.message.register(cmd_start, CommandStart())
    dp.callback_query.register(on_ask_lawyer, F.data == "ask_lawyer")
    dp.message.register(on_text, F.text)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
