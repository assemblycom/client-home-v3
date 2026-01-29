'use client'

import { useUsersStore } from '@users/stores/usersStore'
import type { UsersDto } from '@users/users.dto'
import { useEffect } from 'react'

interface UsersSetterProps {
  users: UsersDto
}

export const UsersSetter = ({ users }: UsersSetterProps) => {
  const prevClients = useUsersStore((state) => state.clients)
  const prevCompanies = useUsersStore((state) => state.companies)
  const setClients = useUsersStore((state) => state.setClients)
  const setCompanies = useUsersStore((state) => state.setCompanies)

  useEffect(() => {
    if (!users.clients.length || prevClients.length > 0 || prevCompanies.length > 0) return

    setClients(users.clients)
    setCompanies(users.companies)
  }, [users, setClients, setCompanies, prevClients, prevCompanies])

  return null
}
