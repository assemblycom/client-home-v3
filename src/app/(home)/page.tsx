import { AssemblyMissingHeadersError } from '@assembly/errors'
import { BannerImagesFetcher } from '@media/components/BannerImagesFetcher'
import { UsersFetcher } from '@users/components/UsersFetcher'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { HomeLayout } from '@/app/(home)/HomeLayout'
import { AuthenticatedAPIHeaders } from '@/app/types'
import { WorkspaceFetcher } from '@/features/workspace/components/WorkspaceFetcher'

export default async function Home() {
  const appHeaders = await headers()
  const token = appHeaders.get(AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN)
  if (!token) throw new AssemblyMissingHeadersError()

  return (
    <>
      <Suspense fallback={null}>
        <UsersFetcher token={token} />
      </Suspense>
      <Suspense fallback={null}>
        <WorkspaceFetcher token={token} />
      </Suspense>
      <Suspense fallback={null}>
        <BannerImagesFetcher token={token} />
      </Suspense>

      <HomeLayout />
    </>
  )
}
