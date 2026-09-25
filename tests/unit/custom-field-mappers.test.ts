import { CustomFieldEntityType, CustomFieldType } from '@assembly/types'
import { describe, expect, it } from 'vitest'
import {
  type CustomFieldItemWithEntity,
  mapCustomFields,
  splitCustomFieldsByEntity,
} from '@/features/custom-fields/utils/custom-field-mappers'

// A raw field as returned by the list endpoint (pre UI mapping).
const rawField = (overrides: Partial<Parameters<typeof mapCustomFields>[0][number]> = {}) => ({
  id: 'field-1',
  key: 'field_1',
  name: 'Field 1',
  type: CustomFieldType.TEXT,
  order: 0,
  options: [],
  entityType: CustomFieldEntityType.CLIENT,
  ...overrides,
})

describe('mapCustomFields', () => {
  it('sorts by order and attaches the type-specific icon while keeping entityType', () => {
    const result = mapCustomFields([
      rawField({ id: 'b', order: 2, type: CustomFieldType.EMAIL }),
      rawField({ id: 'a', order: 1, type: CustomFieldType.TAGS }),
    ])

    expect(result.map((f) => f.id)).toEqual(['a', 'b'])
    expect(result[0]).toMatchObject({ id: 'a', icon: 'Tag', entityType: CustomFieldEntityType.CLIENT })
    expect(result[1]).toMatchObject({ id: 'b', icon: 'Email' })
  })

  it('does not mutate the input array', () => {
    const input = [rawField({ id: 'b', order: 2 }), rawField({ id: 'a', order: 1 })]
    mapCustomFields(input)
    expect(input.map((f) => f.id)).toEqual(['b', 'a'])
  })
})

describe('splitCustomFieldsByEntity', () => {
  const items = [
    { entityType: CustomFieldEntityType.CLIENT, id: 'c1' },
    { entityType: CustomFieldEntityType.COMPANY, id: 'co1' },
    { entityType: CustomFieldEntityType.CLIENT, id: 'c2' },
  ] as unknown as CustomFieldItemWithEntity[]

  it('splits fields into client and company lists, preserving order', () => {
    const { clientCustomFields, companyCustomFields } = splitCustomFieldsByEntity(items)
    expect(clientCustomFields.map((f) => f.id)).toEqual(['c1', 'c2'])
    expect(companyCustomFields.map((f) => f.id)).toEqual(['co1'])
  })

  it('strips entityType from the returned items', () => {
    const { clientCustomFields } = splitCustomFieldsByEntity(items)
    expect(clientCustomFields[0]).not.toHaveProperty('entityType')
  })
})

describe('mapCustomFields + splitCustomFieldsByEntity', () => {
  it('turns one mixed, unordered response into two ordered per-entity lists', () => {
    const mapped = mapCustomFields([
      rawField({ id: 'company-late', order: 3, entityType: CustomFieldEntityType.COMPANY }),
      rawField({ id: 'client-late', order: 2, entityType: CustomFieldEntityType.CLIENT }),
      rawField({ id: 'client-early', order: 1, entityType: CustomFieldEntityType.CLIENT }),
    ])

    const { clientCustomFields, companyCustomFields } = splitCustomFieldsByEntity(mapped)

    expect(clientCustomFields.map((f) => f.id)).toEqual(['client-early', 'client-late'])
    expect(companyCustomFields.map((f) => f.id)).toEqual(['company-late'])
  })
})
