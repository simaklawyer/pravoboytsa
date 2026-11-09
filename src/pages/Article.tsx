import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { articles, sections } from '../data/sections'
import { articleBodies } from '../data/articleBodies'
import { articleChecklists } from '../data/checklists'
import { useFavoritesStore } from '../store/favoritesStore'
import { useRecentStore } from '../store/recentStore'
import { useChecklistStore } from '../store/checklistStore'
import BottomNav from '../components/BottomNav'
import { CompanyCta } from '../components/CompanyCard'

const EMPTY_CHECKS: string[] = []

type Block =
  | { type: 'h'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: { n: string; text: string }[] }

/** Разбирает разметку статьи: **подзаголовок**, «- » списки, «1. » нумерованные списки. */
function parseBody(body: string): Block[] {
  const blocks: Block[] = []
  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    const heading = line.match(/^\*\*(.+)\*\*$/)
    if (heading && !heading[1].includes('**')) {
      blocks.push({ type: 'h', text: heading[1] })
      continue
    }
    const bullet = line.match(/^[-•]\s+(.*)$/)
    if (bullet) {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'ul') last.items.push(bullet[1])
      else blocks.push({ type: 'ul', items: [bullet[1]] })
      continue
    }
    const numbered = line.match(/^(\d+)\.\s+(.*)$/)
    if (numbered) {
      const item = { n: numbered[1], text: numbered[2] }
      const last = blocks[blocks.length - 1]
      if (last?.type === 'ol') last.items.push(item)
      else blocks.push({ type: 'ol', items: [item] })
      continue
    }
    blocks.push({ type: 'p', text: line })
  }
  return blocks
}

/** Выделение внутри строки: **жирный** и *курсив*. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return <em key={i}>{part.slice(1, -1)}</em>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function ArticleBody({ body }: { body: string }) {
  const blocks = parseBody(body)
  return (
    <div className="article-body">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h':
            return (
              <h2
                key={i}
                className="text-[16px] font-semibold text-white leading-snug mt-6 mb-2 first:mt-0"
              >
                {block.text}
              </h2>
            )
          case 'ul':
            return (
              <ul key={i} className="mb-3 space-y-1.5">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-[0.72em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70"
                    />
                    <span className="flex-1">
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={i} className="mb-3 space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="w-5 shrink-0 text-right font-medium text-accent">
                      {item.n}.
                    </span>
                    <span className="flex-1">
                      <Inline text={item.text} />
                    </span>
                  </li>
                ))}
              </ol>
            )
          default:
            return (
              <p key={i} className="mb-3">
                <Inline text={block.text} />
              </p>
            )
        }
      })}
    </div>
  )
}


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
          <p className="text-text-secondary">Такой статьи нет или она переехала</p>
          <Link to="/sections" className="text-accent mt-4 inline-block">
            ← Ко всем разделам
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
              aria-label="Поделиться статьёй"
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
            <ArticleBody body={body} />
          ) : (
            <p className="text-text-secondary text-sm">
              Полный текст этой статьи ещё готовится.
            </p>
          )}
        </div>

        {checks.length > 0 && id ? (
          <div className="card p-4 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Чек-лист: что сделать</span>
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
          Материал справочный и не заменяет юридическую консультацию. Суммы и нормы
          меняются: перед подачей документов сверьтесь с официальным текстом акта.
          В сложной ситуации обратитесь к военному юристу.
        </div>

        <div className="mt-4">
          <CompanyCta />
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
