import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { sections } from '../data/sections'
import BottomNav from '../components/BottomNav'

const roleLabels: Record<string, string> = {
  contract: 'Контрактник',
  svo: 'Участник СВО',
  relative: 'Близкий родственник',
  veteran: 'Ветеран',
  conscript: 'Срочная служба',
}

const quickActions = [
  { id: 'money', title: 'Выплаты и компенсации', subtitle: 'Что положено и как получить', icon: '💰' },
  { id: 'housing', title: 'Жильё и ипотека', subtitle: 'НИС, субсидии, служебное', icon: '🏠' },
  { id: 'health', title: 'Здоровье и ВВК', subtitle: 'Комиссии, лечение, ранения', icon: '🏥' },
  { id: 'emergency', title: 'Экстренные ситуации', subtitle: 'Пропал, плен, гибель', icon: '🚨' },
]

export default function Home() {
  const role = useUserStore((s) => s.role)

  return (
    <div className="min-h-full pb-24 safe-top">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="text-sm text-text-secondary">ПравоБойца</div>
            <h1 className="text-xl font-semibold mt-0.5">
              {role ? roleLabels[role] : 'Гость'}
            </h1>
          </div>
          <Link
            to="/profile"
            className="w-10 h-10 rounded-full bg-bg-elevated border border-border
                       flex items-center justify-center text-lg"
          >
            👤
          </Link>
        </motion.div>
      </div>

      {/* Search bar */}
      <div className="px-5 mb-6">
        <Link to="/search" className="card flex items-center gap-3 px-4 py-3.5 block">
          <span className="text-text-muted">🔍</span>
          <span className="text-text-muted text-[15px]">Что вас интересует?</span>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-8">
        <h2 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">
          Быстрые действия
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
            >
              <Link
                to={`/section/${action.id}`}
                className="card p-4 text-left hover:border-accent/30 active:scale-[0.98] transition-all block h-full"
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="font-medium text-[14px] leading-snug">{action.title}</div>
                <div className="text-xs text-text-muted mt-1">{action.subtitle}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            Все разделы
          </h2>
          <Link to="/sections" className="text-sm text-accent">
            Смотреть все
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          {sections.slice(0, 5).map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i }}
            >
              <Link
                to={`/section/${section.id}`}
                className="card p-4 flex items-center gap-3.5 text-left
                           hover:border-accent/30 active:scale-[0.99] transition-all block"
              >
                <div className="w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center text-xl">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[15px]">{section.title}</div>
                  <div className="text-xs text-text-muted mt-0.5">{section.count} материалов</div>
                </div>
                <div className="text-text-muted">→</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom note */}
      <div className="px-5 mt-8 mb-4">
        <div className="rounded-xl bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent-light">
          🔒 Мы не собираем персональные данные. Только анонимная статистика просмотров.
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
