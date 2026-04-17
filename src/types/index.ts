export type UserRole = "admin" | "volunteer"
export type AppSection =
  | "admin-dashboard"
  | "volunteer-directory"
  | "dropout-center"
  | "volunteer-dashboard"

export type ShiftStatus = "Confirmed" | "Pending" | "Reassigned" | "Backup" | "Completed"
export type UrgencyLevel = "Low" | "Medium" | "High" | "Critical"
export type AvailabilityStatus = "Available" | "Limited" | "Unavailable"
export type DutyStatus = "On-duty" | "Standby" | "Off-duty"

export interface Volunteer {
  id: string
  name: string
  department: string
  year: number
  primarySkills: string[]
  secondarySkills: string[]
  preferredRoles: string[]
  preferredZones: string[]
  availability: {
    currentStatus: AvailabilityStatus
    availableSlots: string[]
    maxHoursPerDay: number
  }
  reliabilityScore: number
  attendanceRate: number
  responseSpeedMinutes: number
  completedShifts: number
  dropoutHistory: number
  noShowCount: number
  currentAssignment: string
  currentZone: string
  dutyStatus: DutyStatus
  rating: number
  fatigueScore: number
  phone: string
  email: string
}

export interface ZoneCoverage {
  zone: string
  required: number
  assigned: number
}

export interface Shift {
  id: string
  eventName: string
  zone: string
  role: string
  reportingTime: string
  duration: string
  coordinator: string
  notes: string
  status: ShiftStatus
  volunteerId: string
  aiUpdated?: boolean
}

export type IncidentResolutionStatus = "Open" | "ReplacementAssigned"

export interface DropoutIncident {
  id: string
  volunteerId: string
  affectedRole: string
  zone: string
  timeWindow: string
  urgency: UrgencyLevel
  impact: string
  conflictCheck: string
  createdAt: string
  resolutionStatus?: IncidentResolutionStatus
  replacementVolunteerId?: string
}

export interface RecommendationBreakdown {
  volunteerId: string
  skillMatch: number
  reliabilityScore: number
  attendanceRate: number
  responseScore: number
  availabilityOverlap: number
  distanceScore: number
  fatiguePenalty: number
  noShowPenalty: number
  confidenceScore: number
  explanation: string
}

export interface RecommendationRequestPayload {
  incident: DropoutIncident
  role: string
  zone: string
  timeSlot: string
  volunteerDataset: Volunteer[]
}

export interface RecommendationResult {
  recommendedVolunteer: RecommendationBreakdown | null
  topCandidates: RecommendationBreakdown[]
  scoreBreakdown: RecommendationBreakdown[]
  explanationText: string
  source: "local" | "backend"
}

export interface AdminAlert {
  id: string
  title: string
  message: string
  time: string
  urgency: UrgencyLevel
}

export interface VolunteerAlert {
  id: string
  volunteerId: string
  title: string
  message: string
  time: string
  actionable?: boolean
  reassignmentTargetZone?: string
  reassignmentTargetAssignment?: string
}

export interface ActivityLog {
  id: string
  message: string
  time: string
  type: "assignment" | "dropout" | "coverage" | "alert"
}
