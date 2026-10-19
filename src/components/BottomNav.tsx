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
                    bg-bg-secondary/95 backdrop-blur-md
                    border-t border-border
                    safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 w-16 py-1.5 rounded-xl
               transition-colors duration-200
               ${isActive
                 ? 'text-accent'
                 : 'text-text-muted hover:text-text-secondary'}`
            }
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-[11px] font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
