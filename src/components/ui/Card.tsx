import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-card p-[30px] mb-6 shadow-card',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  subtitle?: string
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, subtitle, children, ...props }, ref) => {
    return (
      <>
        <h2
          ref={ref}
          className={cn(
            'text-2xl font-bold text-secondary-900 mb-5 pb-4 border-b-2 border-gray-100',
            className
          )}
          {...props}
        >
          {children}
        </h2>
        {subtitle && (
          <p className="text-sm text-text-secondary -mt-2 mb-4">{subtitle}</p>
        )}
      </>
    )
  }
)

CardTitle.displayName = 'CardTitle'
