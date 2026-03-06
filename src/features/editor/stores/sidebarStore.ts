import { create } from 'zustand'

type SidebarView = 'default' | 'change-banner'

interface SidebarStore {
  sidebarView: SidebarView
  setSidebarView: (view: SidebarView) => void
}

export const useSidebarStore = create<SidebarStore>()((set) => ({
  sidebarView: 'default',
  setSidebarView: (sidebarView: SidebarView) => set({ sidebarView }),
}))
