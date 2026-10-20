import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const EMPTY: string[] = []

interface ChecklistState {
  byArticle: Record<string, string[]>
  toggle: (articleId: string, item: string) => void
  items: (articleId: string) => string[]
}

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set, get) => ({
      byArticle: {},
      toggle: (articleId, item) => {
        const cur = get().byArticle[articleId] ?? []
        const next = cur.includes(item)
          ? cur.filter((x) => x !== item)
          : [...cur, item]
        set({ byArticle: { ...get().byArticle, [articleId]: next } })
      },
      items: (articleId) => get().byArticle[articleId] ?? EMPTY,
    }),
    { name: 'pravoboytsa-checklists' }
  )
)
