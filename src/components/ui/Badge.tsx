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
          'inline-block px-2.5 py-1.5 rounded-full text-xs font-bold tracking-[0.2px] border whitespace-nowrap',
          {
            'bg-warning-500/[.18] text-warning-800 border-warning-500/35': variant === 'warning',
            'bg-success-500/15 text-success-700 border-success-500/35': variant === 'success',
            'bg-danger-500/[.12] text-danger-700 border-danger-500/30': variant === 'danger',
            'bg-info-500/[.12] text-info-700 border-info-500/30': variant === 'info',
            'bg-gray-500/[.12] text-gray-700 border-gray-500/25': variant === 'neutral',
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
