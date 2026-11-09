import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import {
  RANK_GROUPS,
  ageLimit,
  ageLimitDate,
  bmi,
  bmiClass,
  daysUntil,
  rub,
  severance,
  woundPayments,
  type DisabilityGroup,
  type RankGroup,
  type Severity,
} from '../lib/calc'
import { plural } from '../lib/plural'

type Tab = 'wound' | 'severance' | 'age' | 'bmi'

const TABS: { id: Tab; label: string }[] = [
  { id: 'wound', label: 'Ранение' },
  { id: 'severance', label: 'Пособие' },
  { id: 'age', label: 'Возраст' },
  { id: 'bmi', label: 'ИМТ' },
]

const inputCls =
  'mt-1 w-full rounded-xl bg-bg-elevated border border-border px-3 py-2.5 outline-none focus:border-accent/40'

/** Число из строки: «40 000,50» → 40000.5 */
function num(value: string): number {
  const n = Number(value.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function Segmented<T extends string | number | boolean>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="mt-1 flex gap-1 rounded-xl bg-bg-elevated p-1 border border-border">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg px-2 py-2 text-[13px] font-medium transition-colors ${
            o.value === value ? 'bg-accent text-white' : 'text-text-secondary'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block text-sm">
      <span className="text-text-muted">{label}</span>
      {children}
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-right ${strong ? 'text-lg font-semibold text-accent' : 'text-[15px] font-medium'}`}>
        {value}
      </span>
    </div>
  )
}

function Result({ children }: { children: ReactNode }) {
  return <div className="mt-4 rounded-xl border border-accent/25 bg-accent/10 px-4 py-2.5">{children}</div>
}

function Notes({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-text-muted">
      {items.map((n) => (
        <li key={n}>• {n}</li>
      ))}
    </ul>
  )
}

function ReadMore({ items }: { items: { id: string; title: string }[] }) {
  return (
    <div className="mt-4 flex flex-col gap-1.5">
      {items.map((a) => (
        <Link key={a.id} to={`/article/${a.id}`} className="text-sm text-accent">
          {a.title} →
        </Link>
      ))}
    </div>
  )
}

/* ---------- Ранение ---------- */
function WoundCalc() {
  const [after, setAfter] = useState(true)
  const [severity, setSeverity] = useState<Severity>('heavy')
  const [disability, setDisability] = useState(false)
  const [group, setGroup] = useState<DisabilityGroup>(3)
  const [paid, setPaid] = useState('100000')
  const [dismissed, setDismissed] = useState(false)

  const r = useMemo(
    () =>
      woundPayments({ after, severity, disability, group, alreadyPaid: num(paid), dismissed }),
    [after, severity, disability, group, paid, dismissed]
  )

  return (
    <>
      <div className="space-y-3">
        <Field label="Когда получено увечье">
          <Segmented
            value={after}
            onChange={setAfter}
            options={[
              { value: true, label: 'После 12.11.2024' },
              { value: false, label: 'До 13.11.2024' },
            ]}
          />
        </Field>
        <Field label="Тяжесть увечья по справке">
          <Segmented
            value={severity}
            onChange={setSeverity}
            options={[
              { value: 'heavy', label: 'Тяжёлое' },
              { value: 'light', label: 'Лёгкое' },
              { value: 'other', label: 'Иное' },
            ]}
          />
        </Field>
        <Field label="Установлена инвалидность">
          <Segmented
            value={disability}
            onChange={setDisability}
            options={[
              { value: false, label: 'Нет' },
              { value: true, label: 'Да' },
            ]}
          />
        </Field>
        {disability ? (
          <Field label="Группа инвалидности">
            <Segmented
              value={group}
              onChange={setGroup}
              options={[
                { value: 1, label: 'I' },
                { value: 2, label: 'II' },
                { value: 3, label: 'III' },
              ]}
            />
          </Field>
        ) : null}
        <Field label="Уже получено по Указу № 98, ₽">
          <input
            inputMode="decimal"
            value={paid}
            onChange={(e) => setPaid(e.target.value)}
            className={inputCls}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" checked={dismissed} onChange={(e) => setDismissed(e.target.checked)} />
          Уволен по негодности вследствие военной травмы
        </label>
      </div>

      <Result>
        <Row label="Итог по Указу № 98" value={rub(r.decreeTotal)} />
        <Row label="Осталось доплатить" value={rub(r.decreeTopUp)} strong />
        <Row label="Страховая 52-ФЗ (ориентир)" value={r.insurance != null ? rub(r.insurance) : 'нет'} />
        {r.dismissal != null ? (
          <Row label="Пособие при увольнении (ориентир)" value={rub(r.dismissal)} />
        ) : null}
      </Result>
      <Notes
        items={[
          ...r.notes,
          'Суммы по Указу № 98 не складываются: 100 тыс., 1 млн и 3 млн рублей считают с зачётом уже выплаченного.',
          'Страховые суммы и пособие индексируются, цифры приведены как ориентир по памятке страховщика на 2025 год. Окончательный расчёт делает финансовый орган и страховщик.',
        ]}
      />
      <ReadMore
        items={[
          { id: 'money-4', title: 'Выплаты при ранении на СВО: суммы и логика' },
          { id: 'money-10', title: 'Страховые выплаты по 52-ФЗ' },
        ]}
      />
    </>
  )
}

/* ---------- Пособие при увольнении ---------- */
function SeveranceCalc() {
  const [post, setPost] = useState('')
  const [rank, setRank] = useState('')
  const [years, setYears] = useState('')
  const [award, setAward] = useState(false)

  const r = useMemo(
    () => severance({ postSalary: num(post), rankSalary: num(rank), years: num(years), award }),
    [post, rank, years, award]
  )
  const ready = num(post) + num(rank) > 0 && years !== ''

  return (
    <>
      <div className="space-y-3">
        <Field label="Оклад по последней воинской должности, ₽">
          <input inputMode="decimal" value={post} onChange={(e) => setPost(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Оклад по воинскому званию, ₽">
          <input inputMode="decimal" value={rank} onChange={(e) => setRank(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Полных лет выслуги (без округления)">
          <input inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} className={inputCls} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" checked={award} onChange={(e) => setAward(e.target.checked)} />
          Есть государственная награда или почётное звание
        </label>
      </div>

      {ready ? (
        <Result>
          <Row label="Окладов в пособии" value={`${r.salaries}`} />
          <Row label="Оклад денежного содержания" value={rub(r.base)} />
          <Row label="Пособие до налогов" value={rub(r.total)} strong />
        </Result>
      ) : null}
      <Notes
        items={[
          'Формула: оклад по должности плюс оклад по званию на день увольнения, умноженные на 2 (выслуга меньше 20 лет) или на 7 (20 лет и больше), плюс ещё один оклад за государственную награду.',
          '19 лет и 11 месяцев считаются как 19 лет: пособие в этом случае составит два оклада.',
          'Проверьте оклады в расчётном листке. Если вы уволены с должности, на которой оклад сохранялся, считают от сохранённого оклада.',
        ]}
      />
      <ReadMore items={[{ id: 'money-3', title: 'Выплаты при увольнении с военной службы' }]} />
    </>
  )
}

/* ---------- Предельный возраст ---------- */
function AgeCalc() {
  const [group, setGroup] = useState<RankGroup>('other')
  const [female, setFemale] = useState(false)
  const [birth, setBirth] = useState('')

  const years = ageLimit(group, female)
  const date = birth ? ageLimitDate(birth, years) : null
  const left = date ? daysUntil(date) : null

  return (
    <>
      <div className="space-y-3">
        <Field label="Воинское звание">
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value as RankGroup)}
            className={inputCls}
            disabled={female}
          >
            {RANK_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label} — {g.age} лет
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" checked={female} onChange={(e) => setFemale(e.target.checked)} />
          Военнослужащая (женского пола): предельный возраст 45 лет
        </label>
        <Field label="Дата рождения">
          <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className={inputCls} />
        </Field>
      </div>

      <Result>
        <Row label="Предельный возраст" value={`${years} ${plural(years, 'год', 'года', 'лет')}`} />
        {date ? (
          <>
            <Row label="Исполнится" value={date.toLocaleDateString('ru-RU')} strong />
            <Row
              label={left != null && left < 0 ? 'Прошло' : 'Осталось'}
              value={
                left == null
                  ? ''
                  : `${Math.abs(left)} ${plural(Math.abs(left), 'день', 'дня', 'дней')}`
              }
            />
          </>
        ) : null}
      </Result>
      <Notes
        items={[
          'Достижение предельного возраста — одно из оснований увольнения, которое сохраняется и в период мобилизации (Указ № 647).',
          'Расчёт показывает дату, когда вам исполнится предельный возраст по ст. 49 закона № 53-ФЗ. Порядок увольнения и возможные исключения смотрите в статье.',
        ]}
      />
      <ReadMore items={[{ id: 'service-4', title: 'Основания увольнения в период мобилизации' }]} />
    </>
  )
}

/* ---------- ИМТ ---------- */
function BmiCalc() {
  const [h, setH] = useState('')
  const [w, setW] = useState('')
  const value = bmi(num(h), num(w))
  const cls = value != null ? bmiClass(value) : null

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Рост, см">
          <input inputMode="decimal" value={h} onChange={(e) => setH(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Вес, кг">
          <input inputMode="decimal" value={w} onChange={(e) => setW(e.target.value)} className={inputCls} />
        </Field>
      </div>
      {value != null && cls ? (
        <Result>
          <Row label="ИМТ" value={String(value).replace('.', ',')} strong />
          <Row label="Оценка" value={cls.label} />
        </Result>
      ) : null}
      {cls ? <Notes items={[cls.note]} /> : null}
      <Notes
        items={[
          'Категорию годности определяет только ВВК по Расписанию болезней (постановление Правительства РФ № 565). Калькулятор показывает один из показателей, а не заключение.',
        ]}
      />
      <ReadMore items={[{ id: 'health-1', title: 'ВВК: зачем она нужна и как её проходить' }]} />
    </>
  )
}

export default function Calc() {
  const [tab, setTab] = useState<Tab>('wound')

  return (
    <div className="min-h-full pb-24 safe-top">
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-xl font-semibold">Расчёты</h1>
        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
          Быстрые расчёты по правилам из статей. Это ориентир: окончательные суммы определяют часть,
          финансовый орган и страховщик.
        </p>
      </div>

      <div className="px-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                t.id === tab
                  ? 'bg-accent text-white border-accent'
                  : 'bg-bg-elevated text-text-secondary border-border'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="card mt-3 p-4">
          {tab === 'wound' ? <WoundCalc /> : null}
          {tab === 'severance' ? <SeveranceCalc /> : null}
          {tab === 'age' ? <AgeCalc /> : null}
          {tab === 'bmi' ? <BmiCalc /> : null}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
