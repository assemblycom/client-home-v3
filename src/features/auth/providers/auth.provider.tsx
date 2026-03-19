'use client'

import type { User } from '@auth/lib/user.entity'
import { authStore, TOKEN_TTL_MS } from '@auth/stores/authStore'
import { type PropsWithChildren, useRef } from 'react'

export { useAuthStore } from '@auth/stores/authStore'

export const AuthProvider = ({ children, ...user }: PropsWithChildren<User>) => {
  const initialized = useRef(false)
  if (!initialized.current) {
    authStore.setState({ ...user, tokenExpiresAt: Date.now() + TOKEN_TTL_MS })
    initialized.current = true
  }

  return children
}
