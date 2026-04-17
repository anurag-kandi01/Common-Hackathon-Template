import type { ShiftStatus } from "../types"
import { Badge } from "./ui/badge"

const toneByStatus: Record<ShiftStatus, "success" | "warning" | "info" | "neutral"> = {
  Confirmed: "success",
  Pending: "warning",
  Reassigned: "info",
  Backup: "neutral",
  Completed: "success",
}

export function StatusBadge({ status }: { status: ShiftStatus }) {
  return <Badge tone={toneByStatus[status]}>{status}</Badge>
}
