import React from 'react'
import { cn } from '@shared/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  errorMessage?: string | undefined
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, errorMessage, leftIcon, rightElement, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const hasError = Boolean(errorMessage)
    const errorId = inputId ? `${inputId}-error` : undefined
    const hintId = inputId ? `${inputId}-hint` : undefined

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
            {label}
            {props.required && (
              <span className="text-red-400 ml-1" aria-hidden>
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-500 pointer-events-none">{leftIcon}</span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? hintId : undefined}
            className={cn(
              // Base
              'w-full rounded-lg border bg-white/5 text-slate-100 placeholder:text-slate-500',
              'text-sm transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-950',
              // Default state
              'border-white/10 focus:border-brand-500 focus:ring-brand-500/30',
              // Error state
              hasError && 'border-red-500/70 focus:border-red-500 focus:ring-red-500/30',
              // Disabled
              'disabled:opacity-50 disabled:cursor-not-allowed',
              // Padding with icons
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightElement ? 'pr-10' : 'pr-3.5',
              'py-2.5 h-10',
              className,
            )}
            {...props}
          />

          {rightElement && <span className="absolute right-3 text-slate-500">{rightElement}</span>}
        </div>

        {hasError && (
          <p id={errorId} role="alert" className="text-xs text-red-400 flex items-center gap-1">
            {errorMessage}
          </p>
        )}

        {!hasError && helperText && (
          <p id={hintId} className="text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
