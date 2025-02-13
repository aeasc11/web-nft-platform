import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  displayError?: 'top' | 'bottom'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, displayError = 'bottom', error, ...props }, ref) => {
    return (
      <>
        {error && displayError === 'top' && (
          <p className='mb-1 text-sm text-red-500'>{error}</p>
        )}
        <div className='w-full'>
          <input
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500',
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && displayError === 'bottom' && (
          <p className='mt-1 text-sm text-red-500'>{error}</p>
        )}
      </>
    )
  },
)

Input.displayName = 'Input'

export { Input }
