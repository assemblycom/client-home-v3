import type { ReactNode } from 'react'
import type { IHandleBarTemplate } from '@/features/handlebar-template/types/hande-bar-template.type'

export function getTemplateValue(
  _template: IHandleBarTemplate,
  fallbackValue?: ReactNode,
): ReactNode | undefined | null {
  // TODO:- implement actual logic
  return fallbackValue
}
