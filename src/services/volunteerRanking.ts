import type { DropoutIncident, RecommendationBreakdown, Volunteer } from "../types"

function zoneProximityScore(targetZone: string, currentZone: string): number {
  if (targetZone === currentZone) return 100
  return 72
}

function skillMatchScore(role: string, volunteer: Volunteer): number {
  const roleKey = role.toLowerCase()
  const skills = [...volunteer.primarySkills, ...volunteer.secondarySkills].map((skill) => skill.toLowerCase())
  const hasMatch = skills.some((skill) => roleKey.includes(skill.split(" ")[0]) || skill.includes(roleKey.split(" ")[0]))
  return hasMatch ? 92 : 64
}

function availabilityOverlapScore(incident: DropoutIncident, volunteer: Volunteer): number {
  const statusBase = volunteer.availability.currentStatus === "Available" ? 96 : volunteer.availability.currentStatus === "Limited" ? 74 : 25
  const slotMatch = volunteer.availability.availableSlots.includes(incident.timeWindow) ? 4 : 0
  return Math.min(100, statusBase + slotMatch)
}

export function rankVolunteers(incident: DropoutIncident, volunteers: Volunteer[]): RecommendationBreakdown[] {
  return volunteers
    .filter((volunteer) => volunteer.availability.currentStatus !== "Unavailable")
    .map((volunteer) => {
      const skillMatch = skillMatchScore(incident.affectedRole, volunteer)
      const responseScore = Math.max(20, 100 - volunteer.responseSpeedMinutes * 5)
      const availabilityOverlap = availabilityOverlapScore(incident, volunteer)
      const distanceScore = zoneProximityScore(incident.zone, volunteer.currentZone)
      const fatiguePenalty = Math.round(volunteer.fatigueScore * 0.2)
      const noShowPenalty = volunteer.noShowCount * 10

      const confidenceRaw =
        skillMatch * 0.25 +
        volunteer.reliabilityScore * 0.21 +
        volunteer.attendanceRate * 0.16 +
        responseScore * 0.1 +
        availabilityOverlap * 0.16 +
        distanceScore * 0.12 -
        fatiguePenalty * 0.08 -
        noShowPenalty * 0.12

      const confidenceScore = Math.max(1, Math.min(99, Math.round(confidenceRaw)))

      return {
        volunteerId: volunteer.id,
        skillMatch,
        reliabilityScore: volunteer.reliabilityScore,
        attendanceRate: volunteer.attendanceRate,
        responseScore,
        availabilityOverlap,
        distanceScore,
        fatiguePenalty,
        noShowPenalty,
        confidenceScore,
        explanation: `Best-fit signal: ${skillMatch}% skill match, ${volunteer.reliabilityScore}% reliability, ${distanceScore}% zone proximity.`,
      }
    })
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
}
