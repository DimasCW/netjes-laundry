/**
 * Generate tracking token in format: NJS-YYYYMMDD-XXXXXX
 * Example: NJS-20250506-A3K9PQ
 */
export function generateTrackingToken(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let random = ""
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `NJS-${date}-${random}`
}
