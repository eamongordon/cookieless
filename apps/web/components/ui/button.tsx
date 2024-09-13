import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const cookieStyles = {
  color: '#ffffff',
  fontWeight: '600',
  backgroundImage: `
    radial-gradient(circle at 5% 20%, #8B4513 5%, transparent 0),
    radial-gradient(circle at 20% 80%, #8B4513 4%, transparent 0),
    radial-gradient(circle at 40% 30%, #8B4513 5%, transparent 0),
    radial-gradient(circle at 70% 60%, #8B4513 5%, transparent 0),              
    radial-gradient(circle at 50% 90%, #8B4513 3%, transparent 0),   
    radial-gradient(circle at 80% 0%, #8B4513 5%, transparent 0),
    radial-gradient(circle at 100% 50%, #8B4513 4%, transparent 0)
  `,
  backgroundSize: '100% 100%',
  textShadow: '1px 0px 6px rgba(170, 170, 170, 0.6)', // Add shadow to make text more visible
};
const cookieTwStyles = "bg-[#f5b31b] hover:bg-[#dca118]";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90",
        destructive:
          "bg-red-500 text-neutral-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-neutral-50 dark:hover:bg-red-900/90",
        outline:
          "border border-neutral-200 bg-white hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800/80",
        ghost: "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        link: "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50",
        cookie: cookieTwStyles
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        {...(variant === "cookie" ? { style: cookieStyles } : {})}
        disabled={isLoading || props.disabled}
      >
        {isLoading && (
          <Loader2 className="animate-spin mr-2 h-2/3" />
        )}
        {props.children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
