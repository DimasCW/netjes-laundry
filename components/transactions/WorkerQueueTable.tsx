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
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react"
import { DataTableSkeleton } from "@/components/shared/DataTableSkeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { TransactionListItem, STATUS_LABELS, STATUS_COLORS, STATUS_ORDER } from "@/types"
import { formatDateShort, formatPhoneDisplay } from "@/lib/utils"
import { updateTransactionStatus } from "@/app/actions/transactions"
import { toast } from "sonner"

interface WorkerQueueTableProps {
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

export function WorkerQueueTable({
  data,
  isLoading,
  pagination,
  onPageChange,
  onLimitChange,
  onDataChange,
}: WorkerQueueTableProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus as any)
    if (currentIndex === -1 || currentIndex >= STATUS_ORDER.length - 1) return

    const nextStatus = STATUS_ORDER[currentIndex + 1]
    
    setUpdatingId(id)
    try {
      const res = await updateTransactionStatus(id, nextStatus)
      if (res.success) {
        toast.success(`Status berhasil diupdate ke ${STATUS_LABELS[nextStatus]}`)
        onDataChange?.()
      } else {
        toast.error(res.error)
      }
    } catch (error) {
      toast.error("Gagal mengupdate status")
    } finally {
      setUpdatingId(null)
    }
  }

  if (isLoading) return <DataTableSkeleton columns={5} rows={10} />

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-8">
        <EmptyState
          title="Tidak ada pekerjaan"
          description="Antrian laundry saat ini kosong."
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
                <TableHead className="w-[140px]">Token</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Nomor WA</TableHead>
                <TableHead>Tanggal Masuk</TableHead>
                <TableHead className="text-right">Progres Pekerjaan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => {
                const currentIndex = STATUS_ORDER.indexOf(item.statusProses)
                const isFinished = currentIndex >= STATUS_ORDER.length - 1
                const nextStatus = !isFinished ? STATUS_ORDER[currentIndex + 1] : null
                const isUpdating = updatingId === item.id

                return (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {item.trackingToken}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.namaPelanggan}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatPhoneDisplay(item.nomorWa)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateShort(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Badge className={STATUS_COLORS[item.statusProses]}>
                          {STATUS_LABELS[item.statusProses]}
                        </Badge>
                        
                        {!isFinished ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 shrink-0 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-900 dark:hover:bg-blue-900/50"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(item.id, item.statusProses)}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                Lanjut {STATUS_LABELS[nextStatus!]}
                                <ArrowRight className="h-3 w-3" />
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 shrink-0 border-emerald-200 text-emerald-600 bg-emerald-50 pointer-events-none"
                            disabled
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Selesai
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        {...pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  )
}
