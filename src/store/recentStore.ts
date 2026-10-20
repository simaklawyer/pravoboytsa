import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentState {
  ids: string[]
  touch: (id: string) => void
  clear: () => void
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      ids: [],
      touch: (id) => {
        const cur = get().ids
        if (cur[0] === id) return
        set({ ids: [id, ...cur.filter((x) => x !== id)].slice(0, 8) })
      },
      clear: () => set({ ids: [] }),
    }),
    { name: 'pravoboytsa-recent' }
  )
)
