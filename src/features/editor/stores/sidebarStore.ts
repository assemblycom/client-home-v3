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
  expandSegments: boolean
  setExpandSegments: (expand: boolean) => void
  mobileSidebarOpen: boolean
  toggleMobileSidebar: () => void
}

const createStore = () =>
  create<SidebarStore>()((set) => ({
    sidebarView: 'default',
    setSidebarView: (sidebarView: SidebarView) => set({ sidebarView }),
    currentSegment: null,
    setCurrentSegment: (currentSegment: CurrentSegment | null) => set({ currentSegment }),
    expandSegments: false,
    setExpandSegments: (expandSegments: boolean) => set({ expandSegments }),
    mobileSidebarOpen: false,
    toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  }))

// Preserve Zustand state across HMR
type HMR = { data: Record<string, unknown> }
let store = createStore()
const hot = (import.meta as unknown as { hot?: HMR }).hot
if (hot) {
  const prev = hot.data.sidebarStore as ReturnType<typeof createStore> | undefined
  if (prev) {
    store = prev
  }
  hot.data.sidebarStore = store
}

export const useSidebarStore = store
