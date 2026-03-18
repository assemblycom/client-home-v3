import type { IconType } from '@assembly-js/design-system'
import type { ActionItemLabel } from '@/features/editor/components/Sidebar/Actions/constant'

export type ActionItemIcon = Extract<IconType, 'Billing' | 'Contract' | 'Tasks' | 'Form'>

export type ActionItemLabelType = (typeof ActionItemLabel)[keyof typeof ActionItemLabel]
