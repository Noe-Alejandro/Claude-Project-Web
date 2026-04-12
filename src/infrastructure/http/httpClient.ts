import axios from 'axios'
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { appConfig } from '@app/config'
import { AppError, ErrorCode } from '@domain/errors/AppError'
import { tokenStorage } from '@infrastructure/storage/tokenStorage'
import { handleHttpError } from './httpErrorHandler'

// Tracks ongoing refresh to avoid parallel refresh calls (mock mode only).
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const onRefreshed = (token: string): void => {
  refreshSubscribers.forEach((cb) => {
    cb(token)
  })
  refreshSubscribers = []
}

const subscribeTokenRefresh = (cb: (token: string) => void): void => {
  refreshSubscribers.push(cb)
}

const clearSession = (): void => {
  tokenStorage.clearAccessToken()
  tokenStorage.setSessionFlag(false)
  window.dispatchEvent(new CustomEvent('auth:session-expired'))
}

export const httpClient: AxiosInstance = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: unknown) =>
    Promise.reject(error instanceof Error ? error : new Error('Request interceptor failed')),
)

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      // Real backend: stateless JWT with no refresh endpoint — session is over.
      if (!appConfig.useMockApi) {
        clearSession()
        throw new AppError('Session expired — please log in again', ErrorCode.SESSION_EXPIRED)
      }

      // Mock mode: try the in-memory refresh (simulates a refresh cookie).
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(httpClient(originalRequest))
          })
          setTimeout(() => {
            reject(new AppError('Token refresh timeout', ErrorCode.TOKEN_REFRESH_FAILED))
          }, 10_000)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await httpClient.post<{ accessToken: string; expiresIn: number }>(
          '/auth/refresh',
        )
        const expiresAt = Date.now() + data.expiresIn * 1000
        tokenStorage.setAccessToken(data.accessToken, expiresAt)
        onRefreshed(data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return await httpClient(originalRequest)
      } catch {
        clearSession()
        throw new AppError('Session expired — please log in again', ErrorCode.SESSION_EXPIRED)
      } finally {
        isRefreshing = false
      }
    }

    throw handleHttpError(error)
  },
)
