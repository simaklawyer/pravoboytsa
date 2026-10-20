import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const contacts = [
  {
    title: 'Горячая линия Минобороны',
    value: '8 800 100-77-07',
    hint: 'Круглосуточно. Не заменяет письменное обращение.',
    href: 'tel:88001007707',
  },
  {
    title: 'Горячая линия СФР (пенсии, выплаты)',
    value: '8 800 100-00-01',
    hint: 'Общие вопросы по социальным выплатам.',
    href: 'tel:88001000001',
  },
]

export default function Contacts() {
  return (
    <div className="min-h-full pb-24 safe-top">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-semibold">Контакты</h1>
        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
          Публичные линии. Военную прокуратуру и военкомат ищите по своему региону на официальных сайтах.
        </p>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {contacts.map((c) => (
          <a
            key={c.title}
            href={c.href}
            className="card p-4 block hover:border-accent/30 transition-all"
          >
            <div className="text-sm text-text-muted">{c.title}</div>
            <div className="text-lg font-semibold text-accent mt-1">{c.value}</div>
            <div className="text-sm text-text-secondary mt-2">{c.hint}</div>
          </a>
        ))}

        <div className="card p-4">
          <div className="font-medium">Военная прокуратура</div>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            Адрес и интернет-приёмную гарнизонной / окружной прокуратуры смотрите на сайте
            военной прокуратуры вашего региона. Жалобу лучше подавать с копией рапорта и
            подтверждением вручения.
          </p>
          <Link to="/article/legal-1" className="text-sm text-accent mt-3 inline-block">
            Как писать жалобу →
          </Link>
        </div>

        <div className="card p-4">
          <div className="font-medium">Военкомат по месту жительства</div>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            Для семьи: поиск, выплаты, статус. Телефон и приёмные дни — на сайте субъекта РФ
            или в справочнике военкоматов.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
