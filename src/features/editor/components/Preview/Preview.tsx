import { useQuery } from '@tanstack/react-query'
import { ROUTES } from '@/app/routes'
import type { User } from '@/features/auth/lib/user.entity'
import type { WorkspaceResponse } from '@/lib/assembly/types'
import { api } from '@/lib/core/axios.instance'

// async function fetchWorkspaceDetail(token: string) {
//   return fetch(`/api/workspace?token=${token}`, {
//     method: 'GET',
//     headers: {
//       'Authorization': `Bearer ${token}`
//     },
//   }).then(res => res.json() as Promise<WorkspaceResponse>);
// }

interface Props extends User {}

export function Preview({ token, workspaceId }: Props) {
  const _ = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => {
      api.get<WorkspaceResponse>(`${ROUTES.api.workspace}?token=${token}`).then((res) => res.data)
    },
  })
  return (
    <div>
      Preview Mode
      <span>{token}</span>
    </div>
  )
}
