import 'server-only'

import { z } from 'zod'

const EnvSchema = z.object({
  ASSEMBLY_API_KEY: z.string().min(1),

  TASKS_ASSEMBLY_API_KEY: z.string().min(1),
  TASKS_APP_ID: z.uuid(),

  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(), // NOTE: We can add other custom environments here
  VERCEL_URL: z.url(),

  DATABASE_URL: z.url(),
  SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_BUCKET_NAME: z.string().min(1),
  SUPABASE_SIGNED_URL_EXPIRY: z.number().optional().default(300),
})

const currentEnv = process.env.VERCEL_ENV

const vercelUrl = currentEnv === 'production' ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_URL

export default EnvSchema.parse({
  ...process.env,
  VERCEL_URL:
    process.env.VERCEL_ENV === 'production'
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_ENV === 'preview'
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000',
})
