// Typed application errors — domain layer owns these definitions

export enum ErrorCode {
  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',

  // Network / API
  NETWORK_ERROR = 'NETWORK_ERROR',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',

  // Application
  UNKNOWN = 'UNKNOWN',
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number | null
  public readonly details: Record<string, unknown> | null

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN,
    statusCode: number | null = null,
    details: Record<string, unknown> | null = null,
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details

    // Maintains proper stack trace in V8
    const captureStackTrace = (
      Error as ErrorConstructor & {
        captureStackTrace?: (targetObject: Error, constructorOpt?: unknown) => void
      }
    ).captureStackTrace
    if (typeof captureStackTrace === 'function') {
      captureStackTrace(this, AppError)
    }
  }

  public static isAppError(error: unknown): error is AppError {
    return error instanceof AppError
  }

  public static fromUnknown(error: unknown): AppError {
    if (AppError.isAppError(error)) return error
    if (error instanceof Error) {
      return new AppError(error.message, ErrorCode.UNKNOWN)
    }
    return new AppError('An unexpected error occurred', ErrorCode.UNKNOWN)
  }
}

// User-friendly messages by error code
export const getErrorMessage = (code: ErrorCode): string => {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.UNAUTHORIZED]: 'You are not authorized. Please log in.',
    [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
    [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password.',
    [ErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
    [ErrorCode.TOKEN_REFRESH_FAILED]: 'Failed to refresh your session.',
    [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
    [ErrorCode.REQUEST_TIMEOUT]: 'Request timed out. Please try again.',
    [ErrorCode.SERVER_ERROR]: 'Server error. Please try again later.',
    [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorCode.CONFLICT]: 'A conflict occurred. Please refresh and try again.',
    [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
    [ErrorCode.RATE_LIMITED]: 'Too many requests. Please wait a moment.',
    [ErrorCode.UNKNOWN]: 'An unexpected error occurred.',
  }
  return messages[code]
}
