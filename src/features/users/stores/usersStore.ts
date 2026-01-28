import type { UsersDto } from '@users/users.dto'
import { create } from 'zustand'

interface UsersState {
  users: UsersDto[]
}

interface UsersActions {
  setUsers: (users: UsersDto[]) => void
}

const initialState: UsersState = {
  users: [],
}

export const useUsersStore = create<UsersState & UsersActions>()((set) => ({
  ...initialState,
  setUsers: (users: UsersDto[]) => set({ users }),
}))
