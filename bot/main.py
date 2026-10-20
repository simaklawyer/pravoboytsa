"""
ПравоБойца — минимальный Telegram-бот (aiogram 3.x).

Открывает Mini App по кнопке. Токен и URL — только из переменных окружения.

Запуск:
  export BOT_TOKEN=...
  export WEBAPP_URL=https://your-host.example
  pip install -r requirements.txt
  python main.py
"""

from __future__ import annotations

import asyncio
import os

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
WEBAPP_URL = os.environ.get("WEBAPP_URL", "").rstrip("/")


def open_app_keyboard() -> InlineKeyboardMarkup | None:
    if not WEBAPP_URL:
        return None
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Открыть ПравоБойца",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        ]
    )


async def cmd_start(message: Message) -> None:
    kb = open_app_keyboard()
    text = (
        "ПравоБойца — справочник по правам военнослужащих и семей.\n\n"
        "Выберите роль, откройте раздел или отметьте ступень своего дела. "
        "Материалы справочные, не заменяют консультацию юриста."
    )
    if kb is None:
        text += "\n\n(Администратор: задайте WEBAPP_URL в окружении.)"
    await message.answer(text, reply_markup=kb)


async def main() -> None:
    if not BOT_TOKEN:
        raise SystemExit("Задайте BOT_TOKEN")
    bot = Bot(BOT_TOKEN)
    dp = Dispatcher()
    dp.message.register(cmd_start, CommandStart())
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
