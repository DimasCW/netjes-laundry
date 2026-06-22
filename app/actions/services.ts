"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ActionResult, ServiceData } from "@/types"

const serviceSchema = z.object({
  namaLayanan: z.string().min(2, "Nama layanan minimal 2 karakter").max(100),
  harga: z.number().positive("Harga harus lebih dari 0"),
  unit: z.string().min(1, "Unit tidak boleh kosong").max(50),
})

export async function getServices(): Promise<ServiceData[]> {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      namaLayanan: true,
      harga: true,
      unit: true,
      createdAt: true,
    },
  })
  return services.map(s => ({
    ...s,
    harga: Number(s.harga)
  }))
}

export async function createService(
  input: unknown
): Promise<ActionResult<ServiceData>> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak" }
  }

  const parsed = serviceSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validasi gagal" }
  }

  try {
    const service = await prisma.service.create({
      data: parsed.data,
    })
    revalidatePath("/services")
    return { success: true, data: service }
  } catch (error) {
    console.error("[createService]", error)
    return { success: false, error: "Gagal membuat layanan. Coba lagi." }
  }
}

export async function updateService(
  id: number,
  input: unknown
): Promise<ActionResult<ServiceData>> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak" }
  }

  const parsed = serviceSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validasi gagal" }
  }

  try {
    const service = await prisma.service.update({
      where: { id },
      data: parsed.data,
    })
    revalidatePath("/services")
    return { success: true, data: service }
  } catch (error) {
    console.error("[updateService]", error)
    return { success: false, error: "Gagal mengupdate layanan." }
  }
}

export async function deleteService(id: number): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak" }
  }

  try {
    await prisma.service.delete({ where: { id } })
    revalidatePath("/services")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("[deleteService]", error)
    return { success: false, error: "Gagal menghapus layanan. Pastikan tidak ada transaksi yang menggunakan layanan ini." }
  }
}
