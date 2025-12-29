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
          'rounded-button font-semibold cursor-pointer transition-all duration-300',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Size styles
          {
            'px-4 py-2 text-sm': size === 'sm',
            'px-7 py-3 text-[15px]': size === 'md',
            'px-9 py-4 text-base': size === 'lg',
          },
          // Variant styles
          {
            'bg-primary text-white hover:bg-primary-hover hover:-translate-y-0.5': variant === 'primary',
            'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white': variant === 'outline',
            'bg-danger-500 text-white hover:bg-danger-600 hover:-translate-y-0.5': variant === 'danger',
          },
          fullWidth && 'w-full',
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? 'Carregando...' : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
