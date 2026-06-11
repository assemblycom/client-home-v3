import type { SettingsResponseDto } from '@settings/lib/settings-actions.dto'
import { createStore, type StoreApi } from 'zustand'
import type { BannerImagesResponse } from '@/features/banner/types'

interface SettingsState extends SettingsResponseDto {
  initialSettings: SettingsResponseDto
}

interface SettingsAction {
  setContent: (content: string) => void
  setHeading: (heading: string) => void
  setSubheading: (subheading: string) => void
  /**
   * Set a heading/subheading field to its canonical editor serialization on both
   * the live value and the change-detection baseline, atomically. Used so a
   * legacy/plain-text value loaded into the editor doesn't read as dirty.
   */
  syncCanonicalContent: (key: 'heading' | 'subheading', value: string) => void
  setActions: (actions: SettingsResponseDto['actions']) => void
  setSettings: (settings: Partial<SettingsResponseDto>) => void
  setInitialSettings: (settings: SettingsResponseDto) => void
  setBannerUrl: (url: string | null) => void
  setBannerImages: (banners: BannerImagesResponse) => void
  setBannerImageId: (bannerImageId: string | null) => void
  setBannerPositionX: (bannerPositionX: number) => void
  setBannerPositionY: (bannerPositionY: number) => void
  setShowGreeting: (showGreeting: boolean) => void
}

export type SettingsStore = SettingsState & SettingsAction

export const createSettingsStore = (settings: SettingsResponseDto) =>
  createStore<SettingsStore>()((set) => ({
    ...settings,
    initialSettings: settings,

    setContent: (content: string) => set((s) => ({ ...s, content })),
    setHeading: (heading: string) => set((s) => ({ ...s, heading })),
    setSubheading: (subheading: string) => set((s) => ({ ...s, subheading })),
    syncCanonicalContent: (key: 'heading' | 'subheading', value: string) =>
      set((s) => ({ ...s, [key]: value, initialSettings: { ...s.initialSettings, [key]: value } })),
    setActions: (actions: SettingsResponseDto['actions']) =>
      set((s) => ({ ...s, actions: { ...s.actions, ...actions } })),
    setSettings: (newSettings: Partial<SettingsResponseDto>) => set((s) => ({ ...s, ...newSettings })),
    setInitialSettings: (newSettings: Partial<SettingsResponseDto>) =>
      set((s) => ({ ...s, initialSettings: { ...s.initialSettings, ...newSettings } })),
    setBannerUrl: (url: string | null) => set((s) => ({ ...s, bannerUrl: url })),
    setBannerImages: (banners: BannerImagesResponse) => set((s) => ({ ...s, bannerImages: banners })),
    setBannerImageId: (bannerImageId: string | null) => set((s) => ({ ...s, bannerImageId })),
    setBannerPositionX: (bannerPositionX: number) => set((s) => ({ ...s, bannerPositionX })),
    setBannerPositionY: (bannerPositionY: number) => set((s) => ({ ...s, bannerPositionY })),
    setShowGreeting: (showGreeting: boolean) => set((s) => ({ ...s, showGreeting })),
  }))

export type SettingsStoreApi = StoreApi<SettingsStore>
