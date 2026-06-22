import { getServices } from "@/app/actions/services"
import { ServicesClient } from "@/components/services/ServicesClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Layanan",
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Layanan Laundry</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Daftar kategori layanan laundry dan harga satuannya.
        </p>
      </div>

      <ServicesClient initialServices={services} />
    </div>
  )
}
