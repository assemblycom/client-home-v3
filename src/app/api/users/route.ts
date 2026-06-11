import { getAllUsers } from '@users/lib/users.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

// Fetching every client (paginated 5k at a time) for workspaces with 10k+ clients
// can exceed Vercel's default 15s function limit. Raise the ceiling as a stopgap;
// the long-term fix is to stop loading the full client list on every page load.
export const maxDuration = 300

export const GET = withErrorHandler(getAllUsers)
