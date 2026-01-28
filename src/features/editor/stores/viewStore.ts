import { create } from 'zustand'
import type { WorkspaceResponse } from '@/lib/assembly/types'

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
  activeClientId: string | null
  activeCompanyId: string | null
  displayMode: DisplayMode
  workspace: WorkspaceResponse | null
}

interface ViewStoreAction {
  reset: () => void
  updateView: (data: Partial<ViewStoreState>) => void
  setWorkspace: (workspace: WorkspaceResponse) => void
}

const defaultState = {
  viewMode: ViewMode.EDITOR,
  activeClientId: null,
  activeCompanyId: null,
  displayMode: DisplayMode.DESKTOP,
  workspace: null,
} as const satisfies Partial<ViewStoreState>

type ViewStore = ViewStoreState & ViewStoreAction

export const useViewStore = create<ViewStore>()((set) => ({
  ...defaultState,
  updateView: (data: Partial<ViewStoreState>) => set(data),
  setClientId: (id: string) => set({ activeClientId: id }),
  setCompanyId: (id: string) => set({ activeCompanyId: id }),
  setWorkspace: (workspace: WorkspaceResponse) => set({ workspace }),
  reset: () => set(defaultState),
}))

export const viewStore = useViewStore
