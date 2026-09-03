'use client'

import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Building, ArrowLeftRight, Wallet, Map, Ruler } from 'lucide-react'
import Link from 'next/link'
import { useIsMounted } from '@/hooks/use-is-mounted'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const DashboardMap = dynamic(() => import('@/components/map/DashboardMap'), { 
  ssr: false, 
  loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl border border-primary/20"></div> 
})

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export default function DashboardOverview() {
  const { address, isConnected } = useAccount()
  
  // 1. Get array of Property IDs owned by user
  const { data: propertyIds, isLoading: isLoadingIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'getPropertiesByOwner',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  })

  // 2. Fetch details for each Property ID
  const { data: propertiesData, isLoading: isLoadingDetails } = useReadContracts({
    contracts: (propertyIds || []).map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName: 'getProperty',
      args: [id],
    })),
    query: {
      enabled: !!propertyIds && propertyIds.length > 0,
    }
  })

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

  const isLoading = isLoadingIds || (propertyIds?.length ? isLoadingDetails : false)

  let verifiedCount = 0
  let pendingCount = 0
  let totalArea = 0n
  const mapProperties: any[] = []

  if (propertiesData && propertyIds) {
    propertiesData.forEach((result, idx) => {
      const prop = result.result as any
      if (prop) {
        if (prop.verified) verifiedCount++
        if (prop.pendingOwner !== '0x0000000000000000000000000000000000000000') pendingCount++
        totalArea += prop.area

        mapProperties.push({
          id: propertyIds[idx],
          lat: Number(prop.latitudeE6) / 1000000,
          lng: Number(prop.longitudeE6) / 1000000,
          verified: prop.verified,
          area: Number(prop.area)
        })
      }
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">Manage your digital properties and global assets.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl hover:border-primary/40 transition-all duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-primary/20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-200">Verified Properties</CardTitle>
              <Building className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold mt-1 text-white">{verifiedCount}</div>
              <p className="text-xs text-slate-400 mt-1">Out of {propertyIds?.length || 0} total</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl hover:border-green-500/40 transition-all duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-24 bg-green-500/10 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-green-500/20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-200">Total Land Area</CardTitle>
              <Ruler className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold mt-1 text-white">{totalArea.toString()} <span className="text-lg font-normal text-slate-400">sqm</span></div>
              <p className="text-xs text-slate-400 mt-1">Combined across all properties</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl hover:border-amber-500/40 transition-all duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-24 bg-amber-500/10 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-amber-500/20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-200">Pending Transfers</CardTitle>
              <ArrowLeftRight className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold mt-1 text-white">{pendingCount}</div>
              <p className="text-xs text-slate-400 mt-1">Awaiting confirmation</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" /> Global Assets Map
        </h2>
        {isLoading ? (
          <Skeleton className="h-[400px] w-full rounded-xl" />
        ) : (
          <DashboardMap properties={mapProperties} />
        )}
      </div>
      
      <div className="flex gap-4 pt-4">
        <Link href="/dashboard/properties" className={buttonVariants({ variant: "default", size: "lg" })}>
          Manage Properties
        </Link>
        <Link href="/dashboard/transactions" className={buttonVariants({ variant: "outline", size: "lg" })}>
          View Transfers
        </Link>
      </div>
    </div>
  )
}
