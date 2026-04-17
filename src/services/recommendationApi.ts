import type { RecommendationRequestPayload, RecommendationResult } from "../types"
import { rankVolunteers } from "./volunteerRanking"

const RECOMMENDATION_ENDPOINT = "/api/recommend-volunteer"

export async function recommendVolunteer(payload: RecommendationRequestPayload): Promise<RecommendationResult> {
  const localScoreBreakdown = rankVolunteers(payload.incident, payload.volunteerDataset)
  const localTopCandidates = localScoreBreakdown.slice(0, 5)
  const localRecommended = localTopCandidates[0] ?? null

  try {
    const response = await fetch(RECOMMENDATION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error("Backend recommendation unavailable")

    const data = (await response.json()) as Omit<RecommendationResult, "source">
    return {
      ...data,
      source: "backend",
    }
  } catch {
    return {
      recommendedVolunteer: localRecommended,
      topCandidates: localTopCandidates,
      scoreBreakdown: localScoreBreakdown,
      explanationText:
        localRecommended?.explanation ??
        "Local fallback ranking is active. Backend/Gemini explanation is currently unavailable.",
      source: "local",
    }
  }
}
