import { getAllUsers } from '@users/lib/users.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getAllUsers)
