import { useEditorStore } from '@editor/stores/editorStore'
import { Icon, type IconType } from 'copilot-design-system'

type DynamicFieldItemProps = {
  fieldContent: string
  value: string
  name: string
  icon: IconType
}

export const DynamicFieldItem = ({ fieldContent, value, name, icon }: DynamicFieldItemProps) => {
  const editor = useEditorStore((s) => s.editor)

  const handleClick = () => {
    editor?.chain().focus().insertAutofillField({ value }).run()
  }

  return (
    <button
      type="button"
      className="w-full cursor-pointer rounded-sm border border-border-gray px-3 py-1.5 text-left hover:bg-background-primary"
      onClick={handleClick}
    >
      <div className="font-medium text-[13px] text-fg-primary leading-5.25">{fieldContent}</div>
      <div className="mt-1 flex items-baseline gap-1.5 text-body-xs text-fg-secondary">
        <Icon icon={icon} width={10} height={10} />
        <span>{name}</span>
      </div>
    </button>
  )
}
