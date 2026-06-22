import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument"
import { getTransactionById } from "@/app/actions/transactions"
import { auth } from "@/auth"
import React from "react"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Auth check
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { id } = await params
    // 2. Fetch data
    const transaction = await getTransactionById(parseInt(id))
    if (!transaction) {
      return new NextResponse("Not Found", { status: 404 })
    }

    // 3. Generate PDF Buffer
    // Note: React PDF needs to be used in a way that works on the server
    const buffer = await renderToBuffer(
      React.createElement(InvoiceDocument, { transaction })
    )

    // 4. Return as PDF response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${transaction.trackingToken}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[API_INVOICE_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
