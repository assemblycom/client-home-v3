import { AssemblyNoTokenError } from '@assembly/errors'
import { ClientEditorWrapper } from '@editor/components/ClientEditorWrapper'
import { BannerImagesFetcher } from '@media/components/BannerImagesFetcher'
import { ClientContextFetcher } from '@users/components/ClientContextFetcher'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { AuthenticatedAPIHeaders } from '@/app/types'
import { WorkspaceFetcher } from '@/features/workspace/components/WorkspaceFetcher'

export default async function ClientPage() {
  const appHeaders = await headers()
  const token = appHeaders.get(AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN)
  if (!token) throw new AssemblyNoTokenError()

  return (
    <div className="flex h-screen w-full overflow-x-hidden">
      <Suspense>
        <ClientContextFetcher token={token} />
      </Suspense>
      <Suspense>
        <WorkspaceFetcher token={token} />
      </Suspense>
      <Suspense>
        <BannerImagesFetcher token={token} />
      </Suspense>
      <ClientEditorWrapper />
    </div>
  )
}
