'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Hash, User, Calendar, ShieldCheck, ShieldAlert } from 'lucide-react'
import { useReadContract } from 'wagmi'
import { landRegistryABI as landRegistryAbi } from '@/contracts/LandRegistry.abi'
import { CONTRACT_ADDRESS } from '@/lib/utils'

export default function PropertyDetailsPage() {
  const params = useParams()
  const propertyId = params.propertyId as string

  const { data: property, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryAbi,
    functionName: 'getProperty',
    args: propertyId ? [propertyId as `0x${string}`] : undefined,
  }) as { data: any, isLoading: boolean }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Property Details</h1>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-muted rounded-xl w-full"></div>
          <div className="h-40 bg-muted rounded-xl w-full"></div>
        </div>
      ) : !property ? (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6 text-center text-destructive">
            Property not found or does not exist.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Hash className="mr-2 h-5 w-5 text-primary" />
                ID: {propertyId}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center">
                  <User className="mr-2 h-4 w-4" /> Owner
                </span>
                <p className="font-mono text-sm break-all bg-muted p-2 rounded">{property.owner}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="mr-2 h-4 w-4" /> Location (Lat, Lng)
                </span>
                <p className="font-medium">{(Number(property.latitudeE6) / 1e6).toFixed(6)}, {(Number(property.longitudeE6) / 1e6).toFixed(6)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Area (sq meters)</span>
                <p className="font-medium">{property.area.toString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Status & Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border flex items-center space-x-3 bg-card">
                {property.verified ? (
                  <>
                    <ShieldCheck className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-bold text-green-500">Verified</p>
                      <p className="text-xs text-muted-foreground">Property documents authenticated</p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="font-bold text-yellow-500">Unverified</p>
                      <p className="text-xs text-muted-foreground">Pending registrar verification</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Metadata Hash (IPFS)</span>
                <p className="font-mono text-xs break-all bg-muted p-2 rounded">{property.metadataHash}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
