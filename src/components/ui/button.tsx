import * as React from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ className = '', ...props }: ButtonProps) {
  return (
    <button
      className={
        'inline-flex items-center justify-center rounded-md text-sm font-medium ' +
        'bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed ' +
        'px-4 py-2 transition-colors ' +
        className
      }
      {...props}
    />
  )
}