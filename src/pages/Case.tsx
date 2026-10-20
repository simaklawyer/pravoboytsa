import { useState } from 'react'
import { stages } from '../data/stages'
import { useCaseStore } from '../store/caseStore'
import BottomNav from '../components/BottomNav'

function daysSince(iso: string) {
  const start = new Date(iso)
  if (Number.isNaN(start.getTime())) return null
  return Math.floor((Date.now() - start.getTime()) / 86_400_000)
}

export default function CasePage() {
  const cases = useCaseStore((s) => s.cases)
  const add = useCaseStore((s) => s.add)
  const setStage = useCaseStore((s) => s.setStage)
  const remove = useCaseStore((s) => s.remove)

  const [title, setTitle] = useState('')
  const [stage, setLocal] = useState(1)
  const [started, setStarted] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')

  return (
    <div className="min-h-full pb-24 safe-top">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-semibold">Моё дело</h1>
        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
          Дата вручения рапорта и текущая ступень. Данные остаются только на устройстве.
        </p>
      </div>

      <form
        className="mx-5 card p-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          add({ title: title.trim(), stage, started, note: note.trim() })
          setTitle('')
          setNote('')
        }}
      >
        <label className="block text-sm">
          <span className="text-text-muted">О чём дело</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl bg-bg-elevated border border-border px-3 py-2.5 outline-none focus:border-accent/40"
            placeholder="Направление на ВВК"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">
            <span className="text-text-muted">Ступень</span>
            <select
              value={stage}
              onChange={(e) => setLocal(Number(e.target.value))}
              className="mt-1 w-full rounded-xl bg-bg-elevated border border-border px-2 py-2.5 outline-none"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}. {s.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-text-muted">Дата старта</span>
            <input
              type="date"
              value={started}
              onChange={(e) => setStarted(e.target.value)}
              className="mt-1 w-full rounded-xl bg-bg-elevated border border-border px-2 py-2.5 outline-none"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-text-muted">Заметка</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded-xl bg-bg-elevated border border-border px-3 py-2.5 outline-none"
            placeholder="Трек письма, входящий номер"
          />
        </label>
        <button type="submit" className="btn-primary w-full">
          Сохранить
        </button>
      </form>

      <div className="px-5 mt-5 flex flex-col gap-3">
        {cases.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">Пока пусто</p>
        ) : (
          cases.map((item) => {
            const meta = stages.find((s) => s.id === item.stage)
            const days = daysSince(item.started)
            return (
              <article key={item.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-medium">{item.title}</h2>
                  <button
                    type="button"
                    className="text-xs text-text-muted"
                    onClick={() => remove(item.id)}
                  >
                    Удалить
                  </button>
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  {meta?.title ?? 'Ступень'} · с {item.started}
                  {days != null ? ` · ${days} дн.` : ''}
                </p>
                {item.note ? <p className="mt-2 text-sm">{item.note}</p> : null}
                {item.stage === 1 && days != null && days >= 30 ? (
                  <p className="mt-2 text-sm text-accent">
                    30 суток с даты старта прошли — посмотрите ступень жалобы.
                  </p>
                ) : null}
                <label className="mt-3 block text-xs text-text-muted">
                  Сменить ступень
                  <select
                    value={item.stage}
                    onChange={(e) => setStage(item.id, Number(e.target.value))}
                    className="mt-1 w-full rounded-xl bg-bg-elevated border border-border px-2 py-2 text-sm text-text-primary outline-none"
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}. {s.title}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}
