'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRoles } from '@/hooks/useRoles'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { ShieldAlert, Users, Activity, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAdmin, isConnected } = useRoles()
  const isMounted = useIsMounted()

  if (!isMounted) return null

  if (!isConnected) {
    return <div className="text-center py-20">Please connect your wallet first.</div>
  }

  const tabs = [
    { name: 'System Overview', path: '/admin', icon: Activity },
    { name: 'Role Management', path: '/admin/roles', icon: Users },
    { name: 'Emergency Controls', path: '/admin/emergency', icon: AlertTriangle },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Admin Tab Navigation */}
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Admin Governance</h1>
        <div className="flex space-x-2 border-b border-primary/20 pb-4 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path
            return (
              <Link key={tab.path} href={tab.path}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  className={`flex items-center gap-2 ${isActive ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Render the specific admin page */}
      <div className="pt-4">
        {children}
      </div>
    </div>
  )
}
