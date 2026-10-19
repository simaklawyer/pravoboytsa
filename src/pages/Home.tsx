import { motion } from 'framer-motion'
import { useUserStore } from '../store/userStore'

const roleLabels: Record<string, string> = {
  contract: 'Контрактник',
  svo: 'Участник СВО',
  relative: 'Близкий родственник',
  veteran: 'Ветеран',
  conscript: 'Срочная служба',
}

const quickActions = [
  { id: '1', title: 'Выплаты и компенсации', subtitle: 'Что положено и как получить', icon: '💰' },
  { id: '2', title: 'Жильё и ипотека', subtitle: 'НИС, субсидии, служебное', icon: '🏠' },
  { id: '3', title: 'Здоровье и ВВК', subtitle: 'Комиссии, лечение, ранения', icon: '🏥' },
  { id: '4', title: 'Экстренные ситуации', subtitle: 'Пропал, плен, гибель', icon: '🚨' },
]

const sections = [
  { id: 'money', title: 'Деньги и выплаты', count: 14, icon: '💰' },
  { id: 'housing', title: 'Жильё и недвижимость', count: 9, icon: '🏠' },
  { id: 'health', title: 'Здоровье и комиссии', count: 11, icon: '🏥' },
  { id: 'family', title: 'Семья и дети', count: 10, icon: '👨‍👩‍👧' },
  { id: 'legal', title: 'Защита прав', count: 13, icon: '⚖️' },
  { id: 'service', title: 'Служба', count: 10, icon: '🪖' },
  { id: 'after', title: 'После службы', count: 9, icon: '🎗️' },
  { id: 'emergency', title: 'Экстренные ситуации', count: 8, icon: '🔍' },
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
          <button className="w-10 h-10 rounded-full bg-bg-elevated border border-border
                             flex items-center justify-center text-lg">
            👤
          </button>
        </motion.div>
      </div>

      {/* Search bar */}
      <div className="px-5 mb-6">
        <div className="card flex items-center gap-3 px-4 py-3.5">
          <span className="text-text-muted">🔍</span>
          <span className="text-text-muted text-[15px]">Что вас интересует?</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-8">
        <h2 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">
          Быстрые действия
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              className="card p-4 text-left hover:border-accent/30 active:scale-[0.98] transition-all"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="font-medium text-[14px] leading-snug">{action.title}</div>
              <div className="text-xs text-text-muted mt-1">{action.subtitle}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="px-5">
        <h2 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">
          Все разделы
        </h2>
        <div className="flex flex-col gap-2.5">
          {sections.map((section, i) => (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i }}
              className="card p-4 flex items-center gap-3.5 text-left
                         hover:border-accent/30 active:scale-[0.99] transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center text-xl">
                {section.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-[15px]">{section.title}</div>
                <div className="text-xs text-text-muted mt-0.5">{section.count} материалов</div>
              </div>
              <div className="text-text-muted">→</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom note */}
      <div className="px-5 mt-8 mb-4">
        <div className="rounded-xl bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent-light">
          🔒 Мы не собираем персональные данные. Только анонимная статистика просмотров.
        </div>
      </div>
    </div>
  )
}
