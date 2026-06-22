import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Seed admin
  const hashedPassword = await bcrypt.hash("Admin@123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@netjes.id" },
    update: {},
    create: {
      nama: "Super Admin",
      email: "admin@netjes.id",
      password: hashedPassword,
      role: "ADMIN",
    },
  })
  console.log("✅ Admin user created: admin@netjes.id")

  // Seed pekerja
  const pekerjaPassword = await bcrypt.hash("Pekerja@123", 12)
  await prisma.user.upsert({
    where: { email: "pekerja@netjes.id" },
    update: {},
    create: {
      nama: "Pegawai Laundry",
      email: "pekerja@netjes.id",
      password: pekerjaPassword,
      role: "PEKERJA",
    },
  })
  console.log("✅ Pekerja user created: pekerja@netjes.id")

  // Seed layanan awal
  const layanan = [
    { namaLayanan: "Cuci Reguler", harga: 7000, unit: "kg" },
    { namaLayanan: "Cuci Express", harga: 12000, unit: "kg" },
    { namaLayanan: "Cuci Sepatu", harga: 25000, unit: "pasang" },
    { namaLayanan: "Setrika", harga: 5000, unit: "kg" },
    { namaLayanan: "Cuci + Setrika", harga: 10000, unit: "kg" },
  ]

  for (const item of layanan) {
    await prisma.service.upsert({
      where: { id: layanan.indexOf(item) + 1 }, // Assuming IDs start from 1 and match index
      update: {
        namaLayanan: item.namaLayanan,
        harga: item.harga,
        unit: item.unit,
      },
      create: {
        namaLayanan: item.namaLayanan,
        harga: item.harga,
        unit: item.unit,
      },
    })
  }
  console.log("✅ Services seeded:", layanan.length, "items")

  // Seed dummy transactions
  console.log("🌱 Seeding dummy transactions...")
  const services = await prisma.service.findMany()
  
  const dummyNames = [
    "Budi Santoso", "Andi Wijaya", "Siti Aminah", "Dewi Lestari", "Rudi Hartono", 
    "Agus Setiawan", "Rina Marlina", "Dimas Saputra", "Eko Prasetyo", "Maya Fitri",
    "Hendra Kurniawan", "Sari Wahyuni", "Doni Pratama", "Larasati", "Fajri Ramadhan",
    "Gita Permata", "Irfan Hakim", "Joko Susilo", "Kiki Amelia", "Lukman Hakim"
  ]
  const dummyStatuses = ["PENDING", "DICUCI", "DIKERINGKAN", "DISETRIKA", "SELESAI", "DIAMBIL"]
  const dummyPayments = ["LUNAS", "BELUM_LUNAS"]

  for (let i = 0; i < 20; i++) {
    const service1 = services[Math.floor(Math.random() * services.length)]
    const service2 = services[Math.floor(Math.random() * services.length)]
    
    const qty1 = Math.floor(Math.random() * 5) + 1
    const qty2 = Math.floor(Math.random() * 3) + 1
    
    const subtotal1 = service1.harga * qty1
    const subtotal2 = service2.harga * qty2
    
    const totalBayar = subtotal1 + (service1.id !== service2.id ? subtotal2 : 0)

    const randomDaysAgo = Math.floor(Math.random() * 14) // Up to 14 days ago
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - randomDaysAgo)
    createdAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))

    const details = [
      { serviceId: service1.id, qty: qty1, subtotal: subtotal1 }
    ]
    if (service1.id !== service2.id) {
      details.push({ serviceId: service2.id, qty: qty2, subtotal: subtotal2 })
    }

    const token = `NJS-${createdAt.toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    await prisma.transaction.create({
      data: {
        userId: admin.id,
        namaPelanggan: dummyNames[i % dummyNames.length],
        nomorWa: `0812${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        trackingToken: token,
        statusProses: dummyStatuses[Math.floor(Math.random() * dummyStatuses.length)],
        statusPembayaran: dummyPayments[Math.floor(Math.random() * dummyPayments.length)],
        totalBayar: totalBayar,
        createdAt: createdAt,
        details: {
          create: details
        }
      }
    })
  }
  console.log("✅ 20 dummy transactions seeded successfully!")

  console.log("🎉 Seed berhasil!")
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
