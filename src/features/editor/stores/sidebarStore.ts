import { create } from 'zustand'

type SidebarView = 'default' | 'change-banner' | 'create-segment' | 'edit-segment'

interface SidebarStore {
  sidebarView: SidebarView
  setSidebarView: (view: SidebarView) => void
  editingSegmentId: string | null
  setEditingSegmentId: (id: string | null) => void
  mobileSidebarOpen: boolean
  toggleMobileSidebar: () => void
}

export const useSidebarStore = create<SidebarStore>()((set) => ({
  sidebarView: 'default',
  setSidebarView: (sidebarView: SidebarView) => set({ sidebarView }),
  editingSegmentId: null,
  setEditingSegmentId: (editingSegmentId: string | null) => set({ editingSegmentId }),
  mobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
}))
