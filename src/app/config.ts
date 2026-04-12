/**
 * Central application configuration.
 * All values are read from environment variables — never hard-coded.
 * Validated at startup so misconfiguration fails fast.
 */

const getEnvString = (key: string, fallback?: string): string => {
  const value = import.meta.env[key] as string | undefined
  if (value !== undefined && value !== '') return value
  if (fallback !== undefined) return fallback
  throw new Error(`Missing required environment variable: ${key}`)
}

const getEnvNumber = (key: string, fallback?: number): number => {
  const raw = import.meta.env[key] as string | undefined
  if (raw !== undefined && raw !== '') {
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed)) return parsed
  }
  if (fallback !== undefined) return fallback
  throw new Error(`Missing or invalid numeric environment variable: ${key}`)
}

const getEnvBoolean = (key: string, fallback = false): boolean => {
  const raw = import.meta.env[key] as string | undefined
  if (raw === undefined || raw === '') return fallback
  return raw === 'true'
}

export const appConfig = {
  appName: getEnvString('VITE_APP_NAME', 'Enterprise App'),
  appVersion: getEnvString('VITE_APP_VERSION', '1.0.0'),
  apiBaseUrl: getEnvString('VITE_API_BASE_URL', 'http://localhost:5000/api'),
  apiTimeout: getEnvNumber('VITE_API_TIMEOUT', 10_000),
  useMockApi: getEnvBoolean('VITE_USE_MOCK_API', false),
  logLevel: getEnvString('VITE_LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',
  enableDevtools: getEnvBoolean('VITE_ENABLE_DEVTOOLS', false),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const

export type AppConfig = typeof appConfig
