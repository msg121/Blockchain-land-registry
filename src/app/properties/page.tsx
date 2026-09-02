'use client'

import { useState } from 'react'
import { useLandRegistry } from '@/hooks/useLandRegistry'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, CheckCircle2, XCircle } from 'lucide-react'
import { useReadContract } from 'wagmi'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'
import { formatCoordinate, formatDate, parseBytes32String } from '@/lib/format'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')

  const { data: propertyData, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'getProperty',
    args: [submittedQuery as `0x${string}`],
    query: {
      enabled: submittedQuery.startsWith('0x') && submittedQuery.length === 66,
    }
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedQuery(searchQuery)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col items-center mb-12 space-y-4 text-center">
        <h1 className="text-4xl font-bold">Property Explorer</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Search the blockchain for transparent land ownership records. Enter a 32-byte Property ID to view verified details.
        </p>
      </div>

      <Card className="mb-12 border-white/20 bg-white/5 shadow-lg backdrop-blur-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input 
              placeholder="Enter Property ID (e.g. 0x123...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-lg bg-white/10 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50"
            />
            <Button type="submit" size="lg" className="bg-white text-black hover:bg-white/90 font-semibold border border-white">
              <Search className="mr-2 h-5 w-5" /> Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground animate-pulse">
          Querying blockchain...
        </div>
      )}

      {isError && submittedQuery && !isLoading && (
        <Card className="border-destructive bg-destructive/5 text-center py-12">
          <CardContent>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Property Not Found</h3>
            <p className="text-muted-foreground mt-2">The property ID you entered does not exist or has not been registered.</p>
          </CardContent>
        </Card>
      )}

      {propertyData && !isLoading && !isError && (
        <Card className="overflow-hidden border-primary/20 shadow-lg animate-in fade-in slide-in-from-bottom-4">
          <CardHeader className="bg-secondary/30 pb-8">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-primary" /> Property Details
                </CardTitle>
                <CardDescription className="mt-2 text-xs font-mono break-all max-w-md">
                  ID: {submittedQuery}
                </CardDescription>
              </div>
              <Badge variant={propertyData.verified ? "default" : "destructive"} className="text-sm px-3 py-1">
                {propertyData.verified ? (
                  <><CheckCircle2 className="mr-1 h-4 w-4" /> Verified</>
                ) : (
                  <><XCircle className="mr-1 h-4 w-4" /> Unverified</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-t">
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Current Owner</h4>
                  <p className="font-mono text-sm break-all">{propertyData.owner}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Metadata Hash</h4>
                  <p className="font-mono text-sm break-all">{propertyData.metadataHash}</p>
                </div>
                {propertyData.pendingOwner !== '0x0000000000000000000000000000000000000000' && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Pending Transfer To</h4>
                    <p className="font-mono text-sm break-all text-amber-500">{propertyData.pendingOwner}</p>
                  </div>
                )}
              </div>
              <div className="p-6 space-y-6 bg-muted/20">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Area (sqm)</h4>
                    <p className="text-xl font-semibold">{propertyData.area.toString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Coordinates</h4>
                    <p className="text-sm">Lat: {formatCoordinate(propertyData.latitudeE6)}</p>
                    <p className="text-sm">Lng: {formatCoordinate(propertyData.longitudeE6)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Registered</h4>
                    <p className="text-sm">{formatDate(propertyData.createdAt)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h4>
                    <p className="text-sm">{formatDate(propertyData.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
