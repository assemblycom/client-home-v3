import { AssemblyNoTokenError } from '@assembly/errors'
import { authenticateHeaders } from '@auth/lib/authenticate'
import { EditorWrapper } from '@editor/components/EditorWrapper'
import { Sidebar } from '@editor/components/Sidebar'
import { TopBar } from '@editor/components/TopBar'
import { settings } from '@settings/lib/settings/settings.schema'
import { UsersFetcher } from '@users/components/UsersFetcher'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import db from '@/db'
import { WorkspaceFetcher } from '@/features/workspace/components/WorkspaceFetcher'

export default async function Home() {
  const { workspaceId, token } = authenticateHeaders(await headers())
  if (!token) throw new AssemblyNoTokenError()
  const data = await db
    .select({
      content: settings.content,
      backgroundColor: settings.backgroundColor,
    })
    .from(settings)
    .where(eq(settings.workspaceId, workspaceId))

  const workspaceSettings = data?.at(0)

  return (
    <>
      <Suspense>
        <UsersFetcher token={token} />
      </Suspense>
      <Suspense>
        <WorkspaceFetcher token={token} />
      </Suspense>

      <main
        style={{
          // @ts-expect-error
          '--bg-color': workspaceSettings?.backgroundColor || '#fff',
        }}
        className="brand-scope flex h-screen w-screen max-w-screen"
      >
        <div className="@container flex h-screen flex-1 flex-col overflow-hidden">
          <TopBar />
          <div className="w-full grow overflow-x-hidden overflow-y-scroll @md:px-6 @md:pt-6.5 pb-6.5">
            <EditorWrapper settings={workspaceSettings} />
          </div>
        </div>
        <Sidebar className="w-100 shrink-0" />
      </main>
    </>
  )
}
