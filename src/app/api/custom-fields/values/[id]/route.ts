import { listCustomFieldOptions } from '@/features/custom-fields/lib/custom-fields.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(listCustomFieldOptions)
