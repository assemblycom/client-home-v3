'use client'

import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ActionItem } from '@editor/components/Sidebar/Actions/ActionItem'
import { useActions } from '@editor/components/Sidebar/Actions/useActions'

export const Actions = () => {
  const { actionItems, onReorder } = useActions()

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = actionItems.findIndex((item) => item.key === active.id)
    const newIndex = actionItems.findIndex((item) => item.key === over.id)
    const reordered = arrayMove(actionItems, oldIndex, newIndex)
    onReorder(reordered.map((item) => item.key))
  }

  return (
    <>
      <div className="text-[13px] text-text-secondary leading-5.25">
        Toggle each item below to control what's visible in the actions section.
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={actionItems.map((a) => a.key)} strategy={verticalListSortingStrategy}>
          <div className="mt-3 mb-2 rounded-md border border-border-gray p-1">
            {actionItems.map((action) => (
              <ActionItem
                key={action.key}
                id={action.key}
                icon={action.icon}
                label={action.label}
                onChange={action.onChange}
                checked={action.checked}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  )
}
