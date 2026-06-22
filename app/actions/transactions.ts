"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { generateTrackingToken } from "@/lib/generate-token"
import {
  sendWhatsApp,
  buildMessageTransaksiDibuat,
  buildMessageLaundrySelesai,
} from "@/lib/whatsapp"
import {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
} from "@/lib/utils"
import {
  ActionResult,
  TransactionData,
  TransactionListItem,
  TransactionFilters,
  PaginatedResponse,
  StatusProses,
} from "@/types"

const STATUS_ORDER: StatusProses[] = [
  "PENDING",
  "DICUCI",
  "DIKERINGKAN",
  "DISETRIKA",
  "SELESAI",
  "DIAMBIL",
]

const transactionSchema = z.object({
  namaPelanggan: z.string().min(2, "Nama minimal 2 karakter").max(100),
  nomorWa: z
    .string()
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,10}$/,
      "Format nomor WA tidak valid (contoh: 08123456789)"
    ),
  details: z
    .array(
      z.object({
        serviceId: z.number().min(1, "Pilih layanan"),
        qty: z.number().positive("Qty harus lebih dari 0"),
      })
    )
    .min(1, "Minimal 1 layanan harus dipilih"),
})

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<PaginatedResponse<TransactionListItem>> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const {
    search = "",
    status = "",
    dateFrom,
    dateTo,
    serviceId,
    page = 1,
    limit = 10,
  } = filters

  const skip = (page - 1) * limit

  const where: Parameters<typeof prisma.transaction.findMany>[0]["where"] = {}

  if (search) {
    where.OR = [
      { namaPelanggan: { contains: search } },
      { nomorWa: { contains: search } },
      { trackingToken: { contains: search } },
    ]
  }

  if (status) {
    where.statusProses = status as StatusProses
  }

  if (dateFrom) {
    where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) }
  }
  if (dateTo) {
    const endDate = new Date(dateTo)
    endDate.setHours(23, 59, 59, 999)
    where.createdAt = { ...where.createdAt, lte: endDate }
  }

  if (serviceId) {
    where.details = {
      some: { serviceId: parseInt(serviceId) },
    }
  }

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        namaPelanggan: true,
        nomorWa: true,
        trackingToken: true,
        statusProses: true,
        statusPembayaran: true,
        totalBayar: true,
        createdAt: true,
        user: { select: { nama: true } },
        _count: { select: { details: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ])

  return {
    data: data.map(d => ({
      ...d,
      totalBayar: Number(d.totalBayar)
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getTransactionById(
  id: number
): Promise<TransactionData | null> {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, nama: true, email: true } },
      details: {
        include: {
          service: {
            select: { id: true, namaLayanan: true, harga: true, unit: true },
          },
        },
      },
    },
  })

  if (!transaction) return null

  return {
    ...transaction,
    totalBayar: Number(transaction.totalBayar),
    details: transaction.details.map(d => ({
      ...d,
      qty: Number(d.qty),
      subtotal: Number(d.subtotal),
      service: {
        ...d.service,
        harga: Number(d.service.harga)
      }
    }))
  }
}

export async function getTransactionByToken(
  token: string
): Promise<TransactionData | null> {
  const transaction = await prisma.transaction.findUnique({
    where: { trackingToken: token },
    include: {
      user: { select: { id: true, nama: true, email: true } },
      details: {
        include: {
          service: {
            select: { id: true, namaLayanan: true, harga: true, unit: true },
          },
        },
      },
    },
  })

  if (!transaction) return null

  return {
    ...transaction,
    totalBayar: Number(transaction.totalBayar),
    details: transaction.details.map(d => ({
      ...d,
      qty: Number(d.qty),
      subtotal: Number(d.subtotal),
      service: {
        ...d.service,
        harga: Number(d.service.harga)
      }
    }))
  }
}

export async function createTransaction(
  input: unknown
): Promise<ActionResult<{ id: number; trackingToken: string }>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Silakan login terlebih dahulu" }

  const parsed = transactionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(", "),
    }
  }

  const { namaPelanggan, nomorWa, details } = parsed.data

  try {
    // Calculate subtotals
    const services = await prisma.service.findMany({
      where: { id: { in: details.map((d) => d.serviceId) } },
    })

    const detailsWithSubtotal = details.map((d) => {
      const service = services.find((s) => s.id === d.serviceId)
      if (!service) throw new Error(`Layanan ID ${d.serviceId} tidak ditemukan`)
      const subtotal = Number(service.harga) * d.qty
      return { serviceId: d.serviceId, qty: d.qty, subtotal }
    })

    const totalBayar = detailsWithSubtotal.reduce(
      (sum, d) => sum + d.subtotal,
      0
    )
    const trackingToken = generateTrackingToken()

    const transaction = await prisma.transaction.create({
      data: {
        userId: parseInt(session.user.id),
        namaPelanggan,
        nomorWa,
        trackingToken,
        totalBayar,
        details: {
          create: detailsWithSubtotal,
        },
      },
    })

    // Send WA notification (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const trackingUrl = `${appUrl}/track/${trackingToken}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&data=${encodeURIComponent(trackingUrl)}&dummy=qr.png`
    
    const waNumber = formatPhoneNumber(nomorWa)
    const message = buildMessageTransaksiDibuat({
      namaPelanggan,
      trackingToken,
      tanggal: formatDate(transaction.createdAt),
      totalBayar: formatCurrency(totalBayar),
      appUrl,
    })
    // Fire and forget
    Promise.resolve().then(() => sendWhatsApp(waNumber, message, qrUrl))

    revalidatePath("/transactions")
    revalidatePath("/dashboard")
    return { success: true, data: { id: transaction.id, trackingToken } }
  } catch (error) {
    console.error("[createTransaction]", error)
    return { success: false, error: "Gagal membuat transaksi. Coba lagi." }
  }
}

export async function updateTransaction(
  id: number,
  input: unknown
): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak" }
  }

  const parsed = transactionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(", "),
    }
  }

  const { namaPelanggan, nomorWa, details } = parsed.data

  try {
    const existing = await prisma.transaction.findUnique({ where: { id } })
    if (!existing) return { success: false, error: "Transaksi tidak ditemukan" }
    if (existing.statusProses !== "PENDING") {
      return {
        success: false,
        error: "Hanya transaksi berstatus Pending yang bisa diedit",
      }
    }

    const services = await prisma.service.findMany({
      where: { id: { in: details.map((d) => d.serviceId) } },
    })

    const detailsWithSubtotal = details.map((d) => {
      const service = services.find((s) => s.id === d.serviceId)
      if (!service) throw new Error(`Layanan ID ${d.serviceId} tidak ditemukan`)
      const subtotal = Number(service.harga) * d.qty
      return { serviceId: d.serviceId, qty: d.qty, subtotal }
    })

    const totalBayar = detailsWithSubtotal.reduce(
      (sum, d) => sum + d.subtotal,
      0
    )

    await prisma.$transaction([
      prisma.transactionDetail.deleteMany({ where: { transactionId: id } }),
      prisma.transaction.update({
        where: { id },
        data: {
          namaPelanggan,
          nomorWa,
          totalBayar,
          details: { create: detailsWithSubtotal },
        },
      }),
    ])

    revalidatePath("/transactions")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("[updateTransaction]", error)
    return { success: false, error: "Gagal mengupdate transaksi." }
  }
}

export async function deleteTransaction(id: number): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak" }
  }

  try {
    await prisma.transaction.delete({ where: { id } })
    revalidatePath("/transactions")
    revalidatePath("/dashboard")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("[deleteTransaction]", error)
    return { success: false, error: "Gagal menghapus transaksi." }
  }
}

export async function updateTransactionStatus(
  id: number,
  newStatus: StatusProses
): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      select: {
        statusProses: true,
        namaPelanggan: true,
        nomorWa: true,
        trackingToken: true,
        totalBayar: true,
      },
    })

    if (!transaction) return { success: false, error: "Transaksi tidak ditemukan" }

    const currentIndex = STATUS_ORDER.indexOf(transaction.statusProses)
    const newIndex = STATUS_ORDER.indexOf(newStatus)

    if (newIndex <= currentIndex) {
      return {
        success: false,
        error: "Status hanya bisa maju ke depan, tidak bisa mundur",
      }
    }

    if (newIndex !== currentIndex + 1) {
      return {
        success: false,
        error: "Status harus diupdate secara berurutan",
      }
    }

    await prisma.transaction.update({
      where: { id },
      data: { statusProses: newStatus },
    })

    // Send WA if status is SELESAI
    if (newStatus === "SELESAI") {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      const trackingUrl = `${appUrl}/track/${transaction.trackingToken}`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&data=${encodeURIComponent(trackingUrl)}&dummy=qr.png`

      const waNumber = formatPhoneNumber(transaction.nomorWa)
      const message = buildMessageLaundrySelesai({
        namaPelanggan: transaction.namaPelanggan,
        trackingToken: transaction.trackingToken,
        totalBayar: formatCurrency(Number(transaction.totalBayar)),
        appUrl,
      })
      Promise.resolve().then(() => sendWhatsApp(waNumber, message, qrUrl))
    }

    revalidatePath("/transactions")
    revalidatePath(`/transactions/${id}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("[updateTransactionStatus]", error)
    return { success: false, error: "Gagal mengupdate status." }
  }
}

export async function updatePaymentStatus(
  id: number,
  newStatus: string
): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!transaction) return { success: false, error: "Transaksi tidak ditemukan" }

    await prisma.transaction.update({
      where: { id },
      data: { statusPembayaran: newStatus },
    })

    revalidatePath("/transactions")
    revalidatePath(`/transactions/${id}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("[updatePaymentStatus]", error)
    return { success: false, error: "Gagal mengupdate status pembayaran." }
  }
}
