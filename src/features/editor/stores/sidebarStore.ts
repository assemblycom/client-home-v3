import { create } from 'zustand'

type SidebarView = 'default' | 'change-banner'

export type CurrentSegment = {
  id?: string
  name?: string
  customField: string
  conditions?: { compareValue: string }[]
}

interface SidebarStore {
  sidebarView: SidebarView
  setSidebarView: (view: SidebarView) => void
  currentSegment: CurrentSegment | null
  setCurrentSegment: (segment: CurrentSegment | null) => void
  mobileSidebarOpen: boolean
  toggleMobileSidebar: () => void
}

export const useSidebarStore = create<SidebarStore>()((set) => ({
  sidebarView: 'default',
  setSidebarView: (sidebarView: SidebarView) => set({ sidebarView }),
  currentSegment: null,
  setCurrentSegment: (currentSegment: CurrentSegment | null) => set({ currentSegment }),
  mobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
}))
