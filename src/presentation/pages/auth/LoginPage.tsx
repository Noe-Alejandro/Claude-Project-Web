import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LoginForm } from '@presentation/components/auth/LoginForm'
import type { LoginFormValues } from '@presentation/components/auth/LoginForm'
import { useLoginMutation } from '@application/auth/useAuthQueries'
import { ROUTES } from '@shared/constants/routes'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect back to where the user was trying to go, or to dashboard
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? ROUTES.DASHBOARD

  const loginMutation = useLoginMutation(() => {
    void navigate(from, { replace: true })
  })

  const handleSubmit = (values: LoginFormValues): void => {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to your account to continue.</p>
      </div>

      <LoginForm
        onSubmit={handleSubmit}
        isLoading={loginMutation.isPending}
        error={loginMutation.error}
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
