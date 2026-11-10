import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role =
  | 'contract'
  | 'svo'
  | 'relative'
  | 'veteran'
  | 'conscript'
  | null

interface UserState {
  role: Role
  setRole: (role: Role) => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
      reset: () => set({ role: null }),
    }),
    {
      name: 'pravoboytsa-user',
    }
  )
)
