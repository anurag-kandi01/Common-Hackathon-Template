import { X } from "lucide-react"
import type { Shift } from "../types"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

interface ShiftDetailDrawerProps {
  shift: Shift | null
  onClose: () => void
}

export function ShiftDetailDrawer({ shift, onClose }: ShiftDetailDrawerProps) {
  return (
    <div className={`fixed inset-0 z-50 transition ${shift ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/65 transition-opacity ${shift ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-[#090d17] p-5 transition-transform duration-300 ${shift ? "translate-x-0" : "translate-x-full"}`}
      >
        {shift && (
          <Card className="h-full overflow-auto p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#7b88ae]">{shift.zone}</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{shift.eventName}</h3>
                <p className="text-sm text-[#9aa5c8]">{shift.role}</p>
              </div>
              <button className="rounded-lg border border-white/10 p-2 text-[#b9c3e2]" onClick={onClose}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-[#c0c9e5]">
              <section><p className="mb-1 text-xs uppercase tracking-[0.14em] text-[#7c89b0]">Reporting time</p>{shift.reportingTime} ({shift.duration})</section>
              <section><p className="mb-1 text-xs uppercase tracking-[0.14em] text-[#7c89b0]">Coordinator</p>{shift.coordinator}</section>
              <section><p className="mb-1 text-xs uppercase tracking-[0.14em] text-[#7c89b0]">Operational notes</p>{shift.notes}</section>
              <section><p className="mb-1 text-xs uppercase tracking-[0.14em] text-[#7c89b0]">AI update flag</p>{shift.aiUpdated ? "This shift was optimized by Crew Sync AI." : "Manual schedule slot."}</section>
            </div>
            <div className="mt-5 flex gap-2">
              <Button className="flex-1">Mark Ready</Button>
              <Button className="flex-1" variant="outline">Need Clarification</Button>
            </div>
          </Card>
        )}
      </aside>
    </div>
  )
}
