export function CrewSyncLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 40 40" className="h-9 w-9 rounded-lg border border-white/10 bg-[#0b0f18] p-1.5">
        <rect x="6" y="7" width="11" height="11" rx="2" fill="#2f6fff" />
        <rect x="22" y="7" width="11" height="11" rx="2" fill="#809eff" />
        <rect x="6" y="22" width="11" height="11" rx="2" fill="#9baecc" />
        <path d="M22 22h10v11H22z" fill="#2f6fff" opacity="0.7" />
      </svg>
      <div>
        <p className="serif-title text-xl font-semibold leading-none text-white">Crew Sync</p>
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#7d87aa]">Volunteer Operations Intelligence</p>
      </div>
    </div>
  )
}
