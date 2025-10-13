import { create } from "zustand"

interface MediaStore {
  folder: string
  id: string[]
  count: number

  updateStore: (data: Partial<MediaStore>) => void
  resetStore: () => void
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  folder: "",
  id: [],
  count: 0,

  updateStore: (data) => {
    const { folder } = get()

   
    if (data.folder && data.folder !== folder) {
      set({
        folder: data.folder,
        id: [],
        count: 0,
      })
      return
    }


    set((state) => ({ ...state, ...data }))
  },

  resetStore: () => set({ folder: "", id: [], count: 0 }),
}))
