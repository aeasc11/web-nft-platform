import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  `inline-flex w-fit items-center justify-center whitespace-nowrap rounded-lg
  font-tertiary font-medium  ring-offset-white
  transition-[background-color,color,border,--vivid-gradient-1,--vivid-gradient-2]
  duration-300 focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:opacity-50`,
  {
    variants: {
      variant: {
        outline: [
          `border border-primary-600 text-primary-600 bg-white
          hover:bg-primary-600 hover:text-primary-100`,
        ],
        primary: [
          `bg-primary-600 text-primary-100 shadow-md
          hover:bg-primary-700 data-[state=open]:bg-primary-700`,
        ],
        white: [
          `bg-white text-primary-black-1 hover:bg-primary-grey
          data-[state=open]:bg-primary-grey`,
        ],
        black: [
          `border border-white/20 bg-primary-black-1/20 text-white hover:border-white
          hover:bg-primary-black-2 data-[state=open]:border-white
          data-[state=open]:bg-primary-black-2`,
        ],
        vivid: [
          `bg-vivid-gradient text-white shadow-lg ring-1 ring-white/20
          hover:text-primary-black-1`,
        ],
        warning: 'bg-primary-orange text-white',
        none: '',
      },
      size: {
        sm: 'min-h-[44.25px] px-5 py-4 text-sm/[0.875]',
        lg: 'min-h-[60px] px-6 py-[18px] text-base/[0.875]',
        icon: 'h-[44.25px] w-[44.25px]',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
