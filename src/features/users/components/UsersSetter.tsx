'use client'

import { useUsersStore } from '@users/stores/usersStore'
import type { UsersDto } from '@users/users.dto'
import { useEffect } from 'react'
import { getArraySymmetricDifference as getSymmetricDifference } from '@/utils/array'

interface UsersSetterProps {
  users: UsersDto[]
}

export const UsersSetter = ({ users }: UsersSetterProps) => {
  const prevUsers = useUsersStore((state) => state.users)
  const setUsers = useUsersStore((state) => state.setUsers)

  useEffect(() => {
    if (!users.length || prevUsers.length > 0) return

    // NOTE: Might be unnecessary. keeping this just in case.
    // Prevent infinite re-render by comparing if new users have been added or removed
    // if (
    //   getSymmetricDifference(
    //     prevUsers.map((u) => u.id),
    //     users.map((u) => u.id),
    //   ).length === 0
    // )
    //   return

    setUsers(users)
  }, [users, setUsers, prevUsers])

  return null
}
