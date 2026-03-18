import type { UsersDto } from '@users/users.dto'
import { isAxiosError } from 'axios'
import env from '@/config/env'
import { TokenRefreshRedirect } from '@/features/app-bridge/components/TokenRefreshRedirect'
import { api } from '@/lib/core/axios.instance'
import { UsersSetter } from './UsersSetter'

interface UsersFetcherProps {
  token: string
}

export const UsersFetcher = async ({ token }: UsersFetcherProps) => {
  try {
    const users = await api.get<{ data: UsersDto }>(`${env.VERCEL_URL}/api/users?token=${token}`)
    return <UsersSetter users={users.data.data} />
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      return <TokenRefreshRedirect />
    }
    throw error
  }
}
