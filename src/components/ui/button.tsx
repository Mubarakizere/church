import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-church-navy text-white hover:bg-church-navy-light shadow-soft transition-colors font-medium",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-church-navy/30 bg-background text-church-navy hover:bg-church-cream hover:text-church-navy transition-colors",
        secondary: "bg-church-cream text-church-navy hover:bg-church-cream/80 font-medium",
        ghost: "hover:bg-church-cream hover:text-church-navy transition-colors",
        link: "text-church-navy underline-offset-4 hover:underline hover:text-church-gold",
        // Church-specific variants
        hero: "bg-church-gold text-church-navy font-semibold hover:bg-church-gold-hover transition-colors shadow-soft",
        navy: "bg-church-navy text-white font-medium hover:bg-church-navy-light shadow-soft transition-colors",
        gold: "bg-church-gold text-church-navy font-semibold hover:bg-church-gold-hover shadow-soft transition-colors",
        "outline-navy": "border-2 border-church-navy text-church-navy hover:bg-church-navy hover:text-white transition-colors",
        "outline-gold": "border-2 border-church-gold text-church-navy bg-transparent hover:bg-church-gold hover:text-church-navy transition-colors",
        elegant: "bg-church-navy text-white hover:bg-church-navy-light shadow-soft border border-church-gold/20",
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
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };