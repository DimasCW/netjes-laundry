import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  const t = await prisma.transaction.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { trackingToken: true }
  })
  console.log(t?.trackingToken)
}
main().finally(() => prisma.$disconnect())
