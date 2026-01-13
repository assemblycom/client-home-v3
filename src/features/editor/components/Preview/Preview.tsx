import type { User } from '@/features/auth/lib/user.entity'

// async function fetchWorkspaceDetail(token: string) {
//   return fetch(`/api/workspace?token=${token}`, {
//     method: 'GET',
//     headers: {
//       'Authorization': `Bearer ${token}`
//     },
//   }).then(res => res.json() as Promise<WorkspaceResponse>);
// }

interface Props extends User {}

export function Preview({ token }: Props) {
  // const [portalUrl, setPortalUrl] = useState("");
  // useEffect(() => {
  //   fetchWorkspaceDetail(token).then((res) => {
  //     setPortalUrl('');
  //   })
  // }, [])
  return (
    <div>
      Preview Mode
      <span>{token}</span>
    </div>
  )
}
