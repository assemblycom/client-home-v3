'use client'

import { useUsersStore } from '@users/stores/usersStore'
import { PreviewProperty } from './PreviewProperty'

export const PreviewSidebar = () => {
  const client = useUsersStore((store) => store.previewClient)
  const company = useUsersStore((store) => store.previewCompany)

  return (
    <div>
      <div>
        <div className="items-center px-6 py-3">Client Details</div>
        <div className="flex flex-col gap-2 ps-6 pe-6 pb-6">
          <PreviewProperty label="First name" value={client?.firstName} />
          <PreviewProperty label="Last name" value={client?.lastName} />
          <PreviewProperty label="Email" value={client?.email} />
          <PreviewProperty label="Company" value={company?.name} />
          <PreviewProperty label="Address" value={client?.customFields?.address?.addressLine1} />
        </div>
      </div>
      {/* TODO: Hide until we implement custom fields properly */}
      <div>{/* <div className="items-center px-6 py-3">Company Details</div> */}</div>
    </div>
  )
}
