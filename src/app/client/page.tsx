import { AssemblyNoTokenError } from '@assembly/errors'
import { ClientEditorWrapper } from '@editor/components/ClientEditorWrapper'
import { CurrentClientFetcher } from '@users/components/CurrentClientFetcher'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { AuthenticatedAPIHeaders } from '@/app/types'
import { WorkspaceFetcher } from '@/features/workspace/components/WorkspaceFetcher'

export default async function ClientPage() {
  const appHeaders = await headers()
  const token = appHeaders.get(AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN)
  if (!token) throw new AssemblyNoTokenError()

  return (
    <div className="flex h-screen w-screen">
      <Suspense>
        <CurrentClientFetcher token={token} />
      </Suspense>
      <Suspense>
        <WorkspaceFetcher token={token} />
      </Suspense>
      <ClientEditorWrapper />
    </div>
  )
}
