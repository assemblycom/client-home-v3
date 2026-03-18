'use client'

import { Icon } from '@assembly-js/design-system'
import { Menu } from '@editor/components/Menu'
import { MenuMode } from '@editor/components/Menu/menuConfig'
import { ClientSelector } from '@editor/components/TopBar/ClientSelector'
import { DisplayModeTab } from '@editor/components/TopBar/DisplayModeTab'
import { SegmentSelector } from '@editor/components/TopBar/SegmentSelector'
import { TabBtn } from '@editor/components/TopBar/TabBtn'
import { useSidebarStore } from '@editor/stores/sidebarStore'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { Activity, useEffect, useEffectEvent, useMemo } from 'react'
import { getActivityMode } from '@/utils/activity'
import { debounce } from '@/utils/debounce'
import { cn } from '@/utils/tailwind'

export const TopBar = () => {
  const viewMode = useViewStore((store) => store.viewMode)
  const changeView = useViewStore((store) => store.changeView)
  const mobileSidebarOpen = useSidebarStore((store) => store.mobileSidebarOpen)
  const toggleMobileSidebar = useSidebarStore((store) => store.toggleMobileSidebar)
  const changeViewInStore = useEffectEvent((viewMode: ViewMode) => changeView({ viewMode }))
  const changeViewModeDebounced = useMemo(() => debounce((view: ViewMode) => changeViewInStore(view), 100), [])

  useEffect(() => {
    return () => {
      changeViewModeDebounced.cancel()
    }
  }, [changeViewModeDebounced])

  return (
    <nav className="@container flex w-full shrink-0 cursor-default flex-col border-border-gray border-b">
      <div className="flex h-14 items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-sm p-1 outline outline-border-gray">
            <TabBtn
              label="Editor"
              active={viewMode === ViewMode.EDITOR}
              handleClick={() => changeViewModeDebounced(ViewMode.EDITOR)}
            />
            <TabBtn
              label="Preview"
              active={viewMode === ViewMode.PREVIEW}
              handleClick={() => changeViewModeDebounced(ViewMode.PREVIEW)}
            />
          </div>
          <Activity mode={getActivityMode(viewMode === ViewMode.EDITOR)}>
            <SegmentSelector />
          </Activity>
          <Activity mode={getActivityMode(viewMode === ViewMode.PREVIEW)}>
            <div className="h-5 w-px bg-border-gray" />
            <ClientSelector />
          </Activity>
        </div>
        <div className="flex items-center gap-2">
          <Activity mode={getActivityMode(viewMode === ViewMode.EDITOR)}>
            <div className="@min-[860px]:block hidden">
              <Menu mode={MenuMode.TOOLBAR} />
            </div>
          </Activity>
          <Activity mode={getActivityMode(viewMode === ViewMode.PREVIEW)}>
            <div className="@min-[860px]:block hidden">
              <DisplayModeTab />
            </div>
          </Activity>
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="flex size-7 cursor-pointer items-center justify-center rounded-sm outline outline-border-gray min-[860px]:hidden"
          >
            <Icon icon={mobileSidebarOpen ? 'SidebarFilled' : 'Sidebar'} width={20} height={20} />
          </button>
        </div>
      </div>
      <Activity mode={getActivityMode(viewMode === ViewMode.EDITOR)}>
        <div
          className={cn(
            'block @min-[860px]:hidden border-border-gray border-t px-5 py-2',
            mobileSidebarOpen && 'hidden',
          )}
        >
          <Menu mode={MenuMode.MOBILE_TOOLBAR} />
        </div>
      </Activity>
    </nav>
  )
}
