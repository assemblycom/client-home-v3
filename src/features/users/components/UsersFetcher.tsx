import type { UsersDto } from '@users/users.dto'
import env from '@/config/env'
import { api } from '@/lib/core/axios.instance'
import { UsersSetter } from './UsersSetter'

interface UsersFetcherProps {
  token: string
}

export const UsersFetcher = async ({ token }: UsersFetcherProps) => {
  const users = await api.get<{ data: UsersDto[] }>(`${env.VERCEL_URL}/api/users?token=${token}`)

  return <UsersSetter users={users.data.data} />
}
