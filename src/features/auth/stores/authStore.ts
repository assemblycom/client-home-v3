import type { ClientUser } from '@auth/lib/user.entity'
import { createStore, type StoreApi } from 'zustand'

interface AuthState extends ClientUser {}

interface AuthAction {
  setUser: (user: ClientUser) => void
}

export type AuthStore = AuthState & AuthAction

export const createAuthStore = (user: ClientUser) =>
  createStore<AuthStore>()((set) => ({
    ...user,
    setUser: (user: ClientUser) => set(() => user),
  }))

export type AuthStoreApi = StoreApi<AuthStore>
