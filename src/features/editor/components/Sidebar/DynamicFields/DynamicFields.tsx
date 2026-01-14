'use client'

import { DynamicFieldComponent } from '@/features/editor/components/Sidebar/DynamicFields/DynamicFieldComponent'
import { useDynamicFields } from '@/features/editor/components/Sidebar/DynamicFields/useDynamicFields'

export const DynamicFields = () => {
  const { dynamicFields } = useDynamicFields()

  return (
    <>
      <div className="text-[13px] text-text-secondary leading-5.25">
        Click any field to copy it to your clipboard. These fields will be automatically replaced with actual values
        when the document is shared.
      </div>
      <div className="mt-5 flex flex-col space-y-4">
        {dynamicFields.map((item) => (
          <DynamicFieldComponent key={item.type} fieldItem={item} />
        ))}
      </div>
    </>
  )
}
