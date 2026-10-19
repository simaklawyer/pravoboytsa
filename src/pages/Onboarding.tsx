import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUserStore, Role } from '../store/userStore'

const roles: { id: Role; title: string; description: string; icon: string }[] = [
  {
    id: 'contract',
    title: 'Контрактник',
    description: 'Права, довольствие, отпуска, ВВК',
    icon: '🪖',
  },
  {
    id: 'svo',
    title: 'Участник СВО / мобилизованный',
    description: 'Выплаты, ранения, защита, льготы',
    icon: '⭐',
  },
  {
    id: 'relative',
    title: 'Жена, мать, близкий',
    description: 'Поиск, пособия, жильё, дети',
    icon: '❤️',
  },
  {
    id: 'veteran',
    title: 'Ветеран / уволенный',
    description: 'Статус, пенсия, льготы, работа',
    icon: '🎗️',
  },
  {
    id: 'conscript',
    title: 'Срочник или родители',
    description: 'Права, перевод, дедовщина, дембель',
    icon: '🪂',
  },
]

export default function Onboarding() {
  const setRole = useUserStore((s) => s.setRole)
  const navigate = useNavigate()

  const handleSelect = (role: Role) => {
    setRole(role)
    navigate('/home')
  }

  return (
    <div className="min-h-full flex flex-col px-5 pt-10 pb-8 safe-top safe-bottom">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl">
            🛡️
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">ПравоБойца</h1>
            <p className="text-sm text-text-secondary">Навигатор прав военнослужащих</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-6 leading-tight">
          Кто вы?
        </h2>
        <p className="text-text-secondary mt-2 text-[15px] leading-relaxed">
          Выберите один раз — приложение покажет именно то, что нужно вам.
        </p>
      </motion.div>

      {/* Role cards */}
      <div className="flex flex-col gap-3 flex-1">
        {roles.map((role, index) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 * index }}
            onClick={() => handleSelect(role.id)}
            className="card p-4 flex items-center gap-4 text-left
                       hover:border-accent/40 active:scale-[0.98]
                       transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center text-2xl
                            group-hover:bg-accent/15 transition-colors">
              {role.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[16px]">{role.title}</div>
              <div className="text-sm text-text-secondary mt-0.5 truncate">
                {role.description}
              </div>
            </div>
            <div className="text-text-muted group-hover:text-accent transition-colors">
              →
            </div>
          </motion.button>
        ))}
      </div>

      <p className="text-center text-xs text-text-muted mt-6">
        Выбор можно изменить позже в профиле
      </p>
    </div>
  )
}
