"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Plus, Pencil, Trash2, Search, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ServiceData } from "@/types"
import { createService, updateService, deleteService } from "@/app/actions/services"
import { toast } from "sonner"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"

const serviceSchema = z.object({
  namaLayanan: z.string().min(2, "Nama minimal 2 karakter"),
  harga: z.coerce.number().positive("Harga harus lebih dari 0"),
  unit: z.string().min(1, "Unit harus diisi (cth: kg, pcs)"),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

interface ServicesClientProps {
  initialServices: ServiceData[]
}

export function ServicesClient({ initialServices }: ServicesClientProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  
  const [services, setServices] = useState(initialServices)
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceData | null>(null)

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      namaLayanan: "",
      harga: 0,
      unit: "kg",
    },
  })

  const filteredServices = services.filter((s) =>
    s.namaLayanan.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenAdd = () => {
    setEditingService(null)
    form.reset({ namaLayanan: "", harga: 0, unit: "kg" })
    setIsOpen(true)
  }

  const handleOpenEdit = (service: ServiceData) => {
    setEditingService(service)
    form.reset({
      namaLayanan: service.namaLayanan,
      harga: Number(service.harga),
      unit: service.unit,
    })
    setIsOpen(true)
  }

  const onSubmit = async (values: ServiceFormValues) => {
    if (editingService) {
      const res = await updateService(editingService.id, values)
      if (res.success) {
        toast.success("Layanan berhasil diperbarui")
        setServices(prev => prev.map(s => s.id === editingService.id ? res.data : s))
        setIsOpen(false)
      } else {
        toast.error(res.error)
      }
    } else {
      const res = await createService(values)
      if (res.success) {
        toast.success("Layanan berhasil ditambah")
        setServices(prev => [...prev, res.data])
        setIsOpen(false)
      } else {
        toast.error(res.error)
      }
    }
  }

  const handleDelete = async (id: number) => {
    const res = await deleteService(id)
    if (res.success) {
      toast.success("Layanan berhasil dihapus")
      setServices(prev => prev.filter(s => s.id !== id))
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari layanan..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isAdmin && (
          <Button onClick={handleOpenAdd} className="w-full sm:w-auto gap-2 gradient-primary text-white">
            <Plus className="h-4 w-4" />
            Tambah Layanan
          </Button>
        )}
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nama Layanan</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="h-48 text-center">
                  <EmptyState description="Layanan tidak ditemukan." />
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-semibold">
                    {service.namaLayanan}
                  </TableCell>
                  <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                    {formatCurrency(service.harga)}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted uppercase tracking-wider">
                      {service.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateShort(service.createdAt)}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => handleOpenEdit(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        title="Hapus Layanan?"
                        description={`Anda akan menghapus layanan ${service.namaLayanan}. Tindakan ini tidak dapat dibatalkan.`}
                        onConfirm={() => handleDelete(service.id)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Layanan" : "Tambah Layanan Baru"}
            </DialogTitle>
            <DialogDescription>
              Silakan isi detail layanan laundry di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="namaLayanan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Layanan</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Cuci Reguler" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="harga"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga (Rp)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Satuan/Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="kg / pcs / pasang" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setIsOpen(false)} type="button">
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={form.formState.isSubmitting}
                  className="gradient-primary text-white"
                >
                  {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Layanan"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
