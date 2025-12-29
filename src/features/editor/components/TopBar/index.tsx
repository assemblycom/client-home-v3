'use client'

import { TabBtn } from '@editor/components/TopBar/TabBtn'

export const TopBar = () => {
  return (
    <nav className="flex min-h-8 cursor-default items-center justify-between border-border-gray border-b px-5 py-3">
      <div className="flex items-center gap-2 rounded-sm p-1 outline outline-border-gray">
        <TabBtn label="Editor" active={true} handleClick={() => null} />
        <TabBtn label="Preview" active={false} handleClick={() => null} />
      </div>
    </nav>
  )
}
