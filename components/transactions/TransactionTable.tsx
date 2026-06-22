"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MoreHorizontal, Trash2, CreditCard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableSkeleton } from "@/components/shared/DataTableSkeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { TransactionListItem, STATUS_LABELS, STATUS_COLORS, PAYMENT_STATUS_COLORS } from "@/types"
import { formatCurrency, formatDateShort, formatPhoneDisplay } from "@/lib/utils"
import { deleteTransaction } from "@/app/actions/transactions"
import { toast } from "sonner"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { PaymentStatusDialog } from "./PaymentStatusDialog"
import { useRouter } from "next/navigation"

interface TransactionTableProps {
  data: TransactionListItem[]
  isLoading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onDataChange?: () => void
}

export function TransactionTable({
  data,
  isLoading,
  pagination,
  onPageChange,
  onLimitChange,
  onDataChange,
}: TransactionTableProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  const router = useRouter()

  const [paymentDialog, setPaymentDialog] = useState({
    isOpen: false,
    transactionId: 0,
    currentStatus: "BELUM_LUNAS",
    trackingToken: "",
  })

  const handleDelete = async (id: number) => {
    const res = await deleteTransaction(id)
    if (res.success) {
      toast.success("Transaksi berhasil dihapus")
      onDataChange?.()
    } else {
      toast.error(res.error)
    }
  }

  if (isLoading) return <DataTableSkeleton columns={7} rows={10} />

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-8">
        <EmptyState
          title="Tidak ada transaksi"
          description="Coba ubah filter atau cari dengan kata kunci lain."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px]">Token</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Nomor WA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {item.trackingToken}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.namaPelanggan}</div>
                    <div className="text-xs text-muted-foreground">Oleh: {item.user.nama}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatPhoneDisplay(item.nomorWa)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5 items-start">
                      <Badge className={STATUS_COLORS[item.statusProses]}>
                        {STATUS_LABELS[item.statusProses]}
                      </Badge>
                      <Badge variant="outline" className={PAYMENT_STATUS_COLORS[item.statusPembayaran]}>
                        {item.statusPembayaran === "LUNAS" ? "Lunas" : "Belum Lunas"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(item.totalBayar)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateShort(item.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/transactions/${item.id}`} className="flex items-center gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" />
                            Detail
                          </Link>
                        </DropdownMenuItem>
                        
                        {isAdmin && (
                          <>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 cursor-pointer"
                              onSelect={(e) => {
                                e.preventDefault()
                                setPaymentDialog({
                                  isOpen: true,
                                  transactionId: item.id,
                                  currentStatus: item.statusPembayaran,
                                  trackingToken: item.trackingToken,
                                })
                              }}
                            >
                              <CreditCard className="h-4 w-4 text-emerald-600" />
                              Edit / Bayar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <ConfirmDialog
                              trigger={
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Hapus
                                </DropdownMenuItem>
                              }
                              title="Hapus Transaksi?"
                              description={`Anda akan menghapus transaksi ${item.trackingToken}. Tindakan ini permanen.`}
                              onConfirm={() => handleDelete(item.id)}
                            />
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        {...pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />

      <PaymentStatusDialog
        isOpen={paymentDialog.isOpen}
        onClose={() => setPaymentDialog(prev => ({ ...prev, isOpen: false }))}
        transactionId={paymentDialog.transactionId}
        currentStatus={paymentDialog.currentStatus}
        trackingToken={paymentDialog.trackingToken}
        onSuccess={() => {
          onDataChange?.()
          router.refresh()
        }}
      />
    </div>
  )
}
