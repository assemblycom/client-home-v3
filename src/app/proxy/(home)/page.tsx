import { AssemblyNoTokenError } from '@assembly/errors'
import { BannerImagesFetcher } from '@media/components/BannerImagesFetcher'
import { UsersFetcher } from '@users/components/UsersFetcher'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { AuthenticatedAPIHeaders } from '@/app/types'
import { WorkspaceFetcher } from '@/features/workspace/components/WorkspaceFetcher'
import { HomeLayout } from './HomeLayout'

export default async function Home() {
  const appHeaders = await headers()
  const token = appHeaders.get(AuthenticatedAPIHeaders.CUSTOM_APP_TOKEN)
  if (!token) throw new AssemblyNoTokenError()

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
