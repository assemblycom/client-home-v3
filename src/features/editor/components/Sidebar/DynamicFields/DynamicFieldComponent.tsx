import type {
  FieldEntityType,
  FieldItem,
} from '@editor/components/Editor/extensions/AutofillField.ext/autofill-fields.config'
import { DynamicFieldItem } from '@/features/editor/components/Sidebar/DynamicFields/DynamicFieldItem'
import type { WorkspaceResponse } from '@/lib/assembly/types'

type DynamicFieldComponentProps = {
  type: FieldEntityType
  labels?: WorkspaceResponse['labels']
  fields: FieldItem[]
}

const getSectionLabel = (type: FieldEntityType, labels?: WorkspaceResponse['labels']): string => {
  if (type === 'client') return labels?.individualTerm ?? 'client'
  if (type === 'company') return labels?.groupTerm ?? 'company'
  return type
}

export const DynamicFieldComponent = ({ type, labels, fields }: DynamicFieldComponentProps) => {
  return (
    <div>
      <div className="flex w-full items-center gap-2">
        <div className="h-px flex-1 bg-border-gray" />
        <span className="text-text-secondary text-xs uppercase leading-4 tracking-[0.3px]">
          {getSectionLabel(type, labels)}
        </span>
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
