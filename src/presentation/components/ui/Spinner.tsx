import React from 'react'
import { cn } from '@shared/utils/cn'

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  label?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label = 'Loading…' }) => (
  <span role="status" aria-label={label} className="inline-flex items-center justify-center">
    <span
      className={cn(
        'rounded-full border-current border-r-transparent animate-spin',
        sizeClasses[size],
        className,
      )}
    />
    <span className="sr-only">{label}</span>
  </span>
)
