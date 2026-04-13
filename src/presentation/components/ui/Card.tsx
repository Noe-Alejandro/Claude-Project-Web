import React from 'react'
import { cn } from '@shared/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  bordered?: boolean
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  bordered = true,
  ...props
}) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-2xl bg-[linear-gradient(180deg,_rgba(15,23,42,0.78),_rgba(15,23,42,0.6))] backdrop-blur-xl',
      bordered && 'border border-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
      'shadow-[0_24px_80px_-38px_rgba(15,23,42,0.95)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.035),_transparent_42%)]',
      paddingStyles[padding],
      className,
    )}
    {...props}
  >
    {children}
  </div>
)

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => (
  <div className={cn('mb-6', className)} {...props}>
    {children}
  </div>
)

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
  as: Tag = 'h2',
  ...props
}) => (
  <Tag className={cn('text-xl font-semibold text-slate-100 tracking-tight', className)} {...props}>
    {children}
  </Tag>
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => (
  <p className={cn('text-sm text-slate-400 mt-1', className)} {...props}>
    {children}
  </p>
)

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={cn(
      'mt-6 flex items-center justify-between pt-6 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)
