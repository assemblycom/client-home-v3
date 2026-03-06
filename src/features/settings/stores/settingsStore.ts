import type { SettingsResponseDto } from '@settings/lib/settings-actions.dto'
import { createStore, type StoreApi } from 'zustand'
import type { BannerImagesResponse } from '@/features/banner/types'

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
  setBannerImages: (banners: BannerImagesResponse) => void
  setBannerImageId: (bannerImageId: string) => void
  setBannerPositionX: (bannerPositionX: number) => void
  setBannerPositionY: (bannerPositionY: number) => void
}

export type SettingsStore = SettingsState & SettingsAction

export const createSettingsStore = (settings: SettingsResponseDto) =>
  createStore<SettingsStore>()((set) => ({
    ...settings,
    initialSettings: settings,

    setContent: (content: string) => set((s) => ({ ...s, content })),
    setSubheading: (subheading: string) => set((s) => ({ ...s, subheading })),
    setActions: (actions: SettingsResponseDto['actions']) =>
      set((s) => ({ ...s, actions: { ...s.actions, ...actions } })),
    setSettings: (newSettings: Partial<SettingsResponseDto>) => set((s) => ({ ...s, ...newSettings })),
    setInitialSettings: (newSettings: Partial<SettingsResponseDto>) =>
      set((s) => ({ ...s, initialSettings: { ...s.initialSettings, ...newSettings } })),
    setBannerUrl: (url: string | null) => set((s) => ({ ...s, bannerUrl: url })),
    setBannerImages: (banners: BannerImagesResponse) => set((s) => ({ ...s, bannerImages: banners })),
    setBannerImageId: (bannerImageId: string) => set((s) => ({ ...s, bannerImageId })),
    setBannerPositionX: (bannerPositionX: number) => set((s) => ({ ...s, bannerPositionX })),
    setBannerPositionY: (bannerPositionY: number) => set((s) => ({ ...s, bannerPositionY })),
  }))

export type SettingsStoreApi = StoreApi<SettingsStore>
