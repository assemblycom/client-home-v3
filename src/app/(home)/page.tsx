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

      <div className="flex h-screen w-screen max-w-screen">
        <div className="@container flex h-screen flex-1 flex-col overflow-hidden">
          <TopBar />
          <div className="w-full grow overflow-x-hidden overflow-y-scroll bg-background-primary @md:px-6 @md:pt-6.5 pb-6.5">
            <EditorWrapper />
          </div>
        </div>
        <Sidebar className="w-100 shrink-0" />
      </div>
    </>
  )
}
