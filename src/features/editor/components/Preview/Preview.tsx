import { useQuery } from '@tanstack/react-query'
import { ROUTES } from '@/app/routes'
import type { User } from '@/features/auth/lib/user.entity'
import type { WorkspaceResponse } from '@/lib/assembly/types'
import { api } from '@/lib/core/axios.instance'
import { PreviewTopBar } from './PreviewTopBar'

interface Props extends User {}

export function Preview({ token, workspaceId }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () =>
      api.get<{ data: WorkspaceResponse }>(`${ROUTES.api.workspace}?token=${token}`).then((res) => res.data.data),
  })

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <PreviewTopBar url={data?.portalUrl} />

      <div className="flex min-h-32 flex-1 flex-col items-center justify-center p-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
            <p className="animate-pulse text-gray-500">Loading workspace preview...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-8 text-center">
            <p className="font-medium text-red-600">Failed to load preview</p>
            <p className="mt-1 text-red-500 text-sm">Please try again later or check your connection.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center"></div>
        )}
      </div>
    </div>
  )
}
