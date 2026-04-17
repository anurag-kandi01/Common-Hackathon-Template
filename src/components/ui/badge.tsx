import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes } from "react"
import { cn } from "../../lib/utils"

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide", {
  variants: {
    tone: {
      neutral: "border-white/10 bg-white/5 text-[#cdd4ec]",
      success: "border-[#3fbf92]/25 bg-[#3fbf92]/10 text-[#7ae4be]",
      warning: "border-[#d29c4a]/30 bg-[#d29c4a]/12 text-[#f0c887]",
      danger: "border-[#db5f73]/30 bg-[#db5f73]/12 text-[#f2a0af]",
      info: "border-[#2f6fff]/30 bg-[#2f6fff]/12 text-[#8db0ff]",
    },
  },
  defaultVariants: { tone: "neutral" },
})

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
