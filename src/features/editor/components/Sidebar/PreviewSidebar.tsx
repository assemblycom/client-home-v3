'use client'

import { useUsersStore } from '@users/stores/usersStore'
import { useMemo } from 'react'
import { PreviewProperty } from './PreviewProperty'

export const PreviewSidebar = () => {
  const clients = useUsersStore((store) => store.users)
  // const clientId = useUsersStore((store) => store.previewClientId)
  // const companyId = useUsersStore((store) => store.previewCompanyId)
  const clientId = clients[0].id
  const companyId = clients[0].company?.id

  const client = useMemo(
    // biome-ignore lint/suspicious/noDoubleEquals: comparing null with undefined
    () => clients.find((client) => client.id === clientId && client.company?.id == companyId),
    [clients, clientId, companyId],
  )

  return (
    <div>
      <div>
        <div className="items-center px-6 py-3">Client Details</div>
        <div className="flex flex-col gap-2 ps-6 pe-6 pb-6">
          <PreviewProperty label="First name" value={client?.firstName} />
          <PreviewProperty label="Last name" value={client?.lastName} />
          <PreviewProperty label="Email" value={client?.email} />
          <PreviewProperty label="Company" value={client?.company?.name} />
          <PreviewProperty label="Address" value={client?.customFields?.address?.addressLine1} />
        </div>
      </div>
      {/* TODO: Hide until we implement custom fields properly */}
      <div>{/* <div className="items-center px-6 py-3">Company Details</div> */}</div>
    </div>
  )
}
