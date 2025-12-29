import { cn } from '@/components/utils'

interface SidebarProps {
  className?: string
}

export const Sidebar = ({ className }: SidebarProps) => {
  return (
    <aside className={cn('h-screen border-border-gray border-l', className)}>
      <div className="box-content flex h-14 items-center border-border-gray border-b px-6 text-custom-xl">
        Customization
      </div>
    </aside>
  )
}
