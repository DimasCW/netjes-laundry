import { Suspense } from "react"
import type { Metadata } from "next"
import {
  getDashboardStats,
  getChartData,
  getTopServices,
} from "@/app/actions/dashboard"
import { StatsGrid } from "@/components/dashboard/StatsGrid"
import { TransactionChart } from "@/components/dashboard/TransactionChart"
import { TopServicesChart } from "@/components/dashboard/TopServicesChart"
import { StatCardSkeleton } from "@/components/shared/DataTableSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const [stats, chartData, topServices] = await Promise.all([
    getDashboardStats(),
    getChartData(),
    getTopServices(),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selamat datang! Berikut ringkasan aktivitas laundry hari ini.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsGrid stats={stats} />

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}>
            <TransactionChart data={chartData} />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}>
            <TopServicesChart data={topServices} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
