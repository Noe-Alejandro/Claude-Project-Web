import React, { createContext, useCallback, useEffect, useReducer } from 'react'
import type { User } from '@domain/models/User'
import type { LoginCredentials } from '@domain/models/Auth'
import { AppError } from '@domain/errors/AppError'
import { authService } from './AuthService'

// ─── State ────────────────────────────────────────────────────────────────────

type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated'

interface AuthState {
  status: AuthStatus
  user: User | null
  error: AppError | null
}

type AuthAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; payload: User }
  | { type: 'INIT_FAILURE' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: AppError }

const initialState: AuthState = {
  status: 'initializing',
  user: null,
  error: null,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INIT_START':
      return { ...state, status: 'initializing', error: null }
    case 'INIT_SUCCESS':
      return { status: 'authenticated', user: action.payload, error: null }
    case 'INIT_FAILURE':
      return { status: 'unauthenticated', user: null, error: null }
    case 'LOGIN_SUCCESS':
      return { status: 'authenticated', user: action.payload, error: null }
    case 'LOGOUT':
      return { status: 'unauthenticated', user: null, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
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

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // On mount: attempt to restore session via silent refresh / stored cookie
  useEffect(() => {
    let cancelled = false

    const initialize = async (): Promise<void> => {
      dispatch({ type: 'INIT_START' })
      try {
        const user = await authService.fetchCurrentUser()
        if (!cancelled) dispatch({ type: 'INIT_SUCCESS', payload: user })
      } catch {
        if (!cancelled) dispatch({ type: 'INIT_FAILURE' })
      }
    }

    void initialize()

    // Listen for session expiry events dispatched by the HTTP interceptor
    const onSessionExpired = (): void => {
      if (!cancelled) dispatch({ type: 'LOGOUT' })
    }
    window.addEventListener('auth:session-expired', onSessionExpired)

    return () => {
      cancelled = true
      window.removeEventListener('auth:session-expired', onSessionExpired)
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    const result = await authService.login(credentials)
    dispatch({ type: 'LOGIN_SUCCESS', payload: result.user })
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout()
    dispatch({ type: 'LOGOUT' })
  }, [])

  const clearError = useCallback((): void => {
    dispatch({ type: 'SET_ERROR', payload: new AppError('') })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        status: state.status,
        user: state.user,
        isAuthenticated: state.status === 'authenticated',
        isInitializing: state.status === 'initializing',
        error: state.error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
