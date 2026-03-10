'use client'

import { EditorWrapper } from '@editor/components/EditorWrapper'
import { Sidebar } from '@editor/components/Sidebar'
import { TopBar } from '@editor/components/TopBar'
import { useSidebarStore } from '@editor/stores/sidebarStore'

export const HomeLayout = () => {
  const mobileSidebarOpen = useSidebarStore((store) => store.mobileSidebarOpen)

  return (
    <div className="flex h-screen w-screen max-w-screen">
      <div className="@container mx-auto flex h-screen max-w-xl flex-1 flex-col overflow-hidden">
        <TopBar />
        {mobileSidebarOpen ? <Sidebar className="flex min-h-0 flex-1 min-[860px]:hidden" /> : null}
        <EditorWrapper className={mobileSidebarOpen ? 'hidden min-[860px]:flex min-[860px]:grow' : undefined} />
      </div>
      <Sidebar className="hidden w-100 shrink-0 min-[860px]:flex" />
    </div>
  )
}
