import { afterEach, beforeEach, expect, it, vi } from 'vitest'

vi.mock('@/config/env', () => ({ default: { SUPABASE_BUCKET_NAME: 'media' } }))

const { getFileNameWithTimestamp } = await import('@/utils/supabase')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(1_700_000_000_000)
})

afterEach(() => {
  vi.useRealTimers()
})

it('replaces chars Supabase rejects as InvalidKey', () => {
  expect(getFileNameWithTimestamp('Welcome you’ll review — Template ✹ Happy Brand (1).png')).toBe(
    'Welcome you_ll review _ Template _ Happy Brand (1)_1700000000000.png',
  )
})

it('keeps an ordinary screenshot filename intact', () => {
  expect(getFileNameWithTimestamp('Screenshot 2026-10-25 at 9.41.12 AM.png')).toBe(
    'Screenshot 2026-10-25 at 9.41.12 AM_1700000000000.png',
  )
})

it('turns unusual spaces into regular spaces', () => {
  expect(getFileNameWithTimestamp('Screenshot at 9.41.12 AM.png')).toBe('Screenshot at 9.41.12 AM_1700000000000.png')
})
