import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { sections, articles } from '../data/sections'
import BottomNav from '../components/BottomNav'

export default function SectionDetail() {
  const { id } = useParams<{ id: string }>()
  const section = sections.find((s) => s.id === id)
  const sectionArticles = articles.filter((a) => a.sectionId === id)

  if (!section) {
    return (
      <div className="min-h-full flex items-center justify-center px-5">
        <div className="text-center">
          <div className="text-4xl mb-3">😕</div>
          <p className="text-text-secondary">Раздел не найден</p>
          <Link to="/sections" className="text-accent mt-4 inline-block">
            ← Вернуться к разделам
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-24 safe-top">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <Link to="/sections" className="text-sm text-accent mb-3 inline-block">
          ← Все разделы
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <div className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center text-2xl">
            {section.icon}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{section.title}</h1>
            <p className="text-sm text-text-secondary">{section.description}</p>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="px-5">
        {sectionArticles.length === 0 ? (
          <div className="card p-6 text-center">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-text-secondary text-sm">
              Материалы этого раздела скоро появятся
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sectionArticles.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  to={`/article/${article.id}`}
                  className="card p-4 block hover:border-accent/30 active:scale-[0.99] transition-all"
                >
                  <div className="font-medium text-[15px] leading-snug">
                    {article.title}
                  </div>
                  <div className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                    {article.summary}
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-md bg-bg-elevated text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
