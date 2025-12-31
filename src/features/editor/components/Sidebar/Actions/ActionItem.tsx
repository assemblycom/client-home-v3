import { Icon, Toggle } from 'copilot-design-system'
import type { ActionItemIcon } from '@/features/editor/components/Sidebar/Actions/type'

type ActionItemProps = {
  icon: ActionItemIcon
  label: string
  checked: boolean
  onChange: () => void
}

export const ActionItem = ({ icon, label, checked, onChange }: ActionItemProps) => {
  return (
    <div className="flex items-center justify-between rounded-sm p-3 hover:bg-background-primary">
      <div className="flex items-center">
        <Icon icon={icon} width={16} height={16} className="text-text-primary" />
        <span className="ml-2 text-sm text-text-primary">{label}</span>
      </div>
      <Toggle label="" checked={checked} onChange={onChange} />
    </div>
  )
}
