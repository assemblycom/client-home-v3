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
