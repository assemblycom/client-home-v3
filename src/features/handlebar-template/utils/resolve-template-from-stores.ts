import { useViewStore } from '@editor/stores/viewStore'
import { useUsersStore } from '@users/stores/usersStore'
import {
  CUSTOM_FIELD_OPTIONS_MAP_QUERY_KEY,
  type CustomFieldOptionsMap,
} from '@/features/custom-fields/hooks/useCustomFields'
import { getQueryClient } from '@/lib/core/query.utils'
import { resolveTemplate } from './resolve-template'

/**
 * Resolves a template string using the current store / query-cache state,
 * outside of the React render cycle.
 *
 * Used by the autofill node's `renderText` so that copying an autofill field
 * yields the resolved value (in preview/client view) rather than nothing. When
 * no preview client is available (e.g. in the editor) resolution returns an
 * empty string and we fall back to the raw template so the handlebar is copied.
 */
export const resolveTemplateFromStores = (template: string): string => {
  const { previewClient, previewCompany } = useUsersStore.getState()
  const { workspace } = useViewStore.getState()
  const optionsMap = getQueryClient().getQueryData<CustomFieldOptionsMap>([CUSTOM_FIELD_OPTIONS_MAP_QUERY_KEY]) ?? {}

  return resolveTemplate(template, previewClient, previewCompany, workspace, optionsMap)
}
