import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6fff]/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#2f6fff] text-white hover:bg-[#3a78ff] shadow-[0_12px_28px_-12px_rgba(47,111,255,0.9)]",
        outline: "border border-white/15 bg-white/0 text-[#e9edf8] hover:border-[#2f6fff]/40 hover:bg-[#2f6fff]/10",
        ghost: "text-[#aab4d6] hover:bg-white/5 hover:text-white",
        destructive:
          "border border-[#db5f73]/45 bg-[#db5f73]/14 text-[#f5b4bf] hover:bg-[#db5f73]/22 shadow-[0_0_0_1px_rgba(219,95,115,0.15)]",
      },
      size: {
        md: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
