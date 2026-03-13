import { Button, Icon, Tooltip } from '@assembly-js/design-system'
import { Select } from '@segments/components/Select'
import { useState } from 'react'
import { useCustomFields } from '@/features/custom-fields/hooks/useCustomFields'

type SegmentCreationCardProps = {
  segmentCount: number
  lockedCustomFieldKey?: string
  hasClients: boolean
  onCreateSegment: () => void
}

const MAX_SEGMENTS = 6 // including default

export const SegmentCreationCard = ({
  segmentCount,
  lockedCustomFieldKey,
  hasClients,
  onCreateSegment,
}: SegmentCreationCardProps) => {
  const { clientCustomFields, isLoading } = useCustomFields()
  const [selectedKey, setSelectedKey] = useState<string>(lockedCustomFieldKey ?? '')
  const [error, setError] = useState<string | null>(null)

  if (segmentCount >= MAX_SEGMENTS) return null

  const isLocked = !!lockedCustomFieldKey
  const hasCustomFields = clientCustomFields.length > 0
  const isDisabled = !hasClients || !hasCustomFields

  const handleCreate = () => {
    if (!isLocked && !selectedKey) {
      setError('Start by selecting a custom field')
      return
    }
    setError(null)
    onCreateSegment()
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
      ) : (
        <Select
          value={selectedKey}
          onChange={(value) => {
            setSelectedKey(value)
            setError(null)
          }}
          options={clientCustomFields.map((f) => ({ value: f.key, label: f.name }))}
          placeholder="Select custom field"
          disabled={isLocked || isLoading}
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
        label="Create segment"
        variant="secondary"
        className="w-full"
        onClick={handleCreate}
        disabled={isDisabled}
      />
    </div>
  )
}
