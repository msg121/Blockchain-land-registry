'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, CheckCircle2, XCircle, Map, Copy, Clock, ExternalLink } from 'lucide-react'
import { useReadContract } from 'wagmi'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'
import { formatCoordinate, formatDate, formatBytes32String } from '@/lib/format'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const DashboardMap = dynamic(() => import('@/components/map/DashboardMap'), { 
  ssr: false, 
  loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl border border-primary/20"></div> 
})

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('landproof_recent_searches')
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load recent searches', e)
    }
  }, [])

  // Smart Dual-Input Resolution
  const isHex = (str: string) => str.startsWith('0x') && str.length === 66
  let bytes32Query = '0x'
  try {
    bytes32Query = submittedQuery 
      ? (isHex(submittedQuery) ? submittedQuery : formatBytes32String(submittedQuery)) 
      : '0x'
  } catch (err) {
    // If formatBytes32String fails (e.g., string too long)
    bytes32Query = '0x'
  }

  const { data: propertyData, isLoading, isError, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'getProperty',
    args: [bytes32Query as `0x${string}`],
    query: {
      enabled: bytes32Query !== '0x',
      retry: false, // Don't retry if it fails
    }
  })

  // Save successful searches to LocalStorage
  useEffect(() => {
    if (propertyData && propertyData.area > 0n && submittedQuery) {
      setRecentSearches(prev => {
        const filtered = prev.filter(q => q !== submittedQuery)
        const updated = [submittedQuery, ...filtered].slice(0, 5)
        localStorage.setItem('landproof_recent_searches', JSON.stringify(updated))
        return updated
      })
    }
  }, [propertyData, submittedQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    // Clean/trim whitespace before querying
    const cleanQuery = searchQuery.trim()
    setSubmittedQuery(cleanQuery)
  }

  const handleChipClick = (query: string) => {
    setSearchQuery(query)
    setSubmittedQuery(query)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  // Show inline error toast if RPC fails
  useEffect(() => {
    if (isError && error) {
      toast.error('Network error or invalid format while fetching data.')
    }
  }, [isError, error])

  // Create map property array if data exists
  const mapProperties = propertyData && !isError && propertyData.area > 0n ? [{
    id: submittedQuery,
    lat: Number(propertyData.latitudeE6) / 1000000,
    lng: Number(propertyData.longitudeE6) / 1000000,
    verified: propertyData.verified,
    area: Number(propertyData.area)
  }] : []

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl min-h-screen">
      <div className="flex flex-col items-center mb-10 space-y-4 text-center">
        <h1 className="text-4xl font-bold">Public Explorer</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Search the blockchain for transparent land ownership records. Enter a human-readable identifier or a raw bytes32 hash.
        </p>
      </div>

      <Card className="mb-8 border-primary/20 bg-slate-900/60 shadow-2xl backdrop-blur-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4 flex-col sm:flex-row">
            <Input 
              placeholder="e.g. Plot-101 or 0x8a3..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-lg h-14 bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary"
            />
            <Button type="submit" size="lg" disabled={isLoading} className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20">
              <Search className="mr-2 h-5 w-5" /> {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
          
          {/* LocalStorage Recent Searches Chips */}
          {recentSearches.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center mr-2"><Clock className="h-3 w-3 mr-1" /> Recent Searches:</span>
              {recentSearches.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(query)}
                  className="px-3 py-1 bg-black/40 border border-white/10 text-slate-300 text-xs rounded-full hover:bg-primary/20 hover:text-white transition-colors"
                >
                  {query.length > 15 ? `${query.substring(0, 15)}...` : query}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-xl bg-slate-800" />
          <Skeleton className="h-[400px] w-full rounded-xl bg-slate-800" />
        </div>
      )}

      {/* Empty State / Not Found */}
      {((isError && submittedQuery && !isLoading) || (propertyData && propertyData.area === 0n && !isLoading) || (submittedQuery && bytes32Query === '0x' && !isLoading)) && (
        <Card className="border-destructive/30 bg-destructive/10 text-center py-16 shadow-2xl backdrop-blur-sm animate-in zoom-in-95">
          <CardContent>
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white">Property Not Found</h3>
            <p className="text-slate-400 mt-2 text-lg">
              We couldn't find any blockchain records for <span className="font-mono text-white">"{submittedQuery}"</span>.
            </p>
            <p className="text-sm text-slate-500 mt-2">Ensure the ID is typed correctly and has been successfully registered.</p>
          </CardContent>
        </Card>
      )}

      {/* Rich Interactive Property Card */}
      {propertyData && propertyData.area > 0n && !isLoading && !isError && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Card className="overflow-hidden border-primary/20 shadow-2xl bg-slate-900/80 backdrop-blur-xl">
            <CardHeader className="bg-primary/10 pb-8 border-b border-primary/10 relative">
              <div className="absolute top-0 right-0 p-24 bg-primary/20 rounded-full -mr-12 -mt-12 blur-3xl pointer-events-none"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <CardTitle className="text-3xl flex items-center gap-2 text-white">
                    <MapPin className="h-8 w-8 text-primary" /> Property Profile
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm font-mono break-all max-w-md text-slate-300 flex items-center gap-2">
                    ID: {submittedQuery}
                    <button onClick={() => handleCopy(submittedQuery)} className="hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors">
                      <Copy className="h-3 w-3" />
                    </button>
                  </CardDescription>
                </div>
                <Badge variant={propertyData.verified ? "default" : "destructive"} className="text-base px-4 py-2 shadow-lg">
                  {propertyData.verified ? (
                    <><CheckCircle2 className="mr-2 h-5 w-5" /> Verified</>
                  ) : (
                    <><XCircle className="mr-2 h-5 w-5" /> Unverified</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-t border-white/5">
                <div className="p-8 space-y-8">
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">Current Owner</h4>
                    <div className="flex items-center justify-between bg-black/50 p-3 rounded-md border border-white/10 group">
                      <p className="font-mono text-base break-all">{propertyData.owner}</p>
                      <button onClick={() => handleCopy(propertyData.owner)} className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-white/10">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">IPFS Metadata Hash</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <p className="font-mono text-base break-all bg-black/50 p-3 rounded-md border border-white/10 flex-1">{propertyData.metadataHash}</p>
                      <a 
                        href={`https://crimson-adverse-bonobo-788.mypinata.cloud/ipfs/${propertyData.metadataHash.replace('ipfs://', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-12 px-4 py-2 w-full sm:w-auto"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> View Deed (PDF)
                      </a>
                    </div>
                  </div>
                  {propertyData.pendingOwner !== '0x0000000000000000000000000000000000000000' && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <h4 className="text-sm font-bold text-amber-500 mb-1 uppercase tracking-wider">Pending Transfer To</h4>
                      <p className="font-mono text-base break-all text-amber-200">{propertyData.pendingOwner}</p>
                    </div>
                  )}
                </div>
                <div className="p-8 space-y-8 bg-black/20">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-wider">Area (sqm)</h4>
                      <p className="text-3xl font-bold text-white">{propertyData.area.toString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-wider">Coordinates</h4>
                      <p className="text-base text-white">Lat: {formatCoordinate(propertyData.latitudeE6)}</p>
                      <p className="text-base text-white">Lng: {formatCoordinate(propertyData.longitudeE6)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-wider">Registered</h4>
                      <p className="text-base text-white">{formatDate(propertyData.createdAt)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-wider">Last Updated</h4>
                      <p className="text-base text-white">{formatDate(propertyData.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2 text-white">
              <Map className="h-6 w-6 text-primary" /> Location on Map
            </h2>
            <div className="border border-primary/20 rounded-xl overflow-hidden shadow-2xl p-1 bg-slate-900/50 backdrop-blur-xl">
               <DashboardMap properties={mapProperties} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
