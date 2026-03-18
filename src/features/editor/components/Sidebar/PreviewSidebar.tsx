'use client'

import { Callout, Icon } from '@assembly-js/design-system'
import { useViewStore } from '@editor/stores/viewStore'
import { useUsersStore } from '@users/stores/usersStore'
import { PreviewProperty } from './PreviewProperty'

export const PreviewSidebar = () => {
  const client = useUsersStore((store) => store.previewClient)
  const company = useUsersStore((store) => store.previewCompany)
  const portalUrl = useViewStore((store) => store.workspace?.portalUrl)

  const values = [
    client?.firstName,
    client?.lastName,
    client?.email,
    company?.name,
    client?.customFields?.address?.addressLine1,
    company?.customFields?.website,
  ]
  const hasMissingValues = values.some((v) => !v)

  return (
    <div>
      {hasMissingValues && (
        <div className="items-center px-6 pt-2 leading-6">
          <Callout
            variant="warning"
            title="Heads up — missing client data"
            description="Some values are missing. Check your CRM before publishing."
            footerAction={{
              href: portalUrl,
              target: '_blank',
              style: { fontFamily: 'Inter', fontSize: '14px', fontWeight: 400, lineHeight: '22px' },
              children: (
                <>
                  Go to CRM <Icon icon="ArrowNE" className="inline size-3.5" />
                </>
              ),
            }}
          />
        </div>
      )}
      <div>
        <div className="items-center px-6 py-3 font-medium leading-6">Client Details</div>
        <div className="flex flex-col gap-2 ps-6 pe-6 pb-6">
          <PreviewProperty label="First name" value={client?.firstName} />
          <PreviewProperty label="Last name" value={client?.lastName} />
          <PreviewProperty label="Email" value={client?.email} />
          <PreviewProperty label="Company" value={company?.name} />
          <PreviewProperty label="Address" value={client?.customFields?.address?.addressLine1} />
        </div>
      </div>
      {/* TODO: Hide until we implement custom fields properly */}
      <div className="items-center px-6 py-3 font-medium leading-6">Company Details</div>
      <div className="flex flex-col gap-2 ps-6 pe-6 pb-6">
        <PreviewProperty label="Website" value={company?.customFields?.website} />
      </div>
    </div>
  )
}
