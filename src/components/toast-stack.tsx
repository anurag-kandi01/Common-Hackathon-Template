import { useEffect } from "react"
import { CheckCircle2, Info, X, XCircle } from "lucide-react"
import { cn } from "../lib/utils"

export type ToastTone = "success" | "error" | "info"

export interface ToastItem {
  id: string
  title: string
  subtitle?: string
  tone: ToastTone
  durationMs?: number
}

interface ToastStackProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastRow key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastRow({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const duration = toast.durationMs ?? 3600

  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(toast.id), duration)
    return () => window.clearTimeout(t)
  }, [toast.id, duration, onDismiss])

  const Icon = toast.tone === "success" ? CheckCircle2 : toast.tone === "error" ? XCircle : Info

  return (
    <div
      className={cn(
        "pointer-events-auto flex gap-3 rounded-2xl border px-4 py-3 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md",
        toast.tone === "success" && "border-[#3fbf92]/35 bg-[#0d1612]/95",
        toast.tone === "error" && "border-[#db5f73]/40 bg-[#140a0d]/95",
        toast.tone === "info" && "border-[#2f6fff]/35 bg-[#090f1c]/95",
      )}
    >
      <Icon
        size={20}
        className={cn(
          "mt-0.5 shrink-0",
          toast.tone === "success" && "text-[#7ae4be]",
          toast.tone === "error" && "text-[#f2a0af]",
          toast.tone === "info" && "text-[#8db0ff]",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.subtitle && <p className="mt-0.5 text-xs leading-relaxed text-[#b4c0e6]">{toast.subtitle}</p>}
      </div>
      <button
        type="button"
        className="shrink-0 rounded-lg p-1 text-[#8a96bc] transition hover:bg-white/10 hover:text-white"
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
      >
        <X size={16} />
      </button>
    </div>
  )
}
