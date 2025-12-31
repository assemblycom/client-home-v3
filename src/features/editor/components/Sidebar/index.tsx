import { cn } from '@/components/utils'
import { Accordion } from '@/features/editor/components/Sidebar/Accordion'
import { Banner } from '@/features/editor/components/Sidebar/Banner'

interface SidebarProps {
  className?: string
}

const AccordionItems = [
  {
    title: 'Banner',
    content: <Banner />,
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
