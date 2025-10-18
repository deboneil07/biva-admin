import { create } from "zustand"

interface RoomStore {
  id: string[],
  count: number
  updateStore: (data: Partial<RoomStore>) => void
  reset: () => void
}

export const useRoomStore = create<RoomStore>((set) => ({
  id: [],
  count: 0,

  updateStore: (data) => {
    set((state) => ({ ...state, ...data }))
  },

  reset: () => {
    set({ id: [], count: 0 })
  }
}))
