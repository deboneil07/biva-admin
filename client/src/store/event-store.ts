import { create } from "zustand"

interface EventStore {
  id: string[],
  count: number

  updateStore: (data: Partial<EventStore>) => void

}

export const useEventStore = create<EventStore>((set) => ({
  id: [],
  count: 0,

  updateStore: (data) => {
    set((state) => ({ ...state, ...data }))
  },


}))
