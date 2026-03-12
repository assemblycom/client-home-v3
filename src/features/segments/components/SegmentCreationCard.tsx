'use client'

import { Button, Icon } from 'copilot-design-system'
import { useState } from 'react'
import { useCustomFields } from '@/features/custom-fields/hooks/useCustomFields'

type SegmentCreationCardProps = {
  segmentCount: number
  lockedCustomFieldKey: string | null
  onCreateSegment: (customFieldKey: string) => void
}

const MAX_SEGMENTS = 5

export const SegmentCreationCard = ({
  segmentCount,
  lockedCustomFieldKey,
  onCreateSegment,
}: SegmentCreationCardProps) => {
  const { clientCustomFields, isLoading } = useCustomFields()
  const [selectedKey, setSelectedKey] = useState<string>(lockedCustomFieldKey ?? '')
  const [error, setError] = useState<string | null>(null)

  if (segmentCount >= MAX_SEGMENTS) return null

  const isLocked = lockedCustomFieldKey !== null
  const hasCustomFields = clientCustomFields.length > 0

  const handleCreate = () => {
    if (!selectedKey) {
      setError('Start by selecting a custom field')
      return
    }
    setError(null)
    onCreateSegment(selectedKey)
  }

  return (
    <div className="flex flex-col gap-2 rounded border border-border-gray bg-[#f8f9fb] p-3">
      <span className="text-sm text-text-primary">Segment by</span>

      {!hasCustomFields && !isLoading ? (
        <div className="flex items-center gap-3 rounded border border-border-gray bg-white px-3 py-2">
          <span className="flex-1 text-sm text-text-secondary">No custom fields available</span>
          <Icon icon="QuestionMark" width={14} height={14} className="text-text-secondary" />
        </div>
      ) : (
        <select
          value={selectedKey}
          onChange={(e) => {
            setSelectedKey(e.target.value)
            setError(null)
          }}
          disabled={isLocked || isLoading}
          className={`w-full rounded border bg-white px-3 py-2 text-sm ${
            error ? 'border-[#991a00]' : 'border-border-gray'
          } ${isLocked ? 'text-text-secondary' : 'text-text-primary'}`}
        >
          <option value="">Select custom field</option>
          {clientCustomFields.map((field) => (
            <option key={field.key} value={field.key}>
              {field.name}
            </option>
          ))}
        </select>
      )}

      {error && (
        <div className="flex items-center gap-1">
          <Icon icon="Warning" width={12} height={12} className="text-[#991a00]" />
          <span className="text-[#991a00] text-sm">{error}</span>
        </div>
      )}

      <Button
        label="Create segment"
        variant="secondary"
        className="w-full"
        onClick={handleCreate}
        disabled={!hasCustomFields}
      />
    </div>
  )
}
