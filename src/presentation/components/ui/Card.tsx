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
      'rounded-2xl bg-slate-900/80 backdrop-blur-sm',
      bordered && 'border border-white/8',
      'shadow-glass',
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
    className={cn('mt-6 pt-6 border-t border-white/8 flex items-center justify-between', className)}
    {...props}
  >
    {children}
  </div>
)
