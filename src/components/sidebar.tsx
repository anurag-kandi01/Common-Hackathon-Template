import { ArrowRightLeft, Gauge, ListChecks, Menu, UserCircle2, Users } from "lucide-react"
import type { AppSection, UserRole } from "../types"
import { CrewSyncLogo } from "./logo"
import { cn } from "../lib/utils"

const nav = [
  { id: "admin-dashboard", label: "Admin Dashboard", icon: Gauge, role: "admin" },
  { id: "volunteer-directory", label: "Volunteer Directory", icon: Users, role: "admin" },
  { id: "dropout-center", label: "Dropout & Reassignment", icon: ArrowRightLeft, role: "admin" },
  { id: "volunteer-dashboard", label: "Volunteer Dashboard", icon: ListChecks, role: "volunteer" },
] as const

interface SidebarProps {
  current: AppSection
  role: UserRole
  onNavigate: (section: AppSection) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

export function Sidebar({ current, role, onNavigate, mobileOpen, setMobileOpen }: SidebarProps) {
  const filteredNav = nav.filter((item) => item.role === role)

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 rounded-lg border border-white/10 bg-[#101524] p-2 text-white lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu size={18} />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[280px] border-r border-white/10 bg-[#090c14]/96 p-4 backdrop-blur-md transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <CrewSyncLogo />
          <div className="mt-8 space-y-2">
            {filteredNav.map((item) => {
              const Icon = item.icon
              const active = current === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    setMobileOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all",
                    active
                      ? "border border-[#2f6fff]/30 bg-[#2f6fff]/14 text-white"
                      : "border border-transparent text-[#a1abc9] hover:border-white/10 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              )
            })}
          </div>
          <div className="mt-auto space-y-3">
            <div className="panel flex items-center justify-between p-3">
              <div>
                <p className="text-xs text-[#97a2c6]">Logged in as</p>
                <p className="text-sm font-semibold text-white">Megnath Marav</p>
              </div>
              <UserCircle2 className="text-[#7b89b5]" size={20} />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
