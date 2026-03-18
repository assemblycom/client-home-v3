import type { ClientContextDto } from '@users/users.dto'
import { isAxiosError } from 'axios'
import env from '@/config/env'
import { TokenRefreshRedirect } from '@/features/app-bridge/components/TokenRefreshRedirect'
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
    if (isAxiosError(error) && error.response?.status === 403) {
      return <TokenRefreshRedirect />
    }
    throw error
  }
}
