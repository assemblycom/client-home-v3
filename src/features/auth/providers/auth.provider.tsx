'use client'

import type { User } from '@auth/lib/user.entity'
import { type AuthStore, type AuthStoreApi, createAuthStore } from '@auth/stores/authStore'
import { createContext, type PropsWithChildren, useContext, useRef } from 'react'
import { useStore } from 'zustand/react'

const AuthContext = createContext<AuthStoreApi | null>(null)

export function AuthProvider({ children, ...props }: PropsWithChildren<User>) {
  const storeRef = useRef<AuthStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createAuthStore(props)
  }

  return <AuthContext.Provider value={storeRef.current}>{children}</AuthContext.Provider>
}

export const useAuthStore = <T,>(selector: (store: AuthStore) => T): T => {
  const authStoreApi = useContext(AuthContext)

  if (!authStoreApi) {
    throw new Error(`useAuthStore must be used within AuthProvider`)
  }

  return useStore(authStoreApi, selector)
}
