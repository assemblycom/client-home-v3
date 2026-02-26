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
  displayMode: DisplayMode
  workspace: WorkspaceResponse | null
  tasksAppId: string | null
}

interface ViewStoreAction {
  reset: () => void
  changeView: (data: Partial<ViewStoreState>) => void
  setWorkspace: (workspace: WorkspaceResponse) => void
  setTasksAppId: (id: string) => void
}

const defaultState = {
  viewMode: ViewMode.EDITOR,
  displayMode: DisplayMode.DESKTOP,
  workspace: null,
  tasksAppId: null,
} as const satisfies Partial<ViewStoreState>

type ViewStore = ViewStoreState & ViewStoreAction

export const useViewStore = create<ViewStore>()((set) => ({
  ...defaultState,
  changeView: (data: Partial<ViewStoreState>) => set(data),
  setWorkspace: (workspace: WorkspaceResponse) => set({ workspace }),
  setTasksAppId: (id: string) => set({ tasksAppId: id }),
  reset: () => set(defaultState),
}))

export const viewStore = useViewStore
