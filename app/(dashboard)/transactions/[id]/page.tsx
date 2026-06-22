import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTransactionById } from "@/app/actions/transactions"
import { TransactionDetailClient } from "@/components/transactions/TransactionDetailClient"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const transaction = await getTransactionById(parseInt(id))
  return {
    title: transaction ? `Detail Transaksi ${transaction.trackingToken}` : "Transaksi Tidak Ditemukan",
  }
}

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const transaction = await getTransactionById(parseInt(id))

  if (!transaction) {
    notFound()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <TransactionDetailClient transaction={transaction} />
    </div>
  )
}
