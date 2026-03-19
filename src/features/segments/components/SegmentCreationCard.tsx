'use client'

import { CustomFieldEntityType } from '@assembly/types'
import { Button, Icon, Tooltip } from '@assembly-js/design-system'
import { Select } from '@segments/components/Select'
import { useSegmentConfigMutation } from '@segments/hooks/useSegmentConfigMutation'
import { useEffect, useMemo, useState } from 'react'
import { useCustomFields } from '@/features/custom-fields/hooks/useCustomFields'

type SegmentCreationCardProps = {
  segmentCount: number
  lockedCustomFieldId?: string
  hasClients: boolean
  onCreateSegment: () => void
}

const MAX_SEGMENTS = 6 // including default

export const SegmentCreationCard = ({
  segmentCount,
  lockedCustomFieldId,
  hasClients,
  onCreateSegment,
}: SegmentCreationCardProps) => {
  const { clientCustomFields, companyCustomFields, isLoading } = useCustomFields()
  const [selectedId, setSelectedId] = useState<string>('')

  useEffect(() => {
    if (lockedCustomFieldId && !selectedId) {
      setSelectedId(lockedCustomFieldId)
    }
  }, [lockedCustomFieldId, selectedId])
  const [error, setError] = useState<string | null>(null)
  const upsertConfig = useSegmentConfigMutation()

  const allCustomFields = useMemo(
    () => [...clientCustomFields, ...companyCustomFields],
    [clientCustomFields, companyCustomFields],
  )

  const groups = useMemo(
    () => [
      {
        label: 'Client',
        options: clientCustomFields.map((f) => ({ value: f.id, label: f.name })),
      },
      {
        label: 'Company',
        options: companyCustomFields.map((f) => ({ value: f.id, label: f.name })),
      },
    ],
    [clientCustomFields, companyCustomFields],
  )

  if (segmentCount >= MAX_SEGMENTS) return null

  // Lock the custom field selector when custom segments exist (more than just default)
  const hasCustomSegments = segmentCount > 1
  const isLocked = hasCustomSegments && !!lockedCustomFieldId
  const hasCustomFields = clientCustomFields.length > 0 || companyCustomFields.length > 0
  const isDisabled = !hasClients || !hasCustomFields

  const handleCreate = async () => {
    const fieldId = isLocked ? lockedCustomFieldId : selectedId
    if (!fieldId) {
      setError('Start by selecting a custom field')
      return
    }

    const field = allCustomFields.find((f) => f.id === fieldId)
    if (!field) {
      setError('Selected custom field not found')
      return
    }

    const entityType = companyCustomFields.some((f) => f.id === field.id)
      ? CustomFieldEntityType.COMPANY
      : CustomFieldEntityType.CLIENT

    setError(null)

    try {
      const configUnchanged = lockedCustomFieldId === field.id
      if (!configUnchanged) {
        await upsertConfig.mutateAsync({
          customField: field.key,
          customFieldId: field.id,
          entityType,
        })
      }
      onCreateSegment()
    } catch {
      setError('Failed to save custom field configuration')
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded border border-border-gray bg-background-primary p-3">
      <span className="text-sm text-text-primary">Segment by</span>

      {isDisabled && !isLoading ? (
        <div className="flex items-center gap-3 rounded border border-border-gray bg-white px-3 py-2">
          <span className="flex-1 text-sm text-text-secondary">
            {!hasClients ? 'No clients available' : 'No custom fields available'}
          </span>
          <Tooltip
            content={
              !hasClients
                ? 'Add clients to your workspace to start segmenting.'
                : 'Use CRM tags to decide who sees this segment.'
            }
            tooltipClassname={'text-body-sm max-w-[90dvw]'}
            actionType="link"
            actionProps={{
              href: !hasClients
                ? 'https://assembly.com/guide/intro-to-clients'
                : 'https://assembly.com/guide/custom-fields',
              target: '_blank',
              children: <span className={'whitespace-nowrap'}>Help guide</span>,
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Icon icon="QuestionMark" width={14} height={14} className="cursor-pointer text-text-secondary" />
          </Tooltip>
        </div>
      ) : isLocked ? (
        <Tooltip
          content="You can only segment by one custom field at a time. To change the custom field, delete your existing segments first."
          tooltipClassname="text-body-sm max-w-[240px]"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <div>
            <Select
              value={lockedCustomFieldId}
              onChange={() => undefined}
              options={[]}
              groups={groups}
              placeholder="Select custom field"
              disabled
              error={!!error}
            />
          </div>
        </Tooltip>
      ) : (
        <Select
          value={selectedId}
          onChange={(value) => {
            setSelectedId(value)
            setError(null)
          }}
          options={[]}
          groups={groups}
          placeholder="Select custom field"
          disabled={isLoading}
          error={!!error}
        />
      )}

      {error && (
        <div className="flex items-center gap-1">
          <Icon icon="Warning" width={12} height={12} className="text-error" />
          <span className="text-error text-sm">{error}</span>
        </div>
      )}

      <Button
        label={upsertConfig.isPending ? 'Saving...' : 'Create segment'}
        variant="secondary"
        className="w-full"
        onClick={handleCreate}
        disabled={isDisabled || upsertConfig.isPending}
      />
    </div>
  )
}
