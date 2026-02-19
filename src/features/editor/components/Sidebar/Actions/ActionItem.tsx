import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon, Toggle } from 'copilot-design-system'
import type { ActionItemIcon } from '@/features/editor/components/Sidebar/Actions/type'

type ActionItemProps = {
  id: string
  icon: ActionItemIcon
  label: string
  checked: boolean
  onChange: () => void
}

export const ActionItem = ({ id, icon, label, checked, onChange }: ActionItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center justify-between rounded-sm p-3 hover:bg-background-primary"
    >
      <div className="flex items-center">
        <button
          {...attributes}
          {...listeners}
          className="mr-2 cursor-grab touch-none text-text-secondary active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <Icon icon="DragDrop" width={16} height={16} />
        </button>
        <Icon icon={icon} width={16} height={16} className="text-text-primary" />
        <span className="ml-2 text-sm text-text-primary">{label}</span>
      </div>
      <Toggle label="" checked={checked} onChange={onChange} />
    </div>
  )
}
