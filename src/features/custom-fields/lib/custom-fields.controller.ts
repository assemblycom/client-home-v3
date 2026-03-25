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
 * Returns a nested map of { [fieldKey]: { [optionKey]: optionLabel } }
 * for all custom field options across both client and company entity types.
 * Namespaced by field key to avoid collisions when different fields share option keys.
 */
export const listAllCustomFieldOptionsMap = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)
  const assembly = new AssemblyClient(user.token)

  const [clientFields, companyFields] = await Promise.all([
    assembly.listCustomFields({ entityType: CustomFieldEntityType.CLIENT }),
    assembly.listCustomFields({ entityType: CustomFieldEntityType.COMPANY }),
  ])

  const allFields = [...(clientFields.data ?? []), ...(companyFields.data ?? [])]

  const optionsResults = await Promise.all(
    allFields.map((field) =>
      assembly
        .listCustomFieldOptions({ id: field.id })
        .then((res) => ({ fieldKey: field.key, options: res.data ?? [] }))
        .catch(() => ({ fieldKey: field.key, options: [] as { key: string; label: string }[] })),
    ),
  )

  const map: Record<string, Record<string, string>> = {}
  for (const { fieldKey, options } of optionsResults) {
    const fieldMap: Record<string, string> = {}
    for (const option of options) {
      fieldMap[option.key] = option.label
    }
    map[fieldKey] = fieldMap
  }

  return NextResponse.json(map)
}
