import { ArrowRight } from "lucide-react"
import { KpiCard } from "../components/kpi-card"
import { Card } from "../components/ui/card"
import { adminActivityLog, adminAlerts, dropoutIncidents, zoneCoverage } from "../data/mockData"
import { useOperations } from "../context/operations-context"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"

export function DashboardScreen() {
  const { volunteers, incidents } = useOperations()
  const availableNow = volunteers.filter((v) => v.availability.currentStatus === "Available").length
  const activeNow = volunteers.filter((v) => v.dutyStatus === "On-duty").length
  const avgReliability = Math.round(volunteers.reduce((acc, v) => acc + v.reliabilityScore, 0) / volunteers.length)
  const coverageHealth = Math.round((zoneCoverage.reduce((acc, z) => acc + Math.min(z.assigned / z.required, 1), 0) / zoneCoverage.length) * 100)
  const openDropouts = incidents.filter((i) => i.resolutionStatus !== "ReplacementAssigned").length
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-[#7a87b0]">Admin home</p>
        <h1 className="serif-title text-4xl font-semibold text-white">Operations Dashboard</h1>
        <p className="text-[#9aa6ca]">Fast situational view for staffing health and dropout response.</p>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Volunteers" value={`${activeNow}`} subcopy="Currently on-ground" />
        <KpiCard label="Available Now" value={`${availableNow}`} subcopy="Ready for assignment" />
        <KpiCard label="Open dropouts" value={`${openDropouts}`} subcopy={`${dropoutIncidents.length} total logged`} />
        <KpiCard label="Coverage Health" value={`${coverageHealth}%`} subcopy="Across key zones" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Zone Coverage</h3>
          <div className="space-y-3">
            {zoneCoverage.map((zone) => {
              const fill = Math.round((zone.assigned / zone.required) * 100)
              const deficit = Math.max(0, zone.required - zone.assigned)
              return (
                <div key={zone.zone} className="rounded-xl border border-white/10 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <p className="font-medium text-white">{zone.zone}</p>
                    <p className="text-[#9aa6ca]">{zone.assigned}/{zone.required}</p>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#2f6fff]" style={{ width: `${Math.min(fill, 100)}%` }} />
                  </div>
                  {deficit > 0 && <p className="mt-2 text-xs text-[#e0aa6c]">Under-covered by {deficit} volunteers</p>}
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Priority Alerts</h3>
          <div className="space-y-3">
            {incidents.map((incident) => (
              <div key={incident.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">{incident.affectedRole}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {incident.resolutionStatus === "ReplacementAssigned" && (
                      <Badge tone="success">Filled</Badge>
                    )}
                    <Badge tone={incident.urgency === "Critical" ? "danger" : "warning"}>{incident.urgency}</Badge>
                  </div>
                </div>
                <p className="text-sm text-[#9ca8ce]">{incident.zone} • {incident.timeWindow}</p>
                <p className="mt-1 text-xs text-[#7e8bb2]">{incident.impact}</p>
              </div>
            ))}
          </div>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              window.location.hash = "dropout-center"
            }}
          >
            Open Reassignment Center <ArrowRight size={14} />
          </Button>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Recent Command Activity</h3>
          <div className="space-y-2">
            {adminActivityLog.slice(0, 4).map((log) => (
              <p key={log.id} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-[#a8b4d6]">
                {log.message} <span className="text-[#7380a8]">({log.time})</span>
              </p>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-lg font-semibold text-white">Roster Reliability Snapshot</h3>
          <p className="mb-3 text-sm text-[#9aa6ca]">Average reliability is {avgReliability}% across the active volunteer pool.</p>
          <div className="space-y-3">
            {adminAlerts.map((alert) => (
              <div key={alert.id} className="rounded-lg border border-white/10 p-3">
                <p className="font-medium text-white">{alert.title}</p>
                <p className="text-sm text-[#97a2c8]">{alert.message}</p>
                <p className="mt-1 text-xs text-[#7380a8]">{alert.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
