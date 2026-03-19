import type { User } from '@auth/lib/user.entity'
import { createStore } from 'zustand'
import { useStore } from 'zustand/react'

export const TOKEN_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface AuthState extends User {
  tokenExpiresAt: number
}

interface AuthAction {
  setUser: (user: User) => void
  setToken: (token: string) => void
}

export type AuthStore = AuthState & AuthAction

export const authStore = createStore<AuthStore>()((set) => ({
  token: '',
  workspaceId: '',
  tokenExpiresAt: 0,
  setUser: (user: User) => set(() => ({ ...user, tokenExpiresAt: Date.now() + TOKEN_TTL_MS })),
  setToken: (token: string) => set({ token, tokenExpiresAt: Date.now() + TOKEN_TTL_MS }),
}))

export const useAuthStore = <T>(selector: (store: AuthStore) => T): T => useStore(authStore, selector)
