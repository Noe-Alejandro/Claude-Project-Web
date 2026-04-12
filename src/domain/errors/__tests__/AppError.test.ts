import { describe, expect, it } from 'vitest'
import { AppError, ErrorCode, getErrorMessage } from '../AppError'

describe('AppError', () => {
  it('still constructs correctly when captureStackTrace is unavailable', () => {
    const errorWithCaptureStackTrace = Error as ErrorConstructor & {
      captureStackTrace?: (targetObject: Error, constructorOpt?: unknown) => void
    }
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      errorWithCaptureStackTrace,
      'captureStackTrace',
    )

    Object.defineProperty(errorWithCaptureStackTrace, 'captureStackTrace', {
      value: undefined,
      configurable: true,
      writable: true,
    })

    try {
      const error = new AppError('No stack helper')

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('No stack helper')
      expect(error.code).toBe(ErrorCode.UNKNOWN)
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(errorWithCaptureStackTrace, 'captureStackTrace', originalDescriptor)
      } else {
        Reflect.deleteProperty(errorWithCaptureStackTrace, 'captureStackTrace')
      }
    }
  })

  it('stores custom metadata on the error instance', () => {
    const details = { field: 'email' }
    const error = new AppError('Validation failed', ErrorCode.VALIDATION_ERROR, 422, details)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('AppError')
    expect(error.message).toBe('Validation failed')
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR)
    expect(error.statusCode).toBe(422)
    expect(error.details).toBe(details)
  })

  it('uses safe defaults when optional arguments are omitted', () => {
    const error = new AppError('Unexpected')

    expect(error.code).toBe(ErrorCode.UNKNOWN)
    expect(error.statusCode).toBeNull()
    expect(error.details).toBeNull()
  })

  it('identifies AppError instances correctly', () => {
    expect(AppError.isAppError(new AppError('Boom'))).toBe(true)
    expect(AppError.isAppError(new Error('Boom'))).toBe(false)
    expect(AppError.isAppError('Boom')).toBe(false)
  })

  it('returns the same instance when normalizing an AppError', () => {
    const appError = new AppError('Known', ErrorCode.FORBIDDEN)

    expect(AppError.fromUnknown(appError)).toBe(appError)
  })

  it('wraps native Error instances when normalizing unknown errors', () => {
    const normalized = AppError.fromUnknown(new Error('Native failure'))

    expect(normalized).toBeInstanceOf(AppError)
    expect(normalized.message).toBe('Native failure')
    expect(normalized.code).toBe(ErrorCode.UNKNOWN)
  })

  it('falls back to a generic message for non-Error unknown values', () => {
    const normalized = AppError.fromUnknown({ message: 'not trusted' })

    expect(normalized).toBeInstanceOf(AppError)
    expect(normalized.message).toBe('An unexpected error occurred')
    expect(normalized.code).toBe(ErrorCode.UNKNOWN)
  })
})

describe('getErrorMessage', () => {
  it('returns a user-facing message for every known error code', () => {
    const messages = Object.values(ErrorCode).map((code) => getErrorMessage(code))

    expect(messages).toEqual([
      'You are not authorized. Please log in.',
      'You do not have permission to perform this action.',
      'Invalid email or password.',
      'Your session has expired. Please log in again.',
      'Failed to refresh your session.',
      'Network error. Please check your connection.',
      'Request timed out. Please try again.',
      'Server error. Please try again later.',
      'The requested resource was not found.',
      'A conflict occurred. Please refresh and try again.',
      'Please check your input and try again.',
      'Too many requests. Please wait a moment.',
      'An unexpected error occurred.',
    ])
  })
})
