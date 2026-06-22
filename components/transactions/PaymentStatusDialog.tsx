"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { updatePaymentStatus } from "@/app/actions/transactions"

interface PaymentStatusDialogProps {
  isOpen: boolean
  onClose: () => void
  transactionId: number
  currentStatus: string
  trackingToken: string
  onSuccess?: () => void
}

export function PaymentStatusDialog({
  isOpen,
  onClose,
  transactionId,
  currentStatus,
  trackingToken,
  onSuccess,
}: PaymentStatusDialogProps) {
  const [status, setStatus] = useState<string>(currentStatus)
  const [isLoading, setIsLoading] = useState(false)

  
  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus)
    }
  }, [isOpen, currentStatus])

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      const res = await updatePaymentStatus(transactionId, status)
      if (res.success) {
        toast.success(`Status pembayaran transaksi ${trackingToken} berhasil diperbarui`)
        onSuccess?.()
        onClose()
      } else {
        toast.error(res.error)
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memperbarui status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Status Pembayaran</DialogTitle>
          <DialogDescription>
            Ubah status pembayaran untuk transaksi {trackingToken}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none">
              Status Pembayaran
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BELUM_LUNAS">Belum Lunas</SelectItem>
                <SelectItem value="LUNAS">Lunas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading} className="gradient-primary text-white">
            {isLoading ? "Menyimpan..." : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
