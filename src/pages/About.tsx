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
          <a className="block px-4 py-3.5" href={company.siteHref} target="_blank" rel="noreferrer">Сайт: {company.siteLabel}</a>
          <a className="block px-4 py-3.5" href={company.emailHref}>Электронная почта: {company.email}</a>
        </div>
      </section>

      <section className="px-5">
        <h2 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">Политика обработки персональных данных для бота</h2>
        <div className="card p-4 text-sm text-text-secondary leading-relaxed space-y-3">
          <p><strong className="text-text-primary">Оператор:</strong> ________________________________.</p>
          <p>Бот может получить от вас имя, Telegram-контакт и текст заявки.</p>
          <p>Цель обработки — ответить на ваше обращение и связаться по вопросу, который вы описали.</p>
          <p>Состояние диалога хранится только в памяти работающего бота и сбрасывается после его перезапуска. Не присылайте паспортные данные, номера счетов и фотографии документов.</p>
          <p>Для вопросов об обработке данных напишите оператору по контактам выше.</p>
        </div>
      </section>

      <BottomNav />
    </div>
  )
}
