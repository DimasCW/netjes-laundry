import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Routes yang tidak perlu auth
const publicRoutes = ["/login", "/track"]

// Routes khusus Admin only
const adminOnlyRoutes = ["/users", "/services", "/dashboard"]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isPublicRoute = publicRoutes.some(
    (route) => nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
  )

  // Allow public routes
  if (isPublicRoute) {
    // If already logged in and accessing /login, redirect based on role
    if (isLoggedIn && nextUrl.pathname === "/login") {
      const redirectPath = userRole === "ADMIN" ? "/dashboard" : "/transactions"
      return NextResponse.redirect(new URL(redirectPath, nextUrl))
    }
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access: Pekerja cannot access admin-only routes
  const isAdminOnlyRoute = adminOnlyRoutes.some(
    (route) => nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
  )

  if (isAdminOnlyRoute && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/transactions", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api/auth|api/invoice|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
