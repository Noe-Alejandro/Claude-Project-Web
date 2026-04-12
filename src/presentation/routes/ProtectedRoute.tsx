import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import type { UserRole } from '@domain/models/User'
import { hasRole } from '@domain/models/User'
import { ROUTES } from '@shared/constants/routes'
import { Spinner } from '@presentation/components/ui/Spinner'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

/**
 * Guards a route subtree — redirects to login if unauthenticated,
 * renders a 403-style message if the user lacks the required role.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isInitializing, user } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" className="text-brand-500" label="Authenticating…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (allowedRoles && user && !hasRole(user, ...allowedRoles)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl font-bold text-brand-500">403</p>
          <p className="mt-2 text-xl font-semibold text-slate-200">Access Denied</p>
          <p className="mt-1 text-slate-400 text-sm">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
