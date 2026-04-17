import { Bell } from "lucide-react"
import type { UserRole } from "../types"

interface TopHeaderProps {
  notificationCount: number
  role: UserRole
  onRoleChange: (role: UserRole) => void
}

export function TopHeader({ notificationCount, role, onRoleChange }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090d18]/90 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#8d99c2]">Crew Sync Command Center</p>
          <p className="text-sm text-[#bcc7e8]">Live staffing control with AI-assisted fallback routing.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          <button
            onClick={() => onRoleChange("admin")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${role === "admin" ? "bg-[#2f6fff] text-white" : "text-[#9aa6ca]"}`}
          >
            Admin
          </button>
          <button
            onClick={() => onRoleChange("volunteer")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${role === "volunteer" ? "bg-[#2f6fff] text-white" : "text-[#9aa6ca]"}`}
          >
            Volunteer
          </button>
          </div>
          <div className="relative rounded-xl border border-white/10 bg-white/5 p-2.5 text-[#dbe4ff]">
            <Bell size={16} />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 animate-pulse items-center justify-center rounded-full bg-[#2f6fff] px-1 text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
