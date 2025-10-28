import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group relative inline-flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer",
    "rounded border font-sans transition-all",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:scale-[99%]",
    "disabled:pointer-events-none disabled:opacity-60",
  ],
  {
    variants: {
      variant: {
        primary:
          "border-none bg-fgAccent1 text-primary-foreground hover:bg-fgAccent2 active:bg-fgAccent2 disabled:bg-muted",
        secondary:
          "border-border bg-bg2 text-fg1 hover:border-border hover:bg-bg3 active:bg-background",
        outline:
          "border-border bg-background text-fg1 hover:border-intense hover:bg-bg2 hover:text-foreground active:bg-background",
        ghost: "border-none bg-transparent text-fg1 hover:bg-accent active:bg-transparent",
        destructive:
          "border-destructive bg-serious1 text-fgSerious1 hover:border-transparent hover:bg-fgSerious1 hover:text-background focus-visible:ring-destructive active:bg-fgSerious1",
      },
      size: {
        sm: "h-7 px-2 py-1 text-xs font-semibold",
        lg: "h-9 px-3 py-2 text-base font-semibold",
        xl: "h-11 gap-3 p-3 text-[0.875rem] font-semibold",
        icon: "h-7 w-8",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "sm",
    },
  }
)

const BUTTON_VARIANTS: Exclude<VariantProps<typeof buttonVariants>['variant'], null | undefined>[] =
  ['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const;
const BUTTON_SIZES: Exclude<VariantProps<typeof buttonVariants>['size'], null | undefined>[] = [
  'sm',
  'lg',
  'xl',
  'icon',
] as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  asChild?: boolean;
}

function prepareIcon(
  icon: React.ReactElement,
  buttonSize?: (typeof BUTTON_SIZES)[number] | null,
): React.ReactElement {
  let extraClassNames = 'w-3 h-3 ';
  switch (buttonSize) {
    case 'sm':
    case 'icon':
      extraClassNames = 'w-3 h-3';
      break;
    case 'lg':
    case 'xl':
      extraClassNames = 'w-4 h-4';
      break;
  }

  return React.cloneElement(icon, {
    // @ts-expect-error React 19
    ...icon.props,
    // @ts-expect-error React 19
    className: cn(extraClassNames, icon.props.className, 'group-data-[pending=true]:opacity-0'),
  });
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const leftIconPrepared = leftIcon ? prepareIcon(leftIcon, size) : null;
  const rightIconPrepared = rightIcon ? prepareIcon(rightIcon, size) : null;

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {leftIconPrepared}
      {props.children}
      {rightIconPrepared}
    </Comp>
  )
}

export { Button, buttonVariants, BUTTON_VARIANTS, BUTTON_SIZES }
