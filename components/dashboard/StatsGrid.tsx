import {
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { DashboardStats } from "@/types"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  trend?: string
}

function StatCard({ title, value, icon: Icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground">{trend}</p>
            )}
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl",
              iconBg
            )}
          >
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  const cards: StatCardProps[] = [
    {
      title: "Total Transaksi Hari Ini",
      value: stats.totalHariIni,
      icon: TrendingUp,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      trend: "Transaksi masuk hari ini",
    },
    {
      title: "Sedang Diproses",
      value: stats.sedangDiproses,
      icon: Clock,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      trend: "Menunggu selesai",
    },
    {
      title: "Selesai Hari Ini",
      value: stats.selesaiHariIni,
      icon: CheckCircle2,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      trend: "Laundry telah selesai",
    },
    {
      title: "Pendapatan Hari Ini",
      value: formatCurrency(stats.pendapatanHariIni),
      icon: DollarSign,
      iconBg: "bg-teal-100 dark:bg-teal-900/30",
      iconColor: "text-teal-600 dark:text-teal-400",
      trend: "Dari transaksi selesai",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  )
}
