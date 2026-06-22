"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RotateCcw, Home } from "lucide-react"
import Link from "next/link"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center mb-6">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Terjadi Kesalahan</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        Mohon maaf, sistem mengalami kendala teknis. Silakan coba memuat ulang halaman.
      </p>
      {error.digest && (
        <p className="text-[10px] text-muted-foreground mt-4 font-mono bg-muted px-2 py-1 rounded">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex items-center gap-3 mt-8">
        <Button onClick={() => reset()} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Coba Lagi
        </Button>
        <Button asChild className="gradient-primary text-white gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            Ke Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
