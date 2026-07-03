import { z } from 'zod'

// Client-safe env. Only NEXT_PUBLIC_* vars, which Next inlines into the browser bundle.
// NOT marked `server-only` on purpose — this module is imported by client code.
const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_STORAGE_URL: z.url({ protocol: /^https$/ }).nullish(),
})

export const publicEnv = PublicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_STORAGE_URL: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL,
})
