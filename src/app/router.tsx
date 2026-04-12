import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@shared/constants/routes'
import { ProtectedRoute } from '@presentation/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@presentation/routes/PublicOnlyRoute'
import { AuthLayout } from '@presentation/components/layout/AuthLayout'
import { AppLayout } from '@presentation/components/layout/AppLayout'
import { Spinner } from '@presentation/components/ui/Spinner'

const LoginPage = lazy(() => import('@presentation/pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('@presentation/pages/dashboard/DashboardPage'))
const NotFoundPage = lazy(() => import('@presentation/pages/errors/NotFoundPage'))

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.LOGIN,
            element: (
              <Suspense
                fallback={
                  <div className="min-h-[60vh] flex items-center justify-center">
                    <Spinner size="lg" className="text-brand-500" />
                  </div>
                }
              >
                <LoginPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: (
              <Suspense
                fallback={
                  <div className="min-h-[60vh] flex items-center justify-center">
                    <Spinner size="lg" className="text-brand-500" />
                  </div>
                }
              >
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.PROFILE,
            element: (
              <div className="p-6 flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
                    Profile
                  </p>
                  <p className="mt-2 text-slate-400 text-sm">This page is under construction.</p>
                </div>
              </div>
            ),
          },
          {
            path: ROUTES.SETTINGS,
            element: (
              <div className="p-6 flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
                    Settings
                  </p>
                  <p className="mt-2 text-slate-400 text-sm">This page is under construction.</p>
                </div>
              </div>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <Spinner size="lg" className="text-brand-500" />
          </div>
        }
      >
        <NotFoundPage />
      </Suspense>
    ),
  },
])
