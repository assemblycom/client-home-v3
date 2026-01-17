import 'client-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import z from 'zod/mini'
import env from '@/config/env'

export default class SupabaseBrowserClient {
  client: SupabaseClient

  constructor() {
    // Use the new zod mini here for reduced bundle size: https://zod.dev/packages/mini
    const publishableKey = z.string().check(z.minLength(1)).parse(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    this.client = createClient(env.SUPABASE_URL, publishableKey)
  }

  // Can use this later for browser-side supabase functionality
}
