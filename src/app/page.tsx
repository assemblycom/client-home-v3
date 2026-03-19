'use client'

import { FreshTokenRedirect } from '@app-bridge/components/FreshTokenRedirect'

export default function Home() {
  return <FreshTokenRedirect redirectPath="/proxy" />
}
