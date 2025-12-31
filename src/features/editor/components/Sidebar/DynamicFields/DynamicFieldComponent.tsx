import { DynamicFieldItem } from '@/features/editor/components/Sidebar/DynamicFields/DynamicFieldItem'
import type { DynamicField } from '@/features/editor/components/Sidebar/DynamicFields/type'

type DynamicFieldComponentProps = {
  fieldItem: DynamicField
}

export const DynamicFieldComponent = ({ fieldItem }: DynamicFieldComponentProps) => {
  return (
    <div>
      <div className="flex w-full items-center gap-2">
        <div className="h-px flex-1 bg-border-gray" />
        <span className="text-text-secondary text-xs uppercase leading-4 tracking-[0.3px]">{fieldItem.type}</span>
        <div className="h-px flex-1 bg-border-gray" />
      </div>
      <div className="mt-3 flex flex-col space-y-3">
        {fieldItem.data.map((item) => (
          <DynamicFieldItem key={item.name} fieldContent={item.fieldContent} name={item.name} />
        ))}
      </div>
    </div>
  )
}
