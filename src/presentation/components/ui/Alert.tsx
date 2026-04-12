import React from 'react'
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { cn } from '@shared/utils/cn'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  onDismiss?: (() => void) | undefined
  className?: string
}

const variantConfig: Record<
  AlertVariant,
  { icon: React.ReactNode; containerClass: string; titleClass: string; textClass: string }
> = {
  info: {
    icon: <Info className="h-4 w-4" />,
    containerClass: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    titleClass: 'text-blue-200',
    textClass: 'text-blue-300/80',
  },
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    containerClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    titleClass: 'text-emerald-200',
    textClass: 'text-emerald-300/80',
  },
  warning: {
    icon: <AlertCircle className="h-4 w-4" />,
    containerClass: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    titleClass: 'text-amber-200',
    textClass: 'text-amber-300/80',
  },
  error: {
    icon: <XCircle className="h-4 w-4" />,
    containerClass: 'bg-red-500/10 border-red-500/20 text-red-300',
    titleClass: 'text-red-200',
    textClass: 'text-red-300/80',
  },
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  className,
}) => {
  const config = variantConfig[variant]

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-lg border p-3.5 text-sm animate-fade-in',
        config.containerClass,
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <div className="flex-1 min-w-0">
        {title && <p className={cn('font-medium text-sm', config.titleClass)}>{title}</p>}
        <div className={cn('text-sm', title && 'mt-0.5', config.textClass)}>{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
