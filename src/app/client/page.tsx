import { authenticateHeaders } from '@auth/lib/authenticate'
import { ClientEditorWrapper } from '@editor/components/ClientEditorWrapper'
import { settings } from '@settings/lib/settings/settings.schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import db from '@/db'

export default async function ClientPage() {
  const { workspaceId } = authenticateHeaders(await headers())
  const data = await db
    .select({
      content: settings.content,
    })
    .from(settings)
    .where(eq(settings.workspaceId, workspaceId))

  return (
    <div className="flex h-screen w-screen">
      <ClientEditorWrapper content={data.at(0)?.content || ''} />
    </div>
  )
}
