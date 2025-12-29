import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-semibold text-text-primary mb-2 text-sm">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 border-2 rounded-input text-sm transition-all duration-200',
              'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
              'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500',
              'placeholder:text-gray-400',
              error
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10'
                : 'border-gray-200 hover:border-gray-300',
              icon && 'pl-11',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-danger-500 flex items-center gap-1">
            <span className="text-xs">⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-text-secondary">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  rows?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-semibold text-text-primary mb-2 text-sm">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-input text-sm transition-all duration-200 resize-none',
            'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
            'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500',
            'placeholder:text-gray-400',
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10'
              : 'border-gray-200 hover:border-gray-300',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-danger-500 flex items-center gap-1">
            <span className="text-xs">⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-text-secondary">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
