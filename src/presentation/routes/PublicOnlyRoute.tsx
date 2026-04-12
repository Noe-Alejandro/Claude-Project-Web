import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { ROUTES } from '@shared/constants/routes'
import { Spinner } from '@presentation/components/ui/Spinner'

/**
 * Prevents authenticated users from accessing login/register pages.
 * Redirects them to the dashboard instead.
 */
export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" className="text-brand-500" />
      </div>
    )
  }

  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />
}
