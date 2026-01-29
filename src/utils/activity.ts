import 'client-only'
import type { ActivityProps } from 'react'

/**
 * Utilities to work with React's Activity tag
 */

export const getActivityMode = (condition: boolean): NonNullable<ActivityProps['mode']> =>
  condition ? 'visible' : 'hidden'
