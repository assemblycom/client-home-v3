import type { CurrentClientDto } from '@users/users.dto'
import env from '@/config/env'
import { api } from '@/lib/core/axios.instance'
import { CurrentClientSetter } from './CurrentClientSetter'

interface CurrentClientFetcherProps {
  token: string
}

export const CurrentClientFetcher = async ({ token }: CurrentClientFetcherProps) => {
  const { data } = await api.get<{ data: CurrentClientDto }>(`${env.VERCEL_URL}/api/current-client?token=${token}`)

  return <CurrentClientSetter currentClient={data.data} />
}
