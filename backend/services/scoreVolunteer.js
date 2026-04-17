const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const zoneProximityScore = (targetZone, volunteerZone) => (targetZone === volunteerZone ? 100 : 72)

const skillMatchScore = (role, volunteer) => {
  const roleKey = String(role || "").toLowerCase()
  const skills = [...(volunteer.primarySkills || []), ...(volunteer.secondarySkills || [])].map((skill) =>
    String(skill).toLowerCase(),
  )
  const matched = skills.some((skill) => roleKey.includes(skill.split(" ")[0]) || skill.includes(roleKey.split(" ")[0]))
  return matched ? 92 : 64
}

const availabilityOverlapScore = (timeSlot, volunteer) => {
  const status = volunteer.availability?.currentStatus
  const statusBase = status === "Available" ? 96 : status === "Limited" ? 74 : 25
  const slotMatch = (volunteer.availability?.availableSlots || []).includes(timeSlot) ? 4 : 0
  return clamp(statusBase + slotMatch, 0, 100)
}

export function scoreAndRankVolunteers({ role, zone, timeSlot, volunteerDataset }) {
  const rows = (volunteerDataset || [])
    .filter((volunteer) => volunteer.availability?.currentStatus !== "Unavailable")
    .map((volunteer) => {
      const skillMatch = skillMatchScore(role, volunteer)
      const reliabilityScore = volunteer.reliabilityScore || 0
      const attendanceRate = volunteer.attendanceRate || 0
      const responseScore = clamp(100 - (volunteer.responseSpeedMinutes || 0) * 5, 20, 100)
      const availabilityOverlap = availabilityOverlapScore(timeSlot, volunteer)
      const distanceScore = zoneProximityScore(zone, volunteer.currentZone)
      const fatiguePenalty = Math.round((volunteer.fatigueScore || 0) * 0.2)
      const noShowPenalty = (volunteer.noShowCount || 0) * 10

      const confidenceRaw =
        skillMatch * 0.25 +
        reliabilityScore * 0.21 +
        attendanceRate * 0.16 +
        responseScore * 0.1 +
        availabilityOverlap * 0.16 +
        distanceScore * 0.12 -
        fatiguePenalty * 0.08 -
        noShowPenalty * 0.12

      return {
        volunteerId: volunteer.id,
        skillMatch,
        reliabilityScore,
        attendanceRate,
        responseScore,
        availabilityOverlap,
        distanceScore,
        fatiguePenalty,
        noShowPenalty,
        confidenceScore: clamp(Math.round(confidenceRaw), 1, 99),
        explanation: `Best-fit signal: ${skillMatch}% skill match, ${reliabilityScore}% reliability, ${distanceScore}% zone proximity.`,
      }
    })
    .sort((a, b) => b.confidenceScore - a.confidenceScore)

  return rows
}
