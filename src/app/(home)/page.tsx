import { AssemblyNoTokenError } from '@assembly/errors'
import { EditorWrapper } from '@editor/components/EditorWrapper'
import { Sidebar } from '@editor/components/Sidebar'
import { TopBar } from '@editor/components/TopBar'
import { UsersFetcher } from '@users/components/UsersFetcher'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { AuthenticatedAPIHeaders } from '@/app/types'
import { WorkspaceFetcher } from '@/features/workspace/components/WorkspaceFetcher'

export default async function Home() {
  const appHeaders = await headers()
  const token = appHeaders.get(AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN)
  if (!token) throw new AssemblyNoTokenError()

  return (
    <>
      <Suspense>
        <UsersFetcher token={token} />
      </Suspense>
      <Suspense>
        <WorkspaceFetcher token={token} />
      </Suspense>

      <div className="flex h-screen w-screen">
        <div className="flex-1">
          <TopBar />
          <div className="h-[calc(100vh-64px)] overflow-y-scroll bg-background-primary px-6 py-6.5">
            <EditorWrapper />
          </div>
        </div>
        <Sidebar className="w-1/3 max-w-[394]" />
      </div>
    </>
  )
}
