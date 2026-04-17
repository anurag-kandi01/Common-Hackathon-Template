export type AssignmentTarget =
  | { kind: "incident"; incidentId: string; roleLabel: string; zone: string; timeWindow: string }
  | { kind: "quick"; taskId: string; roleLabel: string; zone: string; timeWindow: string }

export interface VolunteerAssignmentLock {
  volunteerId: string
  taskId: string
  roleLabel: string
  zone: string
  timeWindow: string
  kind: "incident" | "quick"
}

export const QUICK_ASSIGNMENT_PRESETS = [
  { taskId: "TASK-CR-MAIN", roleLabel: "Crowd Router", zone: "Main Stage", timeWindow: "17:00-20:00" },
  { taskId: "TASK-REG-DESK", roleLabel: "Registration Desk Support", zone: "Registration", timeWindow: "16:00-18:00" },
] as const
