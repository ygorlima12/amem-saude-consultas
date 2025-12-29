import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning'
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-5 py-4 rounded-lg mb-5 text-sm border-l-4',
          {
            'bg-[#e7f3ff] border-l-primary text-[#004085]': variant === 'info',
            'bg-[#fff3cd] border-l-warning-500 text-warning-800': variant === 'warning',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Alert.displayName = 'Alert'

export interface InfoBoxProps extends HTMLAttributes<HTMLDivElement> {}

export const InfoBox = forwardRef<HTMLDivElement, InfoBoxProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-primary/5 border-l-4 border-l-primary px-5 py-5 rounded-lg my-5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

InfoBox.displayName = 'InfoBox'
