"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartDataPoint } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface TransactionChartProps {
  data: ChartDataPoint[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        <p className="text-blue-500">
          Transaksi: <span className="font-bold">{payload[0]?.value}</span>
        </p>
        <p className="text-teal-500">
          Pendapatan:{" "}
          <span className="font-bold">{formatCurrency(payload[1]?.value ?? 0)}</span>
        </p>
      </div>
    )
  }
  return null
}

export function TransactionChart({ data }: TransactionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Transaksi 7 Hari Terakhir</CardTitle>
        <CardDescription>Jumlah transaksi dan pendapatan harian</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="tanggal"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}
            />
            <Bar
              yAxisId="left"
              dataKey="transaksi"
              name="Transaksi"
              fill="hsl(199, 89%, 48%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              yAxisId="right"
              dataKey="pendapatan"
              name="Pendapatan"
              fill="hsl(160, 84%, 39%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
