import { Loader2, WashingMachine } from "lucide-react"

export default function Loading() {
  return (
    <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <WashingMachine className="h-8 w-8 text-primary" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin opacity-50" />
        </div>
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">Netjes Laundry</p>
        <p className="text-xs text-muted-foreground animate-pulse">Memuat data sistem...</p>
      </div>
    </div>
  )
}
