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
  appDisplayNames: Record<string, string>
  activeSegmentId: string | null
}

interface ViewStoreAction {
  reset: () => void
  changeView: (data: Partial<ViewStoreState>) => void
  setWorkspace: (workspace: WorkspaceResponse) => void
  setTasksAppId: (id: string) => void
  setAppDisplayNames: (names: Record<string, string>) => void
  setActiveSegmentId: (segmentId: string | null) => void
}

const defaultState = {
  viewMode: ViewMode.EDITOR,
  displayMode: DisplayMode.DESKTOP,
  workspace: null,
  tasksAppId: null,
  appDisplayNames: {},
  activeSegmentId: null,
} as const satisfies Partial<ViewStoreState>

type ViewStore = ViewStoreState & ViewStoreAction

export const useViewStore = create<ViewStore>()((set) => ({
  ...defaultState,
  changeView: (data: Partial<ViewStoreState>) => set(data),
  setWorkspace: (workspace: WorkspaceResponse) => set({ workspace }),
  setTasksAppId: (tasksAppId: string | null) => set({ tasksAppId }),
  setAppDisplayNames: (appDisplayNames: Record<string, string>) => set({ appDisplayNames }),
  setActiveSegmentId: (activeSegmentId: string | null) => set({ activeSegmentId }),
  reset: () => set(defaultState),
}))

export const viewStore = useViewStore
