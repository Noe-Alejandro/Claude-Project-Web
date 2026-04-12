import { createContext } from 'react'
import type { User } from '@domain/models/User'
import type { LoginCredentials } from '@domain/models/Auth'
import type { AppError } from '@domain/errors/AppError'

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  error: AppError | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
AuthContext.displayName = 'AuthContext'
