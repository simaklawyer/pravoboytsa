import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { articles, sections } from '../data/sections'
import { articleBodies } from '../data/articleBodies'
import { articleChecklists } from '../data/checklists'
import { useFavoritesStore } from '../store/favoritesStore'
import { useRecentStore } from '../store/recentStore'
import { useChecklistStore } from '../store/checklistStore'
import BottomNav from '../components/BottomNav'

const EMPTY_CHECKS: string[] = []

function shareArticle(title: string) {
  const tg = (window as any).Telegram?.WebApp
  const url = window.location.href
  const text = `${title}\n${url}`
  if (tg?.openTelegramLink) {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    tg.openTelegramLink(shareUrl)
    return
  }
  if (navigator.share) {
    void navigator.share({ title, text, url }).catch(() => {})
    return
  }
  void navigator.clipboard.writeText(text).catch(() => {})
}

export default function Article() {
  const { id } = useParams<{ id: string }>()
  const article = articles.find((a) => a.id === id)
  const section = article
    ? sections.find((s) => s.id === article.sectionId)
    : null
  const body = id ? articleBodies[id] : null
  const checks = (id && articleChecklists[id]) || EMPTY_CHECKS

  const { has, toggle } = useFavoritesStore()
  const touch = useRecentStore((s) => s.touch)
  const toggleCheck = useChecklistStore((s) => s.toggle)
  const byArticle = useChecklistStore((s) => s.byArticle)
  const done = (id && byArticle[id]) || EMPTY_CHECKS
  const isFavorite = id ? has(id) : false
  const progress =
    checks.length > 0 ? Math.round((done.length / checks.length) * 100) : 0

  useEffect(() => {
    if (id) touch(id)
  }, [id, touch])

  if (!article) {
    return (
      <div className="min-h-full flex items-center justify-center px-5">
        <div className="text-center">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-text-secondary">Статья не найдена</p>
          <Link to="/sections" className="text-accent mt-4 inline-block">
            ← К разделам
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-24 safe-top">
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <Link
            to={section ? `/section/${section.id}` : '/sections'}
            className="text-sm text-accent"
          >
            ← {section?.title || 'Разделы'}
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shareArticle(article.title)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm
                         border border-border bg-bg-elevated text-text-muted"
              aria-label="Поделиться"
            >
              ↗
            </button>
            <button
              type="button"
              onClick={() => id && toggle(id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                          border transition-all duration-200
                          ${isFavorite
                            ? 'bg-accent/15 border-accent/40 text-accent'
                            : 'bg-bg-elevated border-border text-text-muted'}`}
              aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          </div>
        </div>

        <h1 className="text-xl font-semibold leading-snug tracking-tight">
          {article.title}
        </h1>

        <div className="flex gap-2 mt-3 flex-wrap">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-lg bg-bg-elevated text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="card p-5">
          {body ? (
            <div className="article-body whitespace-pre-line">
              {body.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <p key={i} className="font-semibold text-white mt-4 mb-2 first:mt-0">
                      {line.replace(/\*\*/g, '')}
                    </p>
                  )
                }
                if (line.trim() === '') return <br key={i} />
                return (
                  <p key={i} className="mb-1">
                    {line}
                  </p>
                )
              })}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">
              Полный текст статьи скоро будет добавлен.
            </p>
          )}
        </div>

        {checks.length > 0 && id ? (
          <div className="card p-4 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Чек-лист</span>
              <span className="text-text-muted">{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <ul className="mt-3 space-y-2">
              {checks.map((item) => {
                const on = done.includes(item)
                return (
                  <li key={item}>
                    <label className="flex items-start gap-3 text-sm leading-snug">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleCheck(id, item)}
                        className="mt-0.5 accent-[#3D8B6E]"
                      />
                      <span className={on ? 'text-text-muted line-through' : ''}>
                        {item}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 rounded-xl bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent-light leading-relaxed">
          Материал носит справочный характер и не является юридической консультацией.
          В сложных ситуациях рекомендуем обратиться к военному юристу. Актуальные суммы
          и редакции указов сверяйте по официальным источникам.
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
