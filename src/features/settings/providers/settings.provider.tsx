'use client'

import type { SettingsWithActions } from '@settings/lib/settings-actions.entity'
import { createSettingsStore, type SettingsStore, type SettingsStoreApi } from '@settings/stores/settingsStore'
import { createContext, type PropsWithChildren, useContext, useRef } from 'react'
import { useStore } from 'zustand/react'

export const SettingsContext = createContext<SettingsStoreApi | null>(null)

export const SettingsProvider = ({ children, settings }: PropsWithChildren<{ settings: SettingsWithActions }>) => {
  const storeRef = useRef<SettingsStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createSettingsStore(settings)
  }

  return <SettingsContext.Provider value={storeRef.current}>{children}</SettingsContext.Provider>
}

export const useSettingsStore = <T,>(selector: (store: SettingsStore) => T): T => {
  const settingsStoreApi = useContext(SettingsContext)

  if (!settingsStoreApi) {
    throw new Error(`useSettingsStore must be used within SettingsProvider`)
  }

  return useStore(settingsStoreApi, selector)
}
