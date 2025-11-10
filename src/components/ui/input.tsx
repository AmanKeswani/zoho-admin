import * as React from 'react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={
          'flex h-10 w-full rounded-md border border-border bg-inputBg px-3 py-2 text-sm ' +
          'text-text-high placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 ' +
          'disabled:cursor-not-allowed disabled:opacity-50 ' +
          className
        }
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'