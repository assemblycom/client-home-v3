import { ActionItemLabel } from '@editor/components/Sidebar/Actions/constant'
import type { ActionItemIcon, ActionItemLabelType } from '@editor/components/Sidebar/Actions/type'
import { useState } from 'react'

export const useActions = () => {
  const [checked, setChecked] = useState<Record<ActionItemLabelType, boolean>>({
    [ActionItemLabel.INVOICE]: false,
    [ActionItemLabel.MESSAGE]: false,
    [ActionItemLabel.CONTRACT]: false,
    [ActionItemLabel.TASKS]: false,
    [ActionItemLabel.FORMS]: false,
    [ActionItemLabel.FILES]: false,
  })

  const actionLabels: Record<ActionItemIcon, ActionItemLabelType> = {
    Billing: ActionItemLabel.INVOICE,
    DragDrop: ActionItemLabel.MESSAGE,
    Contract: ActionItemLabel.CONTRACT,
    Tasks: ActionItemLabel.TASKS,
    Form: ActionItemLabel.FORMS,
    Files: ActionItemLabel.FILES,
  }

  const actionItems = Object.entries(actionLabels).map(([k, v]) => ({
    icon: k as ActionItemIcon,
    label: v,
    onChange: () => setChecked((prev) => ({ ...prev, [v]: !prev[v] })),
  }))

  return { actionItems, checked }
}
