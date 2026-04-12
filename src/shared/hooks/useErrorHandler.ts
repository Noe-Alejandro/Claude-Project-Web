import { useCallback } from 'react'
import { AppError, getErrorMessage } from '@domain/errors/AppError'

interface UseErrorHandlerResult {
  getDisplayMessage: (error: unknown) => string
  isAppError: (error: unknown) => error is AppError
}

export const useErrorHandler = (): UseErrorHandlerResult => {
  const getDisplayMessage = useCallback((error: unknown): string => {
    if (AppError.isAppError(error)) {
      return getErrorMessage(error.code)
    }
    if (error instanceof Error) {
      return error.message
    }
    return 'An unexpected error occurred'
  }, [])

  return {
    getDisplayMessage,
    isAppError: (error: unknown): error is AppError => AppError.isAppError(error),
  }
}
