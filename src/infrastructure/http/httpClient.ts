import axios from 'axios'
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { appConfig } from '@app/config'
import { tokenStorage } from '@infrastructure/storage/tokenStorage'
import { handleHttpError } from './httpErrorHandler'
import { AppError, ErrorCode } from '@domain/errors/AppError'

// Tracks ongoing refresh to avoid parallel refresh calls
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

const onRefreshed = (token: string): void => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

const subscribeTokenRefresh = (cb: (token: string) => void): void => {
  refreshSubscribers.push(cb)
}

// ─── Create the singleton Axios instance ─────────────────────────────────────

export const httpClient: AxiosInstance = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Required for httpOnly refresh-token cookie
})

// ─── Request interceptor — attach access token ───────────────────────────────

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: unknown) => Promise.reject(error),
)

// ─── Response interceptor — handle errors & token refresh ────────────────────

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 401 on a non-refresh endpoint → attempt token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue request until refresh completes
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(httpClient(originalRequest))
          })
          setTimeout(
            () => reject(new AppError('Token refresh timeout', ErrorCode.TOKEN_REFRESH_FAILED)),
            10_000,
          )
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
        return httpClient(originalRequest)
      } catch {
        tokenStorage.clearAccessToken()
        tokenStorage.setSessionFlag(false)
        // Dispatch event so the AuthContext can redirect to login
        window.dispatchEvent(new CustomEvent('auth:session-expired'))
        return Promise.reject(
          new AppError('Session expired — please log in again', ErrorCode.SESSION_EXPIRED),
        )
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(handleHttpError(error))
  },
)
