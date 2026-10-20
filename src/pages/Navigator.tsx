import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { stages } from '../data/stages'
import { articles } from '../data/sections'
import BottomNav from '../components/BottomNav'

export default function Navigator() {
  const [stage, setStage] = useState(0)
  const current = stages.find((s) => s.id === stage) ?? stages[0]
  const links = current.articles
    .map((id) => articles.find((a) => a.id === id))
    .filter(Boolean)

  return (
    <div className="min-h-full pb-24 safe-top">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-semibold">Где вы сейчас</h1>
        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
          Выберите ступень. Дальше — ближайший шаг, без прыжка через предыдущие.
        </p>
      </div>

      <div className="px-5 flex flex-col gap-2">
        {stages.map((item, i) => {
          const on = item.id === stage
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              type="button"
              onClick={() => setStage(item.id)}
              className={`card p-3.5 text-left transition-all
                ${on ? 'border-accent/50 bg-accent/10' : 'hover:border-border-light'}`}
            >
              <div className="text-xs text-text-muted">Ступень {item.id}</div>
              <div className="font-medium text-[15px] mt-0.5">{item.title}</div>
            </motion.button>
          )
        })}
      </div>

      <div className="px-5 mt-5">
        <div className="card p-4">
          <div className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Признак
          </div>
          <p className="text-sm mt-2 leading-relaxed">{current.sign}</p>
          <div className="text-xs font-medium text-text-muted uppercase tracking-wider mt-4">
            Следующий шаг
          </div>
          <p className="text-sm mt-2 leading-relaxed">{current.next}</p>
          <div className="mt-4 flex flex-col gap-2">
            {links.map((article) =>
              article ? (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  className="text-sm font-medium text-accent"
                >
                  {article.title}
                </Link>
              ) : null
            )}
            <Link to="/case" className="text-sm text-text-secondary">
              Записать ступень в «Моё дело» →
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
