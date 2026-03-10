import { create } from 'zustand'

type SidebarView = 'default' | 'change-banner'

interface SidebarStore {
  sidebarView: SidebarView
  setSidebarView: (view: SidebarView) => void
  mobileSidebarOpen: boolean
  toggleMobileSidebar: () => void
}

export const useSidebarStore = create<SidebarStore>()((set) => ({
  sidebarView: 'default',
  setSidebarView: (sidebarView: SidebarView) => set({ sidebarView }),
  mobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
}))
