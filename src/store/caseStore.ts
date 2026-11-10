import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CaseItem {
  id: string
  title: string
  stage: number
  started: string
  note: string
}

interface CaseState {
  cases: CaseItem[]
  add: (item: Omit<CaseItem, 'id'>) => void
  setStage: (id: string, stage: number) => void
  remove: (id: string) => void
}

export const useCaseStore = create<CaseState>()(
  persist(
    (set) => ({
      cases: [],
      add: (item) =>
        set((s) => ({
          cases: [{ ...item, id: crypto.randomUUID() }, ...s.cases],
        })),
      setStage: (id, stage) =>
        set((s) => ({
          cases: s.cases.map((c) => (c.id === id ? { ...c, stage } : c)),
        })),
      remove: (id) => set((s) => ({ cases: s.cases.filter((c) => c.id !== id) })),
    }),
    { name: 'pravoboytsa-cases' }
  )
)
