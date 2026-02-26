import { getCurrentClient } from '@users/lib/users.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getCurrentClient)
