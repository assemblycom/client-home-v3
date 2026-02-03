'use client'

import { useMemo } from 'react'
import type { PropsWithClassname } from '@/app/types'
import { getTimeOfDay } from '@/utils/date'
import { cn } from '@/utils/tailwind'

export const Heading = ({ className }: PropsWithClassname) => {
  const greeting = useMemo(() => getTimeOfDay().charAt(0).toUpperCase() + getTimeOfDay().slice(1), [])

  return (
    <div className={cn('flex font-medium text-custom-xl leading-7', className)}>
      <div>Good {greeting},&nbsp;</div>
      {/* Static placeholder for now */}
      <div>User</div>
    </div>
  )
}
