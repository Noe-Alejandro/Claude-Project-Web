import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@shared/constants/routes'
import { ProtectedRoute } from '@presentation/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@presentation/routes/PublicOnlyRoute'
import { AuthLayout } from '@presentation/components/layout/AuthLayout'
import { AppLayout } from '@presentation/components/layout/AppLayout'
import { Spinner } from '@presentation/components/ui/Spinner'
import React from 'react'

// ─── Lazy-loaded pages (code splitting) ──────────────────────────────────────

const LoginPage = lazy(() => import('@presentation/pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('@presentation/pages/dashboard/DashboardPage'))
const NotFoundPage = lazy(() => import('@presentation/pages/errors/NotFoundPage'))

// ─── Sub-components ───────────────────────────────────────────────────────────

// Suspense wrapper
const PageSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" className="text-brand-500" />
      </div>
    }
  >
    {children}
  </Suspense>
)

// Placeholder for unbuilt pages
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6 flex items-center justify-center min-h-[50vh]">
    <div className="text-center">
      <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
        {title}
      </p>
      <p className="mt-2 text-slate-400 text-sm">This page is under construction.</p>
    </div>
  </div>
)

// ─── Router ───────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  // Public-only routes (redirects authenticated users to dashboard)
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.LOGIN,
            element: (
              <PageSuspense>
                <LoginPage />
              </PageSuspense>
            ),
          },
        ],
      },
    ],
  },

  // Protected routes (requires authentication)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: (
              <PageSuspense>
                <DashboardPage />
              </PageSuspense>
            ),
          },
          {
            path: ROUTES.PROFILE,
            element: (
              <PageSuspense>
                <ComingSoon title="Profile" />
              </PageSuspense>
            ),
          },
          {
            path: ROUTES.SETTINGS,
            element: (
              <PageSuspense>
                <ComingSoon title="Settings" />
              </PageSuspense>
            ),
          },
        ],
      },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: (
      <PageSuspense>
        <NotFoundPage />
      </PageSuspense>
    ),
  },
])
