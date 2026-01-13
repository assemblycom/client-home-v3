'use client'

import { TabBtn } from '@editor/components/TopBar/TabBtn'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'

export const TopBar = () => {
  const { viewMode, setViewMode } = useViewStore()

  return (
    <nav className="flex min-h-8 cursor-default items-center justify-between border-border-gray border-b px-5 py-3">
      <div className="flex items-center gap-2 rounded-sm p-1 outline outline-border-gray">
        <TabBtn label="Editor" active={viewMode === ViewMode.EDITOR} handleClick={() => setViewMode(ViewMode.EDITOR)} />
        <TabBtn label="Preview" active={viewMode === ViewMode.PREVIEW} handleClick={() => null} />
      </div>
    </nav>
  )
}
