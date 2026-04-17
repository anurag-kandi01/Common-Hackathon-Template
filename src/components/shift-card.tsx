import { Clock3, MapPin, UserRound } from "lucide-react"
import type { Shift } from "../types"
import { cn } from "../lib/utils"
import { StatusBadge } from "./status-badge"
import { Card } from "./ui/card"

interface ShiftCardProps {
  shift: Shift
  onClick?: () => void
}

export function ShiftCard({ shift, onClick }: ShiftCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer p-4 transition-all hover:-translate-y-0.5 hover:border-[#2f6fff]/35",
        shift.aiUpdated && "ambient-glow",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-[#7480a7]">{shift.zone}</p>
          <p className="mt-1 text-lg font-semibold text-white">{shift.eventName}</p>
          <p className="text-sm text-[#97a2c4]">{shift.role}</p>
        </div>
        <StatusBadge status={shift.status} />
      </div>
      <div className="grid gap-2 text-sm text-[#b5bfdc] sm:grid-cols-3">
        <p className="flex items-center gap-1.5"><Clock3 size={14} /> {shift.reportingTime} • {shift.duration}</p>
        <p className="flex items-center gap-1.5"><MapPin size={14} /> {shift.zone}</p>
        <p className="flex items-center gap-1.5"><UserRound size={14} /> {shift.coordinator}</p>
      </div>
      {shift.aiUpdated && <p className="mt-3 text-xs text-[#8faeff]">AI-updated shift: schedule optimized for live demand.</p>}
    </Card>
  )
}
