import { AssemblyInvalidTokenError, AssemblyNoTokenError } from '@assembly/errors'
import httpStatus from 'http-status'
import { type NextRequest, NextResponse } from 'next/server'
import z, { ZodError } from 'zod'
import env from '@/config/env'
import APIError from '@/errors/api.error'
import type { StatusableError } from '@/errors/base-server.error'
import { NotFoundError } from '@/errors/not-found.error'
import logger from '@/lib/logger'

type RouteContext<P extends Record<string, string>> = { params: Promise<P> }
type SimpleHandler = (req: NextRequest) => Promise<NextResponse>
type ParamsHandler<P extends Record<string, string>> = (req: NextRequest, ctx: RouteContext<P>) => Promise<NextResponse>

/**
 * Reusable utility that wraps a given request handler with a global error handler to standardize response structure
 * in case of failures. Catches exceptions thrown from the handler, and returns a formatted error response.
 *
 * @param {RequestHandler} handler - The request handler to wrap.
 * @returns {RequestHandler} The new handler that includes error handling logic.
 * @example
 * const safeHandler = withErrorHandler(async (req: NextRequest) => {
 *   // your request handling logic
 *   if (errorCondition) {
 *     throw new Error("Oh no!")}
 *   return NextResponse.next();
 * });
 *
 * @throws {ZodError} Captures and handles validation errors and responds with status 400 and the issue detail.
 * @throws {APIError} Captures and handles APIError
 */
export function withErrorHandler(handler: SimpleHandler): SimpleHandler
export function withErrorHandler<P extends Record<string, string>>(handler: ParamsHandler<P>): ParamsHandler<P>
export function withErrorHandler<P extends Record<string, string>>(
  handler: SimpleHandler | ParamsHandler<P>,
): SimpleHandler | ParamsHandler<P> {
  return async (req: NextRequest, ctx?: RouteContext<P>) => {
    // Execute the handler wrapped in a try... catch block
    try {
      return await (handler as ParamsHandler<P>)(req, ctx as RouteContext<P>)
    } catch (error: unknown) {
      // Build error API response and log error
      let message: string | undefined
      let status: number = (error as StatusableError).status || httpStatus.INTERNAL_SERVER_ERROR

      // Build a proper response based on the type of Error encountered
      if (error instanceof NotFoundError) {
        status = httpStatus.NOT_FOUND
        message = 'Not Found'
      } else if (error instanceof ZodError) {
        status = httpStatus.UNPROCESSABLE_ENTITY
        // Prevent leaking internal details of app
        message = env.VERCEL_ENV === 'production' ? 'Failed to parse request body' : z.prettifyError(error)
        logger.error('ZodError :: ', z.prettifyError(error), '\n', error)
      } else if (error instanceof AssemblyNoTokenError) {
        logger.warn('AssemblyNoTokenError :: Found no token for request')
        message = error.message
        status = httpStatus.UNAUTHORIZED
      } else if (error instanceof AssemblyInvalidTokenError) {
        logger.warn('AssemblyInvalidTokenError :: Found invalid token for request')
        message = error.message
        status = httpStatus.UNAUTHORIZED
      } else if (error instanceof APIError) {
        status = error.status
        message = error.message
        if (status !== httpStatus.OK) {
          logger.error('APIError :: ', error.error || error.message)
        }
      } else if (error instanceof Error && error.message) {
        message = error.message
        logger.error('Error :: ', error)
      } else {
        message = 'Something went wrong'
        logger.error('Unhandled error :: ', error)
      }

      // Return a JSON error response instead of HTML error page for API routes
      // In the past we have struggled a lot with "Failed to parse JSON from "<!DOCTYPE..." kind of errors
      if (req.nextUrl.pathname.includes('/api') || req.nextUrl.pathname.includes('/cron')) {
        return NextResponse.json({ error: message }, { status })
      } else {
        // Let NextJS' error boundary handle this
        return NextResponse.next()
      }
    }
  }
}
