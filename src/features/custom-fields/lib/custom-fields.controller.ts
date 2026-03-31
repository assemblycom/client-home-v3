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

  const allFields = await assembly.listCustomFields()

  const map: Record<string, Record<string, Record<string, string>>> = {}
  for (const field of allFields.data ?? []) {
    if (!map[field.entityType]) map[field.entityType] = {}
    const fieldMap: Record<string, string> = {}
    for (const option of field.options ?? []) {
      fieldMap[option.key] = option.label
    }
    map[field.entityType][field.key] = fieldMap
  }

  return NextResponse.json({ data: map })
}
