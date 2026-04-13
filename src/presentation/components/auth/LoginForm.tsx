import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Input } from '@presentation/components/ui/Input'
import { Button } from '@presentation/components/ui/Button'
import { Alert } from '@presentation/components/ui/Alert'
import { useErrorHandler } from '@shared/hooks/useErrorHandler'

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void | Promise<void>
  isLoading: boolean
  error: unknown
}

// ─── Component ────────────────────────────────────────────────────────────────

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
  const [showPassword, setShowPassword] = useState(false)
  const { getDisplayMessage } = useErrorHandler()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Sign in form"
      className="space-y-5"
    >
      {error != null && <Alert variant="error">{getDisplayMessage(error)}</Alert>}

      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        required
        leftIcon={<Mail className="h-4 w-4" />}
        errorMessage={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="••••••••"
        required
        leftIcon={<Lock className="h-4 w-4" />}
        errorMessage={errors.password?.message}
        rightElement={
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => {
              setShowPassword((v) => !v)
            }}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...register('password')}
      />

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-slate-700/80 text-brand-500
                       focus:ring-2 focus:ring-brand-500/30 focus:ring-offset-0
                       checked:bg-brand-500 checked:border-brand-500 cursor-pointer"
            {...register('rememberMe')}
          />
          <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none">
            Remember me
          </span>
        </label>
        <button
          type="button"
          className="text-sm text-brand-400 hover:text-brand-300 transition-colors focus:outline-none focus-visible:underline"
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>

      {/* Demo credentials hint */}
      <div className="rounded-xl border border-white/[0.06] bg-slate-800/55 p-3">
        <p className="text-xs text-slate-400 font-medium mb-1.5">Demo credentials</p>
        <div className="space-y-1">
          <p className="text-xs text-slate-500 font-mono">
            <span className="text-slate-400">admin@example.com</span> / Admin@123!
          </p>
          <p className="text-xs text-slate-500 font-mono">
            <span className="text-slate-400">user@example.com</span> / User@123!
          </p>
        </div>
      </div>
    </form>
  )
}
