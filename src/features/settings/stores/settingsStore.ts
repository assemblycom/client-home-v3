import type { SettingsResponseDto } from '@settings/lib/settings-actions.dto'
import { createStore, type StoreApi } from 'zustand'

interface SettingsState extends SettingsResponseDto {
  initialSettings: SettingsResponseDto
}

interface SettingsAction {
  setContent: (content: string) => void
  setSubheading: (subheading: string) => void
  setActions: (actions: SettingsResponseDto['actions']) => void
  setSettings: (settings: Partial<SettingsResponseDto>) => void
  setInitialSettings: (settings: SettingsResponseDto) => void
  setBannerUrl: (url: string | null) => void
}

export type SettingsStore = SettingsState & SettingsAction

export const createSettingsStore = (settings: SettingsResponseDto) =>
  createStore<SettingsStore>()((set) => ({
    ...settings,
    initialSettings: settings,
    //hardcoded the url for now.
    bannerUrl:
      settings.bannerUrl ??
      'https://sakzqessgcaxgporuunf.supabase.co/storage/v1/object/sign/media/common/Container.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNGIwOGZlMi1jYmQyLTQyZTYtYjliZC0zNjljYmQ4ZDEyNDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpYS9jb21tb24vQ29udGFpbmVyLmpwZyIsImlhdCI6MTc3MTMxOTAyOCwiZXhwIjoxODAyODU1MDI4fQ.hkz8z2g44IDklP_pHFDjoWrMf6UUQtQBU9m66uTGZhM',

    setContent: (content: string) => set((s) => ({ ...s, content })),
    setSubheading: (subheading: string) => set((s) => ({ ...s, subheading })),
    setActions: (actions: SettingsResponseDto['actions']) =>
      set((s) => ({ ...s, actions: { ...s.actions, ...actions } })),
    setSettings: (newSettings: Partial<SettingsResponseDto>) => set((s) => ({ ...s, ...newSettings })),
    setInitialSettings: (newSettings: Partial<SettingsResponseDto>) =>
      set((s) => ({ ...s, initialSettings: { ...s.initialSettings, ...newSettings } })),
    setBannerUrl: (url: string | null) => set((s) => ({ ...s, bannerUrl: url })),
  }))

export type SettingsStoreApi = StoreApi<SettingsStore>
