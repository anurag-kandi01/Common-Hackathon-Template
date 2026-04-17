import { Router } from "express"
import { scoreAndRankVolunteers } from "../services/scoreVolunteer.js"
import { buildGeminiExplanation } from "../services/geminiExplain.js"

const router = Router()

router.post("/recommend-volunteer", async (req, res) => {
  const { incident, role, zone, timeSlot, volunteerDataset } = req.body || {}

  if (!incident || !role || !zone || !timeSlot || !Array.isArray(volunteerDataset)) {
    return res.status(400).json({ error: "Missing required recommendation payload fields." })
  }

  const scoreBreakdown = scoreAndRankVolunteers({ role, zone, timeSlot, volunteerDataset })
  const topCandidates = scoreBreakdown.slice(0, 5)
  const recommendedVolunteer = topCandidates[0] ?? null

  const geminiText = await buildGeminiExplanation({
    geminiApiKey: process.env.GEMINI_API_KEY,
    incident,
    recommendedVolunteer,
    topCandidates,
  })

  return res.json({
    recommendedVolunteer,
    topCandidates,
    scoreBreakdown,
    explanationText: geminiText ?? recommendedVolunteer?.explanation ?? "No recommendation available.",
  })
})

export default router
