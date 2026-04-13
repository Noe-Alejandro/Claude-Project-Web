/**
 * AuthService — orchestrates the auth use-cases.
 * No React dependencies. Testable in isolation.
 */

import type { LoginCredentials } from '@domain/models/Auth'
import type { User } from '@domain/models/User'
import { decodeJwtPayload } from '@domain/models/Auth'
import { AppError, ErrorCode } from '@domain/errors/AppError'
import { authApi } from '@infrastructure/api/auth.api'
import { tokenStorage } from '@infrastructure/storage/tokenStorage'

export interface LoginResult {
  user: User
  expiresAt: number
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const response = await authApi.login(credentials)

    const expiresAt = Date.now() + response.expiresIn * 1000
    tokenStorage.setAccessToken(response.accessToken, expiresAt, credentials.rememberMe)
    tokenStorage.setSessionFlag(true, credentials.rememberMe)

    return { user: response.user, expiresAt }
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout()
    } finally {
      // Always clean up client-side state regardless of server response
      tokenStorage.clearAccessToken()
      tokenStorage.setSessionFlag(false)
    }
  },

  async silentRefresh(): Promise<string> {
    try {
      const response = await authApi.refreshToken()
      const expiresAt = Date.now() + response.expiresIn * 1000
      tokenStorage.setAccessToken(response.accessToken, expiresAt)
      return response.accessToken
    } catch (error) {
      tokenStorage.clearAccessToken()
      tokenStorage.setSessionFlag(false)
      throw AppError.fromUnknown(error)
    }
  },

  async fetchCurrentUser(): Promise<User> {
    // If no session flag, skip the request to avoid a known-to-fail call
    if (!tokenStorage.hasSessionFlag() && !tokenStorage.isAccessTokenPresent()) {
      throw new AppError('No active session', ErrorCode.UNAUTHORIZED)
    }

    try {
      // If access token is missing but session flag is set, try a silent refresh first
      if (!tokenStorage.isAccessTokenPresent()) {
        await authService.silentRefresh()
      }

      const response = await authApi.getMe()
      return response.user
    } catch (error) {
      if (AppError.isAppError(error) && error.code === ErrorCode.UNAUTHORIZED) {
        tokenStorage.clearAccessToken()
        tokenStorage.setSessionFlag(false)
      }
      throw error
    }
  },

  decodeToken(token: string) {
    return decodeJwtPayload(token)
  },
}
