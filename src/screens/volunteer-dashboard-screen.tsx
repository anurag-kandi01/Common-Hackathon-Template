import { useMemo, useState } from "react"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { currentVolunteerId, shifts, volunteerAlerts } from "../data/mockData"
import type { VolunteerAlert } from "../types"
import { useOperations } from "../context/operations-context"

type ReassignmentDecision = "awaiting" | "accepted" | "declined"

export function VolunteerDashboardScreen() {
  const { volunteers, updateVolunteer } = useOperations()
  const volunteer = useMemo(() => volunteers.find((item) => item.id === currentVolunteerId), [volunteers])

  const [reassignmentById, setReassignmentById] = useState<Record<string, ReassignmentDecision>>({})
  const [shiftConfirmed, setShiftConfirmed] = useState(false)

  const myShifts = shifts.filter((shift) => shift.volunteerId === currentVolunteerId)
  const nextShift = myShifts.find((shift) => shift.status !== "Completed") ?? myShifts[0]
  const myAlerts = volunteerAlerts.filter((item) => item.volunteerId === currentVolunteerId)

  const handleAccept = (alert: VolunteerAlert) => {
    if (!alert.actionable) return
    const zone = alert.reassignmentTargetZone ?? volunteer?.currentZone ?? ""
    const assignment = alert.reassignmentTargetAssignment ?? "Reassignment accepted"
    updateVolunteer(currentVolunteerId, {
      currentZone: zone,
      currentAssignment: assignment,
      dutyStatus: "On-duty",
    })
    setReassignmentById((prev) => ({ ...prev, [alert.id]: "accepted" }))
  }

  const handleDecline = (alert: VolunteerAlert) => {
    if (!alert.actionable) return
    setReassignmentById((prev) => ({ ...prev, [alert.id]: "declined" }))
  }

  const reassignmentDecision = (alert: VolunteerAlert): ReassignmentDecision =>
    reassignmentById[alert.id] ?? "awaiting"

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-[#7884ad]">Volunteer view</p>
        <h1 className="serif-title text-4xl font-semibold text-white">My Dashboard</h1>
        <p className="text-[#9aa6ca]">Minimal task view for next shift, alerts, and reassignment requests.</p>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="p-5">
          <p className="text-sm text-[#9ba6cb]">Hello {volunteer?.name.split(" ")[0]}, here is your next priority.</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{nextShift?.eventName}</h3>
          <p className="mt-1 text-sm text-[#a6b1d3]">{nextShift?.role} • {nextShift?.zone}</p>
          <p className="mt-1 text-sm text-[#a6b1d3]">Report at {nextShift?.reportingTime} ({nextShift?.duration})</p>
          {shiftConfirmed && (
            <p className="mt-3 rounded-lg border border-[#3fbf92]/30 bg-[#3fbf92]/10 px-3 py-2 text-sm text-[#7ae4be]">
              Next shift confirmed. Coordinators can see you as ready.
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button disabled={shiftConfirmed} onClick={() => setShiftConfirmed(true)}>
              {shiftConfirmed ? "Confirmed" : "Confirm Next Shift"}
            </Button>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[#7d8ab2]">Current status</p>
          <p className="mt-2 text-xl font-semibold text-white">{volunteer?.dutyStatus}</p>
          <p className="text-sm text-[#99a5ca]">Assigned zone: {volunteer?.currentZone}</p>
          <p className="mt-1 text-sm text-[#8f9bc2]">{volunteer?.currentAssignment}</p>
          <Badge
            tone={
              volunteer?.availability.currentStatus === "Unavailable"
                ? "danger"
                : volunteer?.availability.currentStatus === "Limited"
                  ? "warning"
                  : "success"
            }
            className="mt-3"
          >
            {volunteer?.availability.currentStatus}
          </Badge>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-lg font-semibold text-white">Alerts from Admin</h3>
          <div className="space-y-2">
            {myAlerts.map((alert) => (
              <div key={alert.id} className="rounded-lg border border-white/10 p-3">
                <p className="font-medium text-white">{alert.title}</p>
                <p className="text-sm text-[#9ca8ce]">{alert.message}</p>
                <p className="mt-1 text-xs text-[#7380a8]">{alert.time}</p>
                {alert.actionable && reassignmentDecision(alert) === "accepted" && (
                  <p className="mt-2 text-xs text-[#7ae4be]">Reassignment accepted — your assignment was updated.</p>
                )}
                {alert.actionable && reassignmentDecision(alert) === "declined" && (
                  <p className="mt-2 text-xs text-[#f2a0af]">Reassignment declined — no schedule change applied.</p>
                )}
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-lg font-semibold text-white">Reassignment Requests</h3>
          <div className="space-y-2">
            {myAlerts.filter((item) => item.actionable).map((alert) => {
              const decision = reassignmentDecision(alert)
              return (
                <div key={alert.id} className="rounded-lg border border-[#2f6fff]/25 bg-[#2f6fff]/10 p-3">
                  <p className="font-medium text-white">{alert.message}</p>
                  <p className="mt-1 text-xs text-[#7380a8]">{alert.time}</p>
                  {decision === "awaiting" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="sm" onClick={() => handleAccept(alert)}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => handleDecline(alert)}>Decline</Button>
                    </div>
                  )}
                  {decision === "accepted" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge tone="success">Accepted</Badge>
                      <p className="text-xs text-[#9ca8ce]">You are now routed to {alert.reassignmentTargetZone ?? "the requested zone"}.</p>
                    </div>
                  )}
                  {decision === "declined" && (
                    <div className="mt-3">
                      <Badge tone="danger">Declined</Badge>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </section>

      <Card className="p-5">
        <h3 className="mb-3 text-lg font-semibold text-white">My Shifts</h3>
        <div className="space-y-2">
          {myShifts.map((shift) => (
            <div key={shift.id} className="rounded-lg border border-white/10 p-3 text-sm">
              <p className="font-medium text-white">{shift.eventName}</p>
              <p className="text-[#9ca8ce]">{shift.role} • {shift.zone}</p>
              <p className="text-[#9ca8ce]">{shift.reportingTime} ({shift.duration})</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
