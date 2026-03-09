import { writeFileSync } from 'node:fs'
import { type BrowserContext, chromium } from '@playwright/test'
import { settings } from '@settings/lib/settings/settings.schema'
import z from 'zod'
import db from '@/db'
import AssemblyClient from '@/lib/assembly/assembly-client'
import { encodePayload } from '@/utils/crypto'

const BASE_URL = 'http://localhost:3000'
const CONCURRENCY = 3
const apiKey = z.string().min(1).parse(process.env.ASSEMBLY_API_KEY)
console.log('apiKey', apiKey)

type TestResult = {
  token: string
  payload: Record<string, string> | null
  status: 'passed' | 'failed' | 'skipped'
  errors?: string
}

type WorkspaceReport = {
  internal_user: TestResult
  client: TestResult
}

const validatePage = async (context: BrowserContext, url: string): Promise<Omit<TestResult, 'token' | 'payload'>> => {
  const page = await context.newPage()
  const crashes: string[] = []

  page.on('pageerror', (err) => {
    crashes.push(err.message)
  })

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })

    if (!response || response.status() >= 400) {
      return { status: 'failed', errors: `HTTP ${response?.status() ?? 'no response'}` }
    }

    // Wait for Next.js to render meaningful content
    await page.waitForSelector('main, #__next > *', { timeout: 15_000 })

    // Check for Next.js error overlay (indicates a crash)
    const hasErrorOverlay = await page.$('nextjs-portal, [data-nextjs-dialog]').then(Boolean)
    if (hasErrorOverlay) {
      return { status: 'failed', errors: 'Next.js error overlay detected' }
    }

    return crashes.length > 0 ? { status: 'failed', errors: crashes.join('\n') } : { status: 'passed' }
  } catch (err) {
    return { status: 'failed', errors: String(err) }
  } finally {
    await page.close()
  }
}

// --- Process a single workspace ---

const processWorkspace = async (
  context: BrowserContext,
  workspace: { workspaceId: string; createdById: string | null },
): Promise<WorkspaceReport> => {
  const skipped = (reason: string): TestResult => ({ token: '', payload: null, status: 'skipped', errors: reason })

  // Bootstrap: need createdById to create an initial token
  if (!workspace.createdById) {
    return {
      internal_user: skipped('No createdById on settings row'),
      client: skipped('No createdById — cannot bootstrap AssemblyClient'),
    }
  }

  let assembly: AssemblyClient
  try {
    const bootstrapToken = encodePayload(apiKey, {
      workspaceId: workspace.workspaceId,
      internalUserId: workspace.createdById,
    })
    assembly = new AssemblyClient(bootstrapToken)
  } catch (err) {
    const reason = `AssemblyClient bootstrap failed: ${err}`
    return {
      internal_user: { token: '', payload: null, status: 'failed', errors: reason },
      client: { token: '', payload: null, status: 'failed', errors: reason },
    }
  }

  // --- Internal user ---
  let internalResult: TestResult
  try {
    const internalUsersRes = await assembly.getInternalUsers({ limit: 1 })
    const internalUser = internalUsersRes.data[0]

    if (!internalUser) {
      internalResult = skipped('No internal users in workspace')
    } else {
      const payload = {
        workspaceId: workspace.workspaceId,
        internalUserId: internalUser.id,
      }
      const token = encodePayload(apiKey, payload)
      const url = `${BASE_URL}/?token=${token}`
      const result = await validatePage(context, url)
      internalResult = { token, payload, ...result }
    }
  } catch (err) {
    internalResult = { token: '', payload: null, status: 'failed', errors: `Internal user fetch/test failed: ${err}` }
  }

  // --- Client user ---
  let clientResult: TestResult
  try {
    const clientsRes = await assembly.getClients({ limit: 1 })
    const client = clientsRes.data?.[0]

    if (!client) {
      clientResult = skipped('No clients in workspace')
    } else if (!client.companyIds?.[0]) {
      clientResult = skipped('Client has no companyIds')
    } else {
      const payload = {
        workspaceId: workspace.workspaceId,
        clientId: client.id,
        companyId: client.companyIds[0],
      }
      const token = encodePayload(apiKey, payload)
      const url = `${BASE_URL}/?client=${token}`
      const result = await validatePage(context, url)
      clientResult = { token, payload, ...result }
    }
  } catch (err) {
    clientResult = { token: '', payload: null, status: 'failed', errors: `Client fetch/test failed: ${err}` }
  }

  return { internal_user: internalResult, client: clientResult }
}

;(async () => {
  // 1. Query all workspaces
  const workspaces = await db
    .selectDistinct({ workspaceId: settings.workspaceId, createdById: settings.createdById })
    .from(settings)
    .limit(100)

  console.info(`Found ${workspaces.length} workspaces to validate`)

  if (workspaces.length === 0) {
    console.info('Nothing to validate.')
    return
  }

  // 2. Launch browser
  const browser = await chromium.launch()
  const context = await browser.newContext()

  // 3. Process in batches
  const report: Record<string, WorkspaceReport> = {}

  for (let i = 0; i < workspaces.length; i += CONCURRENCY) {
    const batch = workspaces.slice(i, i + CONCURRENCY)

    const results = await Promise.all(
      batch.map(async (ws) => {
        const result = await processWorkspace(context, ws)
        console.info(
          `[${i + batch.indexOf(ws) + 1}/${workspaces.length}] ${ws.workspaceId} — IU: ${result.internal_user.status}, Client: ${result.client.status}`,
        )
        return { workspaceId: ws.workspaceId, result }
      }),
    )

    for (const { workspaceId, result } of results) {
      report[workspaceId] = result
    }
  }

  // 4. Cleanup
  await context.close()
  await browser.close()

  // 5. Write report
  writeFileSync('migration_report.json', JSON.stringify(report, null, 2))

  // 6. Summary
  const entries = Object.values(report)
  const count = (key: 'internal_user' | 'client', status: string) =>
    entries.filter((e) => e[key].status === status).length

  console.info('\n=== Migration Validation Report ===')
  console.info(`Total workspaces: ${entries.length}`)
  console.info(
    `Internal user: ${count('internal_user', 'passed')} passed, ${count('internal_user', 'failed')} failed, ${count('internal_user', 'skipped')} skipped`,
  )
  console.info(
    `Client: ${count('client', 'passed')} passed, ${count('client', 'failed')} failed, ${count('client', 'skipped')} skipped`,
  )
  console.info('Report written to migration_report.json')
})()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
