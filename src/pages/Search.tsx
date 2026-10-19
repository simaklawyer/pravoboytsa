import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { articles } from '../data/sections'
import BottomNav from '../components/BottomNav'

const popularQueries = [
  'не платят за ранение',
  'муж пропал без вести',
  'как пройти ВВК',
  'детский сад без очереди',
  'жалоба военному прокурору',
  'статус ветерана боевых действий',
  'права срочника',
  'расторжение контракта',
  'выплаты вдове',
]

export default function Search() {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.summary.toLowerCase().includes(query.toLowerCase()) ||
          a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : []

  return (
    <div className="min-h-full pb-24 safe-top">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-semibold mb-4">Поиск</h1>

        <div className="card flex items-center gap-3 px-4 py-3.5">
          <span className="text-text-muted">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Например: не платят за ранение"
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-text-muted"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-text-muted text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {!query && (
        <div className="px-5">
          <h2 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">
            Популярные запросы
          </h2>
          <div className="flex flex-col gap-1">
            {popularQueries.map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="text-left px-3 py-2.5 rounded-xl text-[15px]
                           text-text-secondary hover:bg-bg-elevated hover:text-text-primary
                           transition-colors"
              >
                ↗ {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {query && (
        <div className="px-5">
          {filtered.length === 0 ? (
            <div className="card p-6 text-center">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-text-secondary text-sm">
                Ничего не найдено по запросу «{query}»
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-text-muted mb-1">
                Найдено: {filtered.length}
              </p>
              {filtered.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                >
                  <Link
                    to={`/article/${article.id}`}
                    className="card p-4 block hover:border-accent/30 transition-all"
                  >
                    <div className="font-medium text-[15px]">{article.title}</div>
                    <div className="text-sm text-text-secondary mt-1">
                      {article.summary}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
