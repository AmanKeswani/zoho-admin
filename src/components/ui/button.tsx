import * as React from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ className = '', ...props }: ButtonProps) {
  return (
    <button
      className={
        'inline-flex items-center justify-center rounded-md text-sm font-medium ' +
        'bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-70 disabled:cursor-not-allowed ' +
        'px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ' +
        className
      }
      {...props}
    />
  )
}