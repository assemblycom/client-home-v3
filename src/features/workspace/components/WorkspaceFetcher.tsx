import env from '@/config/env'
import { withFetcherErrorHandler } from '@/features/app-bridge/lib/handle-fetcher-error'
import type { WorkspaceResponse } from '@/lib/assembly/types'
import { api } from '@/lib/core/axios.instance'
import { WorkspaceSetter } from './WorkspaceSetter'

interface WorkspaceFetcherProps {
  token: string
}

export const WorkspaceFetcher = async ({ token }: WorkspaceFetcherProps) => {
  return await withFetcherErrorHandler(async () => {
    const { data } = await api.get<{ data: WorkspaceResponse }>(`${env.VERCEL_URL}/api/workspace?token=${token}`)
    return <WorkspaceSetter workspace={data.data} />
  })
}
