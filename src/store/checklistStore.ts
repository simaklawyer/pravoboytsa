import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChecklistState {
  /** articleId -> checked item keys */
  byArticle: Record<string, string[]>
  toggle: (articleId: string, item: string) => void
  isChecked: (articleId: string, item: string) => boolean
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
      isChecked: (articleId, item) =>
        (get().byArticle[articleId] ?? []).includes(item),
    }),
    { name: 'pravoboytsa-checklists' }
  )
)
