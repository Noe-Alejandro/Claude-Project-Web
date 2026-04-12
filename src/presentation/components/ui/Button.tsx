import React from 'react'
import { cn } from '@shared/utils/cn'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand-600 text-white shadow-sm',
    'hover:bg-brand-500 active:bg-brand-700',
    'focus-visible:ring-brand-500',
    'disabled:bg-brand-800 disabled:text-brand-400',
  ].join(' '),
  secondary: [
    'bg-white/10 text-slate-200 border border-white/10 shadow-sm',
    'hover:bg-white/15 active:bg-white/5',
    'focus-visible:ring-white/30',
    'disabled:opacity-40',
  ].join(' '),
  ghost: [
    'text-slate-400',
    'hover:bg-white/5 hover:text-slate-200',
    'focus-visible:ring-white/20',
    'disabled:opacity-40',
  ].join(' '),
  danger: [
    'bg-red-600 text-white shadow-sm',
    'hover:bg-red-500 active:bg-red-700',
    'focus-visible:ring-red-500',
    'disabled:opacity-50',
  ].join(' '),
  link: [
    'text-brand-400 underline-offset-4',
    'hover:underline hover:text-brand-300',
    'focus-visible:ring-brand-500',
    'disabled:opacity-50',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled ?? isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          'relative inline-flex items-center justify-center font-medium rounded-lg',
          'transition-all duration-150 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          'disabled:cursor-not-allowed select-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="text-current" />
            <span className="opacity-0 absolute inset-0 flex items-center justify-center">
              {children}
            </span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
