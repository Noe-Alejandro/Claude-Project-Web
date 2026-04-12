import type { User } from '@domain/models/User'
import type { UserRole } from '@domain/models/User'
import type { LoginCredentials } from '@domain/models/Auth'
import { decodeJwtPayload } from '@domain/models/Auth'
import { AppError, ErrorCode } from '@domain/errors/AppError'
import { appConfig } from '@app/config'
import { httpClient } from '@infrastructure/http/httpClient'
import { tokenStorage } from '@infrastructure/storage/tokenStorage'

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

// Backend UserResponse shape (camelCase enum via JsonStringEnumConverter)
interface BackendUserResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: string // "admin" | "manager" | "user" | "viewer"
  avatarUrl: string | null
  createdAt: string
  lastLoginAt: string | null
}

const mapBackendUser = (u: BackendUserResponse): User => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  role: u.role as UserRole,
  avatarUrl: u.avatarUrl,
  createdAt: u.createdAt,
  lastLoginAt: u.lastLoginAt,
})

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

let mockSessionUser: User | null = null

const getMockUser = (): User | null => {
  if (mockSessionUser) return mockSessionUser
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
      exp: Math.floor(Date.now() / 1000) + 900,
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

    const { data } = await httpClient.post<{ accessToken: string; expiresIn: number; user: BackendUserResponse }>(
      '/auth/login',
      { email: credentials.email, password: credentials.password },
    )
    return {
      accessToken: data.accessToken,
      expiresIn: data.expiresIn,
      user: mapBackendUser(data.user),
    }
  },

  async logout(): Promise<void> {
    if (appConfig.useMockApi) {
      await delay(200)
      mockSessionUser = null
      sessionStorage.removeItem(MOCK_SESSION_KEY)
      return
    }
    // Stateless JWT backend — no logout endpoint. Client-side cleanup is handled
    // by AuthService.logout() regardless of this call resolving.
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

    // No refresh endpoint on this backend. Signal session expired so the
    // httpClient interceptor's catch block clears state and redirects to login.
    throw new AppError('No refresh endpoint — session expired', ErrorCode.SESSION_EXPIRED, 401)
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

    // Decode the stored JWT to get the user ID, then fetch from /users/{id}
    const token = tokenStorage.getAccessToken()
    if (!token) {
      throw new AppError('No token', ErrorCode.UNAUTHORIZED, 401)
    }

    const payload = decodeJwtPayload(token)
    if (!payload?.sub) {
      throw new AppError('Invalid token', ErrorCode.UNAUTHORIZED, 401)
    }

    const { data } = await httpClient.get<BackendUserResponse>(`/users/${payload.sub}`)
    return { user: mapBackendUser(data) }
  },
}
