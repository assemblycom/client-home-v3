import type { IconType } from 'copilot-design-system'
import type { ActionItemLabel } from '@/features/editor/components/Sidebar/Actions/constant'

export type ActionItemIcon = Extract<IconType, 'Billing' | 'DragDrop' | 'Contract' | 'Tasks' | 'Form' | 'Files'>

export type ActionItemLabelType = (typeof ActionItemLabel)[keyof typeof ActionItemLabel]
