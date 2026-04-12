import React from 'react'
import { cn } from '@shared/utils/cn'
import { getUserInitials } from '@domain/models/User'
import type { User } from '@domain/models/User'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  user: Pick<User, 'firstName' | 'lastName' | 'avatarUrl'>
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', className }) => {
  const initials = getUserInitials(user)

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={`${user.firstName} ${user.lastName}`}
        className={cn(
          'rounded-full object-cover border border-white/10',
          sizeClasses[size],
          className,
        )}
      />
    )
  }

  return (
    <span
      aria-label={`${user.firstName} ${user.lastName} avatar`}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold select-none',
        'bg-gradient-to-br from-brand-500 to-brand-700 text-white',
        'border border-white/10',
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </span>
  )
}
