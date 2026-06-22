import type { Metadata } from "next"
import { Suspense } from "react"
import { TransactionsClient } from "@/components/transactions/TransactionsClient"
import { getServices } from "@/app/actions/services"
import { DataTableSkeleton } from "@/components/shared/DataTableSkeleton"

export const metadata: Metadata = {
  title: "Transaksi",
}

export default async function TransactionsPage() {
  const services = await getServices()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kelola semua transaksi laundry Anda
        </p>
      </div>

      <Suspense fallback={<DataTableSkeleton columns={6} rows={10} />}>
        <TransactionsClient services={services} />
      </Suspense>
    </div>
  )
}
