import type { User } from '@auth/lib/user.entity'
import { createStore, type StoreApi } from 'zustand'

interface AuthState extends User {}

interface AuthAction {
  setUser: (user: User) => void
  setToken: (token: string) => void
}

export type AuthStore = AuthState & AuthAction

export const createAuthStore = (user: User) =>
  createStore<AuthStore>()((set) => ({
    ...user,
    setUser: (user: User) => set(() => user),
    setToken: (token: string) => set({ token }),
  }))

export type AuthStoreApi = StoreApi<AuthStore>
