import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { sections } from '../data/sections'
import BottomNav from '../components/BottomNav'

export default function Sections() {
  return (
    <div className="min-h-full pb-24 safe-top">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-semibold">Разделы</h1>
        <p className="text-sm text-text-secondary mt-1">
          Все материалы по категориям
        </p>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i }}
          >
            <Link
              to={`/section/${section.id}`}
              className="card p-4 flex items-center gap-4
                         hover:border-accent/30 active:scale-[0.99]
                         transition-all block"
            >
              <div className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center text-2xl shrink-0">
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[15px]">{section.title}</div>
                <div className="text-sm text-text-secondary mt-0.5 truncate">
                  {section.description}
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {section.count} материалов
                </div>
              </div>
              <div className="text-text-muted">→</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
