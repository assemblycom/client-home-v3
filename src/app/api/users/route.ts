import { getAllUsers } from '@users/lib/users.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

// Loading the full client list for large workspaces can exceed the default 15s limit.
export const maxDuration = 300

export const GET = withErrorHandler(getAllUsers)
