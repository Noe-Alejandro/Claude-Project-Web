import { useMutation } from '@tanstack/react-query'
import type { LoginCredentials } from '@domain/models/Auth'
import { AppError } from '@domain/errors/AppError'
import { authService } from './AuthService'

/**
 * Mutations for auth actions.
 * Server state (current user) lives in AuthContext + authService.fetchCurrentUser.
 */

export const useLoginMutation = (onSuccess: (user: import('@domain/models/User').User) => void) =>
  useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (result) => onSuccess(result.user),
    onError: (error) => {
      // Errors are surfaced via the mutation's `error` property in the component
      if (!AppError.isAppError(error)) {
        console.error('[useLoginMutation] unexpected error type:', error)
      }
    },
  })

export const useLogoutMutation = (onSuccess: () => void) =>
  useMutation({
    mutationFn: () => authService.logout(),
    onSuccess,
  })
