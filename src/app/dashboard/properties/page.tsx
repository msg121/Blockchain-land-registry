'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useReadContracts, useWriteContract } from 'wagmi'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building, MapPin, CheckCircle2, XCircle, ArrowRightLeft, ExternalLink } from 'lucide-react'
import { formatCoordinate } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export default function MyProperties() {
  const { address } = useAccount()

  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [newOwnerAddress, setNewOwnerAddress] = useState('')

  const { writeContract, isPending } = useWriteContract()

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

  // 2. Fetch details for each Property ID using Multicall
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

  const isLoading = isLoadingIds || (propertyIds?.length ? isLoadingDetails : false)

  const isMounted = useIsMounted()
  if (!isMounted) return null

  if (!address) return null // Handled by layout/overview

  const handleProposeTransfer = () => {
    if (!newOwnerAddress.startsWith('0x') || newOwnerAddress.length !== 42) {
      toast.error("Please enter a valid wallet address")
      return
    }
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName: 'proposeTransfer',
      args: [selectedPropertyId as `0x${string}`, newOwnerAddress as `0x${string}`],
    }, {
      onSuccess: () => {
        toast.success("Transaction submitted to propose transfer")
        setIsTransferOpen(false)
        setNewOwnerAddress('')
      },
      onError: (err) => toast.error(`Error: ${err.message}`)
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
        <p className="text-muted-foreground mt-2">Manage your registered land assets.</p>
      </div>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (!propertyIds || propertyIds.length === 0) && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No properties found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              You don't own any registered properties on this platform yet.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && propertiesData && propertyIds && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {propertiesData.map((result, index) => {
            const property = result.result as any
            if (!property) return null
            const propertyId = propertyIds[index]
            const isTransferPending = property.pendingOwner !== '0x0000000000000000000000000000000000000000'
            
            return (
              <Card key={propertyId} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="bg-secondary/20 pb-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="h-5 w-5 text-primary" /> 
                        Property
                      </CardTitle>
                      <CardDescription className="font-mono text-xs mt-2 break-all">
                        {propertyId}
                      </CardDescription>
                    </div>
                    <Badge variant={property.verified ? "default" : "destructive"}>
                      {property.verified ? <CheckCircle2 className="h-3 w-3 mr-1"/> : <XCircle className="h-3 w-3 mr-1"/>}
                      {property.verified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-2 gap-4 text-sm flex-1">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Area (sqm)</p>
                    <p className="font-medium">{property.area.toString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Location</p>
                    <p className="font-medium">
                      {formatCoordinate(property.latitudeE6)}, {formatCoordinate(property.longitudeE6)}
                    </p>
                  </div>
                  
                  <div className="col-span-2 mt-2">
                    <a 
                      href={`https://ipfs.io/ipfs/${property.metadataHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "outline", size: "sm", className: "w-full text-primary hover:text-primary" })}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" /> View Document (IPFS)
                    </a>
                  </div>
                  
                  {isTransferPending && (
                    <div className="col-span-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md mt-2">
                      <p className="text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">Transfer Proposed To:</p>
                      <p className="font-mono text-xs break-all text-amber-700 dark:text-amber-300">
                        {property.pendingOwner}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2 pb-4 px-6 border-t bg-secondary/5">
                  <Button 
                    className="w-full" 
                    variant={isTransferPending ? "secondary" : "default"}
                    disabled={isTransferPending}
                    onClick={() => {
                      setSelectedPropertyId(propertyId)
                      setIsTransferOpen(true)
                    }}
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    {isTransferPending ? "Transfer Pending" : "Transfer Ownership"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Ownership</DialogTitle>
            <DialogDescription>
              Propose transferring this property to a new owner. The new owner will need to accept the transfer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Property ID</Label>
              <Input 
                value={selectedPropertyId} 
                disabled 
                className="font-mono text-xs text-muted-foreground bg-muted" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-owner">New Owner Wallet Address</Label>
              <Input 
                id="new-owner"
                placeholder="0x..." 
                value={newOwnerAddress}
                onChange={(e) => setNewOwnerAddress(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
            <Button onClick={handleProposeTransfer} disabled={isPending || !newOwnerAddress}>
              {isPending ? "Processing..." : "Propose Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
