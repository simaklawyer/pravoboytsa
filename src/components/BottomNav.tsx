import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/home', label: 'Главная', icon: '🏠' },
  { to: '/sections', label: 'Разделы', icon: '📋' },
  { to: '/search', label: 'Поиск', icon: '🔍' },
  { to: '/profile', label: 'Профиль', icon: '👤' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50
                    bg-bg-secondary/90 backdrop-blur-xl
                    border-t border-border
                    safe-bottom">
      <div className="flex items-center justify-around h-[64px] max-w-lg mx-auto px-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-0.5
               w-[72px] h-12 rounded-2xl transition-all duration-200
               ${isActive
                 ? 'text-accent'
                 : 'text-text-muted active:text-text-secondary'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-0 rounded-2xl bg-accent/12" />
                )}
                <span className="relative text-[20px] leading-none">{tab.icon}</span>
                <span className="relative text-[10px] font-medium tracking-wide">
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
