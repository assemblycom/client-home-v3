import { useState } from 'react'
import { ActionItemLabel } from '@/features/editor/components/Sidebar/Actions/constant'
import type { ActionItemLabelType } from '@/features/editor/components/Sidebar/Actions/type'

export const useActions = () => {
  const [checked, setChecked] = useState<Record<ActionItemLabelType, boolean>>({
    [ActionItemLabel.INVOICE]: false,
    [ActionItemLabel.MESSAGE]: false,
    [ActionItemLabel.CONTRACT]: false,
    [ActionItemLabel.TASKS]: false,
    [ActionItemLabel.FORMS]: false,
    [ActionItemLabel.FILES]: false,
  })

  const handleOnChange = (label: ActionItemLabelType) => {
    console.info('Info: ', label)
    setChecked((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const actionItems = [
    {
      icon: 'Billing' as const,
      label: ActionItemLabel.INVOICE,
      onChange: () => handleOnChange(ActionItemLabel.INVOICE),
    },
    {
      icon: 'DragDrop' as const,
      label: ActionItemLabel.MESSAGE,
      onChange: () => handleOnChange(ActionItemLabel.MESSAGE),
    },
    {
      icon: 'Contract' as const,
      label: ActionItemLabel.CONTRACT,
      onChange: () => handleOnChange(ActionItemLabel.CONTRACT),
    },
    {
      icon: 'Tasks' as const,
      label: ActionItemLabel.TASKS,
      onChange: () => handleOnChange(ActionItemLabel.TASKS),
    },
    {
      icon: 'Form' as const,
      label: ActionItemLabel.FORMS,
      onChange: () => handleOnChange(ActionItemLabel.FORMS),
    },
    {
      icon: 'Files' as const,
      label: ActionItemLabel.FILES,
      onChange: () => handleOnChange(ActionItemLabel.FILES),
    },
  ]

  return { actionItems, checked }
}
