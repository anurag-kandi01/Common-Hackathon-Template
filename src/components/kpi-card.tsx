import type { ReactNode } from "react"
import { Card } from "./ui/card"

interface KpiCardProps {
  label: string
  value: string
  subcopy: string
  icon?: ReactNode
}

export function KpiCard({ label, value, subcopy, icon }: KpiCardProps) {
  return (
    <Card className="group p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2f6fff]/35">
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-[#7f89ad]">
        {label}
        {icon}
      </div>
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-[#8995ba]">{subcopy}</p>
    </Card>
  )
}
