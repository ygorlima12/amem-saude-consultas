import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger'
  fullWidth?: boolean
  isLoading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, isLoading, size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'rounded-button font-semibold cursor-pointer transition-all duration-250',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'active:scale-[0.98]',
          // Size styles
          {
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-2.5 text-[15px]': size === 'md',
            'px-8 py-3.5 text-base': size === 'lg',
          },
          // Variant styles
          {
            'bg-primary text-white hover:bg-primary-hover hover:shadow-button-hover focus:ring-primary/30': variant === 'primary',
            'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white hover:shadow-button focus:ring-primary/30': variant === 'outline',
            'bg-danger-500 text-white hover:bg-danger-600 hover:shadow-button-sm focus:ring-danger-500/30': variant === 'danger',
          },
          fullWidth && 'w-full',
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Carregando...
          </span>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
