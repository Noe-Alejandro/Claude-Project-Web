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
const ProfilePage = lazy(() => import('@presentation/pages/profile/ProfilePage'))
const SettingsPage = lazy(() => import('@presentation/pages/settings/SettingsPage'))
const UsersPage = lazy(() => import('@presentation/pages/admin/UsersPage'))
const NotFoundPage = lazy(() => import('@presentation/pages/errors/NotFoundPage'))

const PageFallback = (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Spinner size="lg" className="text-brand-500" />
  </div>
)

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.LOGIN,
            element: <Suspense fallback={PageFallback}><LoginPage /></Suspense>,
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
            element: <Suspense fallback={PageFallback}><DashboardPage /></Suspense>,
          },
          {
            path: ROUTES.PROFILE,
            element: <Suspense fallback={PageFallback}><ProfilePage /></Suspense>,
          },
          {
            path: ROUTES.SETTINGS,
            element: <Suspense fallback={PageFallback}><SettingsPage /></Suspense>,
          },
          // Admin-only routes
          {
            element: <ProtectedRoute allowedRoles={['admin']} />,
            children: [
              {
                path: ROUTES.USERS,
                element: <Suspense fallback={PageFallback}><UsersPage /></Suspense>,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Suspense fallback={PageFallback}><NotFoundPage /></Suspense>,
  },
])
