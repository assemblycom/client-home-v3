import type {
  FieldEntityType,
  FieldItem,
} from '@editor/components/Editor/extensions/AutofillField.ext/autofill-fields.config'
import { DynamicFieldItem } from '@/features/editor/components/Sidebar/DynamicFields/DynamicFieldItem'

type DynamicFieldComponentProps = {
  type: FieldEntityType
  fields: FieldItem[]
}

export const DynamicFieldComponent = ({ type, fields }: DynamicFieldComponentProps) => {
  return (
    <div>
      <div className="flex w-full items-center gap-2">
        <div className="h-px flex-1 bg-border-gray" />
        <span className="text-text-secondary text-xs uppercase leading-4 tracking-[0.3px]">{type}</span>
        <div className="h-px flex-1 bg-border-gray" />
      </div>
      <div className="mt-3 flex flex-col space-y-3">
        {fields.map((item) => (
          <DynamicFieldItem
            key={item.name}
            fieldContent={item.label}
            value={item.value}
            name={item.name}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  )
}
