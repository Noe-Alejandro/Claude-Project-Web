import type { UserRole } from '@domain/models/User'
import { appConfig } from '@app/config'
import { httpClient } from '@infrastructure/http/httpClient'

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface UserSummaryDto {
  id: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
}

export interface UserDetailDto {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatarUrl: string | null
  createdAt: string
  lastLoginAt: string | null
}

export interface PagedResponseDto<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface CreateUserDto {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: UserRole
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const delay = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms))

const mockUserList: UserSummaryDto[] = [
  {
    id: 'usr_01',
    email: 'admin@example.com',
    fullName: 'Alex Morgan',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'usr_02',
    email: 'user@example.com',
    fullName: 'Jordan Lee',
    role: 'user',
    createdAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'usr_03',
    email: 'manager@example.com',
    fullName: 'Sam Rivera',
    role: 'manager',
    createdAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'usr_04',
    email: 'viewer@example.com',
    fullName: 'Taylor Kim',
    role: 'viewer',
    createdAt: '2024-04-01T00:00:00Z',
  },
]

let mockUsers = [...mockUserList]

const mockDetails: Record<string, UserDetailDto> = {
  usr_01: {
    id: 'usr_01',
    email: 'admin@example.com',
    firstName: 'Alex',
    lastName: 'Morgan',
    role: 'admin',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  usr_02: {
    id: 'usr_02',
    email: 'user@example.com',
    firstName: 'Jordan',
    lastName: 'Lee',
    role: 'user',
    avatarUrl: null,
    createdAt: '2024-03-15T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  usr_03: {
    id: 'usr_03',
    email: 'manager@example.com',
    firstName: 'Sam',
    lastName: 'Rivera',
    role: 'manager',
    avatarUrl: null,
    createdAt: '2024-02-10T00:00:00Z',
    lastLoginAt: null,
  },
  usr_04: {
    id: 'usr_04',
    email: 'viewer@example.com',
    firstName: 'Taylor',
    lastName: 'Kim',
    role: 'viewer',
    avatarUrl: null,
    createdAt: '2024-04-01T00:00:00Z',
    lastLoginAt: null,
  },
}

// ─── API adapter ──────────────────────────────────────────────────────────────

export const usersApi = {
  async list(page = 1, pageSize = 20): Promise<PagedResponseDto<UserSummaryDto>> {
    if (appConfig.useMockApi) {
      await delay(600)
      const start = (page - 1) * pageSize
      const items = mockUsers.slice(start, start + pageSize)
      return {
        items,
        total: mockUsers.length,
        page,
        pageSize,
        totalPages: Math.ceil(mockUsers.length / pageSize),
        hasNextPage: start + pageSize < mockUsers.length,
        hasPreviousPage: page > 1,
      }
    }

    const { data } = await httpClient.get<PagedResponseDto<UserSummaryDto>>('/users', {
      params: { page, pageSize },
    })
    return data
  },

  async getById(id: string): Promise<UserDetailDto> {
    if (appConfig.useMockApi) {
      await delay(400)
      const user = mockDetails[id]
      if (!user) throw new Error('User not found')
      return user
    }

    const { data } = await httpClient.get<UserDetailDto>(`/users/${id}`)
    return data
  },

  async create(request: CreateUserDto): Promise<UserDetailDto> {
    if (appConfig.useMockApi) {
      await delay(700)
      const id = `usr_${Date.now()}`
      const detail: UserDetailDto = {
        id,
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        role: request.role ?? 'user',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
      }
      mockDetails[id] = detail
      mockUsers.push({
        id,
        email: request.email,
        fullName: `${request.firstName} ${request.lastName}`.trim(),
        role: request.role ?? 'user',
        createdAt: detail.createdAt,
      })
      return detail
    }

    const { data } = await httpClient.post<UserDetailDto>('/users', request)
    return data
  },

  async delete(id: string): Promise<void> {
    if (appConfig.useMockApi) {
      await delay(400)
      mockUsers = mockUsers.filter((u) => u.id !== id)
      delete mockDetails[id]
      return
    }

    await httpClient.delete(`/users/${id}`)
  },
}
