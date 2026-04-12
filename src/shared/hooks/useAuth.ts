import { useContext } from 'react'
import { AuthContext } from '@application/auth/AuthContext'

/**
 * Access the auth context.
 * Throws if used outside of <AuthProvider> — fail-fast contract.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>')
  }
  return ctx
}
