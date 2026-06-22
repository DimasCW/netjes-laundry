"use client"

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import { TransactionData } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"

// Register font (Optional, using default for now to keep it simple)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#334155",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0ea5e9", // Blue-500
  },
  subtitle: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  infoBlock: {
    flexDirection: "column",
    gap: 4,
  },
  infoLabel: {
    fontSize: 8,
    color: "#94a3b8",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  infoValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
  },
  table: {
    display: "flex",
    width: "auto",
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
    fontWeight: "bold",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#f1f5f9",
    padding: 8,
  },
  col1: { width: "40%" },
  col2: { width: "20%", textAlign: "center" },
  col3: { width: "20%", textAlign: "right" },
  col4: { width: "20%", textAlign: "right" },
  totalSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    width: 200,
    padding: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0369a1",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0369a1",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 20,
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
    marginBottom: 4,
  },
})

interface InvoiceDocumentProps {
  transaction: TransactionData
}

export function InvoiceDocument({ transaction }: InvoiceDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Netjes Laundry</Text>
            <Text style={styles.subtitle}>Modern Laundry Solution</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={{ fontSize: 12, fontWeight: "bold" }}>INVOICE</Text>
            <Text style={{ color: "#64748b", marginTop: 4 }}>
              {transaction.trackingToken}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Nama Pelanggan</Text>
            <Text style={styles.infoValue}>{transaction.namaPelanggan}</Text>
            <Text style={styles.infoLabel}>WhatsApp</Text>
            <Text style={styles.infoValue}>{transaction.nomorWa}</Text>
          </View>
          <View style={[styles.infoBlock, { textAlign: "right" }]}>
            <Text style={styles.infoLabel}>Tanggal Masuk</Text>
            <Text style={styles.infoValue}>{formatDate(transaction.createdAt)}</Text>
            <Text style={styles.infoLabel}>Kasir</Text>
            <Text style={styles.infoValue}>{transaction.user.nama}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Layanan</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col3}>Harga</Text>
            <Text style={styles.col4}>Subtotal</Text>
          </View>

          {transaction.details.map((detail) => (
            <View key={detail.id} style={styles.tableRow}>
              <Text style={styles.col1}>{detail.service.namaLayanan}</Text>
              <Text style={styles.col2}>
                {Number(detail.qty)} {detail.service.unit}
              </Text>
              <Text style={styles.col3}>
                {formatCurrency(detail.service.harga)}
              </Text>
              <Text style={styles.col4}>{formatCurrency(detail.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL BAYAR</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(transaction.totalBayar)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Terima kasih telah menggunakan jasa Netjes Laundry.</Text>
          <Text style={styles.footerText}>
            Pantau status laundry Anda di: netjes.id/track/{transaction.trackingToken}
          </Text>
          <Text style={[styles.footerText, { marginTop: 10 }]}>
            Hubungi kami: 0812-3456-789 | IG: @netjeslaundry
          </Text>
        </View>
      </Page>
    </Document>
  )
}
