import { Icon } from 'copilot-design-system'

type DynamicFieldItemProps = {
  fieldContent: string
  name: string
}

export const DynamicFieldItem = ({ fieldContent, name }: DynamicFieldItemProps) => {
  return (
    <div className="rounded-sm border border-border-gray px-3 py-1.5 hover:bg-background-primary">
      <div className="font-medium text-[13px] text-text-primary leading-5.25">{fieldContent}</div>
      <div className="mt-1 flex items-center text-text-secondary text-xs leading-5">
        <Icon icon="Profile" width={10} height={10} />
        <span className="ml-1.5">{name}</span>
      </div>
    </div>
  )
}
