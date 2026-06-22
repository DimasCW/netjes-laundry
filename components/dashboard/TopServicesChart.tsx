"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TopServiceData } from "@/types"
import { EmptyState } from "@/components/shared/EmptyState"
import { BarChart2 } from "lucide-react"

const COLORS = [
  "hsl(199, 89%, 48%)",
  "hsl(160, 84%, 39%)",
  "hsl(270, 80%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 80%, 60%)",
]

export function TopServicesChart({ data }: { data: TopServiceData[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Top 5 Layanan</CardTitle>
        <CardDescription>Layanan paling sering dipesan</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={<BarChart2 className="w-8 h-8 text-muted-foreground" />}
            title="Belum ada data"
            description="Data layanan akan muncul setelah transaksi pertama"
          />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="namaLayanan"
                type="category"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                formatter={(value: number) => [value, "Qty"]}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
