'use client'

import { Button, Icon } from '@assembly-js/design-system'
import { useSegmentMutations } from '@segments/hooks/useSegmentMutations'
import { useState } from 'react'

export const SegmentDeletedFieldCard = () => {
  const { deleteAllSegments } = useSegmentMutations()
  const [error, setError] = useState<string | null>(null)

  const handleClearSegments = async () => {
    setError(null)
    try {
      await deleteAllSegments.mutateAsync()
    } catch {
      setError('Failed to clear segments')
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded border border-error/30 bg-error/5 p-3">
      <div className="flex items-start gap-2">
        <Icon icon="Warning" width={14} height={14} className="mt-0.5 shrink-0 text-error" />
        <p className="text-sm text-text-primary">
          The custom field used for segmentation has been deleted. Clear all existing segments to select a new one.
        </p>
      </div>

      {error && <span className="text-error text-sm">{error}</span>}

      <Button
        label={deleteAllSegments.isPending ? 'Clearing...' : 'Clear all segments'}
        variant="secondary"
        className="w-full"
        onClick={handleClearSegments}
        disabled={deleteAllSegments.isPending}
      />
    </div>
  )
}
