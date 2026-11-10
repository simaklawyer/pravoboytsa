import { useMemo, useState } from 'react'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { Link, useSearchParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { CompanyCta } from '../components/CompanyCard'
import { articles } from '../data/sections'
import { getTemplate, templateGroups, templates, type TField, type Template, type Values } from '../data/templates'

const inputCls =
  'mt-1 w-full rounded-xl bg-bg-elevated border border-border px-3 py-2.5 outline-none focus:border-accent/40'

function initialValues(t: Template): Values {
  const v: Values = {}
  for (const f of t.fields) {
    if (f.defaultToday) v[f.id] = new Date().toISOString().slice(0, 10)
    else if (f.default !== undefined) v[f.id] = f.default
    else if (f.type === 'select' && f.options) v[f.id] = f.options[0]
  }
  return v
}

function Field({ field, value, onChange }: { field: TField; value: string; onChange: (v: string) => void }) {
  return (
    <div className="block text-sm">
      <span className="text-text-muted">{field.label}</span>
      {field.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={field.placeholder}
          className={`${inputCls} resize-none`}
        />
      ) : field.type === 'select' ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === 'date' ? 'date' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputCls}
        />
      )}
    </div>
  )
}

function TemplateList() {
  return (
    <div className="px-5 flex flex-col gap-5">
      {templateGroups.map((group) => (
        <div key={group}>
          <h2 className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider">{group}</h2>
          <div className="flex flex-col gap-2">
            {templates
              .filter((t) => t.group === group)
              .map((t) => (
                <Link
                  key={t.id}
                  to={`/draft?t=${t.id}`}
                  className="card p-3.5 block hover:border-accent/30 transition-all"
                >
                  <div className="font-medium text-[15px] leading-snug">{t.title}</div>
                  <div className="text-xs text-text-muted mt-1 leading-relaxed">{t.summary}</div>
                </Link>
              ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-text-muted leading-relaxed">
        Это заготовки, которые заполняются прямо здесь. Текст остаётся на вашем устройстве и никуда не
        отправляется.
      </p>
    </div>
  )
}

function TemplateEditor({ template }: { template: Template }) {
  const [values, setValues] = useState<Values>(() => initialValues(template))
  const [copied, setCopied] = useState(false)
  const text = useMemo(() => template.build(values), [template, values])
  const related = (template.articleIds ?? [])
    .map((id) => articles.find((a) => a.id === id))
    .filter(Boolean)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const download = async () => {
    const doc = new Document({
      sections: [{
        properties: {
          page: { margin: { top: 1134, right: 850, bottom: 1134, left: 1701 } },
        },
        children: text.split('\n').map((line) => new Paragraph({
          children: [new TextRun({ text: line || ' ', font: 'Times New Roman', size: 28 })],
          spacing: { line: 360 },
        })),
      }],
    })
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.id}.docx`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="px-5">
      <Link to="/draft" className="text-sm text-accent">
        ← Все шаблоны
      </Link>
      <h1 className="text-xl font-semibold mt-2 leading-snug">{template.title}</h1>
      <p className="text-sm text-text-secondary mt-1 leading-relaxed">{template.summary}</p>
      {template.note ? (
        <div className="mt-3 rounded-xl bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent-light leading-relaxed">
          {template.note}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {template.fields.map((f) => (
          <Field
            key={f.id}
            field={f}
            value={values[f.id] ?? ''}
            onChange={(v) => setValues((prev) => ({ ...prev, [f.id]: v }))}
          />
        ))}
      </div>

      <div className="mt-5">
        <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Готовый текст</div>
        <pre className="card p-4 text-[13px] leading-relaxed whitespace-pre-wrap font-sans">{text}</pre>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button type="button" className="btn-primary text-sm" onClick={copy}>
            {copied ? 'Скопировано' : 'Скопировать'}
          </button>
          <button type="button" className="btn-secondary text-sm" onClick={() => void download()}>
            Скачать .docx
          </button>
        </div>
        <p className="text-xs text-text-muted mt-3 leading-relaxed">
          Проверьте текст под свою ситуацию, подпишите сами и подайте так, чтобы остался след: входящий номер на
          втором экземпляре или почта с описью. Заготовка не заменяет документ, подготовленный юристом под ваш случай.
        </p>
      </div>

      {related.length ? (
        <div className="mt-5">
          <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Читайте</div>
          <div className="flex flex-col gap-1.5">
            {related.map((a) =>
              a ? (
                <Link key={a.id} to={`/article/${a.id}`} className="text-sm text-accent">
                  {a.title} →
                </Link>
              ) : null
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <CompanyCta text="Нужен документ под вашу ситуацию? Подготовим его вместе с юристом." />
      </div>
    </div>
  )
}

export default function Draft() {
  const [params] = useSearchParams()
  const template = getTemplate(params.get('t'))

  return (
    <div className="min-h-full pb-24 safe-top">
      {template ? (
        <div className="pt-6">
          <TemplateEditor key={template.id} template={template} />
        </div>
      ) : (
        <>
          <div className="px-5 pt-6 pb-4">
            <h1 className="text-xl font-semibold">Документы</h1>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              Выберите документ, заполните поля и скопируйте готовый текст. Рапорты, жалобы и заявления в
              службу судебных приставов.
            </p>
          </div>
          <TemplateList />
        </>
      )}
      <BottomNav />
    </div>
  )
}
