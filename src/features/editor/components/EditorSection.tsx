import { authenticateHeaders } from '@auth/lib/authenticate'
import SettingsActionsService from '@settings/lib/settings-actions.service'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'
import { getQueryClient } from '@/lib/core/query.utils'
import { EditorWrapper } from './EditorWrapper'

export const EditorSection = async () => {
  const requestHeaders = await headers()
  const user = authenticateHeaders(requestHeaders)

  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const settingsService = SettingsActionsService.new(user)
      return await settingsService.getForWorkspace()
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditorWrapper />
    </HydrationBoundary>
  )
}
