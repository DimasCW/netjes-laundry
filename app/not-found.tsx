import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchX, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mx-auto animate-pulse">
            <SearchX className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-black px-2 py-1 rounded-lg shadow-lg">
            404
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Halaman Tidak Ditemukan</h1>
          <p className="text-muted-foreground text-sm">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan ke alamat lain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button asChild variant="outline" className="w-full sm:w-auto gap-2 h-11 px-6">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto gap-2 h-11 px-8 gradient-primary text-white shadow-xl shadow-blue-500/20">
            <Link href="/">
              <Home className="h-4 w-4" />
              Ke Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
