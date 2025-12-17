import 'server-only'

import { z } from 'zod'

const EnvSchema = z.object({
  ASSEMBLY_API_KEY: z.string().min(1),
  DATABASE_URL: z.url(),
  VERCEL_ENV: z.string().optional(),
})

const env = process.env.GITHUB_ACTIONS === 'true' ? {} : EnvSchema.parse(process.env)
export default env
