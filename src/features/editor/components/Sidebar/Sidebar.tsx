'use client'

import { Accordion } from '@editor/components/Sidebar/Accordion'
import { Actions } from '@editor/components/Sidebar/Actions'
import { BackgroundColor } from '@editor/components/Sidebar/BackgroundColor'
import { Banner } from '@editor/components/Sidebar/Banner'
import { DynamicFields } from '@editor/components/Sidebar/DynamicFields'
import { Segment } from '@editor/components/Sidebar/Segment'
import { useViewStore, ViewMode } from '@editor/stores/viewStore'
import { Activity } from 'react'
import { getActivityMode } from '@/utils/activity'
import { cn } from '@/utils/tailwind'
import { PreviewSidebar } from './PreviewSidebar'

interface SidebarProps {
  className?: string
}

const AccordionItems = [
  {
    title: 'Banner',
    content: <Banner />,
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
  },
]

export const Sidebar = ({ className }: SidebarProps) => {
  const viewMode = useViewStore((store) => store.viewMode)

  return (
    <aside className={cn('h-screen overflow-y-auto border-border-gray border-l', className)}>
      <Activity mode={getActivityMode(viewMode === ViewMode.EDITOR)}>
        <div className="box-content flex h-14 items-center border-border-gray border-b px-6 text-custom-xl">
          Customization
        </div>
        <div className="flex flex-col py-5">
          {AccordionItems.map((item) => (
            <Accordion key={item.title} title={item.title} content={item.content} className="pr-5 pl-6" />
          ))}
        </div>
      </Activity>
      <Activity mode={getActivityMode(viewMode === ViewMode.PREVIEW)}>
        <PreviewSidebar />
      </Activity>
    </aside>
  )
}
