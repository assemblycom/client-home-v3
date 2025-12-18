import 'server-only'

import { z } from 'zod'

const EnvSchema = z.object({
  ASSEMBLY_API_KEY: z.string().min(1),
  DATABASE_URL: z.url(),
  VERCEL_ENV: z.string().optional(),
})

export default EnvSchema.parse(process.env)
