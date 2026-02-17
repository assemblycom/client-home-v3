import type { SettingsResponseDto } from '@settings/lib/settings-actions.dto'
import { createStore, type StoreApi } from 'zustand'

interface SettingsState extends SettingsResponseDto {
  initialSettings: SettingsResponseDto
  hasChanged?: boolean
}

interface SettingsAction {
  // setContent: (content: string) => void
  setSubheading: (subheading: string) => void
  setActions: (actions: SettingsResponseDto['actions']) => void
  setSettings: (settings: Partial<SettingsResponseDto>) => void
  setInitialSettings: (settings: SettingsResponseDto) => void
  lasChangedAt?: string
  setHasChanged: (hasChanged: boolean) => void
}

export type SettingsStore = SettingsState & SettingsAction

export const createSettingsStore = (settings: SettingsResponseDto) =>
  createStore<SettingsStore>()((set) => ({
    ...settings,
    initialSettings: settings,
    // setContent: (content: string) => set({ content }),
    setSubheading: (subheading: string) => set({ subheading }),
    // FIX ME:- Should this be updateAction or patchActions instead?
    setActions: (actions: SettingsResponseDto['actions']) => set((s) => ({ actions: { ...s.actions, ...actions } })),
    setSettings: (newSettings: Partial<SettingsResponseDto>) => set({ ...newSettings }),
    // FIX ME:- Should this be updateAction or patchActions instead?
    setInitialSettings: (newSettings: Partial<SettingsResponseDto>) =>
      set((s) => ({ initialSettings: { ...s.initialSettings, ...newSettings } })),
    setHasChanged: (hasChanged: boolean) => set({ hasChanged }),
  }))

export type SettingsStoreApi = StoreApi<SettingsStore>
