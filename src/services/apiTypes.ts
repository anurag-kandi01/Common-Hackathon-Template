import type { DropoutIncident, RecommendationBreakdown, Volunteer } from "../types"

export interface RankingRequest {
  incident: DropoutIncident
  role: string
  zone: string
  timeSlot: string
  volunteers: Volunteer[]
}

export interface RankingResponse {
  recommendedVolunteer: RecommendationBreakdown | null
  topCandidates: RecommendationBreakdown[]
  scoreBreakdown: RecommendationBreakdown[]
  explanationText: string
}

// Gemini/backend-ready contract:
// Replace in-memory ranking with API response implementing RankingResponse.
