'use client'

import { Accordion } from '@editor/components/Sidebar/Accordion'
import { Actions } from '@editor/components/Sidebar/Actions'
import { BackgroundColor } from '@editor/components/Sidebar/BackgroundColor'
import { BannerOptions } from '@editor/components/Sidebar/BannerOptions'
import { DynamicFields } from '@editor/components/Sidebar/DynamicFields'
import { Segment } from '@editor/components/Sidebar/Segment'
import { useSidebarStore } from '@editor/stores/sidebarStore'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { SegmentFormPanel } from '@segments/components/SegmentFormPanel'
import { Activity, useEffect, useMemo } from 'react'
import type { PropsWithClassname } from '@/app/types'
import { getActivityMode } from '@/utils/activity'
import { cn } from '@/utils/tailwind'
import { ChangeBannerPanel } from './ChangeBannerPanel'
import { PreviewSidebar } from './PreviewSidebar'

interface SidebarProps extends PropsWithClassname {}

type AccordionItem = {
  title: string
  content: React.ReactNode
  defaultOpen?: boolean
}

const createAccordionItems = ({
  onChangeBanner,
  expandSegments,
}: {
  onChangeBanner: () => void
  expandSegments: boolean
}): AccordionItem[] => [
  {
    title: 'Banner',
    content: <BannerOptions onChangeBanner={onChangeBanner} />,
  },
  {
    title: 'Actions',
    content: <Actions />,
  },
  {
    title: 'Dynamic fields',
    content: <DynamicFields />,
  },
  {
    title: 'Background color',
    content: <BackgroundColor />,
  },
  {
    title: 'Segments',
    content: <Segment />,
    defaultOpen: expandSegments,
  },
]

export const Sidebar = ({ className }: SidebarProps) => {
  const viewMode = useViewStore((store) => store.viewMode)
  const sidebarView = useSidebarStore((store) => store.sidebarView)
  const setSidebarView = useSidebarStore((store) => store.setSidebarView)
  const currentSegment = useSidebarStore((store) => store.currentSegment)
  const expandSegments = useSidebarStore((store) => store.expandSegments)
  const setExpandSegments = useSidebarStore((store) => store.setExpandSegments)
  const accordionItems = useMemo(
    () => createAccordionItems({ onChangeBanner: () => setSidebarView('change-banner'), expandSegments }),
    [setSidebarView, expandSegments],
  )

  useEffect(() => {
    if (expandSegments) setExpandSegments(false)
  }, [expandSegments, setExpandSegments])
  return (
    <aside className={cn('flex h-screen flex-col border-border-gray min-[860px]:border-l', className)}>
      <Activity mode={getActivityMode(viewMode === ViewMode.EDITOR)}>
        {sidebarView === 'change-banner' ? (
          <ChangeBannerPanel onBack={() => setSidebarView('default')} />
        ) : currentSegment ? (
          <SegmentFormPanel key={currentSegment.id ?? 'new'} />
        ) : (
          <>
            <div className="border-border-gray border-b">
              <div className="flex h-14 items-center px-6 text-custom-xl">Customization</div>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto py-5">
              {accordionItems.map((item) => (
                <Accordion
                  key={item.title}
                  title={item.title}
                  content={item.content}
                  defaultOpen={item.defaultOpen}
                  className="pr-5 pl-6"
                />
              ))}
            </div>
          </>
        )}
      </Activity>
      <Activity mode={getActivityMode(viewMode === ViewMode.PREVIEW)}>
        <PreviewSidebar />
      </Activity>
    </aside>
  )
}
