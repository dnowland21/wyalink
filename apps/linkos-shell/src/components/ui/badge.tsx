import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gray-50 border-gray-800 text-gray-800",
        secondary:
          "bg-secondary-50 border-secondary-800 text-secondary-800",
        destructive:
          "bg-error-50 border-error-800 text-error-800",
        outline: "text-foreground",
        success:
          "bg-success-50 border-success-800 text-success-800",
        error:
          "bg-error-50 border-error-800 text-error-800",
        warning:
          "bg-warning-50 border-warning-800 text-warning-800",
        info:
          "bg-info-50 border-info-800 text-info-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
