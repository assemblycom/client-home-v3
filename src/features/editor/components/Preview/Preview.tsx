import { useAuthStore } from '@auth/providers/auth.provider'
import { Loader } from '@common/components/Loader'
import { PreviewTopBar } from '@editor/components/Preview/PreviewTopBar'
import { DisplayMode, useViewStore } from '@editor/stores/viewStore'
import { useQuery } from '@tanstack/react-query'
import { ROUTES } from '@/app/routes'
import type { WorkspaceResponse } from '@/lib/assembly/types'
import { api } from '@/lib/core/axios.instance'
import { cn } from '@/utils/tailwind'

export function Preview() {
  const workspaceId = useAuthStore((store) => store.workspaceId)
  const token = useAuthStore((store) => store.token)
  const displayMode = useViewStore((store) => store.displayMode)

  const { data, isLoading, error } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () =>
      api.get<{ data: WorkspaceResponse }>(`${ROUTES.api.workspace}?token=${token}`).then((res) => res.data.data),
  })

  return (
    <div
      className={cn(
        'mx-auto flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm',
        {
          'max-w-sm': displayMode === DisplayMode.MOBILE,
        },
      )}
    >
      <PreviewTopBar url={data?.portalUrl} />

      <div className="flex min-h-32 flex-1 flex-col items-center justify-center p-6">
        {isLoading ? (
          <Loader />
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
