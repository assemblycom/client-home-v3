import { BaseServerError } from '@/errors/base-server-error'

class APIError extends BaseServerError {
  constructor(
    message: string,
    readonly status: number = 500,
    readonly error?: unknown,
  ) {
    super(message, status)
    this.name = 'APIError'
  }
}

export default APIError
