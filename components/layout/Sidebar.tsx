"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  Users,
  WashingMachine,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    adminOnly: true,
  },
  {
    href: "/transactions",
    label: "Transaksi",
    icon: ClipboardList,
  },
  {
    href: "/services",
    label: "Layanan",
    icon: Settings,
    adminOnly: true,
  },

]

interface SidebarNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {visibleItems.map((item) => {
        const Icon = item.icon
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/")

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
            aria-label={item.label}
          >
            <Icon
              className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-white"
              )}
            />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-primary shadow-lg shadow-blue-500/30">
          <WashingMachine className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base leading-tight">Netjes</h2>
          <p className="text-slate-400 text-xs">Laundry Manager</p>
        </div>
      </div>

      {/* Nav */}
      <SidebarNav />

      {/* Bottom */}
      <div className="px-4 pb-4 mt-auto">
        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5">
          <p className="text-xs text-slate-500 text-center">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
