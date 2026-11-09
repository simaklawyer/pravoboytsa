import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { CompanyCard } from '../components/CompanyCard'

const contacts = [
  {
    title: 'Горячая линия Минобороны для родственников',
    value: '8 800 100-77-07',
    hint: 'Круглосуточно: сведения о местонахождении военнослужащих и общая информация. Дополнительные номера: 8 (495) 498-43-54 и 8 (495) 498-34-46. Не заменяет письменное обращение; если не дозвонились, пишите в часть.',
    href: 'tel:88001007707',
  },
  {
    title: 'Горячая линия СФР (пенсии, выплаты)',
    value: '8 800 100-00-01',
    hint: 'Единый контакт-центр Социального фонда: пенсии, ЕДВ, пособия. Звонок бесплатный.',
    href: 'tel:88001000001',
  },
  {
    title: 'Контакт-центр ФНС (налоги, блокировка счёта)',
    value: '8 800 222-22-22',
    hint: 'Если счёт заблокирован за налоговый долг. Порядок для участников СВО — в статье «Долги по налогам».',
    href: 'tel:88002222222',
  },
]

export default function Contacts() {
  return (
    <div className="min-h-full pb-24 safe-top">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-semibold">Контакты</h1>
        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
          Общие линии. Номера иногда меняются, поэтому при сомнении сверьтесь с официальным сайтом.
          Военную прокуратуру и военкомат ищите по своему региону.
        </p>
      </div>

      <div className="px-5 flex flex-col gap-3">
        <CompanyCard />

        <h2 className="text-sm font-medium text-text-secondary mt-3 uppercase tracking-wider">
          Государственные линии
        </h2>

        {contacts.map((c) => (
          <a
            key={c.title}
            href={c.href}
            className="card p-4 block hover:border-accent/30 transition-all"
          >
            <div className="text-sm text-text-muted">{c.title}</div>
            <div className="text-lg font-semibold text-accent mt-1">{c.value}</div>
            <div className="text-sm text-text-secondary mt-2 leading-relaxed">{c.hint}</div>
          </a>
        ))}

        <div className="card p-4">
          <div className="font-medium">Военная прокуратура</div>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            Адрес и интернет-приёмную гарнизонной или окружной прокуратуры смотрите на сайте
            военной прокуратуры вашего региона. Подавайте жалобу с копией рапорта и
            подтверждением его вручения.
          </p>
          <Link to="/article/legal-1" className="text-sm text-accent mt-3 inline-block">
            Как написать жалобу →
          </Link>
        </div>

        <div className="card p-4">
          <div className="font-medium">Военкомат по месту жительства</div>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            Обращается семья: поиск, выплаты, справки, статус. Телефон и приёмные дни — на сайте
            вашего региона или в справочнике военкоматов.
          </p>
        </div>

        <div className="card p-4">
          <div className="font-medium">Уполномоченный по правам человека</div>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            Онлайн-приёмная ФГИС УПЧ и личный приём в Москве.
          </p>
          <Link to="/article/legal-4" className="text-sm text-accent mt-3 inline-block">
            Как обратиться →
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
