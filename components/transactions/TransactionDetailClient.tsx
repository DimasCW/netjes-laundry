"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ChevronLeft,
  Printer,
  Calendar,
  User,
  Phone,
  ArrowRight,
  Loader2,
  WashingMachine,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StatusStepper } from "./StatusStepper"
import { PaymentStatusDialog } from "./PaymentStatusDialog"
import {
  TransactionData,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_ORDER,
  PAYMENT_STATUS_COLORS,
} from "@/types"
import { formatCurrency, formatDate, formatPhoneDisplay } from "@/lib/utils"
import { updateTransactionStatus } from "@/app/actions/transactions"
import { toast } from "sonner"
import { StatusProses } from "@prisma/client"
import Link from "next/link"

interface TransactionDetailClientProps {
  transaction: TransactionData
}

export function TransactionDetailClient({ transaction }: TransactionDetailClientProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  const currentIndex = STATUS_ORDER.indexOf(transaction.statusProses)
  const nextStatus = STATUS_ORDER[currentIndex + 1] as StatusProses | undefined

  const handleUpdateStatus = async () => {
    if (!nextStatus) return
    
    setIsUpdating(true)
    const res = await updateTransactionStatus(transaction.id, nextStatus)
    setIsUpdating(false)

    if (res.success) {
      toast.success(`Status berhasil diperbarui ke ${STATUS_LABELS[nextStatus]}`)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handlePrint = () => {
    window.open(`/api/invoice/${transaction.id}`, "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-8 w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                {transaction.trackingToken}
              </h1>
              <Badge className={STATUS_COLORS[transaction.statusProses]}>
                {STATUS_LABELS[transaction.statusProses]}
              </Badge>
              <Badge variant="outline" className={PAYMENT_STATUS_COLORS[transaction.statusPembayaran]}>
                {transaction.statusPembayaran === "LUNAS" ? "Lunas" : "Belum Lunas"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dibuat pada {formatDate(transaction.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isAdmin && (
            <Button
              variant="outline"
              className="flex-1 sm:flex-none gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/30 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
              onClick={() => setIsPaymentDialogOpen(true)}
            >
              <CreditCard className="h-4 w-4" />
              Edit/Bayar
            </Button>
          )}

          <Button
            variant="outline"
            className="flex-1 sm:flex-none gap-2"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Cetak Invoice
          </Button>

          {nextStatus && (
            <Button
              className="flex-1 sm:flex-none gap-2 gradient-primary text-white"
              disabled={isUpdating}
              onClick={handleUpdateStatus}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Update ke {STATUS_LABELS[nextStatus]}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-slate-900">
            <div className="h-1.5 gradient-primary w-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <WashingMachine className="h-4 w-4 text-blue-500" />
                Status Pengerjaan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatusStepper currentStatus={transaction.statusProses} />
            </CardContent>
          </Card>

          {/* Details Table Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detail Layanan</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Layanan</th>
                      <th className="px-4 py-3 font-medium text-center">Qty</th>
                      <th className="px-4 py-3 font-medium text-right">Harga</th>
                      <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transaction.details.map((detail) => (
                      <tr key={detail.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">
                          {detail.service.namaLayanan}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {Number(detail.qty)} {detail.service.unit}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {formatCurrency(detail.service.harga)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(detail.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30">
                    <tr>
                      <td colSpan={3} className="px-4 py-4 font-bold text-right text-base">
                        Total Bayar
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-lg text-blue-600 dark:text-blue-400">
                        {formatCurrency(transaction.totalBayar)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Nama Pelanggan
                  </p>
                  <p className="text-sm font-bold mt-0.5">
                    {transaction.namaPelanggan}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    WhatsApp
                  </p>
                  <p className="text-sm font-bold mt-0.5">
                    {formatPhoneDisplay(transaction.nomorWa)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Tanggal Masuk
                  </p>
                  <p className="text-sm font-bold mt-0.5">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Penerima (Staff)
                  </p>
                  <p className="text-sm font-bold mt-0.5">
                    {transaction.user.nama}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Public Tracking Link Card */}
          <Card className="bg-slate-50 dark:bg-slate-900 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Link Tracking Publik</CardTitle>
              <CardDescription className="text-xs">
                Bagikan link ini ke pelanggan untuk memantau status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-2.5 rounded-lg bg-background border text-[10px] font-mono break-all text-muted-foreground">
                {typeof window !== "undefined" ? window.location.origin : ""}/track/{transaction.trackingToken}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-8"
                onClick={() => {
                  const url = `${window.location.origin}/track/${transaction.trackingToken}`
                  navigator.clipboard.writeText(url)
                  toast.success("Link berhasil disalin")
                }}
              >
                Salin Link Tracking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {isAdmin && (
        <PaymentStatusDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          transactionId={transaction.id}
          currentStatus={transaction.statusPembayaran}
          trackingToken={transaction.trackingToken}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
