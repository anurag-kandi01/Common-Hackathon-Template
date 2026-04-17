import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "./components/sidebar"
import { SkeletonGrid } from "./components/skeleton-grid"
import { TopHeader } from "./components/top-header"
import { DashboardScreen } from "./screens/dashboard-screen"
import { LiveReassignmentsScreen } from "./screens/live-reassignments-screen"
import { VolunteerDashboardScreen } from "./screens/volunteer-dashboard-screen"
import { VolunteerDirectoryScreen } from "./screens/volunteer-directory-screen"
import type { AppSection, UserRole } from "./types"
import { OperationsProvider } from "./context/operations-context"

const sectionFromHash = (): AppSection => {
  const hash = window.location.hash.replace("#", "")
  const valid: AppSection[] = ["admin-dashboard", "volunteer-directory", "dropout-center", "volunteer-dashboard"]
  if (valid.includes(hash as AppSection)) return hash as AppSection
  return "admin-dashboard"
}

function App() {
  const [currentSection, setCurrentSection] = useState<AppSection>(sectionFromHash())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const onHashChange = () => setCurrentSection(sectionFromHash())
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNotificationCount((count) => Math.min(9, count + 1)), 12000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loader = setTimeout(() => setIsLoading(false), 700)
    return () => clearTimeout(loader)
  }, [currentSection])

  const content = useMemo(() => {
    if (currentSection === "volunteer-directory") return <VolunteerDirectoryScreen />
    if (currentSection === "dropout-center") return <LiveReassignmentsScreen />
    if (currentSection === "volunteer-dashboard") return <VolunteerDashboardScreen />
    return <DashboardScreen />
  }, [currentSection])
  const currentRole: UserRole = ["admin-dashboard", "volunteer-directory", "dropout-center"].includes(currentSection) ? "admin" : "volunteer"

  const onNavigate = (section: AppSection) => {
    window.location.hash = section
    setCurrentSection(section)
  }

  return (
    <OperationsProvider>
      <div className="h-screen overflow-hidden">
        <Sidebar current={currentSection} role={currentRole} onNavigate={onNavigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="h-full lg:pl-[280px]">
          <TopHeader
            notificationCount={notificationCount}
            role={currentRole}
            onRoleChange={(nextRole) => {
              const defaultSection = nextRole === "admin" ? "admin-dashboard" : "volunteer-dashboard"
              onNavigate(defaultSection)
            }}
          />
          <main className="h-[calc(100vh-65px)] overflow-y-auto px-4 py-5 lg:px-8">
            {isLoading ? <SkeletonGrid /> : content}
          </main>
        </div>
      </div>
    </OperationsProvider>
  )
}

export default App
