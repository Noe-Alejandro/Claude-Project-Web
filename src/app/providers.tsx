import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from '@application/auth/AuthContext'
import { ErrorBoundary } from '@presentation/components/error-boundary/ErrorBoundary'
import { appConfig } from './config'

// ─── Query Client ─────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 10,        // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (
          error instanceof Error &&
          'statusCode' in error &&
          typeof (error as { statusCode: unknown }).statusCode === 'number' &&
          [401, 403, 404].includes((error as { statusCode: number }).statusCode)
        ) {
          return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: appConfig.isProduction,
    },
    mutations: {
      retry: false,
    },
  },
})

// ─── Root Provider ────────────────────────────────────────────────────────────

interface AppProvidersProps {
  children: React.ReactNode
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
      {appConfig.enableDevtools && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  </ErrorBoundary>
)
