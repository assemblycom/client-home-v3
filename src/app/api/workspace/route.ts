import { getWorkspaceDetail } from '@/features/workspace/lib/workspace.controller'
import { withErrorHandler } from '@/lib/with-error-handler'

export const GET = withErrorHandler(getWorkspaceDetail)
