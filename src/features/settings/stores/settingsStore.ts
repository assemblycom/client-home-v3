import type { SettingsResponseDto } from '@settings/lib/settings-actions.dto'
import { createStore, type StoreApi } from 'zustand'

interface SettingsState extends SettingsResponseDto {
  initialSettings: SettingsResponseDto
}

interface SettingsAction {
  setContent: (content: string) => void
  setActions: (actions: SettingsResponseDto['actions']) => void
  setSettings: (settings: Partial<SettingsResponseDto>) => void
  setInitialSettings: (settings: SettingsResponseDto) => void
}

export type SettingsStore = SettingsState & SettingsAction

export const createSettingsStore = (settings: SettingsResponseDto) =>
  createStore<SettingsStore>()((set) => ({
    ...settings,
    initialSettings: settings,

    setContent: (content: string) => set((s) => ({ ...s, content })),
    setActions: (actions: SettingsResponseDto['actions']) =>
      set((s) => ({ ...s, actions: { ...s.actions, ...actions } })),
    setSettings: (newSettings: Partial<SettingsResponseDto>) => set((s) => ({ ...s, ...newSettings })),
    setInitialSettings: (newSettings: Partial<SettingsResponseDto>) =>
      set((s) => ({ ...s, initialSettings: { ...s.initialSettings, ...newSettings } })),
  }))

export type SettingsStoreApi = StoreApi<SettingsStore>
