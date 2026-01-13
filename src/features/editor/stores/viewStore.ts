import { create } from 'zustand'

export enum ViewMode {
  EDITOR = 'editor',
  PREVIEW = 'preview',
}

export enum DisplayMode {
  DESKTOP = 'dekstop',
  MOBILE = 'mobile',
}

interface ViewStoreState {
  portalUrl?: string | null
  setPortalUrl: (portalurl: string) => void
  viewMode: ViewMode | null
  setViewMode: (mode: ViewMode) => void
  displayMode?: DisplayMode | null
  setDisplayMode: (mode: DisplayMode) => void
}

export const useViewStore = create<ViewStoreState>()((set) => ({
  portalUrl: null,
  setPortalUrl: (portalUrl) => set({ portalUrl }),

  displayMode: null,
  setDisplayMode: (displayMode) => set({ displayMode }),

  viewMode: null,
  setViewMode: (viewMode) => set({ viewMode }),
}))

export const viewStore = useViewStore
