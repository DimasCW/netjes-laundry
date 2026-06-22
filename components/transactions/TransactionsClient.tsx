"use client"

import { useState, useTransition } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Plus, Search, FilterX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TransactionTable } from "./TransactionTable"
import { WorkerQueueTable } from "./WorkerQueueTable"
import { TransactionFiltersArea } from "./TransactionFilters"
import { TransactionForm } from "./TransactionForm"
import { getTransactions } from "@/app/actions/transactions"
import { ServiceData, TransactionFilters } from "@/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

interface TransactionsClientProps {
  services: ServiceData[]
}

export function TransactionsClient({ services }: TransactionsClientProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Pagination & Filters from URL
  const page = Number(searchParams.get("page")) || 1
  const limit = Number(searchParams.get("limit")) || 10
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status") || ""
  const dateFrom = searchParams.get("dateFrom") || ""
  const dateTo = searchParams.get("dateTo") || ""
  const serviceId = searchParams.get("serviceId") || ""

  const filters: TransactionFilters = {
    page,
    limit,
    search,
    status: status as any,
    dateFrom,
    dateTo,
    serviceId,
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => getTransactions(filters),
  })

  const updateUrl = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })
    
    // Reset to page 1 if search/filter changes
    if (!newParams.page && newParams.page !== 0) {
      params.set("page", "1")
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleSearch = (val: string) => {
    updateUrl({ search: val, page: 1 })
  }

  const resetFilters = () => {
    router.push(pathname)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pelanggan / WA / token..."
            className="pl-9"
            defaultValue={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none gap-2"
              onClick={resetFilters}
            >
              <FilterX className="h-4 w-4" />
              Reset
            </Button>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none gap-2 gradient-primary text-white">
                  <Plus className="h-4 w-4" />
                  Tambah Transaksi
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Form Tambah Transaksi</DialogTitle>
                  <DialogDescription>
                    Isi detail pelanggan dan layanan untuk membuat pesanan laundry.
                  </DialogDescription>
                </DialogHeader>
                <TransactionForm
                  services={services}
                  onSuccess={() => {
                    setIsFormOpen(false)
                    refetch()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {isAdmin && (
        <TransactionFiltersArea
          filters={filters}
          services={services}
          onFilterChange={(newFilters) => updateUrl(newFilters)}
        />
      )}

      {isAdmin ? (
        <TransactionTable
          data={data?.data || []}
          isLoading={isLoading || isPending}
          pagination={{
            page: data?.page || 1,
            limit: data?.limit || 10,
            total: data?.total || 0,
            totalPages: data?.totalPages || 1,
          }}
          onPageChange={(p) => updateUrl({ page: p })}
          onLimitChange={(l) => updateUrl({ limit: l, page: 1 })}
          onDataChange={() => refetch()}
        />
      ) : (
        <WorkerQueueTable
          data={data?.data || []}
          isLoading={isLoading || isPending}
          pagination={{
            page: data?.page || 1,
            limit: data?.limit || 10,
            total: data?.total || 0,
            totalPages: data?.totalPages || 1,
          }}
          onPageChange={(p) => updateUrl({ page: p })}
          onLimitChange={(l) => updateUrl({ limit: l, page: 1 })}
          onDataChange={() => refetch()}
        />
      )}
    </div>
  )
}
