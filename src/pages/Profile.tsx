import { useNavigate } from 'react-router-dom'
import { useUserStore, Role } from '../store/userStore'
import BottomNav from '../components/BottomNav'

const roleLabels: Record<string, { title: string; icon: string }> = {
  contract: { title: 'Контрактник', icon: '🪖' },
  svo: { title: 'Участник СВО / мобилизованный', icon: '⭐' },
  relative: { title: 'Жена, мать, близкий', icon: '❤️' },
  veteran: { title: 'Ветеран / уволенный', icon: '🎗️' },
  conscript: { title: 'Срочник или родители', icon: '🪂' },
}

const roles: Role[] = ['contract', 'svo', 'relative', 'veteran', 'conscript']

export default function Profile() {
  const { role, setRole, reset } = useUserStore()
  const navigate = useNavigate()

  const current = role ? roleLabels[role] : null

  return (
    <div className="min-h-full pb-24 safe-top">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-semibold">Профиль</h1>
      </div>

      {/* Current role */}
      <div className="px-5 mb-6">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center text-3xl">
            {current?.icon || '👤'}
          </div>
          <div>
            <div className="text-sm text-text-secondary">Ваша роль</div>
            <div className="font-semibold text-lg mt-0.5">
              {current?.title || 'Не выбрана'}
            </div>
          </div>
        </div>
      </div>

      {/* Change role */}
      <div className="px-5 mb-6">
        <h2 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">
          Сменить роль
        </h2>
        <div className="flex flex-col gap-2">
          {roles.map((r) => {
            const info = roleLabels[r!]
            const isActive = role === r
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`card p-3.5 flex items-center gap-3 text-left transition-all
                  ${isActive ? 'border-accent/50 bg-accent/5' : 'hover:border-border-light'}`}
              >
                <span className="text-xl">{info.icon}</span>
                <span className="flex-1 font-medium text-[15px]">{info.title}</span>
                {isActive && <span className="text-accent text-sm">✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 mb-6">
        <h2 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">
          Действия
        </h2>
        <div className="card divide-y divide-border">
          <button
            onClick={() => {
              reset()
              navigate('/')
            }}
            className="w-full px-4 py-3.5 text-left text-[15px] text-red-400 hover:bg-bg-elevated transition-colors"
          >
            Сбросить и выбрать роль заново
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-5">
        <div className="rounded-xl bg-bg-elevated border border-border px-4 py-3 text-sm text-text-secondary leading-relaxed">
          🔒 ПравоБойца не собирает имя, телефон или Telegram-аккаунт.
          Мы видим только анонимную статистику открытых статей.
        </div>
        <p className="text-center text-xs text-text-muted mt-4">
          База знаний · справочный характер
        </p>
      </div>

      <BottomNav />
    </div>
  )
}
