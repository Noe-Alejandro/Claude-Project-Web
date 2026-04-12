import type { User } from '@domain/models/User'
import type { LoginCredentials } from '@domain/models/Auth'
import { AppError, ErrorCode } from '@domain/errors/AppError'
import { appConfig } from '@app/config'
import { httpClient } from '@infrastructure/http/httpClient'

// ─── Response contracts (must match backend DTOs) ────────────────────────────

export interface LoginResponseDto {
  accessToken: string
  expiresIn: number // seconds
  user: User
}

export interface RefreshResponseDto {
  accessToken: string
  expiresIn: number
}

export interface MeResponseDto {
  user: User
}

// ─── Mock helpers (development only) ─────────────────────────────────────────

const delay = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms))

const MOCK_SESSION_KEY = '__mock_user_email__'

const mockUsers: Record<string, { password: string; user: User }> = {
  'admin@example.com': {
    password: 'password123',
    user: {
      id: 'usr_01',
      email: 'admin@example.com',
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'admin',
      avatarUrl: null,
      createdAt: '2024-01-01T00:00:00Z',
      lastLoginAt: new Date().toISOString(),
    },
  },
  'user@example.com': {
    password: 'password123',
    user: {
      id: 'usr_02',
      email: 'user@example.com',
      firstName: 'Jordan',
      lastName: 'Lee',
      role: 'user',
      avatarUrl: null,
      createdAt: '2024-03-15T00:00:00Z',
      lastLoginAt: new Date().toISOString(),
    },
  },
}

// In-memory user — lost on module reload.
// sessionStorage email is used as the persistent "refresh token" equivalent in mock mode.
let mockSessionUser: User | null = null

const getMockUser = (): User | null => {
  if (mockSessionUser) return mockSessionUser
  // Restore from sessionStorage (simulates refresh-token cookie on page reload)
  const email = sessionStorage.getItem(MOCK_SESSION_KEY)
  if (email) {
    mockSessionUser = mockUsers[email]?.user ?? null
  }
  return mockSessionUser
}

const createMockToken = (userId: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900, // 15 min
    }),
  )
  return `${header}.${payload}.mock_sig_not_for_production`
}

// ─── Auth API adapter ─────────────────────────────────────────────────────────

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponseDto> {
    if (appConfig.useMockApi) {
      await delay(800)
      const record = mockUsers[credentials.email]
      if (record?.password !== credentials.password) {
        throw new AppError('Invalid email or password', ErrorCode.INVALID_CREDENTIALS, 401)
      }
      mockSessionUser = record.user
      sessionStorage.setItem(MOCK_SESSION_KEY, credentials.email)
      return {
        accessToken: createMockToken(record.user.id),
        expiresIn: 900,
        user: record.user,
      }
    }

    const { data } = await httpClient.post<LoginResponseDto>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      rememberMe: credentials.rememberMe,
    })
    return data
  },

  async logout(): Promise<void> {
    if (appConfig.useMockApi) {
      await delay(200)
      mockSessionUser = null
      sessionStorage.removeItem(MOCK_SESSION_KEY)
      return
    }
    await httpClient.post('/auth/logout')
  },

  async refreshToken(): Promise<RefreshResponseDto> {
    if (appConfig.useMockApi) {
      await delay(300)
      const user = getMockUser()
      if (!user) {
        throw new AppError('No session', ErrorCode.SESSION_EXPIRED, 401)
      }
      return {
        accessToken: createMockToken(user.id),
        expiresIn: 900,
      }
    }

    const { data } = await httpClient.post<RefreshResponseDto>('/auth/refresh')
    return data
  },

  async getMe(): Promise<MeResponseDto> {
    if (appConfig.useMockApi) {
      await delay(400)
      const user = getMockUser()
      if (!user) {
        throw new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401)
      }
      return { user }
    }

    const { data } = await httpClient.get<MeResponseDto>('/auth/me')
    return data
  },
}
