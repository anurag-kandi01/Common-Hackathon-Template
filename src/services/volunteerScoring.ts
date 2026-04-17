import type { DropoutIncident, RecommendationBreakdown, Volunteer } from "../types"
import { rankVolunteers } from "./volunteerRanking"

export function scoreVolunteer(incident: DropoutIncident, volunteer: Volunteer): RecommendationBreakdown {
  return rankVolunteers(incident, [volunteer])[0]
}
