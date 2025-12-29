import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'warning' | 'success' | 'danger' | 'info' | 'neutral'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 px-3 py-1 rounded-badge text-xs font-semibold tracking-[0.3px] whitespace-nowrap',
          'transition-all duration-200',
          {
            'bg-warning-500/10 text-warning-700 ring-1 ring-warning-500/20 hover:ring-warning-500/30': variant === 'warning',
            'bg-success-500/10 text-success-700 ring-1 ring-success-500/20 hover:ring-success-500/30': variant === 'success',
            'bg-danger-500/10 text-danger-700 ring-1 ring-danger-500/20 hover:ring-danger-500/30': variant === 'danger',
            'bg-info-500/10 text-info-700 ring-1 ring-info-500/20 hover:ring-info-500/30': variant === 'info',
            'bg-gray-500/10 text-gray-700 ring-1 ring-gray-500/20 hover:ring-gray-500/30': variant === 'neutral',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
