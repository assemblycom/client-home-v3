'use client'

import { useMemo } from 'react'
import { getTimeOfDay } from '@/utils/date'

export const Heading = () => {
  const greeting = useMemo(() => getTimeOfDay().charAt(0).toUpperCase() + getTimeOfDay().slice(1), [])

  return (
    <div className="flex pt-5 font-medium text-custom-xl leading-7">
      <div>Good {greeting},&nbsp;</div>
      {/* Static placeholder for now */}
      <div>User</div>
    </div>
  )
}
