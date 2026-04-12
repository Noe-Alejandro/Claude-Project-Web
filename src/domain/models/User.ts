// Pure domain model — no React, no external library dependencies

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer'

export interface User {
  readonly id: string
  readonly email: string
  readonly firstName: string
  readonly lastName: string
  readonly role: UserRole
  readonly avatarUrl: string | null
  readonly createdAt: string
  readonly lastLoginAt: string | null
}

export interface UserProfile extends User {
  readonly department: string | null
  readonly phoneNumber: string | null
  readonly timezone: string
}

// Value objects / helpers (pure functions, no side effects)
export const getUserFullName = (user: Pick<User, 'firstName' | 'lastName'>): string =>
  `${user.firstName} ${user.lastName}`.trim()

export const getUserInitials = (user: Pick<User, 'firstName' | 'lastName'>): string => {
  const first = user.firstName[0] ?? ''
  const last = user.lastName[0] ?? ''
  return `${first}${last}`.toUpperCase()
}

export const hasRole = (user: Pick<User, 'role'>, ...roles: UserRole[]): boolean =>
  roles.includes(user.role)

export const isAdmin = (user: Pick<User, 'role'>): boolean => user.role === 'admin'
