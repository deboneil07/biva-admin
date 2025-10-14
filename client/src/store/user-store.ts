import { create } from "zustand"

interface UserStore {
  id: string[],
  count: number

  updateStore: (data: Partial<UserStore>) => void

}

export const useUserStore = create<UserStore>((set) => ({
  id: [],
  count: 0,

  updateStore: (data) => {
    set((state) => ({ ...state, ...data }))
  },


}))
