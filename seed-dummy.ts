import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding dummy transactions...")

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } })
  if (!admin) {
    console.error("No admin found. Run seed first.")
    return
  }

  const services = await prisma.service.findMany()
  if (services.length === 0) {
    console.error("No services found.")
    return
  }

  const dummyNames = [
    "Budi Santoso", "Andi Wijaya", "Siti Aminah", "Dewi Lestari", "Rudi Hartono", 
    "Agus Setiawan", "Rina Marlina", "Dimas Saputra", "Eko Prasetyo", "Maya Fitri"
  ]
  const dummyStatuses = ["PENDING", "DICUCI", "DIKERINGKAN", "DISETRIKA", "SELESAI", "DIAMBIL"]
  const dummyPayments = ["LUNAS", "BELUM_LUNAS"]

  let count = 0;
  for (let i = 0; i < 20; i++) {
    const service1 = services[Math.floor(Math.random() * services.length)]
    const service2 = services[Math.floor(Math.random() * services.length)]
    
    const qty1 = Math.floor(Math.random() * 5) + 1
    const qty2 = Math.floor(Math.random() * 3) + 1
    
    const subtotal1 = service1.harga * qty1
    const subtotal2 = service2.harga * qty2
    
    const totalBayar = subtotal1 + (service1.id !== service2.id ? subtotal2 : 0)

    const randomDaysAgo = Math.floor(Math.random() * 7)
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
        namaPelanggan: dummyNames[Math.floor(Math.random() * dummyNames.length)],
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
    count++;
  }

  console.log(`✅ ${count} dummy transactions seeded successfully!`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
