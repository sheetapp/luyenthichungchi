import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
    selectedHang: string // 'Hạng I', 'Hạng II', 'Hạng III'
    selectedCategory: string | null // e.g., 'Thiết kế quy hoạch xây dựng'
    lastExamCategory: string | null

    setSelectedHang: (hang: string) => void
    setSelectedCategory: (category: string | null) => void
    setLastExamCategory: (category: string | null) => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            selectedHang: 'Hạng I',
            selectedCategory: null,
            lastExamCategory: null,

            setSelectedHang: (hang) => set({ selectedHang: hang }),
            setSelectedCategory: (category) => set({ selectedCategory: category }),
            setLastExamCategory: (category) => set({ lastExamCategory: category }),
        }),
        {
            name: 'app-storage',
        }
    )
)
