import { useMemo, useState } from 'react'
import BottomNav from '../components/BottomNav'

export default function Draft() {
  const [to, setTo] = useState('Командиру войсковой части')
  const [from, setFrom] = useState('')
  const [ask, setAsk] = useState('прошу направить меня на военно-врачебную комиссию')
  const [facts, setFacts] = useState('')
  const [copied, setCopied] = useState(false)

  const text = useMemo(() => {
    const date = new Date().toLocaleDateString('ru-RU')
    return [
      to.trim() || 'Командиру воинской части',
      '',
      `от ${from.trim() || '________________ (звание, ФИО, подразделение)'}`,
      '',
      'Рапорт',
      '',
      facts.trim() || 'Кратко излагаю обстоятельства.',
      '',
      `На основании изложенного ${ask.trim() || 'прошу рассмотреть обращение по существу'}.`,
      '',
      'Приложения: копии документов на ___ л.',
      '',
      date,
      'Подпись ______________',
    ].join('\n')
  }, [to, from, ask, facts])

  return (
    <div className="min-h-full pb-24 safe-top">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-semibold">Черновик рапорта</h1>
        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
          Заготовка текста. Подписывает её сам военнослужащий. Это не бланк части.
        </p>
      </div>

      <div className="px-5 space-y-3">
        <Field label="Кому" value={to} onChange={setTo} />
        <Field
          label="От кого"
          value={from}
          onChange={setFrom}
          placeholder="звание, ФИО, подразделение"
        />
        <label className="block text-sm">
          <span className="text-text-muted">Обстоятельства</span>
          <textarea
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl bg-bg-elevated border border-border px-3 py-2.5 outline-none resize-none focus:border-accent/40"
            placeholder="Что произошло и когда"
          />
        </label>
        <Field label="Просьба" value={ask} onChange={setAsk} />
      </div>

      <div className="px-5 mt-5">
        <pre className="card p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {text}
        </pre>
        <button
          type="button"
          className="btn-primary w-full mt-4"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text)
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1600)
            } catch {
              setCopied(false)
            }
          }}
        >
          {copied ? 'Скопировано' : 'Скопировать текст'}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-text-muted">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl bg-bg-elevated border border-border px-3 py-2.5 outline-none focus:border-accent/40"
      />
    </label>
  )
}
