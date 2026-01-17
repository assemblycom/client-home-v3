import 'server-only'

import { z } from 'zod'

const EnvSchema = z.object({
  ASSEMBLY_API_KEY: z.string().min(1),

  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(), // NOTE: We can add other custom environments here

  DATABASE_URL: z.url(),
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_BUCKET_NAME: z.string().min(1),
  SUPABASE_SIGNED_URL_EXPIRY: z.number().optional().default(300),
})

export default EnvSchema.parse(process.env)
