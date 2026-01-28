'use client'

import { useUsersStore } from '@users/stores/usersStore'
import type { UsersDto } from '@users/users.dto'

interface UsersSetterProps {
  users: UsersDto[]
}

export const UsersSetter = ({ users }: UsersSetterProps) => {
  const setUsers = useUsersStore((state) => state.setUsers)
  setUsers(users)

  return null
}
