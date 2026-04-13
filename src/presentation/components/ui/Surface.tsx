import React from 'react'
import { cn } from '@shared/utils/cn'

interface SoftDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
  vertical?: boolean
}

export const SoftDivider: React.FC<SoftDividerProps> = ({
  className,
  inset = false,
  vertical = false,
  ...props
}) => (
  <div
    className={cn(
      'pointer-events-none',
      vertical
        ? 'absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-white/8 to-transparent'
        : 'absolute h-px bg-gradient-to-r from-transparent via-white/10 to-transparent',
      vertical ? 'right-0' : 'bottom-0',
      vertical ? (inset ? 'top-3 bottom-3' : 'inset-y-0') : inset ? 'inset-x-5' : 'inset-x-0',
      className,
    )}
    {...props}
  />
)

interface SoftSectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  icon?: React.ReactNode
  insetDivider?: boolean
}

export const SoftSectionHeader: React.FC<SoftSectionHeaderProps> = ({
  title,
  description,
  actions,
  icon,
  className,
  insetDivider = true,
  ...props
}) => (
  <div
    className={cn('relative flex items-center justify-between gap-4 px-5 py-4', className)}
    {...props}
  >
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-slate-400">{icon}</span>}
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
      </div>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
    </div>
    {actions && <div className="shrink-0">{actions}</div>}
    <SoftDivider inset={insetDivider} />
  </div>
)
