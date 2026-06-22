# Netjes Laundry Management System

Sistem Manajemen Laundry modern yang dibangun dengan Next.js 15, TypeScript, Tailwind CSS, dan MSSQL.

## Fitur Utama

- **Dashboard Analytics**: Ringkasan transaksi harian dan grafik pendapatan.
- **Manajemen Transaksi**: Create, Update, Delete transaksi dengan multi-layanan.
- **Tracking System**: Pelanggan bisa memantau status laundry via link publik (tanpa login).
- **Notifikasi WhatsApp**: Otomatis kirim pesan via Fonnte saat transaksi dibuat dan saat laundry selesai.
- **Invoice PDF**: Generate invoice profesional yang bisa diunduh oleh admin/staff.
- **Role Based Access**: Pembedaan hak akses antara Admin dan Pekerja.
- **Responsive Design**: Optimal di Mobile, Tablet, dan Desktop.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: MSSQL (SQL Server 2022)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5 (Auth.js)
- **Charts**: Recharts
- **PDF**: @react-pdf/renderer
- **WA API**: Fonnte

## Persyaratan Sistem

- Node.js 20+
- Docker & Docker Compose (untuk menjalankan database dan aplikasi)

## Cara Setup (Local Development)

1. **Install Dependensi**
   ```bash
   npm install
   ```

2. **Setup Environment**
   File `.env.local` sudah disiapkan dengan konfigurasi default. Pastikan `FONNTE_TOKEN` sudah benar.

3. **Jalankan Database (Docker)**
   ```bash
   docker-compose up -d db
   ```

4. **Setup Database (Prisma)**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## Cara Deploy (Production via Docker)

1. **Jalankan Full Stack**
   ```bash
   docker-compose up -d --build
   ```

## Akun Demo

### Admin
- **Email**: `admin@netjes.id`
- **Password**: `Admin@123`
- **Role**: ADMIN

### Pekerja
- **Email**: `pekerja@netjes.id`
- **Password**: `Pekerja@123`
- **Role**: PEKERJA

## Tracking Format
URL Tracking: `http://localhost:3000/track/NJS-YYYYMMDD-XXXXXX`

---

&copy; 2026 Netjes Laundry.
