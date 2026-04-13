import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LoginCredentials } from '@domain/models/Auth'
import type { User } from '@domain/models/User'
import { AppError, ErrorCode } from '@domain/errors/AppError'
import { authService } from '../AuthService'

const authApiMocks = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  getMe: vi.fn(),
}))

const tokenStorageMocks = vi.hoisted(() => ({
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
  getTokenExpiresAt: vi.fn(),
  isAccessTokenPresent: vi.fn(),
  clearAccessToken: vi.fn(),
  setSessionFlag: vi.fn(),
  hasSessionFlag: vi.fn(),
}))

vi.mock('@infrastructure/api/auth.api', () => ({
  authApi: authApiMocks,
}))

vi.mock('@infrastructure/storage/tokenStorage', () => ({
  tokenStorage: tokenStorageMocks,
}))

const mockUser: User = {
  id: 'usr_1',
  email: 'user@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'admin',
  avatarUrl: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  lastLoginAt: null,
}

const credentials: LoginCredentials = {
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true,
}

describe('authService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('logs in, stores the token, and returns the calculated expiry', async () => {
    authApiMocks.login.mockResolvedValue({
      accessToken: 'token-123',
      expiresIn: 900,
      user: mockUser,
    })

    const result = await authService.login(credentials)

    expect(authApiMocks.login.mock.calls).toEqual([[credentials]])
    expect(tokenStorageMocks.setAccessToken.mock.calls).toEqual([
      ['token-123', Date.now() + 900_000, true],
    ])
    expect(tokenStorageMocks.setSessionFlag.mock.calls).toEqual([[true, true]])
    expect(result).toEqual({
      user: mockUser,
      expiresAt: Date.now() + 900_000,
    })
  })

  it('clears local auth state even when logout fails', async () => {
    authApiMocks.logout.mockRejectedValue(new Error('server down'))

    await expect(authService.logout()).rejects.toThrow('server down')
    expect(tokenStorageMocks.clearAccessToken.mock.calls).toHaveLength(1)
    expect(tokenStorageMocks.setSessionFlag.mock.calls).toEqual([[false]])
  })

  it('refreshes the token and persists the new expiry', async () => {
    authApiMocks.refreshToken.mockResolvedValue({
      accessToken: 'fresh-token',
      expiresIn: 300,
    })

    await expect(authService.silentRefresh()).resolves.toBe('fresh-token')
    expect(tokenStorageMocks.setAccessToken.mock.calls).toEqual([
      ['fresh-token', Date.now() + 300_000],
    ])
  })

  it('normalizes refresh failures and clears auth state', async () => {
    authApiMocks.refreshToken.mockRejectedValue(new Error('refresh failed'))

    await expect(authService.silentRefresh()).rejects.toMatchObject({
      message: 'refresh failed',
      code: ErrorCode.UNKNOWN,
    })
    expect(tokenStorageMocks.clearAccessToken.mock.calls).toHaveLength(1)
    expect(tokenStorageMocks.setSessionFlag.mock.calls).toEqual([[false]])
  })

  it('rejects immediately when there is no active session to restore', async () => {
    tokenStorageMocks.hasSessionFlag.mockReturnValue(false)
    tokenStorageMocks.isAccessTokenPresent.mockReturnValue(false)

    await expect(authService.fetchCurrentUser()).rejects.toMatchObject({
      message: 'No active session',
      code: ErrorCode.UNAUTHORIZED,
    })
    expect(authApiMocks.getMe).not.toHaveBeenCalled()
  })

  it('uses silent refresh when the session exists but the access token is missing', async () => {
    tokenStorageMocks.hasSessionFlag.mockReturnValue(true)
    tokenStorageMocks.isAccessTokenPresent.mockReturnValue(false)
    authApiMocks.getMe.mockResolvedValue({ user: mockUser })
    const silentRefreshSpy = vi.spyOn(authService, 'silentRefresh').mockResolvedValue('new-token')

    await expect(authService.fetchCurrentUser()).resolves.toEqual(mockUser)
    expect(silentRefreshSpy).toHaveBeenCalledOnce()
    expect(authApiMocks.getMe.mock.calls).toHaveLength(1)
  })

  it('cleans up auth state when getMe returns an unauthorized AppError', async () => {
    tokenStorageMocks.hasSessionFlag.mockReturnValue(true)
    tokenStorageMocks.isAccessTokenPresent.mockReturnValue(true)
    authApiMocks.getMe.mockRejectedValue(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401))

    await expect(authService.fetchCurrentUser()).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    })
    expect(tokenStorageMocks.clearAccessToken.mock.calls).toHaveLength(1)
    expect(tokenStorageMocks.setSessionFlag.mock.calls).toEqual([[false]])
  })

  it('rethrows non-auth errors from getMe without clearing the session', async () => {
    tokenStorageMocks.hasSessionFlag.mockReturnValue(true)
    tokenStorageMocks.isAccessTokenPresent.mockReturnValue(true)
    authApiMocks.getMe.mockRejectedValue(new AppError('Boom', ErrorCode.SERVER_ERROR, 500))

    await expect(authService.fetchCurrentUser()).rejects.toMatchObject({
      code: ErrorCode.SERVER_ERROR,
    })
    expect(tokenStorageMocks.clearAccessToken).not.toHaveBeenCalled()
    expect(tokenStorageMocks.setSessionFlag).not.toHaveBeenCalledWith(false)
  })

  it('delegates token decoding to the auth domain helper', () => {
    const payload = {
      sub: 'user_1',
      email: 'user@example.com',
      role: 'admin',
      iat: 1_700_000_000,
      exp: 1_700_000_900,
    }
    const encoded = btoa(JSON.stringify(payload))
    const token = `header.${encoded}.signature`

    expect(authService.decodeToken(token)).toEqual(payload)
  })
})
