import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          'text-sm text-fg2 file:font-medium',
          'flex h-8 w-full rounded border border-separator2 bg-bg1 px-3 py-1 transition-colors file:border-0 file:bg-transparent file:text-sm placeholder:text-fg4 disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fgAccent1 focus-visible:ring-offset-2 focus-visible:ring-offset-bg1 focus-visible:invalid:ring-red-300',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
