import type { ActivityLog, AdminAlert, DropoutIncident, Shift, Volunteer, VolunteerAlert, ZoneCoverage } from "../types"

const names = [
  "Megnath Marav", "Rohan Mehta", "Neha Verma", "Arjun Nair", "Kriti Singh", "Varun Iyer", "Mira Das", "Sanjay Rao",
  "Priya Kulkarni", "Aniket Paul", "Ishita Ghosh", "Kabir Jain", "Pooja Menon", "Dev Patel", "Ritika Sharma",
  "Aman Batra", "Tanvi Shah", "Nikhil Menon", "Sia Chawla", "Harsh Vyas", "Elena Vance", "Marcus Thomas",
  "Rahul Dey", "Sonal Gupta", "Yash Arora", "Sneha Pillai", "Mohit Saini", "Diya Sen", "Omkar Joshi", "Naina Roy",
  "Ira Kapoor", "Dhruv Malhotra", "Nishta Bedi", "Aarav Sethi", "Zoya Qureshi", "Karan Taneja", "Manya Bhat",
  "Samar Gill", "Lavanya Krishnan", "Aditya Bose",
]
const departments = ["CSE", "ECE", "Mechanical", "Design", "Media", "Civil", "Biotech"]
const zones = ["Main Stage", "Registration", "Workshop Hall", "Hospitality", "Security Gate", "Food Court"]
const skills = ["Crowd Management", "Hospitality", "Logistics", "AV Support", "Registration Ops", "Emergency Response", "Comms"]
const slots = ["10:00-12:00", "12:00-14:00", "14:00-17:00", "17:00-20:00", "20:00-22:00"]

export const volunteerRoster: Volunteer[] = names.map((name, index) => {
  const year = (index % 4) + 1
  const reliability = 68 + ((index * 7) % 31)
  const attendance = 70 + ((index * 9) % 29)
  const currentStatus =
    index === 0 ? "Available" : index % 5 === 0 ? "Unavailable" : index % 3 === 0 ? "Limited" : "Available"
  const dutyStatus = index % 4 === 0 ? "On-duty" : index % 4 === 1 ? "Standby" : "Off-duty"
  return {
    id: `VOL-${String(index + 1).padStart(3, "0")}`,
    name,
    department: departments[index % departments.length],
    year,
    primarySkills: [skills[index % skills.length], skills[(index + 2) % skills.length]],
    secondarySkills: [skills[(index + 3) % skills.length], skills[(index + 5) % skills.length]],
    preferredRoles: ["Zone Steward", "Desk Coordinator", "Crowd Router"].slice(0, (index % 3) + 1),
    preferredZones: [zones[index % zones.length], zones[(index + 2) % zones.length]],
    availability: {
      currentStatus,
      availableSlots: [slots[index % slots.length], slots[(index + 2) % slots.length]],
      maxHoursPerDay: 4 + (index % 4),
    },
    reliabilityScore: reliability,
    attendanceRate: attendance,
    responseSpeedMinutes: 3 + (index % 14),
    completedShifts: 6 + ((index * 3) % 32),
    dropoutHistory: index % 9 === 0 ? 1 : 0,
    noShowCount: index % 11 === 0 ? 1 : 0,
    currentAssignment: dutyStatus === "On-duty" ? "Live assignment active" : "Awaiting assignment",
    currentZone: zones[(index + 1) % zones.length],
    dutyStatus,
    rating: Number((3.6 + ((index % 15) / 10)).toFixed(1)),
    fatigueScore: 18 + ((index * 5) % 58),
    phone: `+91-98${String(10000000 + index * 1231).slice(0, 8)}`,
    email: `${name.toLowerCase().replace(/ /g, ".")}@crewsync.test`,
  }
})

export const currentVolunteerId = "VOL-001"

export const zoneCoverage: ZoneCoverage[] = [
  { zone: "Main Stage", required: 14, assigned: 12 },
  { zone: "Registration", required: 8, assigned: 9 },
  { zone: "Workshop Hall", required: 10, assigned: 7 },
  { zone: "Hospitality", required: 12, assigned: 10 },
  { zone: "Security Gate", required: 9, assigned: 8 },
]

export const shifts: Shift[] = [
  { id: "SH-001", eventName: "Opening Ceremony", zone: "Main Stage", role: "Crowd Router", reportingTime: "14:00", duration: "3h", coordinator: "Ritika Sharma", notes: "Brief lane split at 13:40.", status: "Completed", volunteerId: "VOL-001" },
  { id: "SH-002", eventName: "VIP Arrival Window", zone: "Hospitality", role: "Desk Coordinator", reportingTime: "17:00", duration: "2h", coordinator: "Nikhil Menon", notes: "Escort queue may change by AI updates.", status: "Reassigned", volunteerId: "VOL-001", aiUpdated: true },
  { id: "SH-003", eventName: "Panel Session Overflow", zone: "Workshop Hall", role: "Backup Volunteer", reportingTime: "19:00", duration: "90m", coordinator: "Devika Rao", notes: "Keep radio on channel 4.", status: "Backup", volunteerId: "VOL-001" },
  { id: "SH-004", eventName: "Night Exit Protocol", zone: "Security Gate", role: "Gate Flow Steward", reportingTime: "21:30", duration: "2h", coordinator: "Aman Batra", notes: "Coordinate with medics at gate lane C.", status: "Confirmed", volunteerId: "VOL-001" },
]

export const dropoutIncidents: DropoutIncident[] = [
  {
    id: "INC-101",
    volunteerId: "VOL-014",
    affectedRole: "Registration Desk Support",
    zone: "Registration",
    timeWindow: "16:00-18:00",
    urgency: "High",
    impact: "Queue wait time predicted to increase by 11 minutes.",
    conflictCheck: "No backup currently assigned for this slot.",
    createdAt: "5m ago",
  },
  {
    id: "INC-102",
    volunteerId: "VOL-019",
    affectedRole: "Crowd Router",
    zone: "Main Stage",
    timeWindow: "17:00-20:00",
    urgency: "Critical",
    impact: "Coverage deficit at entry lane B. Safety buffer reduced.",
    conflictCheck: "Adjacent volunteers at 90% task load.",
    createdAt: "2m ago",
  },
  {
    id: "INC-103",
    volunteerId: "VOL-032",
    affectedRole: "Hospitality Runner",
    zone: "Hospitality",
    timeWindow: "18:00-20:00",
    urgency: "Medium",
    impact: "Service SLA risk for artist green-room requests.",
    conflictCheck: "Standby pool exists but low reliability.",
    createdAt: "14m ago",
  },
]

export const adminAlerts: AdminAlert[] = [
  { id: "AA-1", title: "Workshop Hall under-covered", message: "Assigned volunteers below threshold by 3.", time: "4m ago", urgency: "High" },
  { id: "AA-2", title: "Security Gate stable", message: "Coverage recovered after temporary reassignment.", time: "9m ago", urgency: "Low" },
]

export const volunteerAlerts: VolunteerAlert[] = [
  {
    id: "VA-1",
    volunteerId: "VOL-001",
    title: "Reassignment request",
    message: "Can you cover Hospitality Desk from 17:00 to 19:00?",
    time: "6m ago",
    actionable: true,
    reassignmentTargetZone: "Hospitality",
    reassignmentTargetAssignment: "Hospitality Desk · 17:00–19:00",
  },
  { id: "VA-2", volunteerId: "VOL-001", title: "Zone update", message: "Entry moved from Gate B to Gate A for your next check-in.", time: "11m ago" },
]

export const adminActivityLog: ActivityLog[] = [
  { id: "AL-1", message: "INC-102 flagged critical and moved to reassignment queue.", time: "2m ago", type: "dropout" },
  { id: "AL-2", message: "VOL-007 assigned to Registration Desk Support.", time: "5m ago", type: "assignment" },
  { id: "AL-3", message: "Coverage improved in Main Stage from 78% to 87%.", time: "9m ago", type: "coverage" },
  { id: "AL-4", message: "Alert sent to standby group for Workshop Hall overflow.", time: "12m ago", type: "alert" },
]

export const contributionTrend = [
  { label: "Mon", completions: 6 },
  { label: "Tue", completions: 5 },
  { label: "Wed", completions: 8 },
  { label: "Thu", completions: 7 },
  { label: "Fri", completions: 9 },
  { label: "Sat", completions: 11 },
  { label: "Sun", completions: 8 },
]
