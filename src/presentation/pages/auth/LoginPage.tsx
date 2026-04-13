import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LoginForm } from '@presentation/components/auth/LoginForm'
import type { LoginFormValues } from '@presentation/components/auth/LoginForm'
import { useAuth } from '@shared/hooks/useAuth'
import { ROUTES } from '@shared/constants/routes'

const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  // Redirect back to where the user was trying to go, or to dashboard
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? ROUTES.DASHBOARD

  const handleSubmit = async (values: LoginFormValues): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      // login() calls authService.login() (saves token) AND dispatches LOGIN_SUCCESS
      // to AuthContext — so ProtectedRoute sees isAuthenticated = true immediately.
      await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to your account to continue.</p>
      </div>

      <LoginForm
        onSubmit={(values) => {
          void handleSubmit(values)
        }}
        isLoading={isLoading}
        error={error}
      />

      <p className="mt-8 text-center text-xs text-slate-600">
        By signing in, you agree to our{' '}
        <button className="text-slate-500 hover:text-slate-400 underline underline-offset-2">
          Terms of Service
        </button>{' '}
        and{' '}
        <button className="text-slate-500 hover:text-slate-400 underline underline-offset-2">
          Privacy Policy
        </button>
        .
      </p>
    </div>
  )
}

export default LoginPage
