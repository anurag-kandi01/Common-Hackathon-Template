import type { RankingRequest, RankingResponse } from "./apiTypes"
import type { DropoutIncident, RecommendationBreakdown, Volunteer } from "../types"
import { rankVolunteers } from "./volunteerRanking"

export function getBestVolunteerMatch(incident: DropoutIncident, volunteers: Volunteer[]): RecommendationBreakdown[] {
  return rankVolunteers(incident, volunteers)
}

export async function getBestVolunteerMatchAsync(request: RankingRequest): Promise<RankingResponse> {
  const scoreBreakdown = getBestVolunteerMatch(request.incident, request.volunteers)
  const topCandidates = scoreBreakdown.slice(0, 5)
  return Promise.resolve({
    recommendedVolunteer: topCandidates[0] ?? null,
    topCandidates,
    scoreBreakdown,
    explanationText: topCandidates[0]?.explanation ?? "No recommendation available.",
  })
}

export function getTopCandidates(incident: DropoutIncident, volunteers: Volunteer[], limit = 5) {
  return getBestVolunteerMatch(incident, volunteers).slice(0, limit)
}
