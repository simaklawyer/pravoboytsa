import type { MouseEvent } from 'react'
import { company } from '../data/company'

/** Внутри Telegram ссылки лучше открывать средствами Mini App. */
function openExternal(e: MouseEvent<HTMLAnchorElement>, url: string) {
  const tg = (window as any).Telegram?.WebApp
  if (!tg || url.startsWith('tel:') || url.startsWith('mailto:')) return
  e.preventDefault()
  if (url.startsWith('https://t.me/') && tg.openTelegramLink) tg.openTelegramLink(url)
  else if (tg.openLink) tg.openLink(url)
  else window.open(url, '_blank')
}

const rows = [
  { icon: '📞', label: 'Телефон', value: company.phone, href: company.phoneHref },
  { icon: '✈️', label: 'Telegram', value: company.telegramHandle, href: company.telegram },
  { icon: '🌐', label: 'Сайт', value: company.siteLabel, href: company.siteHref },
  { icon: '✉️', label: 'Почта', value: company.email, href: company.emailHref },
]

/** Полная карточка со всеми контактами. */
export function CompanyCard({ title = 'Связаться с нами' }: { title?: string }) {
  return (
    <div className="card p-4">
      <div className="font-medium">{title}</div>
      <p className="text-sm text-text-secondary mt-1 leading-relaxed">
        Если ситуация сложная или вы не уверены, с чего начать, напишите или позвоните нам.
      </p>
      <div className="mt-3 divide-y divide-border">
        {rows.map((r) => (
          <a
            key={r.label}
            href={r.href}
            onClick={(e) => openExternal(e, r.href)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 py-3"
          >
            <span className="text-lg w-6 text-center">{r.icon}</span>
            <span className="flex-1">
              <span className="block text-xs text-text-muted">{r.label}</span>
              <span className="block text-[15px] font-medium text-accent">{r.value}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

/** Короткий призыв внизу статьи или на главной: две кнопки. */
export function CompanyCta({ text = 'Нужна помощь юриста по вашей ситуации?' }: { text?: string }) {
  return (
    <div className="card p-4">
      <div className="text-[15px] font-medium leading-snug">{text}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href={company.phoneHref} className="btn-primary text-center text-sm !px-3">
          Позвонить
        </a>
        <a
          href={company.telegram}
          onClick={(e) => openExternal(e, company.telegram)}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary text-center text-sm !px-3"
        >
          Написать в Telegram
        </a>
      </div>
      <div className="mt-2 text-xs text-text-muted">{company.phone}</div>
    </div>
  )
}
