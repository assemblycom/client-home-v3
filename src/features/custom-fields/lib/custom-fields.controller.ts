import AssemblyClient from '@assembly/assembly-client'
import { CustomFieldEntityType } from '@assembly/types'
import { authenticateHeaders } from '@auth/lib/authenticate'
import { type NextRequest, NextResponse } from 'next/server'
import z from 'zod'
import type { APIResponse } from '@/app/types'
import { NotFoundError } from '@/errors/not-found.error'

export const listCustomFields = async (
  req: NextRequest,
  { params }: { params: Promise<{ entityType: string }> },
): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const assembly = new AssemblyClient(user.token)

  const entityTypeResult = z.enum(CustomFieldEntityType).safeParse((await params).entityType)

  if (entityTypeResult.error) {
    throw new NotFoundError()
  }

  const response = await assembly.listCustomFields({ entityType: entityTypeResult.data })

  return NextResponse.json(response)
}

export const listCustomFieldOptions = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const { id } = await params
  const assembly = new AssemblyClient(user.token)
  const response = await assembly.listCustomFieldOptions({ id })

  return NextResponse.json(response)
}

/**
 * Returns a nested map of { [entityType]: { [fieldKey]: { [optionKey]: optionLabel } } }
 * for all custom field options. Namespaced by entity type first because
 * field keys are only unique within an entity type (client vs company).
 */
export const listAllCustomFieldOptionsMap = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  const assembly = new AssemblyClient(user.token)

  const [clientFields, companyFields] = await Promise.all([
    assembly.listCustomFields({ entityType: CustomFieldEntityType.CLIENT }),
    assembly.listCustomFields({ entityType: CustomFieldEntityType.COMPANY }),
  ])

  const buildEntityMap = async (fields: { id: string; key: string }[]) => {
    const results = await Promise.all(
      fields.map((field) =>
        assembly
          .listCustomFieldOptions({ id: field.id })
          .then((res) => ({ fieldKey: field.key, options: res.data ?? [] }))
          .catch(() => ({ fieldKey: field.key, options: [] as { key: string; label: string }[] })),
      ),
    )

    const entityMap: Record<string, Record<string, string>> = {}
    for (const { fieldKey, options } of results) {
      const fieldMap: Record<string, string> = {}
      for (const option of options) {
        fieldMap[option.key] = option.label
      }
      entityMap[fieldKey] = fieldMap
    }
    return entityMap
  }

  const [clientMap, companyMap] = await Promise.all([
    buildEntityMap(clientFields.data ?? []),
    buildEntityMap(companyFields.data ?? []),
  ])

  return NextResponse.json({ data: { client: clientMap, company: companyMap } })
}
