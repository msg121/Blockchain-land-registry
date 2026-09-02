'use client'

import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Building, ArrowLeftRight, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useIsMounted } from '@/hooks/use-is-mounted'

export default function DashboardOverview() {
  const { address, isConnected } = useAccount()
  
  const isMounted = useIsMounted()
  if (!isMounted) return null

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <Wallet className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Wallet Not Connected</h2>
        <p className="text-muted-foreground">Please connect your wallet to view your dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">Manage your digital properties and pending transfers.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl hover:border-primary/40 hover:shadow-primary/20 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all duration-500 group-hover:bg-primary/20"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors">My Properties</CardTitle>
            <div className="p-2 bg-primary/20 rounded-xl ring-1 ring-primary/30">
              <Building className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-bold mt-2 tracking-tighter text-white">--</div>
            <p className="text-sm text-slate-400 mt-2 font-medium">Verified land records</p>
            <Link href="/dashboard/properties" className={buttonVariants({ variant: "default", className: "w-full mt-6 shadow-lg shadow-primary/25" })}>
              View properties →
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl hover:border-amber-500/40 hover:shadow-amber-500/20 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all duration-500 group-hover:bg-amber-500/20"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors">Pending Transactions</CardTitle>
            <div className="p-2 bg-amber-500/20 rounded-xl ring-1 ring-amber-500/30">
              <ArrowLeftRight className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-bold mt-2 tracking-tighter text-white">--</div>
            <p className="text-sm text-slate-400 mt-2 font-medium">Awaiting your approval</p>
            <Link href="/dashboard/transactions" className={buttonVariants({ variant: "outline", className: "w-full mt-6 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" })}>
              View transactions →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
