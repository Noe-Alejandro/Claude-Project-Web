import type { AxiosError } from 'axios'
import { AppError, ErrorCode } from '@domain/errors/AppError'

interface ApiErrorResponse {
  message?: string
  error?: string
  errors?: Record<string, string[]>
  code?: string
}

const isApiErrorResponse = (data: unknown): data is ApiErrorResponse =>
  typeof data === 'object' && data !== null

export const handleHttpError = (error: AxiosError): AppError => {
  // No response — network/timeout issue
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new AppError('Request timed out', ErrorCode.REQUEST_TIMEOUT)
    }
    return new AppError('Network error — please check your connection', ErrorCode.NETWORK_ERROR)
  }

  const { status, data } = error.response
  const responseData = isApiErrorResponse(data) ? data : null
  const serverMessage = responseData?.message ?? responseData?.error ?? null

  switch (status) {
    case 400:
      return new AppError(
        serverMessage ?? 'Invalid request',
        ErrorCode.VALIDATION_ERROR,
        400,
        responseData?.errors ? { fields: responseData.errors } : null,
      )
    case 401:
      return new AppError(serverMessage ?? 'Unauthorized', ErrorCode.UNAUTHORIZED, 401)
    case 403:
      return new AppError(serverMessage ?? 'Forbidden', ErrorCode.FORBIDDEN, 403)
    case 404:
      return new AppError(serverMessage ?? 'Resource not found', ErrorCode.NOT_FOUND, 404)
    case 409:
      return new AppError(serverMessage ?? 'Conflict', ErrorCode.CONFLICT, 409)
    case 422:
      return new AppError(
        serverMessage ?? 'Validation failed',
        ErrorCode.VALIDATION_ERROR,
        422,
        responseData?.errors ? { fields: responseData.errors } : null,
      )
    case 429:
      return new AppError(serverMessage ?? 'Too many requests', ErrorCode.RATE_LIMITED, 429)
    default:
      if (status >= 500) {
        return new AppError('Server error — please try again later', ErrorCode.SERVER_ERROR, status)
      }
      return new AppError(
        serverMessage ?? 'An unexpected error occurred',
        ErrorCode.UNKNOWN,
        status,
      )
  }
}
