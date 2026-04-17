import { useMemo, useState } from "react"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import type { DutyStatus, Volunteer } from "../types"
import { cn } from "../lib/utils"
import { useOperations } from "../context/operations-context"

type SortOption = "reliability" | "fastest-responder"

function availabilityBadgeTone(volunteer: Volunteer) {
  if (volunteer.availability.currentStatus === "Unavailable") return "danger" as const
  if (volunteer.availability.currentStatus === "Limited") return "warning" as const
  return "success" as const
}

function dutyBadgeTone(duty: DutyStatus) {
  if (duty === "On-duty") return "info" as const
  if (duty === "Standby") return "warning" as const
  return "neutral" as const
}

function dutyLabel(duty: DutyStatus) {
  if (duty === "On-duty") return "On Duty"
  if (duty === "Standby") return "Standby"
  return "Off duty"
}

export function VolunteerDirectoryScreen() {
  const { volunteers, assignVolunteerToBestTask, isVolunteerBusy } = useOperations()
  const [skillFilter, setSkillFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [sortBy, setSortBy] = useState<SortOption>("reliability")
  const [assigningId, setAssigningId] = useState<string | null>(null)

  const rows = useMemo(() => {
    const filtered = volunteers.filter((v) => {
      if (skillFilter !== "all" && ![...v.primarySkills, ...v.secondarySkills].includes(skillFilter)) return false
      if (availabilityFilter !== "all" && v.availability.currentStatus !== availabilityFilter) return false
      return true
    })

    return filtered.sort((a, b) => {
      if (sortBy === "reliability") return b.reliabilityScore - a.reliabilityScore
      return a.responseSpeedMinutes - b.responseSpeedMinutes
    })
  }, [volunteers, skillFilter, availabilityFilter, sortBy])

  const autoAssignVolunteer = async (volunteerId: string) => {
    setAssigningId(volunteerId)
    await new Promise((r) => window.setTimeout(r, 450))
    assignVolunteerToBestTask(volunteerId)
    setAssigningId(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-[#7885ad]">Admin tooling</p>
        <h1 className="serif-title text-4xl font-semibold text-white">Volunteer Directory</h1>
        <p className="text-[#9aa6ca]">Compact roster for rapid assignment decisions.</p>
      </div>

      <Card className="p-4">
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-3">
          <Select value={skillFilter} onChange={setSkillFilter} options={["all", "Hospitality", "Crowd Management", "Logistics", "AV Support"]} />
          <Select value={availabilityFilter} onChange={setAvailabilityFilter} options={["all", "Available", "Limited", "Unavailable"]} />
          <select className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
            <option value="reliability">Highest Reliability</option>
            <option value="fastest-responder">Fastest Responder</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.02] text-[#96a2c8]">
            <tr>
              <th className="px-3 py-3">Volunteer</th>
              <th className="px-3 py-3">Skills</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Metrics</th>
              <th className="px-3 py-3">Current</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => {
              const blocked = v.availability.currentStatus === "Unavailable"
              const locked = isVolunteerBusy(v.id) || (v.dutyStatus === "On-duty" && v.currentAssignment.toLowerCase() !== "awaiting assignment")
              return (
                <tr
                  key={v.id}
                  className={cn(
                    "border-b border-white/5 text-[#d4dbf1]",
                    blocked && "bg-[#db5f73]/[0.07] opacity-[0.97]",
                  )}
                >
                  <td className={cn("px-3 py-3", blocked && "border-l-[3px] border-l-[#db5f73]")}>
                    <p className="font-medium text-white">{v.name}</p>
                    <p className="text-xs text-[#8f9bc2]">{v.id} • {v.department}, Year {v.year}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p>{v.primarySkills.join(", ")}</p>
                    <p className="text-xs text-[#8f9bc2]">Secondary: {v.secondarySkills.join(", ")}</p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={availabilityBadgeTone(v)}>{v.availability.currentStatus}</Badge>
                      <Badge tone={dutyBadgeTone(v.dutyStatus)}>{dutyLabel(v.dutyStatus)}</Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-[#8f9bc2]">Max {v.availability.maxHoursPerDay}h/day</p>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <p>Reliability: {v.reliabilityScore}%</p>
                    <p>Attendance: {v.attendanceRate}%</p>
                    <p>Response: {v.responseSpeedMinutes}m</p>
                    <p>Completed: {v.completedShifts} • No-show: {v.noShowCount}</p>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <p>{v.currentZone}</p>
                    <p className="text-[#9ca8ce]">{v.currentAssignment}</p>
                    <p>Rating: {v.rating.toFixed(1)}</p>
                  </td>
                  <td className="px-3 py-3">
                    {blocked ? (
                      <Button size="sm" variant="destructive" disabled className="font-semibold">
                        Unavailable
                      </Button>
                    ) : locked ? (
                      <Button size="sm" variant="outline" disabled>
                        Assigned
                      </Button>
                    ) : (
                      <Button size="sm" type="button" disabled={assigningId === v.id} onClick={() => autoAssignVolunteer(v.id)}>
                        {assigningId === v.id ? "Assigning..." : "Assign Volunteer"}
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  )
}
