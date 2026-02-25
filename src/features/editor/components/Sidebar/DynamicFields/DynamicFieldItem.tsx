import { Icon, type IconType } from 'copilot-design-system'

type DynamicFieldItemProps = {
  fieldContent: string
  name: string
  icon: IconType
}

export const DynamicFieldItem = ({ fieldContent, name, icon }: DynamicFieldItemProps) => {
  return (
    <div className="rounded-sm border border-border-gray px-3 py-1.5 hover:bg-background-primary">
      <div className="font-medium text-[13px] text-text-primary leading-5.25">{fieldContent}</div>
      <div className="mt-1 flex items-baseline gap-1.5 text-body-xs text-gray-400">
        <Icon icon={icon} width={10} height={10} />
        <span>{name}</span>
      </div>
    </div>
  )
}
