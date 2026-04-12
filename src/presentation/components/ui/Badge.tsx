import React from 'react'
import { cn } from '@shared/utils/cn'
import type { UserRole } from '@domain/models/User'

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-700/60 text-slate-300 border-slate-600/30',
  brand: 'bg-brand-500/15 text-brand-300 border-brand-500/20',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  danger: 'bg-red-500/15 text-red-300 border-red-500/20',
  info: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}) => (
  <span
    className={cn(
      'inline-flex items-center font-medium border rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      variantStyles[variant],
      className,
    )}
    {...props}
  >
    {children}
  </span>
)

// Convenience: role badge
const roleBadgeVariant: Record<UserRole, BadgeVariant> = {
  admin: 'danger',
  manager: 'warning',
  user: 'brand',
  viewer: 'default',
}

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => (
  <Badge variant={roleBadgeVariant[role]}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>
)
