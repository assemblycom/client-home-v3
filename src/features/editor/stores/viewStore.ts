import { create } from 'zustand'

export enum ViewMode {
  EDITOR = 'editor',
  PREVIEW = 'preview',
}

export enum DisplayMode {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
}

interface ViewStoreState {
  viewMode: ViewMode
  displayMode: DisplayMode
}

interface ViewStoreAction {
  reset: () => void
  changeView: (data: Partial<ViewStoreState>) => void
}

const defaultState = {
  viewMode: ViewMode.EDITOR,
  displayMode: DisplayMode.DESKTOP,
} as const satisfies Partial<ViewStoreState>

type ViewStore = ViewStoreState & ViewStoreAction

export const useViewStore = create<ViewStore>()((set) => ({
  ...defaultState,
  changeView: (data: Partial<ViewStoreState>) => set(data),
  reset: () => set(defaultState),
}))

export const viewStore = useViewStore
