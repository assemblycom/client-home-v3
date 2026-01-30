import { useUsersStore } from '@users/stores/usersStore'
import type { UserCompanySelectorProps } from 'copilot-design-system'
import { useMemo } from 'react'

export const useSelector = () => {
  const clients = useUsersStore((store) => store.clients)
  const companies = useUsersStore((store) => store.companies)
  const setPreviewClientId = useUsersStore((store) => store.setPreviewClientId)
  const setPreviewCompanyId = useUsersStore((store) => store.setPreviewCompanyId)

  const selectorClients = useMemo(
    () =>
      clients.map(
        (client) =>
          ({
            ...client,
            value: client.id,
            label: `${client.firstName} ${client.lastName}`,
            type: 'client',
          }) satisfies UserCompanySelectorProps['clientUsers'][0],
      ),
    [clients],
  )
  const selectorCompanies = useMemo(
    () =>
      companies.map(
        (company) =>
          ({
            ...company,
            value: company.id,
            label: company.name,
            type: 'company',
          }) satisfies UserCompanySelectorProps['companies'][0],
      ),
    [companies],
  )

  const handleSelectorChange = (value: UserCompanySelectorProps['clientUsers'][0]['value']) => {
    const client = value[0]
    if (!client.id) {
      console.error('Failed to select client without id')
    }
    setPreviewClientId(client.id)
    setPreviewCompanyId(client.companyId)
  }

  return { selectorClients, selectorCompanies, handleSelectorChange }
}
