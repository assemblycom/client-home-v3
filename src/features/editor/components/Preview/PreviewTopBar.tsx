import type React from 'react'

interface PreviewTopBarProps {
  url?: string
}

export const PreviewTopBar: React.FC<PreviewTopBarProps> = ({ url }) => {
  return (
    <div className="grid grid-cols-[3.25rem_1fr_3.25rem] items-center justify-between gap-2.5 bg-white px-5 py-2">
      <div className="flex gap-1.5">
        <div className="h-3 w-3 overflow-clip rounded-full bg-neutral-200" />
        <div className="h-3 w-3 rounded-full bg-neutral-200" />
        <div className="h-3 w-3 rounded-full bg-neutral-200" />
      </div>
      <div className="flex justify-center">
        <div className="line-clamp-1 w-full max-w-109 truncate text-ellipsis rounded-md bg-neutral-100 px-3 pt-1.25 pb-1 text-center text-gray-300 text-xs">
          {url || ''}
        </div>
      </div>
      <div />
    </div>
  )
}
