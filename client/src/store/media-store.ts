import { create } from "zustand"

interface MediaStore {

  selections: Record<string, {
    id: string[]
    count: number
  }>

  updateStore: (prop: string, data: { id?: string[], count?: number }) => void
  resetStore: (prop?: string) => void
  getSelection: (prop: string) => { id: string[], count: number }
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  selections: {},

  updateStore: (prop, data) => {
    set((state) => ({
      selections: {
        ...state.selections,
        [prop]: {
          id: data.id ?? state.selections[prop]?.id ?? [],
          count: data.count ?? state.selections[prop]?.count ?? 0,
        }
      }
    }))
  },

  resetStore: (prop) => {
    if (prop) {
      // Reset specific section
      set((state) => ({
        selections: {
          ...state.selections,
          [prop]: { id: [], count: 0 }
        }
      }))
    } else {
      // Reset all selections
      set({ selections: {} })
    }
  },

  getSelection: (prop) => {
    const { selections } = get()
    return selections[prop] ?? { id: [], count: 0 }
  },
}))
