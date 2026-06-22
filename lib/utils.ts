import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | { toNumber: () => number }) {
  const num = typeof amount === "object" && "toNumber" in amount
    ? amount.toNumber()
    : Number(amount)
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function formatPhoneNumber(phone: string): string {
  // Normalize to 628xxx format
  if (phone.startsWith("+62")) {
    return phone.replace("+", "")
  }
  if (phone.startsWith("62")) {
    return phone
  }
  if (phone.startsWith("0")) {
    return "62" + phone.slice(1)
  }
  return phone
}

export function formatPhoneDisplay(phone: string): string {
  // Display as 08xxx format
  if (phone.startsWith("628")) {
    return "0" + phone.slice(2)
  }
  if (phone.startsWith("62")) {
    return "0" + phone.slice(2)
  }
  return phone
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function (...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
