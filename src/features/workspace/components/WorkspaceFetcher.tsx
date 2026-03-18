import { isAxiosError } from 'axios'
import env from '@/config/env'
import { TokenRefreshRedirect } from '@/features/app-bridge/components/TokenRefreshRedirect'
import type { WorkspaceResponse } from '@/lib/assembly/types'
import { api } from '@/lib/core/axios.instance'
import { WorkspaceSetter } from './WorkspaceSetter'

interface WorkspaceFetcherProps {
  token: string
}

export const WorkspaceFetcher = async ({ token }: WorkspaceFetcherProps) => {
  try {
    const { data } = await api.get<{ data: WorkspaceResponse }>(`${env.VERCEL_URL}/api/workspace?token=${token}`)
    return <WorkspaceSetter workspace={data.data} />
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      return <TokenRefreshRedirect />
    }
    throw error
  }
}
