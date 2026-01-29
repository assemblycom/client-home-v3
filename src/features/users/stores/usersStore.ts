import type { UsersDto } from '@users/users.dto'
import { create } from 'zustand'

interface UsersState {
  previewClientId: string | null
  previewCompanyId: string | null
  users: UsersDto[]
}

interface UsersActions {
  setUsers: (users: UsersDto[]) => void
  setPreviewClientId: (clientId: string) => void
  setPreviewCompanyId: (companyId: string) => void
}

const initialState: UsersState = {
  users: [],
  previewClientId: null,
  previewCompanyId: null,
}

export const useUsersStore = create<UsersState & UsersActions>()((set) => ({
  ...initialState,
  setUsers: (users: UsersDto[]) => set({ users }),
  setPreviewClientId: (clientId: string) => set({ previewClientId: clientId }),
  setPreviewCompanyId: (companyId: string) => set({ previewCompanyId: companyId }),
}))
