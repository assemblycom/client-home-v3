'use client'

import { CustomFieldType } from '@assembly/types'
import { useSidebarStore } from '@editor/stores/sidebarStore'
import { useSegmentMutations } from '@segments/hooks/useSegmentMutations'
import { useSegmentStats, useSegments } from '@segments/hooks/useSegments'
import { Button, Icon } from 'copilot-design-system'
import { useEffect, useState } from 'react'
import { useCustomFieldOptions } from '@/features/custom-fields/hooks/useCustomFieldOptions'
import { useCustomFields } from '@/features/custom-fields/hooks/useCustomFields'

type ConditionRow = {
  id: string
  compareValue: string
}

let conditionIdCounter = 0
const nextConditionId = () => `cond-${++conditionIdCounter}`

export const SegmentFormPanel = () => {
  const setSidebarView = useSidebarStore((s) => s.setSidebarView)
  const editingSegmentId = useSidebarStore((s) => s.editingSegmentId)
  const isEditing = editingSegmentId !== null

  const { segments } = useSegments()
  const { stats } = useSegmentStats()
  const { createSegment, updateSegment } = useSegmentMutations()
  const { clientCustomFields } = useCustomFields()

  const selectedCustomFieldKey = useSidebarStore((s) => s.selectedCustomFieldKey)
  const editingSegment = isEditing ? segments.find((s) => s.id === editingSegmentId) : null
  const lockedCustomFieldKey = segments.length > 0 ? segments[0].customField : null

  const [name, setName] = useState('')
  const [conditions, setConditions] = useState<ConditionRow[]>([{ id: nextConditionId(), compareValue: '' }])
  const [errors, setErrors] = useState<{ name?: string; conditions?: string }>({})

  // Resolve custom field metadata
  const customFieldKey = editingSegment?.customField ?? selectedCustomFieldKey ?? lockedCustomFieldKey
  const customField = clientCustomFields.find((f) => f.key === customFieldKey)
  const isMultiSelect = customField?.type === CustomFieldType.TAGS
  const { options } = useCustomFieldOptions(isMultiSelect ? (customField?.id ?? null) : null)

  // Populate form when editing
  useEffect(() => {
    if (editingSegment) {
      setName(editingSegment.name)
      setConditions(editingSegment.conditions.map((c) => ({ id: nextConditionId(), compareValue: c.compareValue })))
    }
  }, [editingSegment])

  const handleBack = () => {
    setSidebarView('default')
  }

  const addCondition = () => {
    setConditions([...conditions, { id: nextConditionId(), compareValue: '' }])
  }

  const updateCondition = (index: number, value: string) => {
    setConditions(conditions.map((c, i) => (i === index ? { ...c, compareValue: value } : c)))
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

    if (isEditing && editingSegmentId) {
      updateSegment.mutate({ id: editingSegmentId, name, conditions: validConditions }, { onSuccess: handleBack })
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
            <div className="flex h-4 overflow-hidden rounded-sm bg-[#dfe1e4]">
              {stats.stats.map((stat) => (
                <div
                  key={stat.name}
                  className="h-full"
                  style={{
                    backgroundColor: stat.color,
                    width: stats.totalClients > 0 ? `${(stat.count / stats.totalClients) * 100}%` : '0%',
                  }}
                />
              ))}
            </div>
            {stats.stats.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="text-sm text-text-primary">{stat.name}</span>
                </div>
                <span className="text-sm text-text-secondary">{stat.count}</span>
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
              errors.name ? 'border-[#991a00]' : 'border-border-gray focus:border-[#212b36]'
            }`}
          />
          {errors.name && <span className="text-[#991a00] text-sm">{errors.name}</span>}
        </div>

        {/* Assignment rules */}
        <div className="flex flex-col gap-3">
          <span className="font-medium text-sm text-text-primary">Show this segment if</span>
          <div className="flex flex-col gap-3 rounded border border-border-gray p-4">
            <span className="text-sm text-text-secondary">{customField?.name ?? customFieldKey}</span>

            {conditions.map((condition, index) => (
              <div key={condition.id} className="flex flex-col gap-1">
                {index > 0 && <span className="font-medium text-sm text-text-primary">Or</span>}
                <div className="flex items-center gap-2">
                  {isMultiSelect ? (
                    <select
                      value={condition.compareValue}
                      onChange={(e) => updateCondition(index, e.target.value)}
                      className="flex-1 rounded border border-border-gray bg-white px-3 py-2 text-sm text-text-primary"
                    >
                      <option value="">Select value</option>
                      {options.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={condition.compareValue}
                      onChange={(e) => updateCondition(index, e.target.value)}
                      placeholder="Enter value"
                      className="flex-1 rounded border border-border-gray bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-[#212b36]"
                    />
                  )}
                  {conditions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="shrink-0 rounded p-1 text-text-secondary hover:bg-gray-100"
                    >
                      <Icon icon="Close" width={14} height={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {errors.conditions && <span className="text-[#991a00] text-sm">{errors.conditions}</span>}

          <button
            type="button"
            onClick={addCondition}
            className="flex items-center gap-2 py-0.5 font-medium text-sm text-text-primary"
          >
            <Icon icon="Plus" width={12} height={12} />
            OR rule
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
