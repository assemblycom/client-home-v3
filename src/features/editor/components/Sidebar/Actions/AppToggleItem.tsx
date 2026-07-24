import { Icon, type IconType, Toggle } from '@assembly-js/design-system'

type AppToggleItemProps = {
  icon: IconType
  label: string
  checked: boolean
  onChange: () => void
}

// Toggle row for a dynamic Studio app. Mirrors ActionItem's layout but without the
// drag handle — Studio-app rows are excluded from reorder in v1. The leading spacer
// keeps app icons aligned with the built-in rows' icons.
export const AppToggleItem = ({ icon, label, checked, onChange }: AppToggleItemProps) => {
  return (
    <div className="flex items-center justify-between rounded-sm p-3 hover:bg-background-primary">
      <div className="flex items-center">
        <span className="mr-2 w-4" aria-hidden />
        <Icon icon={icon} width={16} height={16} className="text-text-primary" />
        <span className="ml-2 text-sm text-text-primary">{label}</span>
      </div>
      <Toggle label="" checked={checked} onChange={onChange} />
    </div>
  )
}
