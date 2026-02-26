'use client'

import { useUsersStore } from '@users/stores/usersStore'
import type { CurrentClientDto } from '@users/users.dto'
import { useEffect } from 'react'

interface CurrentClientSetterProps {
  currentClient: CurrentClientDto
}

export const CurrentClientSetter = ({ currentClient }: CurrentClientSetterProps) => {
  const setClients = useUsersStore((s) => s.setClients)
  const setCompanies = useUsersStore((s) => s.setCompanies)
  const setPreviewCompanyId = useUsersStore((s) => s.setPreviewCompanyId)

  useEffect(() => {
    setClients([currentClient.client])
    if (currentClient.company) {
      setCompanies([currentClient.company])
      setPreviewCompanyId(currentClient.company.id)
    }
  }, [currentClient, setClients, setCompanies, setPreviewCompanyId])

  return null
}
