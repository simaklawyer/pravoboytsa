/** Контакты компании. Один источник для всех экранов приложения. */
export const company = {
  name: 'ПравоБойца',
  phone: '8 (800) 600 02 13',
  phoneHref: 'tel:88006000213',
  telegram: 'https://t.me/pravoboitsa',
  telegramHandle: '@pravoboitsa',
  siteLabel: 'право-бойца.рф',
  // ASCII/punycode-форма стабильнее открывается на телефонах и в Telegram.
  siteHref: 'https://xn----7sbbdd8b6acdk7e.xn--p1ai',
  email: '1000@pboitsa.ru',
  emailHref: 'mailto:1000@pboitsa.ru',
} as const
// build verified 2026-11-09
