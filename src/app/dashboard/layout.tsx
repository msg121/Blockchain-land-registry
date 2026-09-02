'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building, ArrowLeftRight } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Properties", href: "/dashboard/properties", icon: Building },
    { name: "Pending Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
