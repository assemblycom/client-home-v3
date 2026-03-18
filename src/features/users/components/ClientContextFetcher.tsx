import type { ClientContextDto } from '@users/users.dto'
import env from '@/config/env'
import { handleFetcherError } from '@/features/app-bridge/lib/handle-fetcher-error'
import { api } from '@/lib/core/axios.instance'
import { ClientContextSetter } from './ClientContextSetter'

interface ClientContextFetcherProps {
  token: string
}

export const ClientContextFetcher = async ({ token }: ClientContextFetcherProps) => {
  try {
    const { data } = await api.get<{ data: ClientContextDto }>(`${env.VERCEL_URL}/api/client-context?token=${token}`)
    return <ClientContextSetter clientContext={data.data} />
  } catch (error) {
    return handleFetcherError(error)
  }
}
