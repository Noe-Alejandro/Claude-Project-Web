import { describe, it, expect } from 'vitest'
import {
  getUserFullName,
  getUserInitials,
  hasRole,
  isAdmin,
} from '../models/User'
import type { User } from '../models/User'

const mockUser: User = {
  id: 'usr_1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin',
  avatarUrl: null,
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: null,
}

describe('getUserFullName', () => {
  it('returns full name', () => {
    expect(getUserFullName(mockUser)).toBe('John Doe')
  })
})

describe('getUserInitials', () => {
  it('returns uppercase initials', () => {
    expect(getUserInitials(mockUser)).toBe('JD')
  })

  it('handles single name', () => {
    expect(getUserInitials({ firstName: 'Alice', lastName: '' })).toBe('A')
  })
})

describe('hasRole', () => {
  it('returns true when user has matching role', () => {
    expect(hasRole(mockUser, 'admin', 'manager')).toBe(true)
  })

  it('returns false when user lacks all roles', () => {
    expect(hasRole(mockUser, 'viewer', 'user')).toBe(false)
  })
})

describe('isAdmin', () => {
  it('returns true for admin', () => {
    expect(isAdmin(mockUser)).toBe(true)
  })

  it('returns false for non-admin', () => {
    expect(isAdmin({ role: 'user' })).toBe(false)
  })
})
