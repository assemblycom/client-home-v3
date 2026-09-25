import { CustomFieldEntityType, type CustomFieldOption, CustomFieldType } from '@assembly/types'
import type { IconType } from '@assembly-js/design-system'

const CUSTOM_FIELD_TYPE_ICON: Record<CustomFieldType, IconType> = {
  [CustomFieldType.ADDRESS]: 'Location',
  [CustomFieldType.EMAIL]: 'Email',
  [CustomFieldType.PHONE_NUMBER]: 'MobileNumber',
  [CustomFieldType.TEXT]: 'Text',
  [CustomFieldType.NUMBER]: 'Number',
  [CustomFieldType.URL]: 'Link',
  [CustomFieldType.TAGS]: 'Tag',
}

export type CustomFieldItem = {
  id: string
  key: string
  name: string
  type: CustomFieldType
  icon: IconType
  options: CustomFieldOption[]
}

/** Nested map: { [entityType]: { [fieldKey]: { [optionKey]: optionLabel } } } */
export type CustomFieldOptionsMap = Record<string, Record<string, Record<string, string>>>

export type CustomFieldItemWithEntity = CustomFieldItem & { entityType: CustomFieldEntityType }

/** Raw custom field as returned by the list endpoint, before UI mapping. */
type RawCustomField = Omit<CustomFieldItem, 'icon'> & {
  order: number
  entityType: CustomFieldEntityType
}

// Sort by display order and attach the type-specific icon, keeping entityType
// so callers can split the combined response.
export const mapCustomFields = (fields: RawCustomField[]): CustomFieldItemWithEntity[] =>
  [...fields]
    .sort((a, b) => a.order - b.order)
    .map(({ id, key, name, type, options, entityType }) => ({
      id,
      key,
      name,
      type,
      options,
      entityType,
      icon: CUSTOM_FIELD_TYPE_ICON[type],
    }))

// Split the combined list by entity type, since field keys are only unique
// within an entity type (client vs company).
export const splitCustomFieldsByEntity = (
  items: CustomFieldItemWithEntity[],
): { clientCustomFields: CustomFieldItem[]; companyCustomFields: CustomFieldItem[] } => {
  const clientCustomFields: CustomFieldItem[] = []
  const companyCustomFields: CustomFieldItem[] = []
  for (const { entityType, ...field } of items) {
    if (entityType === CustomFieldEntityType.CLIENT) clientCustomFields.push(field)
    else if (entityType === CustomFieldEntityType.COMPANY) companyCustomFields.push(field)
  }
  return { clientCustomFields, companyCustomFields }
}
