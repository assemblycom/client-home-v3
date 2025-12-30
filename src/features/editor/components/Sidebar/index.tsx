import { cn } from '@/components/utils'
import { Accordion } from '@/features/editor/components/Sidebar/Accordion'

interface SidebarProps {
  className?: string
}

const AccordionItems = [
  {
    title: 'Banner',
    content: (
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2">
          <span className="text-gray-500">Dummy banner section</span>
          <span className="text-gray-900">Image</span>
        </div>
        <div className="flex items-center gap-x-2">
          <span className="text-gray-500">Banner Color</span>
          <span className="text-gray-900">Color</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Actions',
    content: 'Space for actions',
  },
  {
    title: 'Dynamic fields',
    content: 'Space for dynamic fields',
  },
  {
    title: 'Background color',
    content: 'Space for background color',
  },
  {
    title: 'Segments',
    content: 'Space for segments',
  },
]

export const Sidebar = ({ className }: SidebarProps) => {
  return (
    <aside className={cn('h-screen border-border-gray border-l', className)}>
      <div className="box-content flex h-14 items-center border-border-gray border-b px-6 text-custom-xl">
        Customization
      </div>
      <div className="flex flex-col">
        {AccordionItems.map((item) => (
          <Accordion key={item.title} title={item.title} content={item.content} />
        ))}
      </div>
    </aside>
  )
}
