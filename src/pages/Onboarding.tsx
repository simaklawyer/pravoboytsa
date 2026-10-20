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
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-11 h-11 rounded-2xl bg-accent/20 border border-accent/25
                          flex items-center justify-center text-xl shadow-glow">
            🛡️
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">ПравоБойца</h1>
            <p className="text-sm text-text-secondary">Навигатор прав военнослужащих</p>
          </div>
        </div>

        <h2 className="text-[26px] font-semibold mt-8 leading-tight tracking-tight">
          Кто вы?
        </h2>
        <p className="text-text-secondary mt-2 text-[15px] leading-relaxed max-w-[320px]">
          Выберите один раз — приложение поднимет вверх то, что нужно именно вам.
        </p>
      </motion.div>

      <div className="flex flex-col gap-2.5 flex-1">
        {roles.map((role, index) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.06 * index }}
            onClick={() => handleSelect(role.id)}
            className="card p-4 flex items-center gap-4 text-left
                       hover:border-accent/40 active:scale-[0.98]
                       transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center text-2xl
                            group-hover:bg-accent/15 transition-colors shrink-0">
              {role.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[15.5px]">{role.title}</div>
              <div className="text-sm text-text-secondary mt-0.5">
                {role.description}
              </div>
            </div>
            <div className="text-text-muted group-hover:text-accent transition-colors text-lg">
              →
            </div>
          </motion.button>
        ))}
      </div>

      <p className="text-center text-xs text-text-muted mt-7">
        Выбор можно изменить позже в профиле
      </p>
    </div>
  )
}
