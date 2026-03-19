'use client'

import { AssemblyBridge } from '@assembly-js/app-bridge'
import { Spinner } from '@assembly-js/design-system'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useEffectEvent, useState } from 'react'

export const FreshTokenRedirect = ({ redirectPath }: { redirectPath: string }) => {
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToPage = useEffectEvent((token: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('token', token)
    router.replace(`${redirectPath}?${params.toString()}`)
  })

  useEffect(() => {
    let cancelled = false

    const refreshAndRedirect = async () => {
      try {
        AssemblyBridge.configure({ debug: true })

        let tokenData = AssemblyBridge.sessionToken.getCurrent()

        if (!tokenData?.token) {
          tokenData = await AssemblyBridge.sessionToken.refresh()
        }

        if (cancelled) return

        if (!tokenData?.token) {
          setError('Unable to retrieve session token')
          return
        }

        console.clear()
        console.log(tokenData)

        navigateToPage(tokenData.token)
      } catch (err) {
        if (!cancelled) {
          console.error('[FreshTokenRedirect] Failed to refresh token:', err)
          setError('Failed to refresh session token')
        }
      }
    }

    void refreshAndRedirect()

    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spinner size={5} />
    </div>
  )
}
