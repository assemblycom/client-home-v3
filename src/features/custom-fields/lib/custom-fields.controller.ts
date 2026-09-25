import AssemblyClient from '@assembly/assembly-client'
import { authenticateHeaders } from '@auth/lib/authenticate'
import { type NextRequest, NextResponse } from 'next/server'
import type { APIResponse } from '@/app/types'

// Returns custom fields for all entity types in a single call.
// The client splits them by entityType, avoiding one request per type.
export const listCustomFields = async (req: NextRequest): Promise<NextResponse<APIResponse>> => {
  const user = authenticateHeaders(req.headers)

  const assembly = new AssemblyClient(user.token)

  const response = await assembly.listCustomFields()

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
    for (const option of field.options) {
      fieldMap[option.key] = option.label
    }
    map[field.entityType][field.key] = fieldMap
  }

  return NextResponse.json({ data: map })
}
