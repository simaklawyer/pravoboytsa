import { describe, expect, it } from 'vitest'
import { ageLimit, bmi, bmiClass, severance, woundPayments } from './calc'

describe('calc', () => {
  it('считает выплаты по Указу № 98 и доплату', () => {
    const result = woundPayments({ after: true, severity: 'heavy', disability: false, group: 3, alreadyPaid: 500_000, dismissed: false })
    expect(result.decreeTotal).toBe(3_000_000)
    expect(result.decreeTopUp).toBe(2_500_000)
    expect(result.insurance).toBe(354_159.77)
  })

  it('учитывает итог при инвалидности и пособие при увольнении', () => {
    expect(woundPayments({ after: true, severity: 'light', disability: true, group: 2, alreadyPaid: 1_000_000, dismissed: true })).toMatchObject({ decreeTotal: 4_000_000, decreeTopUp: 3_000_000, insurance: 1_770_798.92 })
    expect(severance({ postSalary: 20_000, rankSalary: 10_000, years: 20, award: true }).total).toBe(240_000)
  })

  it('возвращает предельный возраст', () => {
    expect(ageLimit('other', false)).toBe(50)
    expect(ageLimit('general', false)).toBe(60)
    expect(ageLimit('marshal', false)).toBe(65)
    expect(ageLimit('marshal', true)).toBe(45)
  })

  it('считает и классифицирует ИМТ', () => {
    expect(bmi(180, 81)).toBe(25)
    expect(bmi(0, 81)).toBeNull()
    expect(bmiClass(17).label).toBe('Недостаточность питания')
    expect(bmiClass(32).label).toBe('Ожирение I степени')
  })
})
