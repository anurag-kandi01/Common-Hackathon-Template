import { useEffect, useMemo, useRef, useState } from "react"
import { CheckCircle2, LoaderCircle, Sparkles, TriangleAlert } from "lucide-react"
import type { RecommendationBreakdown } from "../types"
import { recommendVolunteer } from "../services/recommendationApi"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { useOperations } from "../context/operations-context"
import { cn } from "../lib/utils"

const loadingMessages = [
  "Checking required skills",
  "Scanning available volunteers",
  "Comparing reliability and attendance",
  "Ranking best-fit candidates",
]

export function LiveReassignmentsScreen() {
  const {
    volunteers,
    incidents,
    assignVolunteerToTask,
    notifyVolunteer,
    getVolunteersForRanking,
    isVolunteerNotified,
    isVolunteerAssignable,
  } = useOperations()

  const [selectedId, setSelectedId] = useState(() => incidents[0]?.id ?? "")
  const selected = useMemo(
    () => incidents.find((i) => i.id === selectedId) ?? incidents[0],
    [incidents, selectedId],
  )

  const [isLoading, setIsLoading] = useState(false)
  const [hasRecommendation, setHasRecommendation] = useState(false)
  const [explanationText, setExplanationText] = useState("")
  const [source, setSource] = useState<"local" | "backend">("local")
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [topCandidates, setTopCandidates] = useState<RecommendationBreakdown[]>([])
  const [recommended, setRecommended] = useState<RecommendationBreakdown | null>(null)
  const [assignLoading, setAssignLoading] = useState(false)
  const [notifyLoading, setNotifyLoading] = useState(false)
  const backupsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHasRecommendation(false)
    setExplanationText("")
    setRecommended(null)
    setTopCandidates([])
    setLoadingMessageIndex(0)
    setIsLoading(false)
  }, [selectedId])

  useEffect(() => {
    if (!isLoading) return
    const messageTimer = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % loadingMessages.length)
    }, 450)
    return () => window.clearInterval(messageTimer)
  }, [isLoading])

  const backupCandidates = useMemo(
    () =>
      topCandidates
        .slice(1, 6)
        .filter((candidate) => {
          const volunteer = volunteers.find((v) => v.id === candidate.volunteerId)
          if (!volunteer) return false
          return isVolunteerAssignable(volunteer, {
            kind: "incident",
            incidentId: selected.id,
            roleLabel: selected.affectedRole,
            zone: selected.zone,
            timeWindow: selected.timeWindow,
          })
        })
        .slice(0, 3),
    [topCandidates, volunteers, isVolunteerAssignable, selected],
  )

  const recommendedVolunteer = selected && recommended ? volunteers.find((v) => v.id === recommended.volunteerId) : undefined

  const incidentFilled = selected?.resolutionStatus === "ReplacementAssigned"
  const assignableRecommended = recommendedVolunteer
    ? isVolunteerAssignable(recommendedVolunteer, {
        kind: "incident",
        incidentId: selected.id,
        roleLabel: selected.affectedRole,
        zone: selected.zone,
        timeWindow: selected.timeWindow,
      })
    : false
  const notifiedForRecommended =
    selected && recommended ? isVolunteerNotified(selected.id, recommended.volunteerId) : false

  const loadingMessage = loadingMessages[loadingMessageIndex]

  const runRecommendation = async () => {
    if (!selected) return
    setIsLoading(true)
    setHasRecommendation(false)
    setLoadingMessageIndex(0)

    const resultPromise = recommendVolunteer({
      incident: selected,
      role: selected.affectedRole,
      zone: selected.zone,
      timeSlot: selected.timeWindow,
      volunteerDataset: getVolunteersForRanking(selected),
    })

    const simulatedDelay = 1600 + Math.round(Math.random() * 800)
    const delayPromise = new Promise((resolve) => window.setTimeout(resolve, simulatedDelay))

    const [result] = await Promise.all([resultPromise, delayPromise])

    setRecommended(result.recommendedVolunteer)
    setTopCandidates(result.topCandidates)
    setExplanationText(result.explanationText)
    setSource(result.source)
    setHasRecommendation(true)
    setIsLoading(false)
  }

  const handleAssignReplacement = async () => {
    if (!selected || !recommended) return
    setAssignLoading(true)
    await new Promise((r) => window.setTimeout(r, 500))
    const ok = assignVolunteerToTask(recommended.volunteerId, {
      kind: "incident",
      incidentId: selected.id,
      roleLabel: selected.affectedRole,
      zone: selected.zone,
      timeWindow: selected.timeWindow,
    })
    if (ok) {
      const id = recommended.volunteerId
      setTopCandidates((prev) => prev.filter((c) => c.volunteerId !== id))
      setRecommended((prev) => (prev?.volunteerId === id ? null : prev))
    }
    setAssignLoading(false)
  }

  const handleNotify = async () => {
    if (!selected || !recommended || notifiedForRecommended) return
    setNotifyLoading(true)
    await new Promise((r) => window.setTimeout(r, 400))
    notifyVolunteer(recommended.volunteerId, selected.id)
    setNotifyLoading(false)
  }

  if (!selected) return null

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-[#7b87ae]">Command center</p>
        <h1 className="serif-title text-4xl font-semibold text-white">Dropout & Reassignment Center</h1>
        <p className="mt-1 text-[#9aa6c9]">Compact incident triage with backend-ready AI recommendation routing.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr]">
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white"><TriangleAlert size={17} /> Incident Queue</h3>
          <div className="space-y-3">
            {incidents.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition",
                  selectedId === item.id ? "border-[#2f6fff]/45 bg-[#2f6fff]/10" : "border-white/10 bg-white/[0.03] hover:border-white/20",
                )}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">{item.affectedRole}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.resolutionStatus === "ReplacementAssigned" && (
                      <Badge tone="success" className="gap-1">
                        <CheckCircle2 size={12} /> Replacement assigned
                      </Badge>
                    )}
                    <Badge tone={item.urgency === "Critical" ? "danger" : "warning"}>{item.urgency}</Badge>
                  </div>
                </div>
                <p className="text-sm text-[#9ca8ce]">{item.zone} • {item.timeWindow}</p>
                <p className="mt-1 text-xs text-[#7d8ab0]">{item.impact}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white"><Sparkles size={17} /> Selected Recommendation</h3>
          {!isLoading && !hasRecommendation && (
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="space-y-1.5">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8d99c2]">Incident summary</p>
                <p className="text-sm text-[#d8e0f8]">{selected.affectedRole} in {selected.zone}</p>
                <p className="text-sm text-[#9ca8ce]">{selected.timeWindow} • {selected.urgency} priority</p>
              </div>
              <p className="text-sm text-[#b8c4e9]">
                Run AI matching to identify the most suitable available volunteer for this slot.
              </p>
              <Button className="h-11 w-full text-base shadow-[0_0_24px_rgba(47,111,255,0.35)]" onClick={runRecommendation}>
                Find Best Replacement
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="space-y-4 rounded-2xl border border-[#2f6fff]/30 bg-[#2f6fff]/8 p-4">
              <div className="flex items-center gap-3">
                <LoaderCircle size={18} className="animate-spin text-[#8fb0ff]" />
                <p className="text-sm font-medium text-white">Computing recommendation</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-[#2f6fff]" />
              </div>
              <p className="text-sm text-[#d2ddff]">{loadingMessage}</p>
            </div>
          )}

          {hasRecommendation && !isLoading && (
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.01] p-3 transition-opacity duration-500">
              {incidentFilled && (
                <div className="flex items-center gap-2 rounded-xl border border-[#3fbf92]/30 bg-[#3fbf92]/10 px-3 py-2 text-sm text-[#b8f5dc]">
                  <CheckCircle2 size={16} className="shrink-0 text-[#7ae4be]" />
                  <span>Replacement assigned for this incident.</span>
                </div>
              )}
              <p className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-[#c4cfef]">{explanationText}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8390b8]">Source</p>
                <Badge tone={source === "backend" ? "success" : "warning"}>{source === "backend" ? "Backend API" : "Local fallback"}</Badge>
              </div>
              {recommended && recommendedVolunteer && (
                <div className="space-y-2 text-sm">
                  <Metric label="Recommended volunteer" value={`${recommendedVolunteer.name} (${recommendedVolunteer.id})`} />
                  <Metric label="Confidence score" value={`${recommended.confidenceScore}%`} />
                  <Metric label="Skill match" value={`${recommended.skillMatch}%`} />
                  <Metric label="Attendance history" value={`${recommended.attendanceRate}%`} />
                  <Metric label="Availability overlap" value={`${recommended.availabilityOverlap}%`} />
                  <Metric label="Zone proximity" value={`${recommended.distanceScore}%`} />
                </div>
              )}
              {!recommended && incidentFilled && (
                <p className="text-sm text-[#9ca8ce]">Recommendation cleared after assignment — run matching again if you need another view.</p>
              )}
              <p className="text-xs text-[#8ca0d9]">AI matched using skills, reliability, and availability.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  disabled={!recommended || !assignableRecommended || incidentFilled || assignLoading}
                  onClick={handleAssignReplacement}
                  className="relative overflow-hidden"
                >
                  {assignLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoaderCircle size={16} className="animate-spin" /> Assigning…
                    </span>
                  ) : incidentFilled ? (
                    "Assigned"
                  ) : (
                    "Assign Replacement"
                  )}
                </Button>
                <Button
                  variant="outline"
                  disabled={!recommended || notifyLoading || notifiedForRecommended}
                  onClick={handleNotify}
                >
                  {notifyLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoaderCircle size={14} className="animate-spin" /> Sending…
                    </span>
                  ) : notifiedForRecommended ? (
                    "Notified ✓"
                  ) : (
                    "Notify Volunteer"
                  )}
                </Button>
                {notifiedForRecommended && (
                  <Badge tone="success" className="col-span-2 w-fit">Volunteer notified</Badge>
                )}
                <Button
                  className="col-span-2"
                  variant="ghost"
                  type="button"
                  onClick={() => backupsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })}
                >
                  View Backup Candidates
                </Button>
                <Button className="col-span-2" variant="ghost" onClick={runRecommendation}>Run Again</Button>
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-4" ref={backupsRef}>
          <Card className="p-4">
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#a8b5dd]">Top Backup Candidates</h4>
            <div className="space-y-2">
              {!hasRecommendation && <p className="text-xs text-[#8ea0cf]">Backups appear after AI matching is run.</p>}
              {backupCandidates.map((candidate) => {
                const volunteer = volunteers.find((item) => item.id === candidate.volunteerId)
                return (
                  <div key={candidate.volunteerId} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-[#9da9cc]">
                    <p className="font-medium text-white">{volunteer?.name}</p>
                    <p>{candidate.confidenceScore}% confidence • response {volunteer?.responseSpeedMinutes}m</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-[#7d8ab0]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}
