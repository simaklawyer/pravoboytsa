/**
 * Расчёты для страницы «Расчёты». Все формулы и суммы описаны в статьях приложения;
 * величины, которые индексируются, вынесены в константы ниже.
 */

export const rub = (n: number): string =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(n)

const round2 = (n: number) => Math.round(n * 100) / 100

/* ---------- 1. Выплаты при ранении ---------- */

export type Severity = 'heavy' | 'light' | 'other'
export type DisabilityGroup = 1 | 2 | 3

/** Указ № 98 в редакции Указа № 967 и ПП № 1534 (увечья после 12.11.2024). */
export const DECREE_98: Record<Severity, number> = {
  heavy: 3_000_000,
  light: 1_000_000,
  other: 100_000,
}
/** Указ № 968: итог при инвалидности, с учётом ранее выплаченного. */
export const DECREE_98_DISABILITY = 4_000_000
/** Ориентиры страховщика (52-ФЗ) на 2025 год с учётом доплат по индексации. */
export const INSURANCE = {
  heavy: 354_159.77,
  light: 88_539.95,
  group: { 1: 2_656_198.36, 2: 1_770_798.92, 3: 885_399.46 } as Record<DisabilityGroup, number>,
  dismissal: 3_541_597.8, // единовременное пособие при увольнении по негодности (306-ФЗ)
}

export interface WoundInput {
  after: boolean // увечье получено после 12.11.2024
  severity: Severity
  disability: boolean
  group: DisabilityGroup
  alreadyPaid: number
  dismissed: boolean
}

export interface WoundResult {
  decreeTotal: number
  decreeTopUp: number
  insurance: number | null
  dismissal: number | null
  notes: string[]
}

export function woundPayments(i: WoundInput): WoundResult {
  const notes: string[] = []
  let decreeTotal: number

  if (!i.after) {
    decreeTotal = 3_000_000
    notes.push(
      'Увечье получено до 13.11.2024: применяют прежние размеры (в практике 3 000 000 ₽ без деления по тяжести). Переходные правила смотрите в Указе № 1053 и проверяйте дату вашего случая.'
    )
  } else {
    decreeTotal = DECREE_98[i.severity]
  }

  if (i.disability) {
    decreeTotal = DECREE_98_DISABILITY
    notes.push('При инвалидности итоговая выплата по Указу № 98 составляет 4 000 000 ₽ с учётом ранее выплаченной суммы.')
  }

  const paid = Math.max(0, i.alreadyPaid || 0)
  const decreeTopUp = round2(Math.max(0, decreeTotal - paid))

  let insurance: number | null = null
  if (i.disability) insurance = INSURANCE.group[i.group]
  else if (i.severity === 'heavy') insurance = INSURANCE.heavy
  else if (i.severity === 'light') insurance = INSURANCE.light
  else notes.push('Страховая сумма по 52-ФЗ предусмотрена для тяжёлого и лёгкого увечья; для «иного» увечья её нет.')

  if (i.disability && insurance != null) {
    notes.push('Если страховая сумма за увечье уже выплачена, при инвалидности её могут учитывать: уточните расчёт у страховщика.')
  }

  return {
    decreeTotal,
    decreeTopUp,
    insurance,
    dismissal: i.dismissed ? INSURANCE.dismissal : null,
    notes,
  }
}

/* ---------- 2. Единовременное пособие при увольнении ---------- */

export interface SeveranceInput {
  postSalary: number // оклад по последней воинской должности
  rankSalary: number // оклад по воинскому званию
  years: number // полных лет выслуги, без округления
  award: boolean // государственная награда или почётное звание
}

export function severance(i: SeveranceInput) {
  const years = Math.max(0, Math.floor(i.years || 0))
  const salaries = (years >= 20 ? 7 : 2) + (i.award ? 1 : 0)
  const base = Math.max(0, (i.postSalary || 0) + (i.rankSalary || 0))
  return { years, salaries, base, total: round2(base * salaries) }
}

/* ---------- 3. Предельный возраст пребывания на службе ---------- */

export type RankGroup = 'other' | 'colonel' | 'general' | 'marshal'

export const RANK_GROUPS: { id: RankGroup; label: string; age: number }[] = [
  { id: 'other', label: 'Иное воинское звание', age: 50 },
  { id: 'colonel', label: 'Полковник, капитан 1 ранга', age: 55 },
  { id: 'general', label: 'Генерал-майор, контр-адмирал, генерал-лейтенант, вице-адмирал', age: 60 },
  { id: 'marshal', label: 'Маршал РФ, генерал армии, адмирал флота, генерал-полковник, адмирал', age: 65 },
]

export function ageLimit(group: RankGroup, female: boolean): number {
  if (female) return 45
  return RANK_GROUPS.find((g) => g.id === group)?.age ?? 50
}

/** Дата, в которую исполняется предельный возраст. `birth` в формате YYYY-MM-DD. */
export function ageLimitDate(birth: string, years: number): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birth)
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(y + years, mo - 1, d)
  return Number.isNaN(date.getTime()) ? null : date
}

export function daysUntil(target: Date, today = new Date()): number {
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime()
  return Math.round((b - a) / 86_400_000)
}

/* ---------- 4. ИМТ ---------- */

export function bmi(heightCm: number, weightKg: number): number | null {
  if (!(heightCm > 0) || !(weightKg > 0)) return null
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 10) / 10
}

/** Пороги ст. 13 Расписания болезней для питания; степени ожирения по классификации ВОЗ. */
export function bmiClass(value: number): { label: string; note: string } {
  if (value < 18.5)
    return {
      label: 'Недостаточность питания',
      note: 'По Расписанию болезней сначала нужно обследование. Если причин снижения веса не найдено, освидетельствуют по пункту «д» (категория Д).',
    }
  if (value < 19.5)
    return { label: 'Пониженное питание', note: 'ИМТ от 18,5 до 19,4. Решение и категорию определяет ВВК.' }
  if (value < 25) return { label: 'Нормальная масса тела', note: 'По питанию ограничений нет.' }
  if (value < 30) return { label: 'Избыточная масса тела', note: 'Сама по себе ограничений не даёт.' }
  if (value < 35) return { label: 'Ожирение I степени', note: 'Категорию определяет ВВК с учётом сопутствующих заболеваний.' }
  if (value < 40) return { label: 'Ожирение II степени', note: 'Категорию определяет ВВК с учётом сопутствующих заболеваний.' }
  return { label: 'Ожирение III степени', note: 'Категорию определяет ВВК с учётом сопутствующих заболеваний.' }
}
