import env from '@/config/env'
import type { WorkspaceResponse } from '@/lib/assembly/types'
import { api } from '@/lib/core/axios.instance'
import { WorkspaceSetter } from './WorkspaceSetter'

interface WorkspaceFetcherProps {
  token: string
}

export const WorkspaceFetcher = async ({ token }: WorkspaceFetcherProps) => {
  const { data } = await api.get<{ data: WorkspaceResponse }>(`${env.VERCEL_URL}/api/workspace?token=${token}`)

  return <WorkspaceSetter workspace={data.data} />
}
