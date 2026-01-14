'use client'

import { ActionItem } from '@/features/editor/components/Sidebar/Actions/ActionItem'
import { useActions } from '@/features/editor/components/Sidebar/Actions/useActions'

export const Actions = () => {
  const { actionItems, checked } = useActions()

  return (
    <>
      <div className="text-[13px] text-text-secondary leading-5.25">
        Toggle each item below to control what's visible in the actions section.
      </div>
      <div className="mt-3 mb-2 rounded-md border border-border-gray p-1">
        {actionItems.map((action) => (
          <ActionItem
            key={action.label}
            icon={action.icon}
            label={action.label}
            onChange={action.onChange}
            checked={checked[action.label]}
          />
        ))}
      </div>
    </>
  )
}
