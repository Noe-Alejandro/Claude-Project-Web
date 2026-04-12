export const ROUTES = {
  // Public
  LOGIN: '/login',

  // Protected
  DASHBOARD: '/',
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // Errors
  NOT_FOUND: '/404',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
