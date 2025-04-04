import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react";

//mod: cookieStyles
const cookieStyles = {
  fontWeight: '600',
  backgroundImage: `
    radial-gradient(circle at 5% 20%, #835029 5%, transparent 0),
    radial-gradient(circle at 20% 80%, #835029 4%, transparent 0),
    radial-gradient(circle at 40% 30%, #835029 5%, transparent 0),
    radial-gradient(circle at 70% 60%, #835029 5%, transparent 0),              
    radial-gradient(circle at 50% 90%, #835029 3%, transparent 0),   
    radial-gradient(circle at 80% 0%, #835029 5%, transparent 0),
    radial-gradient(circle at 100% 50%, #835029 4%, transparent 0)
  `,
  backgroundSize: '100% 100%',
  textShadow: '1px 0px 6px rgba(170, 170, 170, 0.6)', // Add shadow to make text more visible
};
const cookieTwStyles = "bg-dough-400 hover:bg-dough-500/90 text-white dark:text-neutral-900";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
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
  //mod: add isLoading
  isLoading?: boolean
}

const Button = (
  {
    ref,
    className,
    variant,
    size,
    asChild = false,
    isLoading = false,
    ...props
  }: ButtonProps & {
    ref: React.RefObject<HTMLButtonElement>;
  }
) => {
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
Button.displayName = "Button"

export { Button, buttonVariants }
