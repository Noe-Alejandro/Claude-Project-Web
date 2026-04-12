import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppError, ErrorCode } from '@domain/errors/AppError'
import { useLoginMutation, useLogoutMutation } from '../useAuthQueries'

const authServiceMocks = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('../AuthService', () => ({
  authService: authServiceMocks,
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('useLoginMutation', () => {
  it('calls onSuccess with the logged-in user', async () => {
    const user = {
      id: 'usr_1',
      email: 'user@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'admin' as const,
      avatarUrl: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLoginAt: null,
    }
    const onSuccess = vi.fn()
    authServiceMocks.login.mockResolvedValue({
      user,
      expiresAt: 1_700_000_000_000,
    })

    const { result } = renderHook(() => useLoginMutation(onSuccess), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      email: 'user@example.com',
      password: 'password123',
      rememberMe: true,
    })

    expect(authServiceMocks.login.mock.calls).toHaveLength(1)
    expect(onSuccess).toHaveBeenCalledWith(user)
  })

  it('logs unexpected non-AppError failures', async () => {
    const onSuccess = vi.fn()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    authServiceMocks.login.mockRejectedValue(new Error('Unexpected failure'))

    const { result } = renderHook(() => useLoginMutation(onSuccess), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync({
        email: 'user@example.com',
        password: 'password123',
        rememberMe: false,
      }),
    ).rejects.toThrow('Unexpected failure')

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[useLoginMutation] unexpected error type:',
        expect.any(Error),
      )
    })
  })

  it('does not log expected AppError failures', async () => {
    const onSuccess = vi.fn()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    authServiceMocks.login.mockRejectedValue(
      new AppError('Invalid credentials', ErrorCode.INVALID_CREDENTIALS, 401),
    )

    const { result } = renderHook(() => useLoginMutation(onSuccess), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync({
        email: 'user@example.com',
        password: 'wrong-password',
        rememberMe: false,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_CREDENTIALS })

    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})

describe('useLogoutMutation', () => {
  it('calls the auth service logout and invokes onSuccess', async () => {
    const onSuccess = vi.fn()
    authServiceMocks.logout.mockResolvedValue(undefined)

    const { result } = renderHook(() => useLogoutMutation(onSuccess), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync()

    expect(authServiceMocks.logout.mock.calls).toHaveLength(1)
    expect(onSuccess).toHaveBeenCalledOnce()
  })
})
