import { getTransactionByToken } from "@/app/actions/transactions"
import { StatusStepper } from "@/components/transactions/StatusStepper"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WashingMachine, MapPin, Calendar, CreditCard, ChevronLeft, PackageCheck } from "lucide-react"
import { STATUS_LABELS, STATUS_COLORS } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  return {
    title: `Status Laundry - ${token}`,
    description: `Pantau status laundry Anda dengan nomor tracking ${token}`,
  }
}

export default async function TrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const transaction = await getTransactionByToken(token)

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <Card className="max-w-md w-full text-center p-8 border-dashed shadow-none">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl">Token Tidak Ditemukan</CardTitle>
          <CardDescription className="mt-2">
            Mohon periksa kembali nomor tracking Anda atau hubungi admin Netjes Laundry.
          </CardDescription>
          <Button asChild className="mt-6 gradient-primary text-white">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const isSelesai = transaction.statusProses === "SELESAI" || transaction.statusProses === "DIAMBIL"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <WashingMachine className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Netjes Laundry</span>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {transaction.trackingToken}
          </Badge>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6 animate-fade-in">
        {/* Welcome Message */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Status Laundry Anda</h1>
          <p className="text-muted-foreground text-sm">
            Halo, <span className="text-foreground font-semibold">{transaction.namaPelanggan}</span>! Laundry Anda sedang diproses.
          </p>
          <div className="pt-4 pb-2 flex justify-center">
            <div className="bg-white p-3 rounded-xl border shadow-sm">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${transaction.trackingToken}`
                )}`}
                alt="QR Code Tracking"
                className="w-32 h-32"
              />
              <p className="text-[10px] text-muted-foreground mt-2 font-medium">Scan untuk pantau</p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-slate-900">
          <div className="h-2 gradient-primary w-full" />
          <CardContent className="p-6 sm:p-10">
            <div className="flex flex-col items-center mb-8">
              <Badge className={cn("text-sm px-4 py-1 mb-4", STATUS_COLORS[transaction.statusProses])}>
                {STATUS_LABELS[transaction.statusProses]}
              </Badge>
              <StatusStepper currentStatus={transaction.statusProses} />
            </div>

            {isSelesai ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-3">
                  <PackageCheck className="h-6 w-6" />
                </div>
                <h3 className="text-green-800 dark:text-green-300 font-bold">Laundry Sudah Selesai!</h3>
                <p className="text-green-700/80 dark:text-green-400/80 text-xs mt-1">
                  Silakan ambil laundry Anda di outlet kami. Jangan lupa bawa bukti pembayaran atau nomor tracking ini.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 text-center">
                <p className="text-blue-800 dark:text-blue-300 font-medium text-sm italic">
                  "Kami sedang bekerja keras untuk memberikan hasil terbaik bagi pakaian Anda!"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Details */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Rincian Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {transaction.details.map((detail) => (
                  <div key={detail.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-semibold text-sm">{detail.service.namaLayanan}</p>
                      <p className="text-xs text-muted-foreground">
                        {Number(detail.qty)} {detail.service.unit} x {formatCurrency(detail.service.harga)}
                      </p>
                    </div>
                    <p className="font-bold text-sm">{formatCurrency(detail.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-t border-dashed">
                <span className="font-bold">Total Biaya</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                  {formatCurrency(transaction.totalBayar)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Outlet Info */}
          <Card className="h-fit">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Informasi Toko
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Jam Operasional</p>
                <p className="text-xs font-semibold mt-1">Senin - Sabtu: 08:00 - 20:00</p>
                <p className="text-xs text-muted-foreground">Minggu: Tutup</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Alamat</p>
                <p className="text-xs font-semibold mt-1">Jl. Netjes No. 123, Yogyakarta</p>
              </div>
              <Separator />
              <Button variant="outline" className="w-full gap-2 text-xs" asChild>
                <a href={`https://wa.me/628123456789`} target="_blank">
                  Hubungi Admin
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <p className="text-center text-[10px] text-muted-foreground pt-8">
          &copy; {new Date().getFullYear()} Netjes Laundry. All rights reserved.
        </p>
      </main>
    </div>
  )
}

// Add some missing imports if they were missed
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"
