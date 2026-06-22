"use client"

import { useEffect } from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2, Loader2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ServiceData } from "@/types"
import { createTransaction } from "@/app/actions/transactions"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

const transactionSchema = z.object({
  namaPelanggan: z.string().min(2, "Nama minimal 2 karakter"),
  nomorWa: z
    .string()
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,10}$/,
      "Format nomor WA tidak valid (contoh: 08123456789)"
    ),
  details: z
    .array(
      z.object({
        serviceId: z.string().min(1, "Pilih layanan"),
        qty: z.coerce.number().positive("Qty harus lebih dari 0"),
      })
    )
    .min(1, "Minimal 1 layanan harus dipilih"),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  services: ServiceData[]
  onSuccess: () => void
}

export function TransactionForm({ services, onSuccess }: TransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      namaPelanggan: "",
      nomorWa: "",
      details: [{ serviceId: "", qty: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  })

  // Watch fields for total calculation
  const watchedDetails = useWatch({
    control: form.control,
    name: "details",
  })

  const calculateTotal = () => {
    return watchedDetails.reduce((total, item) => {
      const service = services.find((s) => String(s.id) === item.serviceId)
      if (!service) return total
      return total + Number(service.harga) * (item.qty || 0)
    }, 0)
  }

  const onSubmit = async (data: TransactionFormValues) => {
    // Transform serviceId back to number
    const formattedData = {
      ...data,
      details: data.details.map((d) => ({
        serviceId: parseInt(d.serviceId),
        qty: d.qty,
      })),
    }

    const res = await createTransaction(formattedData)
    if (res.success) {
      toast.success("Transaksi berhasil dibuat")
      onSuccess()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="namaPelanggan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pelanggan</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Dimas Saputra"
                    {...field}
                    onChange={(e) => {
                      const cleanValue = e.target.value.replace(/\d/g, "")
                      field.onChange(cleanValue)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nomorWa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor WhatsApp</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: 08123456789"
                    {...field}
                    onChange={(e) => {
                      const cleanValue = e.target.value
                        .replace(/[^\d+]/g, "")
                        .replace(/(?!^\+)\+/g, "")
                      field.onChange(cleanValue)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base">Daftar Layanan</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => append({ serviceId: "", qty: 1 })}
            >
              <Plus className="h-4 w-4" />
              Tambah Layanan
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const selectedServiceId = watchedDetails[index]?.serviceId
              const selectedService = services.find(
                (s) => String(s.id) === selectedServiceId
              )
              const subtotal = selectedService
                ? Number(selectedService.harga) * (watchedDetails[index]?.qty || 0)
                : 0

              return (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row items-end gap-3 p-4 rounded-xl border bg-muted/30 group relative"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <FormField
                      control={form.control}
                      name={`details.${index}.serviceId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Pilih Layanan</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Pilih..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {services.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                  {s.namaLayanan} ({formatCurrency(s.harga)}/{s.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-full sm:w-32">
                    <FormField
                      control={form.control}
                      name={`details.${index}.qty`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Jumlah ({selectedService?.unit || "-"})
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              className="bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-full sm:w-32 pb-2">
                    <Label className="text-xs text-muted-foreground block mb-1">
                      Subtotal
                    </Label>
                    <div className="h-10 flex items-center font-semibold text-sm">
                      {formatCurrency(subtotal)}
                    </div>
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Total Pembayaran
            </p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 tracking-tight">
              {formatCurrency(calculateTotal())}
            </p>
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full sm:w-auto h-12 px-8 gradient-primary text-white gap-2 text-base shadow-xl shadow-blue-500/20"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Simpan
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
