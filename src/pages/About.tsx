import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { company } from '../data/company'

export default function About() {
  return (
    <div className="min-h-full pb-24 safe-top">
      <div className="px-5 pt-6 pb-4">
        <Link to="/profile" className="text-sm text-accent">← Профиль</Link>
        <h1 className="text-xl font-semibold mt-3">О компании и связь</h1>
        <p className="text-sm text-text-secondary mt-2 leading-relaxed">
          «ПравоБоец» помогает разобраться в правах военнослужащих и их семей. Материалы справочные.
          В сложной ситуации обсудите документы с юристом.
        </p>
      </div>

      <section className="px-5 mb-6">
        <h2 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">Контакты</h2>
        <div className="card divide-y divide-border overflow-hidden">
          <a className="block px-4 py-3.5" href={company.phoneHref}>Телефон: {company.phone}</a>
          <a className="block px-4 py-3.5" href={company.telegram}>Telegram: {company.telegramHandle}</a>
          <a className="block px-4 py-3.5" href={company.siteHref} target="_blank" rel="noreferrer">
            Сайт: {company.siteLabel}
          </a>
          <a className="block px-4 py-3.5" href={company.emailHref}>Почта: {company.email}</a>
        </div>
        <p className="text-xs text-text-muted mt-3 leading-relaxed">
          Для личной связи по делу пишите в Telegram {company.telegramHandle}. Информационные публикации
          в каналах не заменяют переписку с юристом.
        </p>
      </section>

      <section className="px-5 mb-6">
        <div className="rounded-xl bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent-light leading-relaxed">
          Приложение не собирает персональные данные для учёта или маркетинга. Материалы носят
          справочный характер и не являются юридической консультацией.
        </div>
      </section>

      <BottomNav />
    </div>
  )
}
