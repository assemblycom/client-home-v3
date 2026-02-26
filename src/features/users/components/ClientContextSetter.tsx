'use client'

import { useUsersStore } from '@users/stores/usersStore'
import type { ClientContextDto } from '@users/users.dto'
import { useEffect } from 'react'

interface ClientContextSetterProps {
  clientContext: ClientContextDto
}

export const ClientContextSetter = ({ clientContext }: ClientContextSetterProps) => {
  const setClients = useUsersStore((s) => s.setClients)
  const setCompanies = useUsersStore((s) => s.setCompanies)
  const setPreviewCompanyId = useUsersStore((s) => s.setPreviewCompanyId)

  useEffect(() => {
    setClients([clientContext.client])
    if (clientContext.company) {
      setCompanies([clientContext.company])
      setPreviewCompanyId(clientContext.company.id)
    }
  }, [clientContext, setClients, setCompanies, setPreviewCompanyId])

  return null
}
