'use client'

import { CustomFieldType } from '@assembly/types'
import { useSidebarStore } from '@editor/stores/sidebarStore'
import { Select } from '@segments/components/Select'
import { useSegmentMutations } from '@segments/hooks/useSegmentMutations'
import { useSegmentStats } from '@segments/hooks/useSegments'
import { Button, Icon } from 'copilot-design-system'
import { useRef, useState } from 'react'
import { useCustomFieldOptions } from '@/features/custom-fields/hooks/useCustomFieldOptions'
import { useCustomFields } from '@/features/custom-fields/hooks/useCustomFields'

type ConditionRow = { id: number; compareValue: string }

export const SegmentFormPanel = () => {
  const currentSegment = useSidebarStore((s) => s.currentSegment)
  const setCurrentSegment = useSidebarStore((s) => s.setCurrentSegment)
  const setExpandSegments = useSidebarStore((s) => s.setExpandSegments)

  const isEditing = !!currentSegment?.id
  const customFieldKey = currentSegment?.customField ?? null

  const { stats } = useSegmentStats()
  const { createSegment, updateSegment } = useSegmentMutations()
  const { clientCustomFields } = useCustomFields()

  const customField = clientCustomFields.find((f) => f.key === customFieldKey)
  const isMultiSelect = customField?.type === CustomFieldType.TAGS
  const { options } = useCustomFieldOptions(isMultiSelect ? (customField?.id ?? null) : null)

  const nextId = useRef(currentSegment?.conditions?.length ?? 1)
  const [name, setName] = useState(currentSegment?.name ?? '')
  const [conditions, setConditions] = useState<ConditionRow[]>(
    currentSegment?.conditions?.length
      ? currentSegment.conditions.map((c, i) => ({ id: i, compareValue: c.compareValue }))
      : [{ id: 0, compareValue: '' }],
  )
  const [errors, setErrors] = useState<{ name?: string; conditions?: string }>({})

  const handleBack = () => {
    setExpandSegments(true)
    setCurrentSegment(null)
  }

  const addCondition = () => {
    setConditions([...conditions, { id: nextId.current++, compareValue: '' }])
  }

  const updateCondition = (index: number, value: string) => {
    setConditions(conditions.map((c, i) => (i === index ? { ...c, compareValue: value } : c)))
    setErrors((prev) => ({ ...prev, conditions: undefined }))
  }

  const removeCondition = (index: number) => {
    if (conditions.length <= 1) return
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    const validConditions = conditions.filter((c) => c.compareValue.trim())
    if (validConditions.length === 0) newErrors.conditions = 'At least one value is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate() || !customFieldKey) return

    const validConditions = conditions
      .filter((c) => c.compareValue.trim())
      .map((c) => ({ compareValue: c.compareValue }))

    if (isEditing && currentSegment?.id) {
      updateSegment.mutate({ id: currentSegment.id, name, conditions: validConditions }, { onSuccess: handleBack })
    } else {
      createSegment.mutate(
        { name, customField: customFieldKey, conditions: validConditions },
        { onSuccess: handleBack },
      )
    }
  }

  const isMutating = createSegment.isPending || updateSegment.isPending

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-border-gray border-b px-6 pt-2 pb-6">
        <button type="button" onClick={handleBack} className="flex cursor-pointer items-center gap-1.5 py-[3px]">
          <Icon icon="ArrowLeft" className="size-2.5" />
          <span className="text-[11px] text-text-primary leading-[18px]">Back</span>
        </button>
        <div className="mt-2 flex flex-col gap-1">
          <h2 className="text-[20px] text-text-primary leading-6">{isEditing ? 'Edit segment' : 'Create segment'}</h2>
          <p className="text-[13px] text-text-secondary leading-[21px]">
            Create a homepage variant for a specific client group.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="shrink-0 border-border-gray border-b px-5 py-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-primary">Total</span>
              <span className="text-text-secondary">{stats.totalClients} clients</span>
            </div>
            <div className="flex h-4 overflow-hidden rounded-sm bg-gray-200">
              {stats.settings.map((setting) => (
                <div
                  key={setting.settingId}
                  className="h-full"
                  style={{
                    backgroundColor: setting.segment?.color ?? '#DFE1E4',
                    width: stats.totalClients > 0 ? `${(setting.clientsCount / stats.totalClients) * 100}%` : '0%',
                  }}
                />
              ))}
            </div>
            {stats.settings.map((setting) => (
              <div key={setting.settingId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: setting.segment?.color ?? '#DFE1E4' }}
                  />
                  <span className="text-sm text-text-primary">{setting.segment?.name ?? 'Default'}</span>
                </div>
                <span className="text-sm text-text-secondary">{setting.clientsCount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 pt-6">
        {/* Name field */}
        <div className="flex flex-col gap-3">
          <span className="font-medium text-sm text-text-primary">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setErrors((prev) => ({ ...prev, name: undefined }))
            }}
            placeholder="e.g. Gold"
            className={`w-full rounded border bg-white px-3 py-2 text-sm text-text-primary outline-none ${
              errors.name ? 'border-error' : 'border-border-gray focus:border-primary'
            }`}
          />
          {errors.name && <span className="text-error text-sm">{errors.name}</span>}
        </div>

        {/* Assignment rules */}
        <div className="flex flex-col gap-1">
          <span className="text-heading-md">
            Show this segment if <b>{customField?.name || customFieldKey}</b> is
          </span>
          {conditions.map((condition, index) => (
            <div key={condition.id} className="flex flex-col gap-1">
              {index > 0 && <span className="font-medium text-sm text-text-primary">Or</span>}
              <div className="flex items-center gap-2">
                {isMultiSelect ? (
                  <Select
                    value={condition.compareValue}
                    onChange={(value) => updateCondition(index, value)}
                    options={options.map((opt) => ({ value: opt.key, label: opt.label }))}
                    placeholder="Select value"
                    className="flex-1"
                  />
                ) : (
                  <input
                    type="text"
                    value={condition.compareValue}
                    onChange={(e) => updateCondition(index, e.target.value)}
                    placeholder="Enter value"
                    className="flex-1 rounded border border-border-gray bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                  />
                )}
                {conditions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCondition(index)}
                    className="shrink-0 rounded p-1 text-text-secondary hover:text-text-primary"
                  >
                    <Icon icon="Trash" width={16} height={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {errors.conditions && <span className="text-error text-sm">{errors.conditions}</span>}

          <button
            type="button"
            onClick={addCondition}
            className="mt-3 flex items-center gap-2 py-0.5 font-medium text-sm text-text-primary"
          >
            <Icon icon="Plus" width={12} height={12} />
            OR
          </button>
        </div>
      </div>

      {/* Action bar */}
      <div className="shrink-0 border-border-gray border-t px-6 py-3">
        <div className="flex items-center gap-2">
          <Button
            label={isMutating ? 'Saving...' : isEditing ? 'Save' : 'Create'}
            variant="primary"
            onClick={handleSubmit}
            disabled={isMutating}
          />
          <Button label="Cancel" variant="secondary" onClick={handleBack} />
        </div>
      </div>
    </div>
  )
}
