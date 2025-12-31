import { cn } from '@/components/utils'
import { Accordion } from '@/features/editor/components/Sidebar/Accordion'
import { Actions } from '@/features/editor/components/Sidebar/Actions'
import { BackgroundColor } from '@/features/editor/components/Sidebar/BackgroundColor'
import { Banner } from '@/features/editor/components/Sidebar/Banner'
import { DynamicFields } from '@/features/editor/components/Sidebar/DynamicFields'
import { Segment } from '@/features/editor/components/Sidebar/Segment'

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
  return (
    <aside className={cn('h-screen overflow-y-auto border-border-gray border-l', className)}>
      <div className="box-content flex h-14 items-center border-border-gray border-b px-6 text-custom-xl">
        Customization
      </div>
      <div className="flex flex-col">
        {AccordionItems.map((item) => (
          <Accordion key={item.title} title={item.title} content={item.content} className="pr-5 pl-6" />
        ))}
      </div>
    </aside>
  )
}
