'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeftRight, Check, X, MapPin, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { formatCoordinate } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export default function PendingTransactions() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const isMounted = useIsMounted()
  
  // Manual search state
  const [propertyId, setPropertyId] = useState('')
  const [submittedId, setSubmittedId] = useState('')

  // Historical event fetching state
  const [proposedPropertyIds, setProposedPropertyIds] = useState<`0x${string}`[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  // 1. Fetch TransferProposed events where user is pendingOwner
  useEffect(() => {
    async function fetchProposedTransfers() {
      if (!address || !publicClient) return
      setIsLoadingEvents(true)
      try {
        const currentBlock = await publicClient.getBlockNumber()
        // Fetch up to ~30 days of history (approx 200,000 blocks on Sepolia)
        const startBlock = currentBlock - 200000n > 0n ? currentBlock - 200000n : 0n
        
        let allLogs = []
        const chunkSize = 49000n
        
        for (let b = startBlock; b <= currentBlock; b += chunkSize) {
          const toBlock = b + chunkSize - 1n > currentBlock ? currentBlock : b + chunkSize - 1n
          const chunkLogs = await publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: parseAbiItem('event TransferProposed(bytes32 indexed propertyId, address indexed currentOwner, address indexed pendingOwner)'),
            args: { pendingOwner: address },
            fromBlock: b,
            toBlock: toBlock,
          })
          allLogs.push(...chunkLogs)
        }
        
        // Extract unique property IDs
        const ids = Array.from(new Set(allLogs.map(log => log.args.propertyId as `0x${string}`)))
        setProposedPropertyIds(ids)
      } catch (error) {
        console.error("Failed to fetch TransferProposed events", error)
      } finally {
        setIsLoadingEvents(false)
      }
    }
    fetchProposedTransfers()
  }, [address, publicClient])

  // 2. Fetch current pendingOwnerOf for each ID to ensure it hasn't been completed/cancelled
  const { data: currentPendingOwners, isLoading: isLoadingPendingOwners } = useReadContracts({
    contracts: proposedPropertyIds.map(id => ({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName: 'pendingOwnerOf',
      args: [id],
    })),
    query: {
      enabled: proposedPropertyIds.length > 0,
    }
  })

  // Filter IDs that are STILL pending for the current user
  const activePendingPropertyIds = proposedPropertyIds.filter((_, i) => {
    return currentPendingOwners?.[i]?.result === address
  })

  // 3. Fetch property details for the active pending properties
  const { data: propertiesData, isLoading: isLoadingProperties } = useReadContracts({
    contracts: activePendingPropertyIds.map(id => ({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName: 'getProperty',
      args: [id],
    })),
    query: {
      enabled: activePendingPropertyIds.length > 0,
    }
  })

  // Manual check
  const { data: pendingOwnerManual, isLoading: isCheckingManual } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'pendingOwnerOf',
    args: [submittedId as `0x${string}`],
    query: {
      enabled: submittedId.startsWith('0x'),
    }
  })

  const { writeContract, data: hash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const isPendingOverall = isWriting || isConfirming

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedId(propertyId)
  }

  const handleAccept = (id: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName: 'acceptTransfer',
      args: [id],
    }, {
      onSuccess: () => toast.success("Transaction submitted to accept transfer"),
      onError: (err) => toast.error(`Error: ${err.message}`)
    })
  }

  const handleCancel = (id: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName: 'cancelTransfer',
      args: [id],
    }, {
      onSuccess: () => toast.success("Transaction submitted to cancel transfer"),
      onError: (err) => toast.error(`Error: ${err.message}`)
    })
  }

  if (!isMounted) return null

  const isPendingForMeManual = pendingOwnerManual === address
  const hasCheckedManual = submittedId !== '' && !isCheckingManual
  const isLoadingAuto = isLoadingEvents || isLoadingPendingOwners || isLoadingProperties

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Transactions</h1>
        <p className="text-muted-foreground mt-2">Accept or cancel property transactions assigned to you.</p>
      </div>

      {/* Automatic List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Awaiting Your Action</h2>
        {isLoadingAuto && (
          <div className="grid gap-6 md:grid-cols-2">
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
        
        {!isLoadingAuto && activePendingPropertyIds.length === 0 && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Check className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">All caught up!</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                You have no pending property transfers waiting for your approval.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoadingAuto && propertiesData && activePendingPropertyIds.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {propertiesData.map((result, index) => {
              const property = result.result as any
              if (!property) return null
              const pId = activePendingPropertyIds[index]
              
              return (
                <Card key={pId} className="border-primary/20 shadow-sm overflow-hidden flex flex-col">
                  <CardHeader className="bg-primary/5 pb-4 border-b">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ArrowLeftRight className="h-5 w-5 text-primary" /> 
                      Transfer Available
                    </CardTitle>
                    <CardDescription className="font-mono text-xs mt-2 break-all">
                      {pId}
                    </CardDescription>
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
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs mb-1">Current Owner</p>
                      <p className="font-mono text-xs truncate" title={property.owner}>
                        {property.owner}
                      </p>
                    </div>
                    
                    <div className="col-span-2 mt-2">
                      <a 
                        href={`https://ipfs.io/ipfs/${property.metadataHash.replace('ipfs://', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={buttonVariants({ variant: "outline", size: "sm", className: "w-full text-primary hover:text-primary" })}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> View Document (IPFS)
                      </a>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-4 border-t bg-secondary/5">
                    <Button 
                      className="flex-1" 
                      onClick={() => handleAccept(pId)}
                      disabled={isPendingOverall}
                    >
                      {isPendingOverall ? "Processing..." : <><Check className="mr-2 h-4 w-4" /> Accept</>}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-destructive text-destructive hover:bg-destructive/10" 
                      onClick={() => handleCancel(pId)}
                      disabled={isPendingOverall}
                    >
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Manual Fallback */}
      <div className="pt-8">
        <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Manual Lookup</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verify Transfer Manually</CardTitle>
            <CardDescription>Enter the Property ID provided by the current owner to check its status.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input 
                placeholder="0x..." 
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="font-mono"
              />
              <Button type="submit" variant="secondary">Check Status</Button>
            </form>

            {hasCheckedManual && (
              <div className="mt-6">
                {isPendingForMeManual ? (
                  <div className="p-4 border border-primary rounded-lg bg-primary/5 space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <ArrowLeftRight className="h-5 w-5" />
                      <h3 className="font-semibold">Transfer Available</h3>
                    </div>
                    <p className="text-sm">You are the pending owner for this property.</p>
                    <div className="flex gap-3">
                      <Button onClick={() => handleAccept(submittedId as `0x${string}`)} disabled={isPendingOverall}>
                        Accept
                      </Button>
                      <Button variant="destructive" onClick={() => handleCancel(submittedId as `0x${string}`)} disabled={isPendingOverall}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg bg-muted/50 text-center">
                    <X className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No Transfer Found</p>
                    <p className="text-xs text-muted-foreground mt-1 break-all">
                      You are not the pending owner for {submittedId}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
