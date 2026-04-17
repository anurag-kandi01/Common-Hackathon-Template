import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { dropoutIncidents as incidentsFromMock, volunteerRoster as rosterFromMock } from "../data/mockData"
import type { DropoutIncident, Volunteer } from "../types"
import { QUICK_ASSIGNMENT_PRESETS, type AssignmentTarget, type VolunteerAssignmentLock } from "../lib/assignment-types"
import { ToastStack, type ToastItem, type ToastTone } from "../components/toast-stack"

function cloneVolunteers(): Volunteer[] {
  return JSON.parse(JSON.stringify(rosterFromMock)) as Volunteer[]
}

function initialIncidents(): DropoutIncident[] {
  return incidentsFromMock.map((i) => ({ ...i, resolutionStatus: "Open" as const }))
}

const notifyKey = (incidentId: string, volunteerId: string) => `${incidentId}:${volunteerId}`
const lockTaskId = (target: AssignmentTarget) => (target.kind === "incident" ? target.incidentId : target.taskId)

const toMinutes = (value: string) => {
  const [hour, minute] = value.split(":").map(Number)
  return hour * 60 + minute
}

const overlaps = (a: string, b: string) => {
  const [aStart, aEnd] = a.split("-")
  const [bStart, bEnd] = b.split("-")
  if (!aStart || !aEnd || !bStart || !bEnd) return false
  const startA = toMinutes(aStart)
  const endA = toMinutes(aEnd)
  const startB = toMinutes(bStart)
  const endB = toMinutes(bEnd)
  return startA < endB && startB < endA
}

interface OperationsContextValue {
  volunteers: Volunteer[]
  incidents: DropoutIncident[]
  assignmentLocks: Record<string, VolunteerAssignmentLock>
  assignVolunteerToTask: (volunteerId: string, target: AssignmentTarget) => boolean
  assignVolunteerToBestTask: (volunteerId: string) => boolean
  notifyVolunteer: (volunteerId: string, incidentId: string) => "sent" | "already"
  markIncidentResolved: (incidentId: string, volunteerId: string, target: AssignmentTarget) => void
  getVolunteersForRanking: (targetIncident?: DropoutIncident) => Volunteer[]
  getBestOpenTaskForVolunteer: (volunteer: Volunteer) => AssignmentTarget | null
  isVolunteerAssignable: (volunteer: Volunteer, target: AssignmentTarget) => boolean
  hasAssignmentConflict: (volunteer: Volunteer, target: AssignmentTarget) => boolean
  isVolunteerNotified: (incidentId: string, volunteerId: string) => boolean
  isVolunteerBusy: (volunteerId: string) => boolean
  hasVolunteerAssignedToIncident: (incidentId: string, volunteerId: string) => boolean
  updateVolunteer: (volunteerId: string, patch: Partial<Volunteer>) => void
  pushToast: (payload: { title: string; subtitle?: string; tone: ToastTone; durationMs?: number }) => void
}

const OperationsContext = createContext<OperationsContextValue | null>(null)

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(cloneVolunteers)
  const [incidents, setIncidents] = useState<DropoutIncident[]>(initialIncidents)
  const [assignmentLocks, setAssignmentLocks] = useState<Record<string, VolunteerAssignmentLock>>({})
  const [notified, setNotified] = useState<Record<string, true>>({})
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback((payload: { title: string; subtitle?: string; tone: ToastTone; durationMs?: number }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { id, ...payload }])
  }, [])

  const updateVolunteer = useCallback((volunteerId: string, patch: Partial<Volunteer>) => {
    setVolunteers((prev) => prev.map((v) => (v.id === volunteerId ? { ...v, ...patch } : v)))
  }, [])

  const hasActiveAssignment = useCallback(
    (volunteer: Volunteer) =>
      volunteer.dutyStatus === "On-duty" &&
      volunteer.currentAssignment.trim().toLowerCase() !== "awaiting assignment",
    [],
  )

  const isVolunteerBusy = useCallback(
    (volunteerId: string) => Object.prototype.hasOwnProperty.call(assignmentLocks, volunteerId),
    [assignmentLocks],
  )

  const hasVolunteerAssignedToIncident = useCallback(
    (incidentId: string, volunteerId: string) => {
      const inc = incidents.find((i) => i.id === incidentId)
      return inc?.replacementVolunteerId === volunteerId && inc.resolutionStatus === "ReplacementAssigned"
    },
    [incidents],
  )

  const isVolunteerNotified = useCallback(
    (incidentId: string, volunteerId: string) => !!notified[notifyKey(incidentId, volunteerId)],
    [notified],
  )

  const markIncidentResolved = useCallback((incidentId: string, volunteerId: string, target: AssignmentTarget) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId
          ? {
              ...i,
              resolutionStatus: "ReplacementAssigned",
              replacementVolunteerId: volunteerId,
              zone: target.zone,
              timeWindow: target.timeWindow,
            }
          : i,
      ),
    )
  }, [])

  const hasAssignmentConflict = useCallback(
    (volunteer: Volunteer, target: AssignmentTarget) => {
      const lock = assignmentLocks[volunteer.id]
      if (!lock) return false
      if (lock.taskId === lockTaskId(target)) return false
      if (overlaps(lock.timeWindow, target.timeWindow)) return true
      return true
    },
    [assignmentLocks],
  )

  const isVolunteerAssignable = useCallback(
    (volunteer: Volunteer, target: AssignmentTarget) => {
      if (volunteer.availability.currentStatus === "Unavailable") return false
      if (hasActiveAssignment(volunteer)) return false
      if (hasAssignmentConflict(volunteer, target)) return false
      if (target.kind === "incident") {
        const incident = incidents.find((i) => i.id === target.incidentId)
        if (!incident || incident.resolutionStatus === "ReplacementAssigned") return false
      }
      return true
    },
    [hasActiveAssignment, hasAssignmentConflict, incidents],
  )

  const getBestOpenTaskForVolunteer = useCallback(
    (volunteer: Volunteer): AssignmentTarget | null => {
      const openIncidents = incidents.filter((i) => i.resolutionStatus !== "ReplacementAssigned")
      const candidates: AssignmentTarget[] = [
        ...openIncidents.map((incident) => ({
          kind: "incident" as const,
          incidentId: incident.id,
          roleLabel: incident.affectedRole,
          zone: incident.zone,
          timeWindow: incident.timeWindow,
        })),
        ...QUICK_ASSIGNMENT_PRESETS.map((slot) => ({
          kind: "quick" as const,
          taskId: slot.taskId,
          roleLabel: slot.roleLabel,
          zone: slot.zone,
          timeWindow: slot.timeWindow,
        })),
      ]

      const skills = [...volunteer.primarySkills, ...volunteer.secondarySkills].map((s) => s.toLowerCase())
      const taskScore = (target: AssignmentTarget) => {
        const roleKey = target.roleLabel.toLowerCase()
        const skillMatch = skills.some((skill) => roleKey.includes(skill.split(" ")[0]) || skill.includes(roleKey.split(" ")[0])) ? 95 : 62
        const overlapBoost = volunteer.availability.availableSlots.includes(target.timeWindow) ? 98 : volunteer.availability.currentStatus === "Available" ? 78 : 60
        const zoneBoost = volunteer.currentZone === target.zone ? 100 : 72
        const responseScore = Math.max(20, 100 - volunteer.responseSpeedMinutes * 5)
        return (
          skillMatch * 0.3 +
          volunteer.reliabilityScore * 0.2 +
          volunteer.attendanceRate * 0.14 +
          overlapBoost * 0.18 +
          zoneBoost * 0.1 +
          responseScore * 0.08
        )
      }

      const valid = candidates.filter((target) => isVolunteerAssignable(volunteer, target))
      if (!valid.length) return null
      return valid.sort((a, b) => taskScore(b) - taskScore(a))[0]
    },
    [incidents, isVolunteerAssignable],
  )

  const assignVolunteerToTask = useCallback(
    (volunteerId: string, target: AssignmentTarget): boolean => {
      const volunteer = volunteers.find((v) => v.id === volunteerId)
      if (!volunteer) {
        pushToast({ title: "Assignment failed", subtitle: "Volunteer not found.", tone: "error" })
        return false
      }

      if (volunteer.availability.currentStatus === "Unavailable") {
        pushToast({
          title: "Assignment blocked",
          subtitle: `${volunteer.name} is unavailable and cannot be assigned.`,
          tone: "error",
          durationMs: 4000,
        })
        return false
      }

      if (hasActiveAssignment(volunteer) || isVolunteerBusy(volunteerId)) {
        const activeTask = assignmentLocks[volunteerId]?.roleLabel ?? volunteer.currentAssignment
        pushToast({
          title: "Volunteer already assigned",
          subtitle: `${volunteer.name} is already assigned to ${activeTask}. Complete or release the current assignment before reassigning.`,
          tone: "info",
          durationMs: 4000,
        })
        return false
      }

      if (!isVolunteerAssignable(volunteer, target)) {
        pushToast({
          title: "Assignment conflict",
          subtitle: `${volunteer.name} cannot be assigned to this slot due to an active overlap or incident state.`,
          tone: "error",
          durationMs: 4000,
        })
        return false
      }

      if (target.kind === "incident") {
        const incident = incidents.find((i) => i.id === target.incidentId)
        if (!incident) {
          pushToast({ title: "Cannot assign", subtitle: "Incident not found.", tone: "error" })
          return false
        }
        if (incident.resolutionStatus === "ReplacementAssigned") {
          pushToast({ title: "Cannot assign", subtitle: "This incident already has a replacement assigned.", tone: "info", durationMs: 3800 })
          return false
        }
        if (hasVolunteerAssignedToIncident(target.incidentId, volunteerId)) {
          pushToast({
            title: "Already assigned",
            subtitle: `${volunteer.name} is already recorded for this incident.`,
            tone: "info",
            durationMs: 3800,
          })
          return false
        }

        const assignmentLabel = `${target.roleLabel} · ${target.timeWindow}`
        setVolunteers((prev) =>
          prev.map((v) =>
            v.id === volunteerId
              ? {
                  ...v,
                  dutyStatus: "On-duty",
                  currentZone: incident.zone,
                  currentAssignment: assignmentLabel,
                  availability: {
                    ...v.availability,
                    currentStatus: v.availability.currentStatus === "Available" ? "Limited" : v.availability.currentStatus,
                  },
                }
              : v,
          ),
        )
        markIncidentResolved(target.incidentId, volunteerId, target)
        setAssignmentLocks((b) => ({
          ...b,
          [volunteerId]: {
            volunteerId,
            taskId: target.incidentId,
            roleLabel: target.roleLabel,
            zone: target.zone,
            timeWindow: target.timeWindow,
            kind: "incident",
          },
        }))
        pushToast({
          title: "Volunteer assigned successfully",
          subtitle: `${volunteer.name} assigned to ${target.roleLabel}`,
          tone: "success",
          durationMs: 4000,
        })
        return true
      }

      const assignmentLabel = `${target.roleLabel} · ${target.timeWindow}`
      setVolunteers((prev) =>
        prev.map((v) =>
          v.id === volunteerId
            ? {
                ...v,
                dutyStatus: "On-duty",
                currentZone: target.zone,
                currentAssignment: assignmentLabel,
                availability: {
                  ...v.availability,
                  currentStatus: v.availability.currentStatus === "Available" ? "Limited" : v.availability.currentStatus,
                },
              }
            : v,
        ),
      )
      setAssignmentLocks((b) => ({
        ...b,
        [volunteerId]: {
          volunteerId,
          taskId: target.taskId,
          roleLabel: target.roleLabel,
          zone: target.zone,
          timeWindow: target.timeWindow,
          kind: "quick",
        },
      }))
      pushToast({
        title: "Volunteer assigned successfully",
        subtitle: `${volunteer.name} assigned to ${target.roleLabel}`,
        tone: "success",
        durationMs: 4000,
      })
      return true
    },
    [
      volunteers,
      incidents,
      assignmentLocks,
      isVolunteerBusy,
      hasVolunteerAssignedToIncident,
      markIncidentResolved,
      pushToast,
      hasActiveAssignment,
      isVolunteerAssignable,
    ],
  )

  const assignVolunteerToBestTask = useCallback(
    (volunteerId: string) => {
      const volunteer = volunteers.find((v) => v.id === volunteerId)
      if (!volunteer) {
        pushToast({ title: "Assignment failed", subtitle: "Volunteer not found.", tone: "error" })
        return false
      }
      const target = getBestOpenTaskForVolunteer(volunteer)
      if (!target) {
        pushToast({
          title: "No eligible task found",
          subtitle: `${volunteer.name} has no conflict-free open incident or quick slot.`,
          tone: "info",
          durationMs: 3600,
        })
        return false
      }
      return assignVolunteerToTask(volunteerId, target)
    },
    [volunteers, getBestOpenTaskForVolunteer, assignVolunteerToTask, pushToast],
  )

  const notifyVolunteer = useCallback(
    (volunteerId: string, incidentId: string): "sent" | "already" => {
      const key = notifyKey(incidentId, volunteerId)
      if (notified[key]) {
        const volunteer = volunteers.find((v) => v.id === volunteerId)
        const incident = incidents.find((i) => i.id === incidentId)
        pushToast({
          title: "Already sent",
          subtitle:
            volunteer && incident
              ? `${volunteer.name} was already notified for ${incident.affectedRole}.`
              : "This volunteer was already notified for this incident.",
          tone: "info",
          durationMs: 3500,
        })
        return "already"
      }
      const volunteer = volunteers.find((v) => v.id === volunteerId)
      const incident = incidents.find((i) => i.id === incidentId)
      setNotified((n) => ({ ...n, [key]: true }))
      pushToast({
        title: "Volunteer notified",
        subtitle: volunteer && incident
          ? `${volunteer.name} has been informed about ${incident.affectedRole}`
          : "Notification sent to volunteer.",
        tone: "success",
        durationMs: 4000,
      })
      return "sent"
    },
    [notified, volunteers, incidents, pushToast],
  )

  const getVolunteersForRanking = useCallback((targetIncident?: DropoutIncident) => {
    return volunteers.filter((v) => {
      if (v.availability.currentStatus === "Unavailable") return false
      if (hasActiveAssignment(v)) return false
      if (isVolunteerBusy(v.id)) return false
      if (targetIncident) {
        const incidentTarget: AssignmentTarget = {
          kind: "incident",
          incidentId: targetIncident.id,
          roleLabel: targetIncident.affectedRole,
          zone: targetIncident.zone,
          timeWindow: targetIncident.timeWindow,
        }
        if (hasAssignmentConflict(v, incidentTarget)) return false
      }
      return true
    })
  }, [volunteers, isVolunteerBusy, hasActiveAssignment, hasAssignmentConflict])

  const value = useMemo<OperationsContextValue>(
    () => ({
      volunteers,
      incidents,
      assignmentLocks,
      assignVolunteerToTask,
      assignVolunteerToBestTask,
      notifyVolunteer,
      markIncidentResolved,
      getVolunteersForRanking,
      getBestOpenTaskForVolunteer,
      isVolunteerAssignable,
      hasAssignmentConflict,
      isVolunteerNotified,
      isVolunteerBusy,
      hasVolunteerAssignedToIncident,
      updateVolunteer,
      pushToast,
    }),
    [
      volunteers,
      incidents,
      assignmentLocks,
      assignVolunteerToTask,
      assignVolunteerToBestTask,
      notifyVolunteer,
      markIncidentResolved,
      getVolunteersForRanking,
      getBestOpenTaskForVolunteer,
      isVolunteerAssignable,
      hasAssignmentConflict,
      isVolunteerNotified,
      isVolunteerBusy,
      hasVolunteerAssignedToIncident,
      updateVolunteer,
      pushToast,
    ],
  )

  return (
    <OperationsContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </OperationsContext.Provider>
  )
}

export function useOperations() {
  const ctx = useContext(OperationsContext)
  if (!ctx) throw new Error("useOperations must be used within OperationsProvider")
  return ctx
}
