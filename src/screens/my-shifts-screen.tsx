import { useMemo, useState } from "react"
import { shifts } from "../data/mockData"
import type { Shift } from "../types"
import { ShiftCard } from "../components/shift-card"
import { ShiftDetailDrawer } from "../components/shift-detail-drawer"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"

export function MyShiftsScreen() {
  const [view, setView] = useState<"Day" | "Week">("Day")
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)

  const shiftsToRender = useMemo(
    () => (view === "Day" ? shifts.filter((s) => s.reportingTime >= "14:00" && s.reportingTime <= "22:00") : shifts),
    [view],
  )

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#7b87ae]">Volunteer scheduling</p>
            <h1 className="serif-title text-4xl font-semibold text-white">My Shifts</h1>
          </div>
          <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {(["Day", "Week"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`rounded-lg px-4 py-2 text-sm transition ${view === mode ? "bg-[#2f6fff] text-white" : "text-[#9ca8cf]"}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {shiftsToRender.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} onClick={() => setSelectedShift(shift)} />
          ))}
        </div>

        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">Need a swap?</p>
              <p className="text-sm text-[#9ba6ca]">Request a swap at least 30 minutes before report time.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Request Swap</Button>
            </div>
          </div>
        </Card>
      </div>
      <ShiftDetailDrawer shift={selectedShift} onClose={() => setSelectedShift(null)} />
    </>
  )
}
