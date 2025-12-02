import { create } from "zustand";

interface RoomStore {
    selectedRoomTypes: string[]; // Changed from 'id' to 'selectedRoomTypes'
    count: number;
    updateStore: (data: Partial<RoomStore>) => void;
    reset: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
    selectedRoomTypes: [], // Changed from 'id: []'
    count: 0,

    updateStore: (data) => {
        set((state) => ({ ...state, ...data }));
    },

    reset: () => {
        set({ selectedRoomTypes: [], count: 0 }); // Updated reset
    },
}));
