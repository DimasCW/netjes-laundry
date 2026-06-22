"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { DashboardStats, ChartDataPoint, TopServiceData } from "@/types"
import { subDays, startOfDay, endOfDay, format } from "date-fns"

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())

  const [totalHariIni, sedangDiproses, selesaiHariIni, pendapatanResult] =
    await Promise.all([
      prisma.transaction.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.transaction.count({
        where: {
          statusProses: {
            notIn: ["SELESAI", "DIAMBIL"],
          },
        },
      }),
      prisma.transaction.count({
        where: {
          statusProses: { in: ["SELESAI", "DIAMBIL"] },
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { totalBayar: true },
        where: {
          statusProses: { in: ["SELESAI", "DIAMBIL"] },
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      }),
    ])

  return {
    totalHariIni,
    sedangDiproses,
    selesaiHariIni,
    pendapatanHariIni: Number(pendapatanResult._sum.totalBayar ?? 0),
  }
}

export async function getChartData(): Promise<ChartDataPoint[]> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const days = 7
  const data: ChartDataPoint[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    const [count, sumResult] = await Promise.all([
      prisma.transaction.count({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
      }),
      prisma.transaction.aggregate({
        _sum: { totalBayar: true },
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
          statusProses: { in: ["SELESAI", "DIAMBIL"] },
        },
      }),
    ])

    data.push({
      tanggal: format(date, "dd MMM"),
      transaksi: count,
      pendapatan: Number(sumResult._sum.totalBayar ?? 0),
    })
  }

  return data
}

export async function getTopServices(): Promise<TopServiceData[]> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const results = await prisma.transactionDetail.groupBy({
    by: ["serviceId"],
    _sum: { qty: true },
    orderBy: { _sum: { qty: "desc" } },
    take: 5,
  })

  const withNames = await Promise.all(
    results.map(async (r) => {
      const service = await prisma.service.findUnique({
        where: { id: r.serviceId },
        select: { namaLayanan: true },
      })
      return {
        namaLayanan: service?.namaLayanan ?? "Unknown",
        total: Number(r._sum.qty ?? 0),
      }
    })
  )

  return withNames
}
