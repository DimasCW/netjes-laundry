import { Decimal } from "@prisma/client/runtime/library"

export type Role = "ADMIN" | "PEKERJA"

export type StatusProses = 
  | "PENDING"
  | "DICUCI"
  | "DIKERINGKAN"
  | "DISETRIKA"
  | "SELESAI"
  | "DIAMBIL"

export type StatusPembayaran = 
  | "BELUM_LUNAS"
  | "LUNAS"

// ==================== Auth ====================
declare module "next-auth" {
  interface User {
    role: Role
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}

// ==================== Server Action Result ====================
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ==================== User ====================
export interface UserData {
  id: number
  nama: string
  email: string
  role: Role
  createdAt: Date
}

export interface CreateUserInput {
  nama: string
  email: string
  password: string
  role: Role
}

export interface UpdateUserInput {
  nama: string
  email: string
  role: Role
  password?: string
}

// ==================== Service ====================
export interface ServiceData {
  id: number
  namaLayanan: string
  harga: Decimal | number
  unit: string
  createdAt: Date
}

export interface CreateServiceInput {
  namaLayanan: string
  harga: number
  unit: string
}

// ==================== Transaction ====================
export interface TransactionDetailData {
  id: number
  transactionId: number
  serviceId: number
  qty: Decimal | number
  subtotal: Decimal | number
  service: {
    id: number
    namaLayanan: string
    harga: Decimal | number
    unit: string
  }
}

export interface TransactionData {
  id: number
  userId: number
  namaPelanggan: string
  nomorWa: string
  trackingToken: string
  statusProses: StatusProses
  statusPembayaran: StatusPembayaran
  totalBayar: Decimal | number
  createdAt: Date
  user: {
    id: number
    nama: string
    email: string
  }
  details: TransactionDetailData[]
}

export interface TransactionListItem {
  id: number
  namaPelanggan: string
  nomorWa: string
  trackingToken: string
  statusProses: StatusProses
  statusPembayaran: StatusPembayaran
  totalBayar: Decimal | number
  createdAt: Date
  user: {
    nama: string
  }
  _count: {
    details: number
  }
}

export interface CreateTransactionInput {
  namaPelanggan: string
  nomorWa: string
  details: {
    serviceId: number
    qty: number
  }[]
}

export interface UpdateTransactionInput {
  namaPelanggan: string
  nomorWa: string
  details: {
    serviceId: number
    qty: number
  }[]
}

// ==================== Filter & Pagination ====================
export interface TransactionFilters {
  search?: string
  status?: StatusProses | ""
  dateFrom?: string
  dateTo?: string
  serviceId?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ==================== Dashboard ====================
export interface DashboardStats {
  totalHariIni: number
  sedangDiproses: number
  selesaiHariIni: number
  pendapatanHariIni: number
}

export interface ChartDataPoint {
  tanggal: string
  transaksi: number
  pendapatan: number
}

export interface TopServiceData {
  namaLayanan: string
  total: number
}

// ==================== Status ====================
export const STATUS_LABELS: Record<StatusProses, string> = {
  PENDING: "Pending",
  DICUCI: "Dicuci",
  DIKERINGKAN: "Dikeringkan",
  DISETRIKA: "Disetrika",
  SELESAI: "Selesai",
  DIAMBIL: "Diambil",
}

export const STATUS_ORDER: StatusProses[] = [
  "PENDING",
  "DICUCI",
  "DIKERINGKAN",
  "DISETRIKA",
  "SELESAI",
  "DIAMBIL",
]

export const STATUS_COLORS: Record<StatusProses, string> = {
  PENDING: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  DICUCI: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DIKERINGKAN: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  DISETRIKA: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  SELESAI: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  DIAMBIL: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
}

export const PAYMENT_STATUS_COLORS: Record<StatusPembayaran, string> = {
  BELUM_LUNAS: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  LUNAS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}
