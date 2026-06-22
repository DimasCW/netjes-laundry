export async function sendWhatsApp(to: string, message: string, mediaUrl?: string): Promise<void> {
  const WAHA_API_URL = process.env.WAHA_API_URL || "http://localhost:3000"
  const WAHA_API_KEY = process.env.WAHA_API_KEY
  const WAHA_SESSION = process.env.WAHA_SESSION || "default"
  
  if (!WAHA_API_URL) {
    console.warn("[WhatsApp] WAHA_API_URL tidak dikonfigurasi, skip pengiriman WA")
    return
  }

  // Format recipient number for WAHA (e.g., 628xxx -> 628xxx@c.us)
  const chatId = to.includes("@") ? to : `${to}@c.us`

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (WAHA_API_KEY) {
      headers["X-Api-Key"] = WAHA_API_KEY
    }

    let res
    if (mediaUrl) {
      // Send as file with caption
      const endpoint = `${WAHA_API_URL}/api/sendFile`
      const payload = {
        session: WAHA_SESSION,
        chatId: chatId,
        file: {
          url: mediaUrl,
          filename: "qrcode.png",
          mimetype: "image/png"
        },
        caption: message
      }

      res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })
    } else {
      // Send as plain text
      const endpoint = `${WAHA_API_URL}/api/sendText`
      const payload = {
        session: WAHA_SESSION,
        chatId: chatId,
        text: message
      }

      res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })
    }

    let data
    try {
      data = await res.json()
    } catch {
      data = { status: false, reason: await res.text() }
    }

    if (!res.ok) {
      console.error("[WhatsApp] Gagal kirim WA via WAHA:", data)
      
      if (mediaUrl) {
        console.log("[WhatsApp] Mencoba kirim ulang sebagai teks saja...")
        const textEndpoint = `${WAHA_API_URL}/api/sendText`
        const fallbackPayload = {
          session: WAHA_SESSION,
          chatId: chatId,
          text: message
        }

        const retryRes = await fetch(textEndpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(fallbackPayload),
        })
        const retryData = await retryRes.json().catch(() => ({}))
        console.log("[WhatsApp] Hasil kirim ulang:", retryData)
      }
    } else {
      console.log("[WhatsApp] Berhasil kirim ke:", to, "| Response:", data)
    }
  } catch (error) {
    // Jangan throw — gagal WA tidak boleh menggagalkan transaksi
    console.error("[WhatsApp] Error:", error)
  }
}

export function buildMessageTransaksiDibuat(params: {
  namaPelanggan: string
  trackingToken: string
  tanggal: string
  totalBayar: string
  appUrl: string
}): string {
  const trackingUrl = `${params.appUrl}/track/${params.trackingToken}`
  
  return `Halo *${params.namaPelanggan}* 👋

Terima kasih telah mempercayakan laundry Anda ke *Netjes Laundry*.

🧺 Detail Transaksi:
• No. Tracking: *${params.trackingToken}*
• Tanggal Masuk: ${params.tanggal}
• Total: ${params.totalBayar}

Pantau status laundry Anda di:
${trackingUrl}

Kami akan segera memproses laundry Anda. 🙏`
}

export function buildMessageLaundrySelesai(params: {
  namaPelanggan: string
  trackingToken: string
  totalBayar: string
  appUrl: string
}): string {
  const trackingUrl = `${params.appUrl}/track/${params.trackingToken}`
  
  return `Halo *${params.namaPelanggan}* 🎉

Laundry Anda sudah *selesai* dan siap untuk diambil!

📦 No. Tracking: *${params.trackingToken}*
💰 Total: ${params.totalBayar}

Silakan datang ke toko kami untuk mengambil laundry Anda.
Jam operasional: Senin–Sabtu, 08.00–20.00

Terima kasih sudah menggunakan *Netjes Laundry*! ✨`
}
