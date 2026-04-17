export async function buildGeminiExplanation({ geminiApiKey, incident, recommendedVolunteer, topCandidates }) {
  if (!geminiApiKey) return null

  // Placeholder integration for future Gemini endpoint call.
  // Keep local ranking as primary fallback for demo reliability.
  const candidateCount = topCandidates?.length ?? 0
  const volunteerId = recommendedVolunteer?.volunteerId ?? "unknown"
  return `Gemini placeholder: ${volunteerId} selected for incident ${incident?.id} with ${candidateCount} backup candidates.`
}
