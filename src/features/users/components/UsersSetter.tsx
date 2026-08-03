'use client'

import { useUsersStore } from '@users/stores/usersStore'
import type { UsersDto } from '@users/users.dto'
import { useEffect } from 'react'

interface UsersSetterProps {
  users: UsersDto
}

export const UsersSetter = ({ users }: UsersSetterProps) => {
  const isInitialized = useUsersStore((state) => state.isInitialized)
  const setInitialized = useUsersStore((state) => state.setInitialized)
  const setClients = useUsersStore((state) => state.setClients)
  const setCompanies = useUsersStore((state) => state.setCompanies)

  useEffect(() => {
    if (isInitialized) return

    setClients(users.clients)
    setCompanies(users.companies)
    setInitialized(true)
  }, [users, setClients, setCompanies, isInitialized, setInitialized])

  return null
}
